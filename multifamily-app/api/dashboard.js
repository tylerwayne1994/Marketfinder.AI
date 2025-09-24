// api/dashboard.js - Proxy for dashboard API requests

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
    // Get the user ID from query params
    const userId = req.query.user_id
    if (!userId) {
      return res.status(400).json({ error: 'Missing user_id parameter' })
    }
    
    // Determine which endpoint we're proxying to
    const endpoint = req.query.endpoint || 'summary'
    
    // Construct the backend URL
    const backendUrl = `https://marketfinder-ai.onrender.com/api/dashboard/${endpoint}?user_id=${userId}`
    
    // Forward the request
    const response = await fetch(backendUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    // Get response data
    const data = await response.json()
    
    // Return response
    res.status(response.status).json(data)
  } catch (error) {
    console.error('Dashboard API proxy error:', error)
    res.status(500).json({ error: 'Failed to proxy request to dashboard API' })
  }
}
