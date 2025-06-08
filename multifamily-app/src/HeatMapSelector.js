import React from 'react';
import { MapPin, Users, Building2, TrendingUp, ArrowRight, ArrowLeft, Info } from 'lucide-react';

const HeatMapSelector = ({ setCurrentPage }) => {
  const colors = {
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    primary: '#06b6d4',
    secondary: '#3b82f6',
    accent: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    gray: {
      dark: '#374151',
      medium: '#4b5563',
      light: '#6b7280',
      lighter: '#94a3b8',
      lightest: '#cbd5e1'
    }
  };

  const mapOptions = [
    {
      id: 'county',
      title: 'County Heat Map',
      subtitle: 'Individual County Analysis',
      description: 'Analyze investment opportunities at the county level with detailed demographic and economic data.',
      icon: Building2,
      color: colors.primary,
      features: [
        '3,100+ US Counties',
        'Census ACS 5-Year Data',
        'Population Growth Trends',
        'Employment & Income Metrics',
        'Housing Market Analysis',
        'FMR vs Market Rent Estimates'
      ],
      benefits: [
        'Granular market analysis',
        'Precise location targeting',
        'Detailed local demographics',
        'Direct Census data integration'
      ]
    },
    {
      id: 'msa',
      title: 'MSA Heat Map',
      subtitle: 'Metropolitan Statistical Areas',
      description: 'Explore major metropolitan markets and their economic performance across integrated regional economies.',
      icon: Users,
      color: colors.accent,
      features: [
        '380+ Metropolitan Areas',
        'Regional Economic Integration',
        'Multi-County Market Analysis',
        'Urban-Suburban Dynamics',
        'Major Population Centers',
        'Regional Investment Trends'
      ],
      benefits: [
        'Metro-wide market view',
        'Regional economic trends',
        'Multi-county strategies',
        'Major market focus'
      ]
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.background,
      color: 'white',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '48px' }}>
          <button
            onClick={() => setCurrentPage('home')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: colors.gray.lighter,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'all 0.3s ease',
              padding: '8px 12px',
              borderRadius: '6px',
              marginBottom: '32px'
            }}
            onMouseEnter={(e) => {
              e.target.style.color = colors.primary;
              e.target.style.backgroundColor = 'rgba(6, 182, 212, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = colors.gray.lighter;
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            <ArrowLeft size={16} /> Back to Home
          </button>

          <div style={{ textAlign: 'center' }}>
            <h1 style={{
              fontSize: '3rem',
              fontWeight: 'bold',
              marginBottom: '16px',
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 50%, ${colors.accent} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Choose Your Market View
            </h1>
            <p style={{
              fontSize: '1.25rem',
              color: colors.gray.lighter,
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Select the geographic scale that best fits your investment strategy and analysis needs.
            </p>
          </div>
        </div>

        {/* Map Options */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '32px',
          marginBottom: '48px'
        }}>
          {mapOptions.map((option) => {
            const IconComponent = option.icon;
            
            return (
              <div
                key={option.id}
                style={{
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: `2px solid ${option.color}`,
                  borderRadius: '16px',
                  padding: '32px',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  opacity: 1
                }}
                onClick={() => {
                  setCurrentPage(option.id === 'county' ? 'countyHeatMap' : 'msaHeatMap');
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-4px)';
                  e.target.style.boxShadow = `0 8px 32px ${option.color}40`;
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  marginBottom: '24px'
                }}>
                  <div style={{
                    background: `${option.color}20`,
                    border: `2px solid ${option.color}`,
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <IconComponent size={32} style={{ color: option.color }} />
                  </div>
                  <div>
                    <h2 style={{
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      marginBottom: '4px',
                      color: 'white'
                    }}>
                      {option.title}
                    </h2>
                    <p style={{
                      fontSize: '1rem',
                      color: option.color,
                      fontWeight: '600'
                    }}>
                      {option.subtitle}
                    </p>
                  </div>
                </div>

                <p style={{
                  fontSize: '1rem',
                  color: colors.gray.lightest,
                  marginBottom: '24px',
                  lineHeight: '1.6'
                }}>
                  {option.description}
                </p>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '24px',
                  marginBottom: '24px'
                }}>
                  <div>
                    <h4 style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: option.color,
                      marginBottom: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Key Features
                    </h4>
                    <ul style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: 0
                    }}>
                      {option.features.map((feature, index) => (
                        <li key={index} style={{
                          fontSize: '0.875rem',
                          color: colors.gray.lightest,
                          marginBottom: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <div style={{
                            width: '4px',
                            height: '4px',
                            borderRadius: '50%',
                            background: option.color
                          }} />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: option.color,
                      marginBottom: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Benefits
                    </h4>
                    <ul style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: 0
                    }}>
                      {option.benefits.map((benefit, index) => (
                        <li key={index} style={{
                          fontSize: '0.875rem',
                          color: colors.gray.lightest,
                          marginBottom: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <div style={{
                            width: '4px',
                            height: '4px',
                            borderRadius: '50%',
                            background: option.color
                          }} />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '16px',
                  background: `${option.color}20`,
                  border: `1px solid ${option.color}`,
                  borderRadius: '8px',
                  color: option.color,
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}>
                  Explore {option.title}
                  <ArrowRight size={16} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Section */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          border: `2px solid ${colors.gray.dark}`,
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '16px'
        }}>
          <div style={{
            background: `${colors.secondary}20`,
            border: `2px solid ${colors.secondary}`,
            borderRadius: '8px',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Info size={20} style={{ color: colors.secondary }} />
          </div>
          <div>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              marginBottom: '8px',
              color: 'white'
            }}>
              Not Sure Which to Choose?
            </h3>
            <p style={{
              fontSize: '0.875rem',
              color: colors.gray.lightest,
              lineHeight: '1.6',
              marginBottom: '12px'
            }}>
              <strong>County Maps</strong> are perfect for detailed, local analysis and identifying specific investment opportunities in smaller markets.
              <br />
              <strong>MSA Maps</strong> are ideal for understanding broader metropolitan trends and regional economic patterns.
            </p>
            <p style={{
              fontSize: '0.875rem',
              color: colors.gray.lighter,
              lineHeight: '1.6'
            }}>
              You can always switch between views to compare different geographic scales for your investment strategy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatMapSelector;