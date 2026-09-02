import type { PagesFunction } from '@cloudflare/workers-types';
import { createClient } from '@libsql/client';

interface Env {
  TURSO_DATABASE_URL: string;
  TURSO_AUTH_TOKEN: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  try {
    const client = createClient({
      url: env.TURSO_DATABASE_URL,
      authToken: env.TURSO_AUTH_TOKEN,
    });

    const result = await client.execute('SELECT COUNT(*) as count FROM email_list WHERE subscribed = 1');
    const count = result.rows[0]?.count || 0;

    return new Response(JSON.stringify({ count }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (err) {
    return new Response(JSON.stringify({ count: 0 }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};
