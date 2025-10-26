// Vercel serverless function to proxy Stripe webhooks to backend
export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the Stripe signature from headers
    const stripeSignature = req.headers['stripe-signature'];
    
    // Forward the webhook to the backend
    const backendUrl = 'https://marketfinder-ai.onrender.com/webhook/stripe';
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': stripeSignature,
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    
    console.log('[Webhook Proxy] Backend response:', data);
    
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('[Webhook Proxy] Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
