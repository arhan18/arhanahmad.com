import type { PagesFunction } from '@cloudflare/workers-types';

interface Env {
  DODO_PAYMENTS_API_KEY: string;
  DODO_PAYMENTS_ENVIRONMENT: string;
}

interface CheckoutRequest {
  productId: string;
  email: string;
  name?: string;
  productName?: string;
  price?: number;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const body = await request.json() as CheckoutRequest;
    const { productId, email, name, productName, price } = body;

    if (!productId || !email) {
      return new Response(JSON.stringify({ error: 'productId and email required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const baseUrl = env.DODO_PAYMENTS_ENVIRONMENT === 'live_mode'
      ? 'https://live.dodopayments.com'
      : 'https://test.dodopayments.com';

    const checkoutResponse = await fetch(`${baseUrl}/checkouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.DODO_PAYMENTS_API_KEY}`,
      },
      body: JSON.stringify({
        product_id: productId,
        quantity: 1,
        email: email,
        name: name || undefined,
        return_url: `https://arhanahmad.com/checkout/success?product=${encodeURIComponent(productId)}`,
        metadata: {
          email: email,
          product_name: productName || productId,
        },
      }),
    });

    if (!checkoutResponse.ok) {
      const error = await checkoutResponse.text();
      console.error('Dodo checkout error:', error);
      return new Response(JSON.stringify({ error: 'Failed to create checkout' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const checkout = await checkoutResponse.json();

    return new Response(JSON.stringify({
      url: checkout.checkout_url,
      checkoutUrl: checkout.checkout_url,
      checkoutId: checkout.checkout_id,
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (err) {
    console.error('Checkout error:', err);
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
