import type { PagesFunction } from '@cloudflare/workers-types';
import { createClient } from '@libsql/client';

interface Env {
  TURSO_DATABASE_URL: string;
  TURSO_AUTH_TOKEN: string;
  RESEND_API_KEY: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const body = await request.json() as { email: string; name?: string };
    const { email, name } = body;

    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Valid email required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const client = createClient({
      url: env.TURSO_DATABASE_URL,
      authToken: env.TURSO_AUTH_TOKEN,
    });

    const existing = await client.execute({
      sql: 'SELECT id FROM email_list WHERE email = ?',
      args: [email],
    });

    let subscriberNumber: number;

    if (existing.rows.length > 0) {
      const countResult = await client.execute({
        sql: 'SELECT COUNT(*) as count FROM email_list WHERE id <= ? AND subscribed = 1',
        args: [existing.rows[0].id],
      });
      subscriberNumber = Number(countResult.rows[0]?.count || 1);
    } else {
      await client.execute({
        sql: 'INSERT INTO email_list (email, name, type, subscribed) VALUES (?, ?, ?, 1)',
        args: [email, name || null, 'subscriber'],
      });
      const countResult = await client.execute('SELECT COUNT(*) as count FROM email_list WHERE subscribed = 1');
      subscriberNumber = Number(countResult.rows[0]?.count || 1);

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Arhan <email@arhanahmad.com>',
          to: email,
          subject: 'Welcome to the crew 🚀',
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #fafafa;">
              <div style="text-align: center; margin-bottom: 30px;">
                <img src="https://arhanahmad.com/avatar.jpg" alt="Arhan Ahmad" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid #06b6d4;" />
              </div>
              <div style="background: white; border-radius: 12px; padding: 30px; border: 1px solid #e5e7eb;">
                <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 8px; text-align: center;">You're in!</h1>
                <p style="color: #666; font-size: 16px; line-height: 1.6; text-align: center;">Hey! Thanks for subscribing. You're subscriber #${subscriberNumber}.</p>
                <p style="color: #666; font-size: 16px; line-height: 1.6; text-align: center;">I ship small products — tools, templates, weird experiments. You'll get notified when something new drops.</p>
                <p style="color: #666; font-size: 16px; line-height: 1.6; text-align: center;">No spam. Unsubscribe anytime.</p>
                <div style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 20px;">
                  <p style="color: #999; font-size: 14px; text-align: center;">Reply "hii" to this email to say hi. I actually read the replies.</p>
                  <p style="color: #999; font-size: 14px; text-align: center;">— Arhan</p>
                </div>
              </div>
              <div style="text-align: center; margin-top: 20px;">
                <a href="https://arhanahmad.com" style="color: #06b6d4; text-decoration: none; font-size: 14px;">arhanahmad.com</a>
              </div>
            </div>
          `,
        }),
      });
    }

    return new Response(JSON.stringify({ success: true, message: 'Subscribed!' }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (err) {
    console.error('Subscribe error:', err);
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
