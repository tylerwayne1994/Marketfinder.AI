// background.js - Chrome Extension Background Script

// Your API endpoint - UPDATE THIS to match your server
const API_BASE_URL = 'https://probable-guide-97x7r747w79p2p5qx-3001.app.github.dev';

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📨 Background received message:', request.action);
  
  if (request.action === 'saveProperty') {
    savePropertyToAPI(request.property)
      .then(response => {
        console.log('✅ Property saved successfully:', response);
        sendResponse({ success: true, response });
        
        // Show notification
        showNotification(`Saved: ${request.property.title}`, request.property.source);
      })
      .catch(error => {
        console.error('❌ Error saving property:', error);
        sendResponse({ success: false, error: error.message });
      });
    
    return true; // Keep message channel open for async response
  }
  
  if (request.action === 'getStats') {
    getAPIStats()
      .then(stats => {
        sendResponse({ success: true, stats });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    
    return true;
  }
});

// Function to save property to your API
async function savePropertyToAPI(property) {
  try {
    console.log('💾 Saving property to API:', property.title);
    
    // Add AI scoring before saving
    property.aiScore = calculateAIScore(property);
    property.aiRecommendation = generateAIRecommendation(property);
    
    const response = await fetch(`${API_BASE_URL}/api/properties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(property)
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('📊 API response:', result);
    
    return result;
  } catch (error) {
    console.error('💥 API Error:', error);
    throw error;
  }
}

// Function to get stats from your API
async function getAPIStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/stats`);
    
    if (!response.ok) {
      throw new Error(`Stats API failed: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('📊 Stats Error:', error);
    throw error;
  }
}

// Calculate AI score for properties
function calculateAIScore(property) {
  let score = 0.5; // Base score
  
  // Cap rate scoring (most important for commercial)
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
  
  // Vacancy scoring (lower is better)
  if (property.vacancy !== null && property.vacancy !== undefined) {
    if (property.vacancy < 5) score += 0.1;
    else if (property.vacancy > 15) score -= 0.1;
  }
  
  // Year built scoring (newer is better, but not too important)
  if (property.yearBuilt) {
    const age = new Date().getFullYear() - property.yearBuilt;
    if (age < 10) score += 0.05;
    else if (age > 50) score -= 0.05;
  }
  
  return Math.max(0.1, Math.min(1.0, score));
}

// Generate AI recommendation based on score
function generateAIRecommendation(property) {
  const score = property.aiScore || calculateAIScore(property);
  
  if (score >= 0.85) return "🚀 Strong Buy - Excellent financials and market position";
  if (score >= 0.75) return "✅ Good Investment - Above average returns expected";
  if (score >= 0.65) return "🤔 Consider - Mixed signals, analyze carefully";
  if (score >= 0.55) return "⚠️ Caution - Below market performance indicators";
  return "❌ Pass - Poor financial metrics for investment";
}

// Show notification when property is saved
function showNotification(title, source) {
  // Note: Chrome extension notifications require additional permissions
  // For now, we'll just log it
  console.log(`🔔 Notification: ${title} from ${source}`);
  
  // If you want actual notifications, add "notifications" to permissions in manifest.json
  // and uncomment below:
  /*
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icon.png',
    title: 'Property Saved!',
    message: `${title} from ${source}`
  });
  */
}

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('🚀 Buy Box Property Scanner Extension Installed!');
  console.log('📡 API Endpoint:', API_BASE_URL);
  
  // Set initial storage values
  chrome.storage.local.set({
    propertiesScraped: 0,
    lastScrapedAt: null,
    isActive: true
  });
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
  console.log('🔄 Buy Box Property Scanner Extension Started!');
});