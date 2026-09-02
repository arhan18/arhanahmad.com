import type { PagesFunction } from '@cloudflare/workers-types';
import { createClient } from '@libsql/client';

interface Env {
  TURSO_DATABASE_URL: string;
  TURSO_AUTH_TOKEN: string;
  RESEND_API_KEY: string;
  NEWSLETTER_SECRET: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const body = await request.json() as {
      secret: string;
      subject: string;
      html: string;
      type?: string;
    };

    if (body.secret !== env.NEWSLETTER_SECRET) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (!body.subject || !body.html) {
      return new Response(JSON.stringify({ error: 'Subject and html required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const client = createClient({
      url: env.TURSO_DATABASE_URL,
      authToken: env.TURSO_AUTH_TOKEN,
    });

    let sql = 'SELECT email FROM email_list WHERE subscribed = 1';
    const args: string[] = [];

    if (body.type === 'subscribers') {
      sql += ' AND type = ?';
      args.push('subscriber');
    } else if (body.type === 'buyers') {
      sql += ' AND type = ?';
      args.push('buyer');
    }

    const result = await client.execute({ sql, args });
    const emails = result.rows.map(r => r.email as string);

    if (emails.length === 0) {
      return new Response(JSON.stringify({ error: 'No emails found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const resendResponse = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        emails.map(email => ({
          from: 'Arhan <onboarding@resend.dev>',
          to: email,
          subject: body.subject,
          html: body.html,
        }))
      ),
    });

    if (!resendResponse.ok) {
      const err = await resendResponse.text();
      console.error('Resend batch error:', err);
      return new Response(JSON.stringify({ error: 'Failed to send emails' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      sent: emails.length,
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (err) {
    console.error('Newsletter error:', err);
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
