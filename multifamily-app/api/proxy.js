// api/proxy.js - Deploy this to Vercel

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  )
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }
  
  try {
    // Get the endpoint to forward to from query params
    const endpoint = req.query.endpoint
    if (!endpoint) {
      return res.status(400).json({ error: 'Missing endpoint parameter' })
    }
    
    // Construct the backend URL
    const backendUrl = `https://marketfinder-ai.onrender.com${endpoint}`
    
    // Forward the request with all query parameters
    const queryParams = new URLSearchParams(req.query)
    queryParams.delete('endpoint') // Remove the endpoint param
    
    const url = `${backendUrl}${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    
    // Forward the request
    const response = await fetch(url, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    })
    
    // Get response data
    const data = await response.json()
    
    // Return response
    res.status(response.status).json(data)
  } catch (error) {
    console.error('API proxy error:', error)
    res.status(500).json({ error: 'Failed to proxy request to backend' })
  }
}
