// crexi-scraper.js - Crexi Content Script

(function() {
  'use strict';
  
  console.log('🔍 Crexi scraper loaded on:', window.location.href);
  
  // Check if we're on a property detail page
  if (window.location.pathname.includes('/properties/')) {
    console.log('📄 Crexi property page detected');
    setTimeout(() => {
      scrapeCrexiProperty();
    }, 3000); // Wait for page to fully load
  }
  
  // Function to scrape property data from Crexi
  function scrapeCrexiProperty() {
    try {
      console.log('🏢 Starting Crexi property scraping...');
      
      const property = {
        id: generatePropertyId('crexi'),
        source: 'Crexi',
        url: window.location.href,
        scrapedAt: new Date().toISOString(),
        
        // Basic Information
        title: extractCrexiTitle(),
        address: extractCrexiAddress(),
        propertyType: extractCrexiPropertyType(),
        
        // Financial Data
        price: extractCrexiPrice(),
        capRate: extractCrexiCapRate(),
        noi: extractCrexiNOI(),
        pricePerUnit: extractCrexiPricePerUnit(),
        pricePerSF: extractCrexiPricePerSF(),
        
        // Property Details
        units: extractCrexiUnits(),
        sqft: extractCrexiSqft(),
        yearBuilt: extractCrexiYearBuilt(),
        lotSize: extractCrexiLotSize(),
        vacancy: extractCrexiVacancy(),
        
        // Listing Information
        broker: extractCrexiBroker(),
        listingDate: extractCrexiListingDate(),
        
        // Description
        description: extractCrexiDescription()
      };
      
      console.log('📊 Scraped Crexi property data:', property);
      
      // Only send if we have essential data
      if (property.title && (property.price || property.capRate || property.units)) {
        console.log('✅ Sending Crexi property to API:', property.title);
        sendPropertyToAPI(property);
        showScrapedNotification(property);
      } else {
        console.log('⚠️ Insufficient Crexi property data, skipping:', property);
      }
      
    } catch (error) {
      console.error('❌ Crexi scraping error:', error);
    }
  }
  
  // === CREXI DATA EXTRACTION FUNCTIONS ===
  
  function extractCrexiTitle() {
    const selectors = [
      'h1.property-title',
      '.property-name h1',
      '.listing-title',
      'h1[data-testid="property-title"]',
      'h1'
    ];
    
    return extractTextFromSelectors(selectors) || 'Commercial Property';
  }
  
  function extractCrexiAddress() {
    const selectors = [
      '.property-address',
      '.listing-address',
      '[data-testid="address"]',
      '.address'
    ];
    
    return extractTextFromSelectors(selectors) || 'Address not available';
  }
  
  function extractCrexiPrice() {
    const selectors = [
      '.asking-price',
      '.price',
      '.listing-price',
      '[data-testid="price"]'
    ];
    
    const priceText = extractTextFromSelectors(selectors);
    return extractPriceFromText(priceText);
  }
  
  function extractCrexiCapRate() {
    const bodyText = document.body.textContent.toLowerCase();
    
    // Try specific selectors first
    const capRateSelectors = [
      '.cap-rate',
      '[data-testid="cap-rate"]',
      '.capitalization-rate'
    ];
    
    let capRateText = extractTextFromSelectors(capRateSelectors);
    
    // If not found, search in body text
    if (!capRateText) {
      const capRatePatterns = [
        /cap\s*rate[:\s]*(\d+\.?\d*)\s*%/i,
        /capitalization\s*rate[:\s]*(\d+\.?\d*)\s*%/i,
        /(\d+\.?\d*)\s*%\s*cap/i
      ];
      
      for (const pattern of capRatePatterns) {
        const match = bodyText.match(pattern);
        if (match) {
          return parseFloat(match[1]);
        }
      }
    }
    
    if (capRateText) {
      const match = capRateText.match(/(\d+\.?\d*)\s*%/);
      return match ? parseFloat(match[1]) : null;
    }
    
    return null;
  }
  
  function extractCrexiNOI() {
    const bodyText = document.body.textContent;
    const noiPatterns = [
      /NOI[:\s]*\$?([\d,]+)/i,
      /net\s*operating\s*income[:\s]*\$?([\d,]+)/i,
      /annual\s*income[:\s]*\$?([\d,]+)/i
    ];
    
    for (const pattern of noiPatterns) {
      const match = bodyText.match(pattern);
      if (match) {
        return parseInt(match[1].replace(/,/g, ''));
      }
    }
    
    return null;
  }
  
  function extractCrexiUnits() {
    const bodyText = document.body.textContent;
    const unitsPatterns = [
      /(\d+)\s*units?/i,
      /(\d+)\s*doors?/i,
      /(\d+)\s*apartments?/i,
      /unit[s]?\s*[:\-]?\s*(\d+)/i
    ];
    
    for (const pattern of unitsPatterns) {
      const match = bodyText.match(pattern);
      if (match) {
        return parseInt(match[1]);
      }
    }
    
    return null;
  }
  
  function extractCrexiSqft() {
    const bodyText = document.body.textContent;
    const sqftPatterns = [
      /([\d,]+)\s*sq\.?\s*ft/i,
      /sq\.?\s*ft[:\s]*([\d,]+)/i,
      /([\d,]+)\s*square\s*feet/i
    ];
    
    for (const pattern of sqftPatterns) {
      const match = bodyText.match(pattern);
      if (match) {
        return parseInt(match[1].replace(/,/g, ''));
      }
    }
    
    return null;
  }
  
  function extractCrexiYearBuilt() {
    const bodyText = document.body.textContent;
    const yearPatterns = [
      /built[:\s]*(\d{4})/i,
      /year\s*built[:\s]*(\d{4})/i,
      /constructed[:\s]*(\d{4})/i
    ];
    
    for (const pattern of yearPatterns) {
      const match = bodyText.match(pattern);
      if (match) {
        const year = parseInt(match[1]);
        if (year >= 1800 && year <= new Date().getFullYear()) {
          return year;
        }
      }
    }
    
    return null;
  }
  
  function extractCrexiVacancy() {
    const bodyText = document.body.textContent;
    const vacancyPatterns = [
      /vacancy[:\s]*(\d+\.?\d*)\s*%/i,
      /vacant[:\s]*(\d+\.?\d*)\s*%/i,
      /occupancy[:\s]*(\d+\.?\d*)\s*%/i
    ];
    
    for (const pattern of vacancyPatterns) {
      const match = bodyText.match(pattern);
      if (match) {
        let vacancy = parseFloat(match[1]);
        // If it's occupancy, convert to vacancy
        if (pattern.source.includes('occupancy')) {
          vacancy = 100 - vacancy;
        }
        return vacancy;
      }
    }
    
    return null;
  }
  
  function extractCrexiPricePerUnit() {
    const bodyText = document.body.textContent;
    const ppuPatterns = [
      /\$?([\d,]+)\s*per\s*unit/i,
      /price\s*per\s*unit[:\s]*\$?([\d,]+)/i,
      /unit\s*price[:\s]*\$?([\d,]+)/i
    ];
    
    for (const pattern of ppuPatterns) {
      const match = bodyText.match(pattern);
      if (match) {
        return parseInt(match[1].replace(/,/g, ''));
      }
    }
    
    return null;
  }
  
  function extractCrexiPricePerSF() {
    const bodyText = document.body.textContent;
    const ppsfPatterns = [
      /\$?([\d,]+)\s*per\s*sq\.?\s*ft/i,
      /price\s*per\s*sq\.?\s*ft[:\s]*\$?([\d,]+)/i,
      /\$?([\d,]+)\s*\/\s*sq\.?\s*ft/i
    ];
    
    for (const pattern of ppsfPatterns) {
      const match = bodyText.match(pattern);
      if (match) {
        return parseInt(match[1].replace(/,/g, ''));
      }
    }
    
    return null;
  }
  
  function extractCrexiBroker() {
    const selectors = [
      '.broker-name',
      '.listing-agent',
      '.contact-name',
      '.agent-name'
    ];
    
    return extractTextFromSelectors(selectors);
  }
  
  function extractCrexiDescription() {
    const selectors = [
      '.property-description',
      '.listing-description',
      '.description',
      '.property-details'
    ];
    
    const description = extractTextFromSelectors(selectors);
    return description ? description.substring(0, 500) : null;
  }
  
  function extractCrexiPropertyType() {
    const bodyText = document.body.textContent.toLowerCase();
    
    if (bodyText.includes('multifamily') || bodyText.includes('apartment')) return 'Multifamily';
    if (bodyText.includes('office')) return 'Office';
    if (bodyText.includes('retail')) return 'Retail';
    if (bodyText.includes('industrial')) return 'Industrial';
    if (bodyText.includes('warehouse')) return 'Warehouse';
    
    return 'Commercial';
  }
  
  function extractCrexiListingDate() {
    const bodyText = document.body.textContent;
    const datePatterns = [
      /listed[:\s]*(\d{1,2}\/\d{1,2}\/\d{4})/i,
      /listing\s*date[:\s]*(\d{1,2}\/\d{1,2}\/\d{4})/i
    ];
    
    for (const pattern of datePatterns) {
      const match = bodyText.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    return null;
  }
  
  function extractCrexiLotSize() {
    const bodyText = document.body.textContent;
    const lotPatterns = [
      /([\d,]+\.?\d*)\s*acres?/i,
      /lot\s*size[:\s]*([\d,]+\.?\d*)/i,
      /land\s*area[:\s]*([\d,]+\.?\d*)/i
    ];
    
    for (const pattern of lotPatterns) {
      const match = bodyText.match(pattern);
      if (match) {
        return parseFloat(match[1].replace(/,/g, ''));
      }
    }
    
    return null;
  }
  
  // === UTILITY FUNCTIONS ===
  
  function extractTextFromSelectors(selectors) {
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        return element.textContent.trim();
      }
    }
    return null;
  }
  
  function extractPriceFromText(text) {
    if (!text) return null;
    
    const pricePatterns = [
      /\$?([\d,]+(?:\.\d{2})?)/,
      /([\d,]+)\s*(?:million|mil)/i,
      /\$?([\d,]+)/
    ];
    
    for (const pattern of pricePatterns) {
      const match = text.match(pattern);
      if (match) {
        let price = parseFloat(match[1].replace(/,/g, ''));
        
        if (text.toLowerCase().includes('million') || text.toLowerCase().includes('mil')) {
          price *= 1000000;
        }
        
        return price;
      }
    }
    
    return null;
  }
  
  function generatePropertyId(source) {
    return `${source}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  function sendPropertyToAPI(property) {
    chrome.runtime.sendMessage({
      action: 'saveProperty',
      property: property
    }, (response) => {
      if (response && response.success) {
        console.log('✅ Crexi property saved successfully');
      } else {
        console.error('❌ Failed to save Crexi property:', response?.error);
      }
    });
  }
  
  function showScrapedNotification(property) {
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        font-size: 14px;
        font-weight: 500;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        animation: slideIn 0.3s ease-out;
      ">
        <div>🏢 Crexi Property Scraped!</div>
        <div style="font-size: 12px; opacity: 0.9; margin-top: 4px;">
          ${property.title || 'Commercial Property'}
        </div>
      </div>
    `;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
      style.remove();
    }, 4000);
  }
  
})();