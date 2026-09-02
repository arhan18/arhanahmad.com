export async function onRequestPost(context) {
  const { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN, DODO_PAYMENTS_API_KEY } = context.env;

  const { createClient } = await import('@libsql/client');
  const turso = createClient({
    url: TURSO_DATABASE_URL,
    authToken: TURSO_AUTH_TOKEN,
  });

  const body = await context.request.json();
  const { action } = body;

  if (action === 'getSlots') {
    const result = await turso.execute('SELECT * FROM slots ORDER BY position');
    return new Response(JSON.stringify(result.rows), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (action === 'getSlot') {
    const result = await turso.execute({
      sql: 'SELECT * FROM slots WHERE position = ?',
      args: [body.position],
    });
    return new Response(JSON.stringify(result.rows[0] || null), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (action === 'updateSlot') {
    const { position, websiteUrl, brandName, bidAmount, occupantName } = body;
    await turso.execute({
      sql: `UPDATE slots SET website_url = ?, brand_name = ?, bid_amount = ?, occupant_name = ? WHERE position = ?`,
      args: [websiteUrl, brandName, bidAmount, occupantName, position],
    });
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (action === 'createCheckoutSession') {
    const { productName, price, websiteUrl, brandName, rank } = body;

    // Create checkout session via DodoPayments API
    const res = await fetch('https://live.dodopayments.com/checkouts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DODO_PAYMENTS_API_KEY}`,
      },
      body: JSON.stringify({
        product_cart: [{
          product_id: 'pdt_0Nmik0Q254dOP7oaQyCqf',
          quantity: 1,
        }],
        return_url: 'https://arhanahmad.com/checkout/success',
        metadata: {
          rank: String(rank),
          website_url: websiteUrl,
          brand_name: brandName,
        },
      }),
    });

    const session = await res.json();

    if (!res.ok) {
      return new Response(JSON.stringify({ error: session }), {
        status: res.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ checkoutUrl: session.checkout_url }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ error: 'Invalid action' }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  });
}
