import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, MapPin, DollarSign, Home, Filter, Play, Pause, RefreshCw, Download, TrendingUp } from 'lucide-react';
import { styles } from './styles';
import scraperService from './ScraperService';

const BuyBoxPage = ({ 
  setCurrentPage, 
  buyBoxCriteria, 
  setBuyBoxCriteria,
  scrapedProperties,
  setScrapedProperties,
  isScrapingActive,
  setIsScrapingActive,
  scrapingProgress,
  setScrapingProgress
}) => {
  const [activeTab, setActiveTab] = useState('criteria');
  const [hoveredButton, setHoveredButton] = useState(null);
  const [scrapingStatus, setScrapingStatus] = useState('idle'); // idle, initializing, scraping, completed, error
  const [statusMessage, setStatusMessage] = useState('');
  const [searchId, setSearchId] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [favorites, setFavorites] = useState([]);

  // Load favorites on component mount
  useEffect(() => {
    const loadFavorites = () => {
      const savedFavorites = scraperService.getFavoriteProperties();
      setFavorites(savedFavorites.map(f => f.id));
    };
    loadFavorites();
  }, []);

  const toggleFavorite = (property) => {
    const isFavorite = favorites.includes(property.id);
    
    if (isFavorite) {
      scraperService.removeFavoriteProperty(property.id);
      setFavorites(prev => prev.filter(id => id !== property.id));
    } else {
      scraperService.saveFavoriteProperty(property);
      setFavorites(prev => [...prev, property.id]);
    }
  };

  // Browser scraper is ready immediately - no initialization needed
  useEffect(() => {
    console.log('Browser scraper service ready');
  }, []);

  const handleInputChange = (field, value) => {
    setBuyBoxCriteria(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field, value, isChecked) => {
    setBuyBoxCriteria(prev => ({
      ...prev,
      [field]: isChecked 
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };

  const startScraping = async () => {
    try {
      setScrapingStatus('initializing');
      setStatusMessage('Initializing AI scraper...');
      setIsScrapingActive(true);
      setScrapingProgress(0);
      setScrapedProperties([]);

      // Start the real scraping process
      const result = await scraperService.startScraping(buyBoxCriteria, {
        onProgress: (progressData) => {
          setScrapingProgress(progressData.progress);
          setStatusMessage(progressData.message);
          if (progressData.propertiesFound > 0) {
            setScrapedProperties(prev => [...prev]);
          }
        },
        onComplete: (results) => {
          setScrapedProperties(results);
          setScrapingStatus('completed');
          setStatusMessage(`Completed! Found ${results.length} properties`);
          setIsScrapingActive(false);
          setScrapingProgress(100);
          
          // Generate AI insights
          const insights = scraperService.analyzeMarketTrends();
          setAiInsights(insights);
          
          // Auto-switch to results tab
          setActiveTab('results');
        },
        onError: (error) => {
          setScrapingStatus('error');
          setStatusMessage(`Error: ${error.message}`);
          setIsScrapingActive(false);
        }
      });

      setSearchId(result.searchId);
      setScrapingStatus('scraping');

    } catch (error) {
      console.error('Scraping failed:', error);
      setScrapingStatus('error');
      setStatusMessage(`Failed to start scraping: ${error.message}`);
      setIsScrapingActive(false);
    }
  };

  const stopScraping = () => {
    scraperService.stopScraping();
    setIsScrapingActive(false);
    setScrapingStatus('idle');
    setStatusMessage('Scraping stopped by user');
  };

  const exportResults = async (format) => {
    if (!searchId) return;
    
    try {
      const exportData = scraperService.exportResults(searchId, format);
      const blob = new Blob([exportData], { 
        type: format === 'csv' ? 'text/csv' : 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `multifamily_properties_${new Date().toISOString().split('T')[0]}.${format}`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const resetCriteria = () => {
    setBuyBoxCriteria({
      states: [],
      cities: [],
      zipCodes: [],
      marketTypes: [],
      propertyTypes: ['multifamily'], // Fixed to multifamily only
      minUnits: '',
      maxUnits: '',
      minPrice: '',
      maxPrice: '',
      minPricePerUnit: '',
      maxPricePerUnit: '',
      minCapRate: '',
      maxCapRate: '',
      minCashFlow: '',
      maxCashFlow: '',
      minROI: '',
      maxROI: '',
      minYearBuilt: '',
      maxYearBuilt: '',
      minSqft: '',
      maxSqft: '',
      condition: [],
      listingAge: '',
      priceReductions: false,
      distressedSales: false,
      offMarketOnly: false,
      sellerFinancing: false,
      assumableMortgage: false,
      cashOnly: false,
      keywords: '',
      excludeKeywords: '',
      minRentRoll: '',
      maxVacancy: '',
      emailAlerts: false,
      alertFrequency: 'daily',
    });
    setScrapedProperties([]);
    setScrapingProgress(0);
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.container}>
        <div style={styles.header}>
          <button 
            style={styles.backButton}
            onClick={() => setCurrentPage('home')}
          >
            <ArrowLeft size={20} /> Back to Home
          </button>
          <h1 style={styles.title}>Multifamily Buy Box Scanner</h1>
          <p style={styles.subtitle}>
            Set your investment criteria and let AI scan major real estate platforms for matching multifamily properties
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', marginBottom: '30px', borderBottom: '2px solid #e5e7eb' }}>
          {[
            { key: 'criteria', label: 'Investment Criteria', icon: Filter },
            { key: 'results', label: `Results (${scrapedProperties.length})`, icon: Search }
          ].map(tab => (
            <button
              key={tab.key}
              style={{
                ...styles.tabButton,
                ...(activeTab === tab.key ? styles.tabButtonActive : {}),
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onClick={() => setActiveTab(tab.key)}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'criteria' && (
          <div style={{ display: 'grid', gap: '30px' }}>
            {/* Location Criteria */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <MapPin size={24} color="#667eea" />
                <h2 style={styles.sectionTitle}>Location Criteria</h2>
              </div>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Target States</label>
                  <input
                    type="text"
                    style={styles.input}
                    placeholder="e.g., TX, FL, GA (comma separated)"
                    value={buyBoxCriteria.states.join(', ')}
                    onChange={(e) => handleInputChange('states', e.target.value.split(', ').filter(s => s.trim()))}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Target Cities</label>
                  <input
                    type="text"
                    style={styles.input}
                    placeholder="e.g., Austin, Dallas, Houston"
                    value={buyBoxCriteria.cities.join(', ')}
                    onChange={(e) => handleInputChange('cities', e.target.value.split(', ').filter(s => s.trim()))}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Market Types</label>
                  <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                    {['Urban', 'Suburban', 'Rural'].map(type => (
                      <label key={type} style={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={buyBoxCriteria.marketTypes.includes(type.toLowerCase())}
                          onChange={(e) => handleArrayChange('marketTypes', type.toLowerCase(), e.target.checked)}
                        />
                        {type}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Property Criteria */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <Home size={24} color="#10b981" />
                <h2 style={styles.sectionTitle}>Property Criteria</h2>
              </div>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Property Type</label>
                  <input
                    type="text"
                    style={{...styles.input, backgroundColor: '#f3f4f6', color: '#6b7280'}}
                    value="Multifamily Only"
                    disabled
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Min Units</label>
                  <input
                    type="number"
                    style={styles.input}
                    placeholder="5"
                    value={buyBoxCriteria.minUnits}
                    onChange={(e) => handleInputChange('minUnits', e.target.value)}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Max Units</label>
                  <input
                    type="number"
                    style={styles.input}
                    placeholder="100"
                    value={buyBoxCriteria.maxUnits}
                    onChange={(e) => handleInputChange('maxUnits', e.target.value)}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Min Year Built</label>
                  <input
                    type="number"
                    style={styles.input}
                    placeholder="1980"
                    value={buyBoxCriteria.minYearBuilt}
                    onChange={(e) => handleInputChange('minYearBuilt', e.target.value)}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Property Condition</label>
                  <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                    {['Excellent', 'Good', 'Fair', 'Needs Work'].map(condition => (
                      <label key={condition} style={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={buyBoxCriteria.condition.includes(condition.toLowerCase().replace(' ', '-'))}
                          onChange={(e) => handleArrayChange('condition', condition.toLowerCase().replace(' ', '-'), e.target.checked)}
                        />
                        {condition}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Criteria */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <DollarSign size={24} color="#f59e0b" />
                <h2 style={styles.sectionTitle}>Financial Criteria</h2>
              </div>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Min Purchase Price</label>
                  <input
                    type="number"
                    style={styles.input}
                    placeholder="500000"
                    value={buyBoxCriteria.minPrice}
                    onChange={(e) => handleInputChange('minPrice', e.target.value)}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Max Purchase Price</label>
                  <input
                    type="number"
                    style={styles.input}
                    placeholder="5000000"
                    value={buyBoxCriteria.maxPrice}
                    onChange={(e) => handleInputChange('maxPrice', e.target.value)}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Min Cap Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    style={styles.input}
                    placeholder="6.0"
                    value={buyBoxCriteria.minCapRate}
                    onChange={(e) => handleInputChange('minCapRate', e.target.value)}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Max Cap Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    style={styles.input}
                    placeholder="12.0"
                    value={buyBoxCriteria.maxCapRate}
                    onChange={(e) => handleInputChange('maxCapRate', e.target.value)}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Min Price per Unit</label>
                  <input
                    type="number"
                    style={styles.input}
                    placeholder="75000"
                    value={buyBoxCriteria.minPricePerUnit}
                    onChange={(e) => handleInputChange('minPricePerUnit', e.target.value)}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Max Price per Unit</label>
                  <input
                    type="number"
                    style={styles.input}
                    placeholder="200000"
                    value={buyBoxCriteria.maxPricePerUnit}
                    onChange={(e) => handleInputChange('maxPricePerUnit', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Advanced Filters */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <Filter size={24} color="#8b5cf6" />
                <h2 style={styles.sectionTitle}>Advanced Filters</h2>
              </div>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Keywords (Include)</label>
                  <input
                    type="text"
                    style={styles.input}
                    placeholder="e.g., renovated, value-add, cash flow"
                    value={buyBoxCriteria.keywords}
                    onChange={(e) => handleInputChange('keywords', e.target.value)}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Keywords (Exclude)</label>
                  <input
                    type="text"
                    style={styles.input}
                    placeholder="e.g., student housing, senior living"
                    value={buyBoxCriteria.excludeKeywords}
                    onChange={(e) => handleInputChange('excludeKeywords', e.target.value)}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Max Vacancy (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    style={styles.input}
                    placeholder="15.0"
                    value={buyBoxCriteria.maxVacancy}
                    onChange={(e) => handleInputChange('maxVacancy', e.target.value)}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Max Days on Market</label>
                  <input
                    type="number"
                    style={styles.input}
                    placeholder="90"
                    value={buyBoxCriteria.listingAge}
                    onChange={(e) => handleInputChange('listingAge', e.target.value)}
                  />
                </div>
              </div>
              
              <div style={{ marginTop: '20px' }}>
                <h3 style={{ ...styles.sectionTitle, fontSize: '16px', marginBottom: '15px' }}>Special Deal Types</h3>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                  {[
                    { key: 'priceReductions', label: 'Price Reductions Only' },
                    { key: 'distressedSales', label: 'Distressed Sales' },
                    { key: 'sellerFinancing', label: 'Seller Financing Available' },
                    { key: 'assumableMortgage', label: 'Assumable Mortgages' }
                  ].map(option => (
                    <label key={option.key} style={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={buyBoxCriteria[option.key]}
                        onChange={(e) => handleInputChange(option.key, e.target.checked)}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '40px' }}>
              <button
                style={{
                  ...styles.button,
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  ...(hoveredButton === 'reset' ? styles.buttonHover : {})
                }}
                onMouseEnter={() => setHoveredButton('reset')}
                onMouseLeave={() => setHoveredButton(null)}
                onClick={resetCriteria}
              >
                <RefreshCw size={20} /> Reset Criteria
              </button>
              
              <button
                style={{
                  ...styles.button,
                  background: isScrapingActive 
                    ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                    : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  ...(hoveredButton === 'scan' ? styles.buttonHover : {})
                }}
                onMouseEnter={() => setHoveredButton('scan')}
                onMouseLeave={() => setHoveredButton(null)}
                onClick={isScrapingActive ? stopScraping : startScraping}
                disabled={isScrapingActive && scrapingProgress < 100}
              >
                {isScrapingActive ? <Pause size={20} /> : <Play size={20} />}
                {isScrapingActive ? 'Stop Scanning' : 'Start AI Scan'}
              </button>
            </div>

            {/* Progress Bar */}
            {(isScrapingActive || scrapingProgress > 0) && (
              <div style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>
                    {statusMessage || 'Scanning Real Estate Platforms...'}
                  </span>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>
                    {Math.round(scrapingProgress)}%
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${scrapingProgress}%`,
                    height: '100%',
                    background: scrapingStatus === 'error' 
                      ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                      : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                {scrapingStatus === 'error' && (
                  <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '8px' }}>
                    {statusMessage}
                  </p>
                )}
              </div>
            )}

            {/* AI Insights Section */}
            {aiInsights && (
              <div style={{ marginTop: '30px', ...styles.section }}>
                <div style={styles.sectionHeader}>
                  <TrendingUp size={24} color="#f59e0b" />
                  <h2 style={styles.sectionTitle}>AI Market Insights</h2>
                </div>
                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Total Properties Analyzed</label>
                    <div style={{ 
                      ...styles.input, 
                      backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                      color: '#10b981',
                      fontWeight: '600'
                    }}>
                      {aiInsights.totalProperties.toLocaleString()}
                    </div>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Average Price</label>
                    <div style={{ 
                      ...styles.input, 
                      backgroundColor: 'rgba(59, 130, 246, 0.1)', 
                      color: '#3b82f6',
                      fontWeight: '600'
                    }}>
                      ${Math.round(aiInsights.averagePrice).toLocaleString()}
                    </div>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Price Range</label>
                    <div style={{ 
                      ...styles.input, 
                      backgroundColor: 'rgba(139, 92, 246, 0.1)', 
                      color: '#8b5cf6',
                      fontWeight: '600'
                    }}>
                      ${aiInsights.priceRange.min.toLocaleString()} - ${aiInsights.priceRange.max.toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div style={{ marginTop: '20px' }}>
                  <h3 style={{ ...styles.sectionTitle, fontSize: '16px', marginBottom: '15px' }}>Top Markets</h3>
                  <div style={{ display: 'grid', gap: '10px' }}>
                    {aiInsights.topLocations.slice(0, 3).map(([location, count], index) => (
                      <div key={location} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '10px 15px',
                        backgroundColor: 'rgba(51, 65, 85, 0.3)',
                        borderRadius: '8px'
                      }}>
                        <span style={{ color: '#cbd5e1' }}>{location}</span>
                        <span style={{ color: '#10b981', fontWeight: '600' }}>{count} properties</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'results' && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <Search size={24} color="#667eea" />
              <h2 style={styles.sectionTitle}>Found Properties</h2>
              {scrapedProperties.length > 0 && (
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
                  <button
                    style={{
                      ...styles.button,
                      padding: '8px 16px',
                      fontSize: '14px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    }}
                    onClick={() => exportResults('csv')}
                  >
                    <Download size={16} /> Export CSV
                  </button>
                  <button
                    style={{
                      ...styles.button,
                      padding: '8px 16px',
                      fontSize: '14px',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                    }}
                    onClick={() => exportResults('json')}
                  >
                    <Download size={16} /> Export JSON
                  </button>
                </div>
              )}
            </div>
            
            {scrapedProperties.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
                <Search size={48} color="#d1d5db" style={{ marginBottom: '20px' }} />
                <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>No Properties Found Yet</h3>
                <p>Set your criteria and start scanning to find matching multifamily properties.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '20px' }}>
                {scrapedProperties.map((property, index) => (
                  <div key={property.id || index} style={{
                    ...styles.card,
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: '20px',
                    padding: '24px',
                    alignItems: 'start'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>
                          {property.title || property.name || 'Multifamily Property'}
                        </h3>
                        <span style={{
                          backgroundColor: property.source === 'Crexi' ? 'rgba(16, 185, 129, 0.2)' :
                                         property.source === 'LoopNet' ? 'rgba(59, 130, 246, 0.2)' :
                                         property.source === 'Realtor.com' ? 'rgba(139, 92, 246, 0.2)' :
                                         'rgba(245, 158, 11, 0.2)',
                          color: property.source === 'Crexi' ? '#10b981' :
                                property.source === 'LoopNet' ? '#3b82f6' :
                                property.source === 'Realtor.com' ? '#8b5cf6' :
                                '#f59e0b',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          {property.source}
                        </span>
                      </div>
                      
                      <p style={{ color: '#6b7280', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MapPin size={16} />
                        {property.address || property.location || 'Address not available'}
                      </p>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                        {property.units && (
                          <div>
                            <span style={{ color: '#9ca3af', fontSize: '12px' }}>Units:</span>
                            <div style={{ fontWeight: '600' }}>{property.units}</div>
                          </div>
                        )}
                        {property.yearBuilt && (
                          <div>
                            <span style={{ color: '#9ca3af', fontSize: '12px' }}>Built:</span>
                            <div style={{ fontWeight: '600' }}>{property.yearBuilt}</div>
                          </div>
                        )}
                        {property.sqft && (
                          <div>
                            <span style={{ color: '#9ca3af', fontSize: '12px' }}>Sq Ft:</span>
                            <div style={{ fontWeight: '600' }}>{property.sqft.toLocaleString()}</div>
                          </div>
                        )}
                        {property.capRate && (
                          <div>
                            <span style={{ color: '#9ca3af', fontSize: '12px' }}>Cap Rate:</span>
                            <div style={{ fontWeight: '600', color: '#10b981' }}>{property.capRate}%</div>
                          </div>
                        )}
                      </div>
                      
                      {property.aiRecommendation && (
                        <div style={{
                          backgroundColor: property.aiScore >= 0.8 ? 'rgba(16, 185, 129, 0.1)' :
                                         property.aiScore >= 0.6 ? 'rgba(245, 158, 11, 0.1)' :
                                         'rgba(107, 114, 128, 0.1)',
                          color: property.aiScore >= 0.8 ? '#10b981' :
                                property.aiScore >= 0.6 ? '#f59e0b' :
                                '#6b7280',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}>
                          🤖 AI: {property.aiRecommendation}
                        </div>
                      )}
                      
                      {property.url && (
                        <a
                          href={property.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: '#3b82f6',
                            textDecoration: 'none',
                            fontSize: '14px',
                            marginTop: '12px',
                            display: 'inline-block'
                          }}
                        >
                          View Full Listing →
                        </a>
                      )}
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 }}>
                        {property.price ? `${property.price.toLocaleString()}` : 'Price on Request'}
                      </p>
                      {property.aiScore && (
                        <div style={{
                          marginTop: '8px',
                          fontSize: '14px',
                          color: '#6b7280'
                        }}>
                          AI Score: {Math.round(property.aiScore * 100)}/100
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyBoxPage;