// Vercel serverless function to proxy Stripe webhooks to backend

export const config = {
  api: {
    bodyParser: false, // Disable body parsing to get raw body for signature verification
  },
};

// Helper to read the raw body from request
async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the raw body
    const rawBody = await getRawBody(req);
    
    // Get the Stripe signature from headers
    const stripeSignature = req.headers['stripe-signature'];
    
    console.log('[Webhook Proxy] Forwarding webhook to backend...');
    console.log('[Webhook Proxy] Body length:', rawBody.length);
    console.log('[Webhook Proxy] Has signature:', !!stripeSignature);
    
    // Forward the webhook to the backend with raw body
    const backendUrl = 'https://marketfinder-ai.onrender.com/webhook/stripe';
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': stripeSignature,
      },
      body: rawBody,
    });

    const data = await response.json();
    
    console.log('[Webhook Proxy] Backend response:', response.status, data);
    
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('[Webhook Proxy] Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
