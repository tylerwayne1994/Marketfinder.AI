// Also scrape search results pages
if (window.location.pathname.includes('/search') || window.location.search.includes('search')) {
  console.log('🔍 LoopNet search results page detected');
  setTimeout(() => {
    scrapeLoopNetSearchResults();
  }, 3000);
}

// Function to scrape search results and auto-visit promising properties
function scrapeLoopNetSearchResults() {
  try {
    console.log('📊 Scraping LoopNet search results...');
    
    const listings = document.querySelectorAll('.placardContent, .property-card, .listing-item, .search-results-item');
    console.log(`Found ${listings.length} listings on search page`);
    
    let scrapedCount = 0;
    
    listings.forEach((listing, index) => {
      setTimeout(() => {
        const property = scrapeSearchListingCard(listing);
        
        if (property && isPromisingProperty(property)) {
          console.log('✅ Found promising property:', property.title);
          sendPropertyToAPI(property);
          scrapedCount++;
        }
      }, index * 500); // Stagger requests every 500ms
    });
    
    if (scrapedCount > 0) {
      showScrapedNotification({ title: `Found ${scrapedCount} promising properties from search!` });
    }
    
  } catch (error) {
    console.error('❌ Search results scraping error:', error);
  }
}

// Extract data from search result cards
function scrapeSearchListingCard(element) {
  try {
    const titleElement = element.querySelector('.placard-title a, .property-title, .listing-title');
    const priceElement = element.querySelector('.placard-price, .price, .asking-price');
    const addressElement = element.querySelector('.placard-address, .address, .location');
    const detailsElement = element.querySelector('.placard-details, .property-details');
    
    const title = titleElement?.textContent?.trim() || 'Property';
    const address = addressElement?.textContent?.trim() || '';
    const priceText = priceElement?.textContent?.trim() || '';
    const detailsText = detailsElement?.textContent?.trim() || '';
    
    // Extract basic data
    const price = extractPriceFromText(priceText);
    const unitsMatch = detailsText.match(/(\d+)\s*units?/i);
    const units = unitsMatch ? parseInt(unitsMatch[1]) : null;
    
    const property = {
      id: generatePropertyId('loopnet_search'),
      source: 'LoopNet',
      title,
      address,
      price,
      units,
      url: titleElement?.href || window.location.href,
      scrapedAt: new Date().toISOString(),
      propertyType: 'Multifamily', // Assume multifamily for now
      scrapedFrom: 'search_results'
    };
    
    return property;
  } catch (error) {
    console.error('Error parsing search listing:', error);
    return null;
  }
}

// Check if property looks promising based on common criteria
function isPromisingProperty(property) {
  // Basic filters - adjust these based on common buy box criteria
  
  // Must have price and units
  if (!property.price || !property.units) return false;
  
  // Price range filter (adjust as needed)
  if (property.price < 500000 || property.price > 20000000) return false;
  
  // Unit count filter (focus on multifamily)
  if (property.units < 5 || property.units > 200) return false;
  
  // Price per unit filter
  const pricePerUnit = property.price / property.units;
  if (pricePerUnit < 30000 || pricePerUnit > 500000) return false;
  
  return true;
}