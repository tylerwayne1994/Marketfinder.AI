const express = require('express');
const cors = require('cors');
const app = express();

// CORS configuration
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// In-memory database - stores all properties
let properties = [
  // Your existing test properties (keep these working)
  {
    id: 'test-loopnet-1',
    title: 'Riverside Apartments - Austin',
    address: '1234 Riverside Dr, Austin, TX 78701',
    price: 3200000,
    units: 24,
    capRate: 7.2,
    noi: 192000,
    yearBuilt: 2015,
    sqft: 28800,
    source: 'LoopNet',
    aiScore: 0.87,
    aiRecommendation: '🚀 Strong Buy - Excellent cap rate and location',
    url: 'https://loopnet.com/test-property-1',
    scrapedAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'test-crexi-1',
    title: 'Pine Valley Multifamily Complex',
    address: '5678 Pine Valley Rd, Dallas, TX 75201',
    price: 2800000,
    units: 18,
    capRate: 6.8,
    noi: 168000,
    yearBuilt: 2018,
    sqft: 21600,
    source: 'Crexi',
    aiScore: 0.82,
    aiRecommendation: '✅ Good Investment - Strong fundamentals',
    url: 'https://crexi.com/test-property-1',
    scrapedAt: new Date().toISOString(),
    isActive: true
  }
];

console.log('🏢 Server starting with', properties.length, 'test properties');

// Helper function to calculate AI score
function calculateAIScore(property) {
  let score = 0.5; // Base score
  
  // Cap rate scoring (most important)
  if (property.capRate) {
    if (property.capRate >= 8) score += 0.3;
    else if (property.capRate >= 6) score += 0.2;
    else if (property.capRate >= 4) score += 0.1;
  }
  
  // Price per unit scoring
  if (property.price && property.units) {
    const pricePerUnit = property.price / property.units;
    if (pricePerUnit < 100000) score += 0.2;
    else if (pricePerUnit < 150000) score += 0.1;
  }
  
  // NOI scoring
  if (property.noi && property.price) {
    const noiYield = (property.noi * 12) / property.price;
    if (noiYield > 0.08) score += 0.15;
    else if (noiYield > 0.06) score += 0.1;
  }
  
  return Math.max(0.1, Math.min(1.0, score));
}

// Helper function to generate AI recommendation
function generateAIRecommendation(property) {
  const score = property.aiScore || calculateAIScore(property);
  
  if (score >= 0.85) return "🚀 Strong Buy - Excellent financials and market position";
  if (score >= 0.75) return "✅ Good Investment - Above average returns expected";
  if (score >= 0.65) return "🤔 Consider - Mixed signals, analyze carefully";
  if (score >= 0.55) return "⚠️ Caution - Below market performance indicators";
  return "❌ Pass - Poor financial metrics for investment";
}

// API Routes

// Root route - shows API info
app.get('/', (req, res) => {
  res.json({
    message: '🏢 Buy Box API Server - Enhanced',
    status: 'Running',
    propertiesCount: properties.filter(p => p.isActive).length,
    endpoints: {
      health: '/api/health',
      search: '/api/properties/search?states=TX',
      addProperty: 'POST /api/properties',
      stats: '/api/stats'
    },
    version: '2.0'
  });
});

// Health check
app.get('/api/health', (req, res) => {
  const activeProperties = properties.filter(p => p.isActive).length;
  res.json({ 
    status: 'OK', 
    propertiesCount: activeProperties,
    timestamp: new Date().toISOString()
  });
});

