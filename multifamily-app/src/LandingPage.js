import React, { useState, useEffect, useRef } from 'react';
import { Map, Building2, FileText, TrendingUp, Brain, Zap, CheckCircle } from 'lucide-react';
// VideoWithHover component for local video files with hover-to-play/loop and delayed stop
function VideoWithHover({ src, description }) {
  const videoRef = React.useRef(null);
  const timeoutRef = React.useRef(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.loop = true;
      // Only play if paused
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
      }
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      timeoutRef.current = setTimeout(() => {
        // Only pause if not already paused
        if (!videoRef.current.paused) {
          videoRef.current.pause();
        }
        videoRef.current.currentTime = 0;
      }, 5000); // 5 seconds
    }
  };

  return (
    <div style={{ flex: '1 1 400px', minWidth: '320px', maxWidth: '500px', textAlign: 'center' }}>
      <video
        ref={videoRef}
        width="100%"
        height="280"
        controls
        style={{ borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', cursor: 'pointer' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        preload="metadata"
        poster="/videos/video-poster.png"
        onError={e => { e.target.poster = '/videos/video-poster.png'; }}
      >
        <source src={src} type="video/mp4" />
        Sorry, this video could not be loaded. Please check the file name and format.
      </video>
      <div style={{ marginTop: '8px', fontWeight: 600 }}>{description}</div>
    </div>
  );
}

const LandingPage = ({ setCurrentPage }) => {
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [hoveredStat, setHoveredStat] = useState(null);
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimationPhase(1), 100);
    return () => clearTimeout(timer);
  }, []);

  const features = [
    {
      icon: Brain,
      title: 'AI Automatic Underwriter',
      subtitle: 'Instant Deal Analysis & Portfolio Review',
      description: 'Upload your Offering Memorandum, Rent Roll, or P&L statements and our AI instantly underwrites the deal, providing comprehensive analysis and investment recommendations. Also analyze your existing portfolio properties for optimization opportunities.',
      highlights: [
        'Automatic underwriting with deal scoring (Good/Bad deal assessment)',
        'Analyze OMs, Rent Rolls, P&Ls, PDFs, and spreadsheets',
        'Portfolio property analysis with improvement recommendations',
        'Current investment state evaluation and optimization options'
      ],
      color: '#3b82f6' // Blue
    },
    {
      icon: Map,
      title: 'Interactive Market Heat Maps',
      subtitle: 'Zip Code & County Level Intelligence',
      description: 'Visualize market dynamics at zip code and county levels with comprehensive heat maps. Features an integrated AI chat interface for intelligent queries like "Show me the top 3 zip codes with highest rents" for instant, actionable insights.',
      highlights: [
        'Zip code and county level heat map visualization',
        'Population density, income, and growth metrics',
        'Rent comparisons and market trends',
        'AI-powered chat search within heat maps for custom queries'
      ],
      color: '#10b981' // Green
    },
    {
      icon: TrendingUp,
      title: 'Market Intelligence Platform',
      subtitle: 'AI-Enhanced Location Analysis',
      description: 'Enter any zip code or city to receive instant market insights based on 10+ critical investment metrics. Our integrated LLM provides expert market opinions and investment recommendations tailored to each location you research.',
      highlights: [
        'Comprehensive analysis of 10+ market metrics',
        'AI-generated market opinions and recommendations',
        'City and zip code level insights',
        'Investment opportunity scoring with LLM interpretation'
      ],
      color: '#8b5cf6' // Purple
    },
    {
      icon: FileText,
      title: 'Legal Document Generator',
      subtitle: 'AI-Powered Contracts',
      description: 'Generate professional legal documents instantly with our AI contract generator. Create LOIs, Purchase Agreements, Operating Agreements, and more.',
      highlights: [
        'Custom Letters of Intent (LOIs)',
        'Purchase & Sale Agreements',
        'LLC Operating Agreements'
      ],
      color: '#f59e0b' // Orange
    }
  ];

  const stats = [
    { number: '3,000+', label: 'Counties Analyzed', icon: Map },
    { number: '380+', label: 'Metro Areas', icon: Building2 },
    { number: '99.9%', label: 'AI Accuracy', icon: Brain },
    { number: '50+', label: 'Document Types', icon: FileText }
  ];

  // SVG Logo Component - Exact match to provided image
  const TerraLogo = () => (
    <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" stroke="black" strokeWidth="5" fill="none"/>
      <circle cx="50" cy="50" r="15" fill="none" stroke="black" strokeWidth="3"/>
      {/* 8-pointed star/compass design */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const radian = (angle * Math.PI) / 180;
        const isCardinal = angle % 90 === 0;
        const length = isCardinal ? 38 : 35;
        const width = isCardinal ? 12 : 10;
        
        // Calculate petal/ray endpoints
        const innerRadius = 20;
        const outerRadius = length;
        
        // Create elongated petal shape
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
            {/* Add white accent lines for cardinal directions */}
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

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'white',
      color: '#000000',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Image with Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '100vh',
        backgroundImage: 'url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        opacity: 0.05
      }} />

      {/* Content */}
      <div style={{ 
        position: 'relative', 
        zIndex: 1
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e5e5',
          padding: '16px 24px'
        }}>
          <div style={{
            maxWidth: '1200px',
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
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <button
                onClick={() => setCurrentPage('login')}
                style={{
                  backgroundColor: 'transparent',
                  color: '#000000',
                  padding: '10px 24px',
                  borderRadius: '8px',
                  border: '2px solid #000000',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f5f5f5';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                Login
              </button>
              
              <button
                onClick={() => setCurrentPage('signup')}
                style={{
                  backgroundColor: '#000000',
                  color: 'white',
                  padding: '10px 24px',
                  borderRadius: '8px',
                  border: '2px solid #000000',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#333333';
                  e.target.style.borderColor = '#333333';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#000000';
                  e.target.style.borderColor = '#000000';
                }}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div style={{
          padding: '80px 24px',
          textAlign: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            transform: animationPhase ? 'translateY(0)' : 'translateY(30px)',
            opacity: animationPhase ? 1 : 0,
            transition: 'all 0.8s ease'
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
                Revolutionary AI Real Estate Platform
              </span>
            </div>

            <h1 style={{
              fontSize: '4rem',
              fontWeight: '800',
              color: '#000000',
              marginBottom: '32px',
              lineHeight: '1.1'
            }}>
              AI Multifamily Market Finder
            </h1>

            <p style={{
              fontSize: '1.5rem',
              color: '#333333',
              maxWidth: '800px',
              margin: '0 auto 48px auto',
              lineHeight: '1.6'
            }}>
              Analyze multifamily properties instantly with AI-powered underwriting and discover deals with intelligent market scanning across major real estate platforms.
            </p>
          </div>
        </div>

        {/* Features Section */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px 80px 24px'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '64px'
          }}>
            <h2 style={{
              fontSize: '3rem',
              fontWeight: '800',
              color: '#000000',
              marginBottom: '16px'
            }}>
              Powerful AI-Driven Features
            </h2>
            <p style={{
              fontSize: '1.25rem',
              color: '#333333',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Everything you need to analyze, underwrite, and close multifamily deals faster than ever before.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              const isHovered = hoveredFeature === index;
              
              return (
                <div
                  key={index}
                  style={{
                    backgroundColor: 'white',
                    border: `2px solid ${isHovered ? '#000000' : '#e5e5e5'}`,
                    borderRadius: '20px',
                    padding: '28px',
                    cursor: 'pointer',
                    transition: 'all 0.4s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
                    boxShadow: isHovered ? '0 15px 40px rgba(0, 0, 0, 0.15)' : '0 4px 20px rgba(0, 0, 0, 0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '380px'
                  }}
                  onMouseEnter={() => setHoveredFeature(index)}
                  onMouseLeave={() => setHoveredFeature(null)}
                >
                  {/* Header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px',
                    marginBottom: '20px'
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
                        color: '#000000',
                        lineHeight: '1.2'
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
                    marginBottom: '20px',
                    flex: 1
                  }}>
                    {feature.description}
                  </p>

                  {/* Highlights */}
                  <div>
                    <h4 style={{
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: '#666666',
                      marginBottom: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Key Features
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

                  {/* Action */}
                  <div style={{
                    marginTop: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{
                      fontSize: '0.75rem',
                      color: '#666666',
                      fontWeight: '600'
                    }}>
                      Available in platform →
                    </span>
                    
                    <div style={{
                      backgroundColor: '#3b82f6',
                      border: '1px solid #3b82f6',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      fontSize: '0.625rem',
                      color: 'white',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      AI Powered
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* Videos Section - Now below features, spaced out vertically */}
        <div style={{
          maxWidth: '1200px',
          margin: '64px auto 48px auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '56px',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <VideoWithHover
            src="/videos/zip code map.mp4"
            description="Zip Code Map: Explore market data at the zip code level with interactive heat maps."
          />
          <VideoWithHover
            src="/videos/county heat map .mp4"
            description="County Heat Map: Visualize trends and opportunities across counties."
          />
          <VideoWithHover
            src="/videos/Results.mp4"
            description="Auto Underwrite Results: See instant deal analysis and recommendations from the AI underwriter."
          />
          <VideoWithHover
            src="/videos/Market Analysis.mp4"
            description="Market Analysis: Get comprehensive insights and investment metrics for any location."
          />
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          padding: '32px 24px',
          borderTop: '1px solid #e5e5e5',
          backgroundColor: 'white'
        }}>
          <p style={{
            color: '#666666',
            fontSize: '0.875rem',
            margin: 0
          }}>
            © 2025 Terra.Ai. All rights reserved. | Revolutionizing real estate investment with artificial intelligence.<br />
            <a href="/terms.html" style={{ color: '#3b82f6', marginRight: 16 }}>Terms of Service</a>
            <a href="/privacy.html" style={{ color: '#3b82f6', marginRight: 16 }}>Privacy Policy</a>
            <a href="mailto:support@terra.ai" style={{ color: '#3b82f6', marginRight: 16 }}>Support</a>
            <a href="/faq.html" style={{ color: '#3b82f6' }}>Billing FAQ</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;