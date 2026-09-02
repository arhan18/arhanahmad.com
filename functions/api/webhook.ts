import type { PagesFunction } from '@cloudflare/workers-types';
import { createClient } from '@libsql/client';

interface Env {
  DODO_PAYMENTS_API_KEY: string;
  DODO_PAYMENTS_WEBHOOK_KEY: string;
  RESEND_API_KEY: string;
  DOWNLOAD_SECRET: string;
  TURSO_DATABASE_URL: string;
  TURSO_AUTH_TOKEN: string;
}

async function saveBuyer(env: Env, email: string, name: string, productId: string) {
  try {
    const client = createClient({
      url: env.TURSO_DATABASE_URL,
      authToken: env.TURSO_AUTH_TOKEN,
    });
    await client.execute({
      sql: 'INSERT OR REPLACE INTO email_list (email, name, type, product_id, subscribed) VALUES (?, ?, ?, ?, 1)',
      args: [email, name, 'buyer', productId],
    });
  } catch (e) {
    console.error('Failed to save buyer:', e);
  }
}

interface Product {
  id: string;
  name: string;
  downloadUrl: string;
  emailTemplate: string;
}

const PRODUCTS: Record<string, Product> = {
  'astro-portfolio-template': {
    id: 'astro-portfolio-template',
    name: 'Astro Portfolio Template',
    downloadUrl: 'https://arhanahmad.com/downloads/astro-portfolio-template-v1.zip',
    emailTemplate: 'astro-template',
  },
  'astro-portfolio-template-v1': {
    id: 'astro-portfolio-template-v1',
    name: 'Astro Portfolio Template',
    downloadUrl: 'https://arhanahmad.com/downloads/astro-portfolio-template-v1.zip',
    emailTemplate: 'astro-template',
  },
  'prompt-templates': {
    id: 'prompt-templates',
    name: 'Prompt Templates',
    downloadUrl: 'https://arhanahmad.com/downloads/prompt-templates.zip',
    emailTemplate: 'prompts',
  },
  'indie-hacker-toolkit': {
    id: 'indie-hacker-toolkit',
    name: 'Indie Hacker Toolkit',
    downloadUrl: 'https://arhanahmad.com/downloads/indie-hacker-toolkit.zip',
    emailTemplate: 'toolkit',
  },
  'x-growth-playbook': {
    id: 'x-growth-playbook',
    name: 'X Growth Playbook',
    downloadUrl: 'https://arhanahmad.com/downloads/x-growth-playbook.zip',
    emailTemplate: 'playbook',
  },
};

function generateToken(secret: string, email: string, productId: string): string {
  const data = `${email}:${productId}:${Date.now()}`;
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const dataBuffer = encoder.encode(data);

  return btoa(data).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
}

