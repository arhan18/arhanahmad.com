export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': env.ALLOWED_ORIGINS || '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    // POST /subscribe - Add subscriber
    if (request.method === 'POST' && url.pathname === '/subscribe') {
      try {
        const { email } = await request.json();
        
        if (!email || !email.includes('@')) {
          return new Response(JSON.stringify({ error: 'Invalid email' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const timestamp = new Date().toISOString();
        
        // Store subscriber in KV
        const subscriber = {
          email: normalizedEmail,
          subscribedAt: timestamp,
          source: 'portfolio',
          active: true,
        };
        
        await env.SUBSCRIBERS.put(
          `subscriber:${normalizedEmail}`,
          JSON.stringify(subscriber),
          { expirationTtl: 31536000 } // 1 year
        );

        // Update subscriber count
        const countStr = await env.SUBSCRIBERS.get('stats:count');
        const count = countStr ? parseInt(countStr) + 1 : 1;
        await env.SUBSCRIBERS.put('stats:count', count.toString());

        // Store in list for admin access
        const listStr = await env.SUBSCRIBERS.get('stats:list');
        const list = listStr ? JSON.parse(listStr) : [];
        list.push({ email: normalizedEmail, date: timestamp });
        await env.SUBSCRIBERS.put('stats:list', JSON.stringify(list));

        return new Response(JSON.stringify({ 
          message: 'Thanks for subscribing!',
          email: normalizedEmail,
          count,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to subscribe' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // GET /count - Get subscriber count
    if (request.method === 'GET' && url.pathname === '/count') {
      const countStr = await env.SUBSCRIBERS.get('stats:count');
      const count = countStr ? parseInt(countStr) : 0;
      
      return new Response(JSON.stringify({ count }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /subscribers - Get all subscribers (admin only)
    if (request.method === 'GET' && url.pathname === '/subscribers') {
      // Add auth check here in production
      const listStr = await env.SUBSCRIBERS.get('stats:list');
      const list = listStr ? JSON.parse(listStr) : [];
      
      return new Response(JSON.stringify({ 
        subscribers: list,
        count: list.length,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response('Newsletter API', {
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
    });
  },
};
