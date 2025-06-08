import React, { useState, useContext, createContext, useEffect, useRef } from 'react';
import { Calculator, TrendingUp, ArrowRight, BarChart3, Home, Map, Zap, FileText, Settings, Moon, Sun, Palette, Bell, Plus, DollarSign, Calendar, MapPin, Users, Eye, Trash2, Edit3, Chrome, ArrowLeft } from 'lucide-react';
import PropertyScrapePage from './PropertyScrapePage';

// Error Boundary Component for debugging
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Component Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '48px', minHeight: '100vh', background: 'var(--bg-primary, #0f172a)', color: 'var(--text-primary, white)', textAlign: 'center' }}>
          <h1>Component Error Detected</h1>
          <p style={{ color: '#ef4444' }}>Error: {this.state.error?.message}</p>
          <button onClick={() => this.props.setCurrentPage('home')} style={{ marginTop: '20px', padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            Back to Home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Debug Component Loader with THEME FORCING
const DebugComponentLoader = ({ componentName, children, setCurrentPage, themeData }) => {
  console.log(`Attempting to render: ${componentName}`);
  
  useEffect(() => {
    // Force theme attributes on document
    if (themeData) {
      document.documentElement.setAttribute('data-theme', themeData.theme);
      document.documentElement.setAttribute('data-accent', themeData.accentColor);
      document.documentElement.setAttribute('data-font-size', themeData.fontSize);
    }
  }, [themeData]);
  
  try {
    return (
      <ErrorBoundary setCurrentPage={setCurrentPage}>
        <div style={{ 
          minHeight: '100vh',
          background: 'var(--bg-primary, linear-gradient(135deg, #0f172a 0%, #1e293b 100%))',
          color: 'var(--text-primary, #ffffff)',
          transition: 'all 0.3s ease'
        }}>
          {children}
        </div>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error(`Error rendering ${componentName}:`, error);
    return (
      <div style={{ padding: '48px', minHeight: '100vh', background: 'var(--bg-primary, #0f172a)', color: 'var(--text-primary, white)', textAlign: 'center' }}>
        <h1>Failed to Load: {componentName}</h1>
        <p style={{ color: '#ef4444' }}>Error: {error.message}</p>
        <button onClick={() => setCurrentPage('home')} style={{ marginTop: '20px', padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          Back to Home
        </button>
      </div>
    );
  }
};

// PropertyMap Component with WORKING Google Maps Implementation
const PropertyMap = ({ properties }) => {
  const { currentTheme } = useTheme();
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const markersRef = useRef([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load Google Maps Script
  useEffect(() => {
    // Check if already loaded
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyA79lhiG_UjtP9QDSF5qNOloJ0nysmZbzg&libraries=places';
    script.async = true;
    script.defer = true;
    
    // Set up load handler
    script.onload = () => {
      setIsLoaded(true);
    };
    
    // Add script to document
    document.head.appendChild(script);
    
    // Cleanup
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    // Check if Google Maps is loaded
    if (!isLoaded || !window.google || !window.google.maps || !mapRef.current) {
      return;
    }

    // Initialize the map
    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: { lat: 35.7596, lng: -79.0193 }, // North Carolina center
      zoom: 7,
      // Dark theme to match your app
      styles: [
        {
          featureType: "all",
          elementType: "geometry",
          stylers: [{ color: "#242f3e" }]
        },
        {
          featureType: "all",
          elementType: "labels.text.stroke",
          stylers: [{ lightness: -80 }]
        },
        {
          featureType: "administrative",
          elementType: "labels.text.fill",
          stylers: [{ color: "#746855" }]
        },
        {
          featureType: "poi",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }]
        },
        {
          featureType: "road",
          elementType: "geometry",
          stylers: [{ color: "#38414e" }]
        },
        {
          featureType: "road",
          elementType: "geometry.stroke",
          stylers: [{ color: "#212a37" }]
        },
        {
          featureType: "road",
          elementType: "labels.text.fill",
          stylers: [{ color: "#9ca5b3" }]
        },
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#17263c" }]
        },
        {
          featureType: "water",
          elementType: "labels.text.fill",
          stylers: [{ color: "#515c6d" }]
        }
      ]
    });

    setMap(mapInstance);
  }, [isLoaded]);

  useEffect(() => {
    if (!map || !window.google) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add markers for each property
    const bounds = new window.google.maps.LatLngBounds();
    
    properties.filter(p => p.lat && p.lng).forEach((property) => {
      const marker = new window.google.maps.Marker({
        position: { lat: property.lat, lng: property.lng },
        map: map,
        title: property.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#06b6d4",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2
        }
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="color: #000; padding: 10px;">
            <h3 style="margin: 0 0 5px 0;">${property.name}</h3>
            <p style="margin: 0 0 5px 0; color: #666;">${property.address}</p>
            <div><strong>Units:</strong> ${property.units}</div>
            <div><strong>Cap Rate:</strong> ${property.capRate.toFixed(2)}%</div>
            <div><strong>NOI:</strong> ${(property.noi/1000).toFixed(0)}K</div>
            <div><strong>Status:</strong> ${property.status}</div>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      markersRef.current.push(marker);
      bounds.extend(marker.getPosition());
    });

    // Fit map to show all markers
    if (properties.filter(p => p.lat && p.lng).length > 0) {
      map.fitBounds(bounds);
      // Don't zoom in too far for single property
      if (properties.filter(p => p.lat && p.lng).length === 1) {
        setTimeout(() => {
          map.setZoom(Math.min(map.getZoom(), 15));
        }, 100);
      }
    }
  }, [map, properties]);

  // Show loading state while Google Maps loads
  if (!isLoaded) {
    return (
      <div style={{
        height: '300px',
        background: 'var(--bg-hover, #374151)',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-secondary, #94a3b8)',
        fontSize: '0.875rem'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{
            width: '40px',
            height: '40px',
            margin: '0 auto 16px'
          }}></div>
          <div>Loading Google Maps...</div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      style={{
        height: '300px',
        borderRadius: '8px',
        width: '100%'
      }}
    />
  );
};

// Dashboard Component
const Dashboard = ({ setCurrentPage, setViewingProperty }) => {
  const { currentTheme, currentAccent } = useTheme();
  const [savedProperties, setSavedProperties] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');

  // Load saved properties from localStorage on component mount
  useEffect(() => {
    const loadSavedProperties = () => {
      try {
        const saved = localStorage.getItem('savedProperties');
        if (saved) {
          const properties = JSON.parse(saved);
          setSavedProperties(properties);
        } else {
          // If no saved properties, use default data
          setSavedProperties([
            {
              id: 1,
              name: 'Pine Ridge Apartments',
              address: '85 Poplar Street, Sparta, NC',
              units: 49,
              purchasePrice: 3495000,
              capRate: 7.13,
              cashOnCash: 7.57,
              roi: 12.42,
              noi: 249207,
              dateSaved: '2025-01-15',
              status: 'Under Analysis',
              lat: 36.5087,
              lng: -81.1240
            },
            {
              id: 2,
              name: 'Riverside Commons',
              address: '1234 River Road, Charlotte, NC',
              units: 24,
              purchasePrice: 1800000,
              capRate: 6.8,
              cashOnCash: 8.2,
              roi: 11.5,
              noi: 122400,
              dateSaved: '2025-01-10',
              status: 'Offer Submitted',
              lat: 35.2271,
              lng: -80.8431
            },
            {
              id: 3,
              name: 'Sunset Manor',
              address: '567 Oak Street, Asheville, NC',
              units: 16,
              purchasePrice: 1200000,
              capRate: 7.5,
              cashOnCash: 9.1,
              roi: 13.2,
              noi: 90000,
              dateSaved: '2025-01-08',
              status: 'Due Diligence',
              lat: 35.5951,
              lng: -82.5515
            }
          ]);
        }
      } catch (error) {
        console.error('Error loading saved properties:', error);
        setSavedProperties([]);
      }
    };

    loadSavedProperties();
  }, []);

  const handleDeleteProperty = (id) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      const updatedProperties = savedProperties.filter(prop => prop.id !== id);
      setSavedProperties(updatedProperties);
      
      // Update localStorage
      localStorage.setItem('savedProperties', JSON.stringify(updatedProperties));
      
      // Also remove from detailed analyses
      try {
        const detailedAnalyses = JSON.parse(localStorage.getItem('detailedAnalyses') || '[]');
        const updatedDetailedAnalyses = detailedAnalyses.filter(analysis => analysis.id !== id);
        localStorage.setItem('detailedAnalyses', JSON.stringify(updatedDetailedAnalyses));
      } catch (error) {
        console.error('Error updating detailed analyses:', error);
      }
    }
  };

  const handleViewProperty = (property) => {
    // Load the detailed analysis for this property
    try {
      const detailedAnalyses = JSON.parse(localStorage.getItem('detailedAnalyses') || '[]');
      const propertyAnalysis = detailedAnalyses.find(analysis => analysis.id === property.id);
      
      if (propertyAnalysis) {
        // Set the viewing property data and navigate to results
        setViewingProperty(propertyAnalysis);
        setCurrentPage('results');
      } else {
        // If no detailed analysis found, show basic results
        alert('Detailed analysis not found. This may be a legacy property.');
        setCurrentPage('results');
      }
    } catch (error) {
      console.error('Error loading property analysis:', error);
      alert('Error loading property analysis.');
    }
  };

  const handleEditProperty = (property) => {
    // Same as view for now - could be enhanced to load in edit mode
    handleViewProperty(property);
  };

  const filteredProperties = filterStatus === 'all' 
    ? savedProperties 
    : savedProperties.filter(prop => prop.status.toLowerCase().includes(filterStatus.toLowerCase()));

  const totalPortfolioValue = savedProperties.reduce((sum, prop) => sum + prop.purchasePrice, 0);
  const totalUnits = savedProperties.reduce((sum, prop) => sum + prop.units, 0);
  const avgCapRate = savedProperties.length > 0 ? savedProperties.reduce((sum, prop) => sum + prop.capRate, 0) / savedProperties.length : 0;
  const totalNOI = savedProperties.reduce((sum, prop) => sum + prop.noi, 0);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'under analysis': return '#3b82f6';
      case 'offer submitted': return '#f59e0b';
      case 'due diligence': return '#8b5cf6';
      case 'closed': return '#10b981';
      case 'passed': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: currentTheme.background, 
      color: currentTheme.textPrimary 
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '48px 24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <button
            onClick={() => setCurrentPage('home')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#94a3b8',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'all 0.3s ease',
              padding: '8px 12px',
              borderRadius: '6px'
            }}
            onMouseEnter={(e) => {
              e.target.style.color = '#06b6d4';
              e.target.style.backgroundColor = 'rgba(6, 182, 212, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#94a3b8';
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            <ArrowLeft size={16} /> Back to Home
          </button>
          
          <button
            onClick={() => {
              setViewingProperty(null); // Reset to create new analysis
              setCurrentPage('underwrite');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(to right, #10b981, #059669)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'all 0.3s ease'
            }}
          >
            <Plus size={16} /> Analyze New Property
          </button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: 'bold', 
            marginBottom: '16px',
            background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Investment Dashboard
          </h1>
          <p style={{ color: currentTheme.textSecondary, fontSize: '1.125rem' }}>
            Your multifamily investment portfolio overview
          </p>
        </div>

        {/* Portfolio Summary Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '24px', 
          marginBottom: '48px' 
        }}>
          <div style={{
            background: 'linear-gradient(to right, #059669, #047857)',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center'
          }}>
            <DollarSign style={{ margin: '0 auto 12px', color: 'white' }} size={32} />
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
              ${(totalPortfolioValue/1000000).toFixed(1)}M
            </div>
            <div style={{ color: '#bbf7d0', fontSize: '0.875rem' }}>Total Portfolio Value</div>
          </div>

          <div style={{
            background: 'linear-gradient(to right, #2563eb, #1d4ed8)',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center'
          }}>
            <Users style={{ margin: '0 auto 12px', color: 'white' }} size={32} />
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{totalUnits}</div>
            <div style={{ color: '#bfdbfe', fontSize: '0.875rem' }}>Total Units</div>
          </div>

          <div style={{
            background: 'linear-gradient(to right, #7c3aed, #6d28d9)',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center'
          }}>
            <TrendingUp style={{ margin: '0 auto 12px', color: 'white' }} size={32} />
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{avgCapRate.toFixed(2)}%</div>
            <div style={{ color: '#ddd6fe', fontSize: '0.875rem' }}>Avg Cap Rate</div>
          </div>

          <div style={{
            background: 'linear-gradient(to right, #ea580c, #dc2626)',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center'
          }}>
            <BarChart3 style={{ margin: '0 auto 12px', color: 'white' }} size={32} />
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
              ${(totalNOI/1000).toFixed(0)}K
            </div>
            <div style={{ color: '#fed7aa', fontSize: '0.875rem' }}>Annual NOI</div>
          </div>

          <div style={{
            background: 'linear-gradient(to right, #0891b2, #0e7490)',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center'
          }}>
            <Home style={{ margin: '0 auto 12px', color: 'white' }} size={32} />
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{savedProperties.length}</div>
            <div style={{ color: '#a5f3fc', fontSize: '0.875rem' }}>Properties</div>
          </div>
        </div>

        {/* Property Map */}
        <div style={{ 
          background: currentTheme.cardBg, 
          borderRadius: '12px', 
          padding: '24px', 
          marginBottom: '32px',
          border: `1px solid ${currentTheme.borderColor}`
        }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '600', 
            marginBottom: '20px',
            color: currentTheme.textPrimary,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <MapPin style={{ color: '#06b6d4' }} size={24} />
            Property Locations
          </h2>
          <PropertyMap properties={savedProperties} />
        </div>

        {/* Filter Controls */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '32px' 
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: currentTheme.textPrimary }}>Saved Properties</h2>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            {['all', 'analysis', 'offer', 'diligence', 'closed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  background: filterStatus === status ? currentAccent.primary : currentTheme.hover,
                  color: currentTheme.textPrimary,
                  transition: 'all 0.3s ease'
                }}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Properties List */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
          gap: '24px' 
        }}>
          {filteredProperties.map((property) => (
            <div key={property.id} style={{
              background: currentTheme.cardBg,
              borderRadius: '12px',
              padding: '24px',
              border: `1px solid ${currentTheme.borderColor}`,
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              {/* Property Header */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start', 
                marginBottom: '16px' 
              }}>
                <div>
                  <h3 style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: '600', 
                    marginBottom: '4px',
                    color: currentTheme.textPrimary
                  }}>
                    {property.name}
                  </h3>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px', 
                    color: currentTheme.textSecondary,
                    fontSize: '0.875rem'
                  }}>
                    <MapPin size={14} />
                    {property.address}
                  </div>
                </div>
                
                <div style={{
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  backgroundColor: getStatusColor(property.status) + '20',
                  color: getStatusColor(property.status),
                  border: `1px solid ${getStatusColor(property.status)}`
                }}>
                  {property.status}
                </div>
              </div>

              {/* Property Stats */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)', 
                gap: '16px', 
                marginBottom: '20px' 
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#10b981' }}>
                    {property.units}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: currentTheme.textSecondary }}>Units</div>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#06b6d4' }}>
                    ${(property.purchasePrice/1000).toFixed(0)}K
                  </div>
                  <div style={{ fontSize: '0.75rem', color: currentTheme.textSecondary }}>Purchase Price</div>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#8b5cf6' }}>
                    {property.capRate.toFixed(2)}%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: currentTheme.textSecondary }}>Cap Rate</div>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#f59e0b' }}>
                    {property.cashOnCash.toFixed(2)}%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: currentTheme.textSecondary }}>Cash on Cash</div>
                </div>
              </div>

              {/* Date Saved */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px', 
                marginBottom: '16px',
                fontSize: '0.75rem',
                color: currentTheme.textSecondary
              }}>
                <Calendar size={12} />
                Saved: {new Date(property.dateSaved).toLocaleDateString()}
              </div>

              {/* Action Buttons */}
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: '1fr 1fr auto',
                gap: '8px' 
              }}>
                <button
                  onClick={() => handleViewProperty(property)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    background: currentTheme.hover,
                    color: currentTheme.textPrimary,
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    transition: 'background-color 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = currentTheme.borderColor}
                  onMouseLeave={(e) => e.target.style.backgroundColor = currentTheme.hover}
                >
                  <Eye size={14} /> View
                </button>
                
                <button
                  onClick={() => handleEditProperty(property)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    background: '#06b6d4',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    transition: 'background-color 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#0891b2'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#06b6d4'}
                >
                  <Edit3 size={14} /> Edit
                </button>
                
                <button
                  onClick={() => handleDeleteProperty(property.id)}
                  style={{
                    padding: '8px 12px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    transition: 'background-color 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#dc2626'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#ef4444'}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProperties.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '64px 24px',
            background: currentTheme.cardBg,
            borderRadius: '12px',
            border: `2px dashed ${currentTheme.borderColor}`
          }}>
            <Home size={48} style={{ margin: '0 auto 16px', color: currentTheme.textSecondary }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px', color: currentTheme.textPrimary }}>
              No properties found
            </h3>
            <p style={{ color: currentTheme.textSecondary, marginBottom: '24px' }}>
              {filterStatus === 'all' 
                ? "Start analyzing properties to see them here" 
                : `No properties with "${filterStatus}" status`}
            </p>
            <button
              onClick={() => {
                setViewingProperty(null); // Reset to create new analysis
                setCurrentPage('underwrite');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(to right, #10b981, #059669)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'all 0.3s ease'
              }}
            >
              <Plus size={16} /> Analyze Your First Property
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Import your actual components with error handling
let UnderwritePage, UploadPage, ManualPage, ResultsPage, FinancingPage, DealStructurePage, HeatMapSelector, CountyHeatMap, MSAHeatMap, DocumentGenerator, DocSigner;

try {
  UnderwritePage = require('./UnderwritePage').default;
  console.log('✅ UnderwritePage imported successfully');
} catch (error) {
  console.error('❌ Failed to import UnderwritePage:', error);
  UnderwritePage = ({ setCurrentPage }) => (
    <div style={{ padding: '48px', minHeight: '100vh', background: 'var(--bg-primary, #0f172a)', color: 'var(--text-primary, white)', textAlign: 'center' }}>
      <h1>UnderwritePage Import Failed</h1>
      <p style={{ color: '#ef4444' }}>Error: {error.message}</p>
      <button onClick={() => setCurrentPage('home')} style={{ marginTop: '20px', padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Back to Home</button>
    </div>
  );
}

try {
  UploadPage = require('./UploadPage').default;
  console.log('✅ UploadPage imported successfully');
} catch (error) {
  console.error('❌ Failed to import UploadPage:', error);
  UploadPage = ({ setCurrentPage }) => (
    <div style={{ padding: '48px', minHeight: '100vh', background: 'var(--bg-primary, #0f172a)', color: 'var(--text-primary, white)', textAlign: 'center' }}>
      <h1>UploadPage Import Failed</h1>
      <p style={{ color: '#ef4444' }}>Error: {error.message}</p>
      <button onClick={() => setCurrentPage('home')} style={{ marginTop: '20px', padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Back to Home</button>
    </div>
  );
}

try {
  ManualPage = require('./ManualPage').default;
  console.log('✅ ManualPage imported successfully');
} catch (error) {
  console.error('❌ Failed to import ManualPage:', error);
  ManualPage = ({ setCurrentPage }) => (
    <div style={{ padding: '48px', minHeight: '100vh', background: 'var(--bg-primary, #0f172a)', color: 'var(--text-primary, white)', textAlign: 'center' }}>
      <h1>ManualPage Import Failed</h1>
      <p style={{ color: '#ef4444' }}>Error: {error.message}</p>
      <button onClick={() => setCurrentPage('home')} style={{ marginTop: '20px', padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Back to Home</button>
    </div>
  );
}

try {
  ResultsPage = require('./ResultsPage').default;
  console.log('✅ ResultsPage imported successfully');
} catch (error) {
  console.error('❌ Failed to import ResultsPage:', error);
  ResultsPage = ({ setCurrentPage }) => (
    <div style={{ padding: '48px', minHeight: '100vh', background: 'var(--bg-primary, #0f172a)', color: 'var(--text-primary, white)', textAlign: 'center' }}>
      <h1>ResultsPage Import Failed</h1>
      <p style={{ color: '#ef4444' }}>Error: {error.message}</p>
      <button onClick={() => setCurrentPage('home')} style={{ marginTop: '20px', padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Back to Home</button>
    </div>
  );
}

try {
  FinancingPage = require('./FinancingPage').default;
  console.log('✅ FinancingPage imported successfully');
} catch (error) {
  console.error('❌ Failed to import FinancingPage:', error);
  FinancingPage = ({ setCurrentPage }) => (
    <div style={{ padding: '48px', minHeight: '100vh', background: 'var(--bg-primary, #0f172a)', color: 'var(--text-primary, white)', textAlign: 'center' }}>
      <h1>FinancingPage Import Failed</h1>
      <p style={{ color: '#ef4444' }}>Error: {error.message}</p>
      <button onClick={() => setCurrentPage('home')} style={{ marginTop: '20px', padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Back to Home</button>
    </div>
  );
}

try {
  DealStructurePage = require('./DealStructurePage').default;
  console.log('✅ DealStructurePage imported successfully');
} catch (error) {
  console.error('❌ Failed to import DealStructurePage:', error);
  DealStructurePage = ({ setCurrentPage }) => (
    <div style={{ padding: '48px', minHeight: '100vh', background: 'var(--bg-primary, #0f172a)', color: 'var(--text-primary, white)', textAlign: 'center' }}>
      <h1>DealStructurePage Import Failed</h1>
      <p style={{ color: '#ef4444' }}>Error: {error.message}</p>
      <button onClick={() => setCurrentPage('home')} style={{ marginTop: '20px', padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Back to Home</button>
    </div>
  );
}

try {
  HeatMapSelector = require('./HeatMapSelector').default;
  console.log('✅ HeatMapSelector imported successfully');
} catch (error) {
  console.error('❌ Failed to import HeatMapSelector:', error);
  HeatMapSelector = ({ setCurrentPage }) => (
    <div style={{ padding: '48px', minHeight: '100vh', background: 'var(--bg-primary, #0f172a)', color: 'var(--text-primary, white)', textAlign: 'center' }}>
      <h1>HeatMapSelector Import Failed</h1>
      <p style={{ color: '#ef4444' }}>Error: {error.message}</p>
      <button onClick={() => setCurrentPage('home')} style={{ marginTop: '20px', padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Back to Home</button>
    </div>
  );
}

try {
  CountyHeatMap = require('./MarketHeatMap').default;
  console.log('✅ CountyHeatMap imported successfully');
} catch (error) {
  console.error('❌ Failed to import CountyHeatMap:', error);
  CountyHeatMap = ({ setCurrentPage }) => (
    <div style={{ padding: '48px', minHeight: '100vh', background: 'var(--bg-primary, #0f172a)', color: 'var(--text-primary, white)', textAlign: 'center' }}>
      <h1>CountyHeatMap Import Failed</h1>
      <p style={{ color: '#ef4444' }}>Error: {error.message}</p>
      <button onClick={() => setCurrentPage('home')} style={{ marginTop: '20px', padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Back to Home</button>
    </div>
  );
}

try {
  MSAHeatMap = require('./MSAHeatMap').default;
  console.log('✅ MSAHeatMap imported successfully');
} catch (error) {
  console.error('❌ Failed to import MSAHeatMap:', error);
  MSAHeatMap = ({ setCurrentPage }) => (
    <div style={{ padding: '48px', minHeight: '100vh', background: 'var(--bg-primary, #0f172a)', color: 'var(--text-primary, white)', textAlign: 'center' }}>
      <h1>MSAHeatMap Import Failed</h1>
      <p style={{ color: '#ef4444' }}>Error: {error.message}</p>
      <button onClick={() => setCurrentPage('home')} style={{ marginTop: '20px', padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Back to Home</button>
    </div>
  );
}

try {
  DocumentGenerator = require('./DocumentGenerator').default;
  console.log('✅ DocumentGenerator imported successfully');
} catch (error) {
  console.error('❌ Failed to import DocumentGenerator:', error);
  DocumentGenerator = ({ setCurrentPage }) => (
    <div style={{ padding: '48px', minHeight: '100vh', background: 'var(--bg-primary, #0f172a)', color: 'var(--text-primary, white)', textAlign: 'center' }}>
      <h1>DocumentGenerator Import Failed</h1>
      <p style={{ color: '#ef4444' }}>Error: {error.message}</p>
      <button onClick={() => setCurrentPage('home')} style={{ marginTop: '20px', padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Back to Home</button>
    </div>
  );
}

try {
  DocSigner = require('./DocSigner').default;
  console.log('✅ DocSigner imported successfully');
} catch (error) {
  console.error('❌ Failed to import DocSigner:', error);
  DocSigner = ({ setCurrentPage }) => (
    <div style={{ padding: '48px', minHeight: '100vh', background: 'var(--bg-primary, #0f172a)', color: 'var(--text-primary, white)', textAlign: 'center' }}>
      <h1>DocSigner Import Failed</h1>
      <p style={{ color: '#ef4444' }}>Error: {error.message}</p>
      <button onClick={() => setCurrentPage('home')} style={{ marginTop: '20px', padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Back to Home</button>
    </div>
  );
}

// Theme Context
const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

// Theme Provider Component with localStorage persistence
const ThemeProvider = ({ children }) => {
  // Load theme from localStorage or default to 'dark'
  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('app-theme');
      return savedTheme || 'dark';
    } catch (error) {
      console.error('Error loading theme from localStorage:', error);
      return 'dark';
    }
  });

  // Load other preferences from localStorage
  const [accentColor, setAccentColor] = useState(() => {
    try {
      const savedAccent = localStorage.getItem('app-accent-color');
      return savedAccent || 'blue';
    } catch (error) {
      return 'blue';
    }
  });

  const [fontSize, setFontSize] = useState(() => {
    try {
      const savedFontSize = localStorage.getItem('app-font-size');
      return savedFontSize || 'medium';
    } catch (error) {
      return 'medium';
    }
  });

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('app-theme', theme);
      // Also apply to document root for immediate effect
      document.documentElement.setAttribute('data-theme', theme);
      // Force immediate body style update
      document.body.style.background = theme === 'light' 
        ? 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' 
        : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)';
      document.body.style.color = theme === 'light' ? '#0f172a' : '#ffffff';
    } catch (error) {
      console.error('Error saving theme to localStorage:', error);
    }
  }, [theme]);

  // Save accent color to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('app-accent-color', accentColor);
      document.documentElement.setAttribute('data-accent', accentColor);
    } catch (error) {
      console.error('Error saving accent color to localStorage:', error);
    }
  }, [accentColor]);

  // Save font size to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('app-font-size', fontSize);
      document.documentElement.setAttribute('data-font-size', fontSize);
    } catch (error) {
      console.error('Error saving font size to localStorage:', error);
    }
  }, [fontSize]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const themes = {
    dark: {
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      sidebarBg: '#1e293b',
      cardBg: '#1e293b',
      borderColor: '#334155',
      textPrimary: '#ffffff',
      textSecondary: '#94a3b8',
      hover: '#374151'
    },
    light: {
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      sidebarBg: '#ffffff',
      cardBg: '#ffffff',
      borderColor: '#e2e8f0',
      textPrimary: '#0f172a',
      textSecondary: '#64748b',
      hover: '#f1f5f9'
    }
  };

  const fontSizes = {
    small: { base: '0.875rem', title: '3rem', subtitle: '1.125rem' },
    medium: { base: '1rem', title: '3.5rem', subtitle: '1.25rem' },
    large: { base: '1.125rem', title: '4rem', subtitle: '1.5rem' }
  };

  const accentColors = {
    blue: { primary: '#3b82f6', secondary: '#06b6d4' },
    purple: { primary: '#8b5cf6', secondary: '#a855f7' },
    green: { primary: '#10b981', secondary: '#22c55e' },
    orange: { primary: '#f59e0b', secondary: '#fb923c' }
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,
    currentTheme: themes[theme],
    accentColor,
    setAccentColor,
    currentAccent: accentColors[accentColor],
    fontSize,
    setFontSize,
    currentFontSize: fontSizes[fontSize]
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// Settings Page Component
const SettingsPage = ({ setCurrentPage }) => {
  const { theme, toggleTheme, currentTheme, accentColor, setAccentColor, fontSize, setFontSize } = useTheme();
  const [notifications, setNotifications] = useState(true);

  const styles = {
    container: {
      minHeight: '100vh',
      background: currentTheme.background,
      color: currentTheme.textPrimary,
      padding: '48px',
      transition: 'all 0.3s ease'
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      marginBottom: '16px'
    },
    subtitle: {
      fontSize: '1.125rem',
      color: currentTheme.textSecondary,
      marginBottom: '48px'
    },
    section: {
      background: currentTheme.cardBg,
      borderRadius: '16px',
      padding: '32px',
      marginBottom: '24px',
      border: `1px solid ${currentTheme.borderColor}`,
      transition: 'all 0.3s ease'
    },
    sectionTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    settingRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px'
    },
    settingLabel: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    },
    settingTitle: {
      fontSize: '1rem',
      fontWeight: '500'
    },
    settingDescription: {
      fontSize: '0.875rem',
      color: currentTheme.textSecondary
    },
    toggle: {
      width: '60px',
      height: '32px',
      background: theme === 'dark' ? '#374151' : '#e2e8f0',
      borderRadius: '16px',
      position: 'relative',
      cursor: 'pointer',
      transition: 'background 0.3s ease'
    },
    toggleActive: {
      background: '#3b82f6'
    },
    toggleKnob: {
      width: '26px',
      height: '26px',
      background: 'white',
      borderRadius: '50%',
      position: 'absolute',
      top: '3px',
      left: theme === 'light' ? '31px' : '3px',
      transition: 'left 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    colorOptions: {
      display: 'flex',
      gap: '12px'
    },
    colorOption: {
      width: '40px',
      height: '40px',
      borderRadius: '8px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'transform 0.2s ease'
    },
    colorOptionSelected: {
      transform: 'scale(1.1)',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.3)'
    },
    sizeOptions: {
      display: 'flex',
      gap: '12px'
    },
    sizeOption: {
      padding: '8px 16px',
      borderRadius: '8px',
      border: `1px solid ${currentTheme.borderColor}`,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontSize: '0.875rem'
    },
    sizeOptionSelected: {
      background: '#3b82f6',
      color: 'white',
      borderColor: '#3b82f6'
    },
    backButton: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 24px',
      background: currentTheme.cardBg,
      border: `1px solid ${currentTheme.borderColor}`,
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '0.875rem',
      transition: 'all 0.2s ease',
      marginBottom: '32px'
    }
  };

  return (
    <div style={styles.container}>
      <div 
        style={styles.backButton}
        onClick={() => setCurrentPage('home')}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = currentTheme.hover;
          e.currentTarget.style.transform = 'translateX(-4px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = currentTheme.cardBg;
          e.currentTarget.style.transform = 'translateX(0)';
        }}
      >
        <ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} />
        Back to Home
      </div>

      <h1 style={styles.title}>Settings</h1>
      <p style={styles.subtitle}>Customize your experience across all pages</p>

      {/* Appearance Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>
          <Palette size={24} />
          Appearance
        </h2>

        {/* Theme Toggle */}
        <div style={styles.settingRow}>
          <div style={styles.settingLabel}>
            <span style={styles.settingTitle}>Theme</span>
            <span style={styles.settingDescription}>Switch between light and dark mode</span>
          </div>
          <div 
            style={{...styles.toggle, ...(theme === 'light' ? styles.toggleActive : {})}}
            onClick={toggleTheme}
          >
            <div style={styles.toggleKnob}>
              {theme === 'dark' ? <Moon size={16} color="#374151" /> : <Sun size={16} color="#3b82f6" />}
            </div>
          </div>
        </div>

        {/* Accent Color */}
        <div style={styles.settingRow}>
          <div style={styles.settingLabel}>
            <span style={styles.settingTitle}>Accent Color</span>
            <span style={styles.settingDescription}>Choose your preferred accent color</span>
          </div>
          <div style={styles.colorOptions}>
            {Object.entries({
              blue: '#3b82f6',
              purple: '#8b5cf6',
              green: '#10b981',
              orange: '#f59e0b'
            }).map(([color, hex]) => (
              <div
                key={color}
                style={{
                  ...styles.colorOption,
                  background: hex,
                  ...(accentColor === color ? styles.colorOptionSelected : {})
                }}
                onClick={() => setAccentColor(color)}
              >
                {accentColor === color && <div style={{ width: '8px', height: '8px', background: 'white', borderRadius: '50%' }} />}
              </div>
            ))}
          </div>
        </div>

        {/* Font Size */}
        <div style={styles.settingRow}>
          <div style={styles.settingLabel}>
            <span style={styles.settingTitle}>Font Size</span>
            <span style={styles.settingDescription}>Adjust text size for better readability</span>
          </div>
          <div style={styles.sizeOptions}>
            {['small', 'medium', 'large'].map((size) => (
              <div
                key={size}
                style={{
                  ...styles.sizeOption,
                  ...(fontSize === size ? styles.sizeOptionSelected : {})
                }}
                onClick={() => setFontSize(size)}
              >
                {size.charAt(0).toUpperCase() + size.slice(1)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>
          <Bell size={24} />
          Notifications
        </h2>

        <div style={styles.settingRow}>
          <div style={styles.settingLabel}>
            <span style={styles.settingTitle}>Email Notifications</span>
            <span style={styles.settingDescription}>Receive updates about your saved properties</span>
          </div>
          <div 
            style={{...styles.toggle, ...(notifications ? styles.toggleActive : {})}}
            onClick={() => setNotifications(!notifications)}
          >
            <div style={{...styles.toggleKnob, left: notifications ? '31px' : '3px'}} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Updated HomePage Component with Theme Support
const HomePage = ({ setCurrentPage }) => {
  const { currentTheme, currentAccent, currentFontSize } = useTheme();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredMenuItem, setHoveredMenuItem] = useState(null);

  const menuItems = [
    {
      icon: Home,
      label: 'Dashboard',
      page: 'dashboard',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      icon: Calculator,
      label: 'Underwrite',
      page: 'underwrite',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      icon: Chrome,
      label: 'Property Scraper',
      page: 'propertyScrape',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      icon: Map,
      label: 'Market Heat Map',
      page: 'heatMapSelector',
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    },
    {
      icon: FileText,
      label: 'Document Generator',
      page: 'documentGenerator',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
    },
    {
      icon: Settings,
      label: 'Settings',
      page: 'settings',
      gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
    }
  ];

  const styles = {
    pageContainer: {
      minHeight: '100vh',
      background: currentTheme.background,
      color: currentTheme.textPrimary,
      display: 'flex',
      transition: 'all 0.3s ease',
      fontSize: currentFontSize.base
    },
    sidebar: {
      width: '280px',
      background: currentTheme.sidebarBg,
      borderRight: `1px solid ${currentTheme.borderColor}`,
      padding: '32px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '32px',
      transition: 'all 0.3s ease'
    },
    logo: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: currentTheme.textPrimary,
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    logoIcon: {
      width: '40px',
      height: '40px',
      background: `linear-gradient(135deg, ${currentAccent.secondary}, ${currentAccent.primary})`,
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    menuSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    sectionTitle: {
      fontSize: '0.875rem',
      fontWeight: '600',
      color: currentTheme.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      marginBottom: '8px'
    },
    menuItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: currentTheme.textPrimary
    },
    menuItemHover: {
      background: currentTheme.hover,
      transform: 'translateX(4px)'
    },
    mainContent: {
      flex: 1,
      padding: '48px',
      overflow: 'auto'
    },
    heroSection: {
      textAlign: 'center',
      marginBottom: '64px'
    },
    heroTitle: {
      fontSize: currentFontSize.title,
      fontWeight: 'bold',
      marginBottom: '24px',
      background: `linear-gradient(135deg, ${currentAccent.secondary} 0%, ${currentAccent.primary} 50%, #8b5cf6 100%)`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      lineHeight: '1.1'
    },
    heroSubtitle: {
      fontSize: currentFontSize.subtitle,
      color: currentTheme.textSecondary,
      lineHeight: '1.6',
      maxWidth: '800px',
      margin: '0 auto'
    },
    cardGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '32px',
      marginBottom: '48px'
    },
    card: {
      background: currentTheme.cardBg,
      borderRadius: '16px',
      padding: '32px',
      textAlign: 'center',
      transition: 'all 0.3s ease',
      border: `1px solid ${currentTheme.borderColor}`,
      cursor: 'pointer'
    },
    cardHover: {
      transform: 'translateY(-8px)',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
      borderColor: currentAccent.primary
    },
    iconBox: {
      width: '80px',
      height: '80px',
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 24px',
      transition: 'transform 0.3s ease'
    },
    iconBoxBlue: {
      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
    },
    iconBoxCyan: {
      background: 'linear-gradient(135deg, #06b6d4, #0891b2)'
    },
    iconBoxGreen: {
      background: 'linear-gradient(135deg, #10b981, #059669)'
    },
    iconBoxPurple: {
      background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
    },
    iconBoxOrange: {
      background: 'linear-gradient(135deg, #f59e0b, #d97706)'
    },
    cardTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: currentTheme.textPrimary,
      marginBottom: '16px'
    },
    cardText: {
      color: currentTheme.textSecondary,
      lineHeight: '1.6',
      fontSize: '1rem'
    }
  };

  return (
    <div style={styles.pageContainer}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        {/* Logo */}
        <div style={styles.logo}>
          <div style={styles.logoIcon}>
            <BarChart3 size={24} color="white" />
          </div>
          <span>MultifamilyAI</span>
        </div>

        {/* Navigation Menu */}
        <div style={styles.menuSection}>
          <div style={styles.sectionTitle}>Navigation</div>
          {menuItems.map((item, index) => (
            <div
              key={index}
              style={{
                ...styles.menuItem,
                ...(hoveredMenuItem === index ? styles.menuItemHover : {})
              }}
              onMouseEnter={() => setHoveredMenuItem(index)}
              onMouseLeave={() => setHoveredMenuItem(null)}
              onClick={() => setCurrentPage(item.page)}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                background: item.gradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <item.icon size={18} color="white" />
              </div>
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Resources Section */}
        <div style={styles.menuSection}>
          <div style={styles.sectionTitle}>Resources</div>
          <div style={styles.menuItem}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Zap size={18} color="white" />
            </div>
            <span>Templates</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        <div style={styles.heroSection}>
          <h1 style={styles.heroTitle}>AI Multifamily Market Finder</h1>
          <p style={styles.heroSubtitle}>
            Analyze multifamily properties instantly with AI-powered underwriting and discover deals with intelligent market scanning across major real estate platforms.
          </p>
        </div>
        
        {/* Page Feature Boxes */}
        <div style={styles.cardGrid}>
          {[
            { 
              icon: Home, 
              title: 'Dashboard', 
              text: 'View your saved properties, portfolio analytics, and investment performance metrics. Track deals from analysis to closing with comprehensive portfolio management.',
              gradient: styles.iconBoxBlue,
              page: 'dashboard'
            },
            { 
              icon: Calculator, 
              title: 'Underwrite Properties', 
              text: 'Upload PDFs or manually enter property data for instant financial analysis. Get cap rates, cash flow projections, and AI-powered investment recommendations.',
              gradient: styles.iconBoxGreen,
              page: 'underwrite'
            },
            { 
              icon: Chrome, 
              title: 'Property Scraper', 
              text: 'Chrome extension and web scraping tools to automatically collect property listings from Zillow, Crexi, and LoopNet with AI-powered analysis.',
              gradient: styles.iconBoxCyan,
              page: 'propertyScrape'
            },
            { 
              icon: Map, 
              title: 'Market Heat Map', 
              text: 'Discover emerging markets and identify investment opportunities with real-time market data visualization and property value trend analysis.',
              gradient: styles.iconBoxPurple,
              page: 'heatMapSelector'
            },
            { 
              icon: FileText, 
              title: 'Document Generator', 
              text: 'Generate professional legal documents for real estate investments. Create promissory notes, operating agreements, purchase contracts, and more with AI assistance.',
              gradient: styles.iconBoxOrange,
              page: 'documentGenerator'
            }
          ].map((item, index) => (
            <div 
              key={index}
              style={{
                ...styles.card,
                ...(hoveredCard === index ? styles.cardHover : {})
              }}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => setCurrentPage(item.page)}
            >
              <div style={{...styles.iconBox, ...item.gradient}}>
                <item.icon size={32} color="white" />
              </div>
              <h3 style={styles.cardTitle}>{item.title}</h3>
              <p style={styles.cardText}>{item.text}</p>
              <div style={{
                marginTop: '20px',
                padding: '12px 24px',
                background: `rgba(${currentAccent.primary.match(/\d+/g).slice(0,3).join(',')}, 0.1)`,
                border: `1px solid ${currentAccent.primary}`,
                borderRadius: '8px',
                color: currentAccent.primary,
                fontSize: '0.875rem',
                fontWeight: '600'
              }}>
                Click to Access →
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [viewingProperty, setViewingProperty] = useState(null);
  const [documentData, setDocumentData] = useState(null); // Add documentData state for DocSigner
  const [propertyData, setPropertyData] = useState({
    propertyName: '',
    units: '',
    purchasePrice: '',
    grossRent: '',
    vacancy: '',
    operatingExpenses: '',
    loanAmount: '',
    interestRate: '',
    loanTerm: '',
    monthlyPayment: '',
    exitCapRate: '',
    holdPeriod: ''
  });

  const handleFileUpload = (file) => {
    setUploadedFile(file);
    console.log('File uploaded:', file.name);
  };

  // Enhanced setCurrentPage function that can handle data passing for DocSigner
  const handleSetCurrentPage = (page, data = null) => {
    console.log('🔄 App navigating to:', page, data ? 'with data' : 'without data');
    
    if (data) {
      setDocumentData(data);
    }
    
    setCurrentPage(page);
  };

  console.log('🔄 App rendering, currentPage:', currentPage);

  // Get current theme data for passing to components
  const getCurrentThemeData = () => {
    try {
      return {
        theme: localStorage.getItem('app-theme') || 'dark',
        accentColor: localStorage.getItem('app-accent-color') || 'blue',
        fontSize: localStorage.getItem('app-font-size') || 'medium'
      };
    } catch (error) {
      return { theme: 'dark', accentColor: 'blue', fontSize: 'medium' };
    }
  };

  const renderPage = () => {
    const themeData = getCurrentThemeData();
    
    switch(currentPage) {
      case 'home':
        return <HomePage setCurrentPage={handleSetCurrentPage} />;
      case 'settings':
        return <SettingsPage setCurrentPage={handleSetCurrentPage} />;
      case 'dashboard':
        return (
          <DebugComponentLoader componentName="Dashboard" setCurrentPage={handleSetCurrentPage} themeData={themeData}>
            <Dashboard setCurrentPage={handleSetCurrentPage} setViewingProperty={setViewingProperty} />
          </DebugComponentLoader>
        );
      case 'propertyScrape':
        return (
          <DebugComponentLoader componentName="PropertyScrapePage" setCurrentPage={handleSetCurrentPage} themeData={themeData}>
            <PropertyScrapePage setCurrentPage={handleSetCurrentPage} />
          </DebugComponentLoader>
        );
      case 'underwrite':
        return (
          <DebugComponentLoader componentName="UnderwritePage" setCurrentPage={handleSetCurrentPage} themeData={themeData}>
            <UnderwritePage setCurrentPage={handleSetCurrentPage} />
          </DebugComponentLoader>
        );
      case 'upload':
        return (
          <DebugComponentLoader componentName="UploadPage" setCurrentPage={handleSetCurrentPage} themeData={themeData}>
            <UploadPage setCurrentPage={handleSetCurrentPage} uploadedFile={uploadedFile} handleFileUpload={handleFileUpload} />
          </DebugComponentLoader>
        );
      case 'manual':
        return (
          <DebugComponentLoader componentName="ManualPage" setCurrentPage={handleSetCurrentPage} themeData={themeData}>
            <ManualPage setCurrentPage={handleSetCurrentPage} propertyData={propertyData} setPropertyData={setPropertyData} />
          </DebugComponentLoader>
        );
      case 'financing':
        return (
          <DebugComponentLoader componentName="FinancingPage" setCurrentPage={handleSetCurrentPage} themeData={themeData}>
            <FinancingPage 
              setCurrentPage={handleSetCurrentPage} 
              propertyData={propertyData} 
              setPropertyData={setPropertyData}
              uploadedFile={uploadedFile}
            />
          </DebugComponentLoader>
        );
      case 'results':
        return (
          <DebugComponentLoader componentName="ResultsPage" setCurrentPage={handleSetCurrentPage} themeData={themeData}>
            <ResultsPage setCurrentPage={handleSetCurrentPage} propertyData={propertyData} viewingProperty={viewingProperty} />
          </DebugComponentLoader>
        );
      case 'dealStructure':
        return (
          <DebugComponentLoader componentName="DealStructurePage" setCurrentPage={handleSetCurrentPage} themeData={themeData}>
            <DealStructurePage 
              setCurrentPage={handleSetCurrentPage} 
              propertyData={propertyData} 
            />
          </DebugComponentLoader>
        );
      case 'heatMapSelector':
        return (
          <DebugComponentLoader componentName="HeatMapSelector" setCurrentPage={handleSetCurrentPage} themeData={themeData}>
            <HeatMapSelector setCurrentPage={handleSetCurrentPage} />
          </DebugComponentLoader>
        );
      case 'countyHeatMap':
        return (
          <DebugComponentLoader componentName="CountyHeatMap" setCurrentPage={handleSetCurrentPage} themeData={themeData}>
            <CountyHeatMap setCurrentPage={handleSetCurrentPage} />
          </DebugComponentLoader>
        );
      case 'msaHeatMap':
        return (
          <DebugComponentLoader componentName="MSAHeatMap" setCurrentPage={handleSetCurrentPage} themeData={themeData}>
            <MSAHeatMap setCurrentPage={handleSetCurrentPage} />
          </DebugComponentLoader>
        );
      case 'documentGenerator':
        return (
          <DebugComponentLoader componentName="DocumentGenerator" setCurrentPage={handleSetCurrentPage} themeData={themeData}>
            <DocumentGenerator setCurrentPage={handleSetCurrentPage} />
          </DebugComponentLoader>
        );
      case 'docsigner':
        return (
          <DebugComponentLoader componentName="DocSigner" setCurrentPage={handleSetCurrentPage} themeData={themeData}>
            <DocSigner 
              documentData={documentData}
              setCurrentPage={handleSetCurrentPage} 
            />
          </DebugComponentLoader>
        );
      default:
        return (
          <div style={{ padding: '48px', minHeight: '100vh', background: 'var(--bg-primary, #0f172a)', color: 'var(--text-primary, white)', textAlign: 'center' }}>
            <h1>Page Not Found</h1>
            <p style={{ color: '#ef4444' }}>Unknown page: "{currentPage}"</p>
            <button onClick={() => handleSetCurrentPage('home')} style={{ marginTop: '20px', padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Back to Home</button>
          </div>
        );
    }
  };

  return (
    <ThemeProvider>
      {renderPage()}
    </ThemeProvider>
  );
};

export default App;