function getEmailTemplate(template: string, name: string, downloadUrl: string): string {
  const templates: Record<string, { subject: string; html: string }> = {
    'astro-template': {
      subject: 'Your Astro Portfolio Template is ready!',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #fafafa;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://arhanahmad.com/avatar.jpg" alt="Arhan Ahmad" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid #06b6d4;" />
          </div>
          <div style="background: white; border-radius: 12px; padding: 30px; border: 1px solid #e5e7eb;">
            <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 8px; text-align: center;">Hey ${name}!</h1>
            <p style="color: #666; font-size: 16px; line-height: 1.6; text-align: center;">Thanks for purchasing the Astro Portfolio Template. Here's your download:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${downloadUrl}" style="display: inline-block; background: #06b6d4; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">Download Template →</a>
            </div>
            <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p style="color: #334155; font-size: 14px; margin: 0 0 8px 0;"><strong>Quick Start:</strong></p>
              <ol style="color: #64748b; font-size: 14px; margin: 0; padding-left: 20px;">
                <li>Unzip the downloaded file</li>
                <li>Edit <code>src/data.ts</code> with your info</li>
                <li>Run <code>npm install</code></li>
                <li>Deploy to Cloudflare/Vercel</li>
              </ol>
            </div>
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px;">
              <p style="color: #999; font-size: 14px; text-align: center;">If you have any issues, just reply to this email.</p>
              <p style="color: #999; font-size: 14px; text-align: center;">— Arhan</p>
            </div>
          </div>
        </div>
      `,
    },
    template: {
      subject: 'Your Astro Portfolio Template is ready!',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #fafafa;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://arhanahmad.com/avatar.jpg" alt="Arhan Ahmad" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid #06b6d4;" />
          </div>
          <div style="background: white; border-radius: 12px; padding: 30px; border: 1px solid #e5e7eb;">
            <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 8px; text-align: center;">Hey ${name}!</h1>
            <p style="color: #666; font-size: 16px; line-height: 1.6; text-align: center;">Thanks for purchasing the Astro Portfolio Template. Here's your download:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${downloadUrl}" style="display: inline-block; background: #06b6d4; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">Download Template →</a>
            </div>
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px;">
              <p style="color: #999; font-size: 14px; text-align: center;">If you have any issues, just reply to this email.</p>
              <p style="color: #999; font-size: 14px; text-align: center;">— Arhan</p>
            </div>
          </div>
        </div>
      `,
    },
    prompts: {
      subject: 'Your Prompt Templates are ready!',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #fafafa;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://arhanahmad.com/avatar.jpg" alt="Arhan Ahmad" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid #06b6d4;" />
          </div>
          <div style="background: white; border-radius: 12px; padding: 30px; border: 1px solid #e5e7eb;">
            <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 8px; text-align: center;">Hey ${name}!</h1>
            <p style="color: #666; font-size: 16px; line-height: 1.6; text-align: center;">Thanks for grabbing the Prompt Templates. 50+ prompts for vibe coding, ready to use:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${downloadUrl}" style="display: inline-block; background: #06b6d4; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">Download Prompts →</a>
            </div>
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px;">
              <p style="color: #999; font-size: 14px; text-align: center;">If you have any issues, just reply to this email.</p>
              <p style="color: #999; font-size: 14px; text-align: center;">— Arhan</p>
            </div>
          </div>
        </div>
      `,
    },
    toolkit: {
      subject: 'Your Indie Hacker Toolkit is ready!',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #fafafa;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://arhanahmad.com/avatar.jpg" alt="Arhan Ahmad" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid #06b6d4;" />
          </div>
          <div style="background: white; border-radius: 12px; padding: 30px; border: 1px solid #e5e7eb;">
            <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 8px; text-align: center;">Hey ${name}!</h1>
            <p style="color: #666; font-size: 16px; line-height: 1.6; text-align: center;">Thanks for purchasing the Indie Hacker Toolkit. Here's your curated list of tools:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${downloadUrl}" style="display: inline-block; background: #06b6d4; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">Download Toolkit →</a>
            </div>
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px;">
              <p style="color: #999; font-size: 14px; text-align: center;">If you have any issues, just reply to this email.</p>
              <p style="color: #999; font-size: 14px; text-align: center;">— Arhan</p>
            </div>
          </div>
        </div>
      `,
    },
    playbook: {
      subject: 'Your X Growth Playbook is ready!',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #fafafa;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://arhanahmad.com/avatar.jpg" alt="Arhan Ahmad" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid #06b6d4;" />
          </div>
          <div style="background: white; border-radius: 12px; padding: 30px; border: 1px solid #e5e7eb;">
            <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 8px; text-align: center;">Hey ${name}!</h1>
            <p style="color: #666; font-size: 16px; line-height: 1.6; text-align: center;">Thanks for purchasing the X Growth Playbook. Here's your growth strategy:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${downloadUrl}" style="display: inline-block; background: #06b6d4; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">Download Playbook →</a>
            </div>
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px;">
              <p style="color: #999; font-size: 14px; text-align: center;">If you have any issues, just reply to this email.</p>
              <p style="color: #999; font-size: 14px; text-align: center;">— Arhan</p>
            </div>
          </div>
        </div>
      `,
    },
  };

  return templates[template]?.html || templates.template.html;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const body = await request.json();
    const eventType = body.event_type || body.type;

    if (eventType === 'payment.succeeded' || eventType === 'checkout.completed') {
      const payment = body.data || body;
      const email = payment.customer?.email || payment.email;
      const productId = payment.product_id || payment.metadata?.product_id;
      const name = payment.customer?.name || payment.metadata?.name || 'there';

      if (!email || !productId) {
        console.error('Missing email or productId in webhook:', body);
        return new Response(JSON.stringify({ received: true }), { status: 200 });
      }

      const product = PRODUCTS[productId];
      if (!product) {
        console.error('Unknown product:', productId);
        return new Response(JSON.stringify({ received: true }), { status: 200 });
      }

      await saveBuyer(env, email, name, productId);

      const token = generateToken(env.DOWNLOAD_SECRET, email, productId);
      const downloadUrl = `${product.downloadUrl}?token=${token}&email=${encodeURIComponent(email)}`;

      const html = getEmailTemplate(product.emailTemplate, name, downloadUrl);

      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Arhan <email@arhanahmad.com>',
          to: email,
          subject: product.emailTemplate === 'template'
            ? 'Your Astro Portfolio Template is ready!'
            : `Your ${product.name} is ready!`,
          html: html,
        }),
      });

      if (!emailResponse.ok) {
        const err = await emailResponse.text();
        console.error('Resend error:', err);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Webhook error:', err);
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }
};
