// Vercel serverless function to proxy Stripe webhooks to backend
export const config = {
  api: {
    bodyParser: false, // Disable body parsing to get raw body
  },
};

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the raw body as a buffer
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const rawBody = Buffer.concat(chunks);
    
    // Get the Stripe signature from headers
    const stripeSignature = req.headers['stripe-signature'];
    
    // Forward the webhook to the backend with raw body
    const backendUrl = 'https://marketfinder-ai.onrender.com/webhook/stripe';
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': stripeSignature,
      },
      body: rawBody, // Send raw body, not JSON stringified
    });

    const data = await response.json();
    
    console.log('[Webhook Proxy] Backend response:', data);
    
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('[Webhook Proxy] Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
