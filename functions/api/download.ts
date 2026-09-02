import type { PagesFunction } from '@cloudflare/workers-types';

interface Env {
  DOWNLOAD_SECRET: string;
}

const PRODUCT_FILES: Record<string, string> = {
  'astro-portfolio-template': '/downloads/astro-portfolio-template.zip',
  'prompt-templates': '/downloads/prompt-templates.zip',
  'indie-hacker-toolkit': '/downloads/indie-hacker-toolkit.zip',
  'x-growth-playbook': '/downloads/x-growth-playbook.zip',
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);

  const token = url.searchParams.get('token');
  const email = url.searchParams.get('email');
  const productId = url.searchParams.get('product');

  if (!token || !email || !productId) {
    return new Response('Invalid download link', { status: 400 });
  }

  const file = PRODUCT_FILES[productId];
  if (!file) {
    return new Response('Product not found', { status: 404 });
  }

  // For now, serve the file directly (token validation can be added later)
  return new Response(JSON.stringify({
    message: 'Download ready',
    product: productId,
    file: file,
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