// Search properties (your existing endpoint - enhanced)
app.get('/api/properties/search', (req, res) => {
  console.log('🔍 Search request:', req.query);
  
  // Only return active properties
  let results = properties.filter(p => p.isActive !== false);
  
  // Apply state filter
  if (req.query.states) {
    const states = req.query.states.split(',').map(s => s.trim().toUpperCase());
    console.log('🗺️ Filtering by states:', states);
    results = results.filter(p => 
      states.some(state => p.address && p.address.toUpperCase().includes(state))
    );
  }
  
  // Apply city filter
  if (req.query.cities) {
    const cities = req.query.cities.split(',').map(c => c.trim().toLowerCase());
    console.log('🏙️ Filtering by cities:', cities);
    results = results.filter(p => 
      cities.some(city => p.address && p.address.toLowerCase().includes(city))
    );
  }
  
  // Apply price filters
  if (req.query.minPrice) {
    const minPrice = parseInt(req.query.minPrice);
    results = results.filter(p => p.price && p.price >= minPrice);
  }
  
  if (req.query.maxPrice) {
    const maxPrice = parseInt(req.query.maxPrice);
    results = results.filter(p => p.price && p.price <= maxPrice);
  }
  
  // Apply cap rate filters
  if (req.query.minCapRate) {
    const minCapRate = parseFloat(req.query.minCapRate);
    results = results.filter(p => p.capRate && p.capRate >= minCapRate);
  }
  
  if (req.query.maxCapRate) {
    const maxCapRate = parseFloat(req.query.maxCapRate);
    results = results.filter(p => p.capRate && p.capRate <= maxCapRate);
  }
  
  // Apply unit filters
  if (req.query.minUnits) {
    const minUnits = parseInt(req.query.minUnits);
    results = results.filter(p => p.units && p.units >= minUnits);
  }
  
  if (req.query.maxUnits) {
    const maxUnits = parseInt(req.query.maxUnits);
    results = results.filter(p => p.units && p.units <= maxUnits);
  }
  
  // Sort by AI score (highest first)
  results.sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0));
  
  console.log(`✅ Returning ${results.length} properties after filtering`);
  
  res.json({ 
    success: true, 
    properties: results,
    pagination: {
      total: results.length,
      limit: 100,
      offset: 0,
      hasMore: false
    }
  });
});

