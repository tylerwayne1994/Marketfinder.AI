import React, { useState, useContext, createContext } from 'react';
import { Calculator, BarChart3, Map, Zap, DollarSign, MapPin, FileText, ArrowRight, Brain, TrendingUp, CheckCircle, User } from 'lucide-react';

// Theme Context (minimal implementation for compatibility)
export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  
  const value = {
    theme,
    setTheme,
    toggleTheme: () => setTheme(prev => prev === 'light' ? 'dark' : 'light')
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

const HomePage = ({ setCurrentPage, isAuthenticated = false, currentUser = null }) => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredMenuItem, setHoveredMenuItem] = useState(null);

  // Terra.Ai Logo Component - matching landing page exactly
  const TerraLogo = () => (
    <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" stroke="black" strokeWidth="5" fill="none"/>
      <circle cx="50" cy="50" r="15" fill="none" stroke="black" strokeWidth="3"/>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const radian = (angle * Math.PI) / 180;
        const isCardinal = angle % 90 === 0;
        const length = isCardinal ? 38 : 35;
        
        const innerRadius = 20;
        const outerRadius = length;
        
        const x1 = 50 + innerRadius * Math.cos(radian - 0.15);
        const y1 = 50 + innerRadius * Math.sin(radian - 0.15);
        const x2 = 50 + outerRadius * Math.cos(radian);
        const y2 = 50 + outerRadius * Math.sin(radian);
        const x3 = 50 + innerRadius * Math.cos(radian + 0.15);
        const y3 = 50 + innerRadius * Math.sin(radian + 0.15);
        
        return (
          <g key={i}>
            <path
              d={`M 50 50 L ${x1} ${y1} Q ${50 + (outerRadius-5) * Math.cos(radian - 0.08)} ${50 + (outerRadius-5) * Math.sin(radian - 0.08)}, ${x2} ${y2} Q ${50 + (outerRadius-5) * Math.cos(radian + 0.08)} ${50 + (outerRadius-5) * Math.sin(radian + 0.08)}, ${x3} ${y3} Z`}
              fill="black"
            />
            {isCardinal && (
              <line 
                x1={50 + 22 * Math.cos(radian)} 
                y1={50 + 22 * Math.sin(radian)} 
                x2={50 + 30 * Math.cos(radian)} 
                y2={50 + 30 * Math.sin(radian)} 
                stroke="white" 
                strokeWidth="2"
              />
            )}
          </g>
        );
      })}
    </svg>
  );

  // Menu items - REMOVED Property Scraper
  const menuItems = [
    {
      icon: Calculator,
      label: 'Underwrite',
      page: 'underwrite',
      color: '#3b82f6',
      description: 'Instant AI underwriting'
    },
    {
      icon: Map,
      label: 'Market Heat Map',
      page: 'marketHeatMap',
      color: '#8b5cf6',
      description: 'Visualize market dynamics'
    },
    {
      icon: MapPin,
      label: 'Census Map Viewer',
      page: 'censusMapViewer',
      color: '#f59e0b',
      description: 'Demographic mapping'
    },
    {
      icon: DollarSign,
      label: 'Market Rents',
      page: 'marketHighlights',
      color: '#ef4444',
      description: 'Real-time rent data'
    },
    {
      icon: BarChart3,
      label: 'Market Analysis',
      page: 'market-analysis',
      color: '#ec4899',
      description: 'ZIP code market metrics'
    },
    {
      icon: FileText,
      label: 'Document Generator',
      page: 'documentGenerator',
      color: '#6366f1',
      description: 'AI contract generation'
    },
  ];

  const features = [
    {
      icon: Brain,
      title: 'AI Automatic Underwriter',
      subtitle: 'Instant Deal Analysis & Portfolio Review',
      description: 'Upload your Offering Memorandum, Rent Roll, or P&L statements and our AI instantly underwrites the deal, providing comprehensive analysis and investment recommendations.',
      highlights: [
        'Automatic underwriting with deal scoring',
        'Analyze OMs, Rent Rolls, P&Ls, PDFs',
        'Portfolio property analysis',
        'Investment optimization options'
      ],
      color: '#3b82f6',
      page: 'underwrite'
    },
    {
      icon: Map,
      title: 'Interactive Market Heat Maps',
      subtitle: 'Zip Code & County Level Intelligence',
      description: 'Visualize market dynamics at zip code and county levels with comprehensive heat maps. Features an integrated AI chat interface for intelligent queries.',
      highlights: [
        'Zip code and county heat maps',
        'Population density metrics',
        'Rent comparisons and trends',
        'AI-powered chat search'
      ],
      color: '#10b981',
      page: 'marketHeatMap'
    },
    {
      icon: TrendingUp,
      title: 'Market Intelligence Platform',
      subtitle: 'AI-Enhanced Location Analysis',
      description: 'Enter any zip code or city to receive instant market insights based on 10+ critical investment metrics with AI recommendations.',
      highlights: [
        'Analysis of 10+ market metrics',
        'AI-generated recommendations',
        'City and zip code insights',
        'Investment opportunity scoring'
      ],
      color: '#8b5cf6',
      page: 'market-analysis'
    },
    {
      icon: FileText,
      title: 'Legal Document Generator',
      subtitle: 'AI-Powered Contracts',
      description: 'Generate professional legal documents instantly with our AI contract generator. Create LOIs, Purchase Agreements, and more.',
      highlights: [
        'Custom Letters of Intent',
        'Purchase & Sale Agreements',
        'LLC Operating Agreements',
        'Professional templates'
      ],
      color: '#f59e0b',
      page: 'documentGenerator'
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'white',
      color: '#000000',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Image with White Overlay - Same as Landing Page */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'url("https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
  opacity: 0.5,
        zIndex: 0
      }} />

      {/* Content Container */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header with Terra.Ai Logo */}
        <div style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e5e5',
          padding: '16px 24px',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <TerraLogo />
              <span style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#000000'
              }}>
                Terra.Ai
              </span>
            </div>

            {/* Navigation Menu with Dashboard Button */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px'
            }}>
              {menuItems.slice(0, 3).map((item, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(item.page)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: hoveredMenuItem === index ? item.color : '#333333',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    transition: 'color 0.2s ease',
                    padding: '8px 0'
                  }}
                  onMouseEnter={() => setHoveredMenuItem(index)}
                  onMouseLeave={() => setHoveredMenuItem(null)}
                >
                  {item.label}
                </button>
              ))}
              
              {/* Dashboard Button */}
              <button
                onClick={() => setCurrentPage('dashboard')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 20px',
                  backgroundColor: '#000000',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#333333';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#000000';
                }}
              >
                <User size={16} />
                Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div style={{
          padding: '60px 24px',
          textAlign: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#f5f5f5',
            border: '1px solid #000000',
            borderRadius: '12px',
            padding: '12px 24px',
            marginBottom: '32px'
          }}>
            <Zap size={20} style={{ color: '#000000' }} />
            <span style={{
              fontSize: '1rem',
              color: '#000000',
              fontWeight: '600'
            }}>
              AI-Powered Real Estate Platform
            </span>
          </div>

          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: '800',
            color: '#000000',
            marginBottom: '24px',
            lineHeight: '1.1'
          }}>
            AI Multifamily Market Finder
          </h1>

          <p style={{
            fontSize: '1.25rem',
            color: '#333333',
            maxWidth: '700px',
            margin: '0 auto 48px auto',
            lineHeight: '1.6'
          }}>
            Analyze multifamily properties instantly with AI-powered underwriting and discover deals with intelligent market scanning
          </p>

          <button
            onClick={() => setCurrentPage('underwrite')}
            style={{
              backgroundColor: '#000000',
              color: 'white',
              padding: '16px 40px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '1.125rem',
              fontWeight: '700',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
            }}
          >
            <span>Start Analyzing Now</span>
            <ArrowRight size={20} />
          </button>
        </div>

        {/* Quick Access Buttons - MOVED ABOVE FEATURES */}
        <div style={{
          backgroundColor: '#f8f8f8',
          borderTop: '1px solid #e5e5e5',
          borderBottom: '1px solid #e5e5e5',
          padding: '40px 24px',
          marginBottom: '60px'
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px'
          }}>
            {menuItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={index}
                  onClick={() => setCurrentPage(item.page)}
                  style={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e5e5',
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = item.color;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e5e5';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    backgroundColor: `${item.color}15`,
                    borderRadius: '8px',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <IconComponent size={18} style={{ color: item.color }} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#000000'
                    }}>
                      {item.label}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#666666',
                      marginTop: '2px'
                    }}>
                      {item.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Features Grid */}
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 24px 80px 24px'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '48px'
          }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: '800',
              color: '#000000',
              marginBottom: '16px'
            }}>
              Powerful AI-Driven Features
            </h2>
            <p style={{
              fontSize: '1.125rem',
              color: '#333333',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Everything you need to analyze, underwrite, and close multifamily deals faster than ever before.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              const isHovered = hoveredCard === index;
              
              return (
                <div
                  key={index}
                  style={{
                    backgroundColor: 'white',
                    border: `2px solid ${isHovered ? '#000000' : '#e5e5e5'}`,
                    borderRadius: '20px',
                    padding: '32px',
                    cursor: 'pointer',
                    transition: 'all 0.4s ease',
                    transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
                    boxShadow: isHovered ? '0 15px 40px rgba(0, 0, 0, 0.15)' : '0 4px 20px rgba(0, 0, 0, 0.05)',
                    minHeight: '420px',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => setCurrentPage(feature.page)}
                >
                  {/* Header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px',
                    marginBottom: '24px'
                  }}>
                    <div style={{
                      backgroundColor: `${feature.color}15`,
                      border: `2px solid ${feature.color}`,
                      borderRadius: '12px',
                      padding: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <IconComponent size={24} style={{ color: feature.color }} />
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: '700',
                        margin: '0 0 6px 0',
                        color: '#000000'
                      }}>
                        {feature.title}
                      </h3>
                      <p style={{
                        fontSize: '0.875rem',
                        color: '#666666',
                        margin: 0,
                        fontWeight: '600'
                      }}>
                        {feature.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#333333',
                    lineHeight: 1.6,
                    marginBottom: '24px',
                    flex: 1
                  }}>
                    {feature.description}
                  </p>

                  {/* Key Features */}
                  <div>
                    <h4 style={{
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: '#666666',
                      marginBottom: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      KEY FEATURES
                    </h4>
                    
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      {feature.highlights.map((highlight, hIndex) => (
                        <div
                          key={hIndex}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '0.75rem',
                            color: '#333333'
                          }}
                        >
                          <CheckCircle size={12} style={{ color: feature.color, flexShrink: 0 }} />
                          {highlight}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div style={{
                    marginTop: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{
                      fontSize: '0.75rem',
                      color: '#666666',
                      fontWeight: '600'
                    }}>
                      Available now →
                    </span>
                    
                    <div style={{
                      backgroundColor: feature.color,
                      borderRadius: '6px',
                      padding: '4px 8px',
                      fontSize: '0.625rem',
                      color: 'white',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      AI POWERED
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;