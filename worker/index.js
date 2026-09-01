export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    if (request.method === 'POST' && url.pathname === '/visit') {
      try {
        const { deviceId } = await request.json();

        if (!deviceId) {
          return new Response(JSON.stringify({ error: 'deviceId required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const visitedKey = `visited:${deviceId}`;
        const alreadyVisited = await env.VISITS.get(visitedKey);

        if (!alreadyVisited) {
          const countStr = await env.VISITS.get('count');
          const count = countStr ? parseInt(countStr, 10) + 1 : 1;
          await env.VISITS.put('count', count.toString());
          await env.VISITS.put(visitedKey, 'true', { expirationTtl: 86400 * 365 });
          return new Response(JSON.stringify({ count, marked: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const countStr = await env.VISITS.get('count');
        const count = countStr ? parseInt(countStr, 10) : 0;
        return new Response(JSON.stringify({ count, marked: false }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    if (request.method === 'GET' && url.pathname === '/count') {
      const countStr = await env.VISITS.get('count');
      const count = countStr ? parseInt(countStr, 10) : 0;
      return new Response(JSON.stringify({ count }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response('Not found', { status: 404, headers: corsHeaders });
  },
};
