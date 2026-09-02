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
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const client = createClient({
      url: env.TURSO_DATABASE_URL,
      authToken: env.TURSO_AUTH_TOKEN,
    });

    const url = new URL(context.request.url);
    const type = url.searchParams.get('type');

    let sql = 'SELECT * FROM email_list WHERE subscribed = 1';
    const args: string[] = [];

    if (type === 'subscribers') {
      sql += ' AND type = ?';
      args.push('subscriber');
    } else if (type === 'buyers') {
      sql += ' AND type = ?';
      args.push('buyer');
    }

    sql += ' ORDER BY created_at DESC';

    const result = await client.execute({ sql, args });

    return new Response(JSON.stringify({
      emails: result.rows,
      total: result.rows.length,
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (err) {
    console.error('Get emails error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
