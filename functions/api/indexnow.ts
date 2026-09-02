import type { PagesFunction } from '@cloudflare/workers-types';

interface Env {
  INDEXNOW_KEY: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const body = await request.json() as { host: string; urlList: string[] };
    
    const bingResponse = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host: body.host,
        key: env.INDEXNOW_KEY,
        keyLocation: `https://${body.host}/${env.INDEXNOW_KEY}.txt`,
        urlList: body.urlList,
      }),
    });

    return new Response(JSON.stringify({ 
      success: true, 
      bing: bingResponse.status 
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env } = context;
  return new Response(env.INDEXNOW_KEY, {
    headers: { 'Content-Type': 'text/plain' },
  });
};