// Add new property (for Chrome extension)
app.post('/api/properties', (req, res) => {
  try {
    const property = req.body;
    
    console.log('💾 New property received:', property.title || 'Unnamed Property');
    
    // Validate required fields
    if (!property.id) {
      property.id = `scraped_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Check if property already exists (avoid duplicates)
    const existingProperty = properties.find(p => p.id === property.id);
    
    if (existingProperty) {
      // Update existing property
      const index = properties.findIndex(p => p.id === property.id);
      properties[index] = {
        ...existingProperty,
        ...property,
        updatedAt: new Date().toISOString(),
        isActive: true
      };
      
      console.log('📝 Updated existing property:', property.title);
      res.json({ 
        success: true, 
        property: properties[index], 
        action: 'updated' 
      });
    } else {
      // Add AI scoring if not present
      if (!property.aiScore) {
        property.aiScore = calculateAIScore(property);
      }
      
      if (!property.aiRecommendation) {
        property.aiRecommendation = generateAIRecommendation(property);
      }
      
      // Add metadata
      property.scrapedAt = property.scrapedAt || new Date().toISOString();
      property.isActive = true;
      
      // Add to database
      properties.push(property);
      
      console.log('✅ Added new property:', property.title, 
                  `(Total: ${properties.filter(p => p.isActive).length} active properties)`);
      
      res.json({ 
        success: true, 
        property, 
        action: 'created',
        totalProperties: properties.filter(p => p.isActive).length
      });
    }
    
  } catch (error) {
    console.error('❌ Error adding property:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to add property', 
      details: error.message 
    });
  }
});

// Get stats (enhanced)
app.get('/api/stats', (req, res) => {
  try {
    const activeProperties = properties.filter(p => p.isActive !== false);
    const totalProperties = activeProperties.length;
    
    if (totalProperties === 0) {
      return res.json({
        success: true,
        totalProperties: 0,
        todayCount: 0,
        avgCapRate: 0,
        priceRange: { minPrice: 0, maxPrice: 0, avgPrice: 0 },
        topMarkets: []
      });
    }
    
    // Calculate averages
    const prices = activeProperties.map(p => p.price).filter(p => p && p > 0);
    const capRates = activeProperties.map(p => p.capRate).filter(c => c && c > 0);
    
    const avgPrice = prices.length > 0 ? prices.reduce((sum, p) => sum + p, 0) / prices.length : 0;
    const avgCapRate = capRates.length > 0 ? capRates.reduce((sum, c) => sum + c, 0) / capRates.length : 0;
    
    // Today's count
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayCount = activeProperties.filter(p => 
      new Date(p.scrapedAt) >= todayStart
    ).length;
    
    // Top markets by source
    const sourceCount = {};
    activeProperties.forEach(p => {
      if (p.source) {
        sourceCount[p.source] = (sourceCount[p.source] || 0) + 1;
      }
    });
    
    const topMarkets = Object.entries(sourceCount)
      .map(([source, count]) => ({ _id: source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    console.log('📊 Stats requested - Active properties:', totalProperties);
    
    res.json({
      success: true,
      totalProperties,
      todayCount,
      avgCapRate: Math.round(avgCapRate * 10) / 10,
      priceRange: {
        minPrice: prices.length > 0 ? Math.min(...prices) : 0,
        maxPrice: prices.length > 0 ? Math.max(...prices) : 0,
        avgPrice: Math.round(avgPrice)
      },
      topMarkets
    });
    
  } catch (error) {
    console.error('❌ Stats error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate stats' 
    });
  }
});

// Get property by ID
app.get('/api/properties/:id', (req, res) => {
  try {
    const property = properties.find(p => p.id === req.params.id && p.isActive !== false);
    
    if (!property) {
      return res.status(404).json({ 
        success: false, 
        error: 'Property not found' 
      });
    }
    
    res.json({ success: true, property });
  } catch (error) {
    console.error('❌ Error fetching property:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch property' 
    });
  }
});

// Delete/deactivate property
app.delete('/api/properties/:id', (req, res) => {
  try {
    const propertyIndex = properties.findIndex(p => p.id === req.params.id);
    
    if (propertyIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        error: 'Property not found' 
      });
    }
    
    // Soft delete - mark as inactive instead of removing
    properties[propertyIndex].isActive = false;
    properties[propertyIndex].deletedAt = new Date().toISOString();
    
    console.log('🗑️ Deactivated property:', properties[propertyIndex].title);
    
    res.json({ 
      success: true, 
      message: 'Property deactivated successfully' 
    });
  } catch (error) {
    console.error('❌ Error deleting property:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete property' 
    });
  }
});

// Clear all scraped properties (keep test properties)
app.post('/api/admin/clear-scraped', (req, res) => {
  try {
    const beforeCount = properties.length;
    
    // Keep only test properties (those with IDs starting with 'test-')
    properties = properties.filter(p => p.id.startsWith('test-'));
    
    const afterCount = properties.length;
    const removedCount = beforeCount - afterCount;
    
    console.log(`🧹 Cleared ${removedCount} scraped properties, kept ${afterCount} test properties`);
    
    res.json({ 
      success: true, 
      message: `Cleared ${removedCount} scraped properties`,
      remainingProperties: afterCount
    });
  } catch (error) {
    console.error('❌ Error clearing properties:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to clear properties' 
    });
  }
});

// Start server
const PORT = 3001;
app.listen(PORT, () => {
  console.log('🚀 Enhanced Buy Box API Server Started!');
  console.log(`📍 Running on: http://localhost:${PORT}`);
  console.log(`📊 Active properties: ${properties.filter(p => p.isActive !== false).length}`);
  console.log('');
  console.log('🛠️  Available endpoints:');
  console.log('  GET    /api/health              - Health check');
  console.log('  GET    /api/properties/search   - Search properties');
  console.log('  POST   /api/properties          - Add new property');
  console.log('  GET    /api/properties/:id      - Get property by ID');
  console.log('  DELETE /api/properties/:id      - Delete property');
  console.log('  GET    /api/stats               - Get statistics');
  console.log('  POST   /api/admin/clear-scraped - Clear scraped properties');
  console.log('');
  console.log('🧪 Ready for Chrome extension integration!');
});
