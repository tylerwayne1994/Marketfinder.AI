import React, { useState, useEffect } from 'react';
import { Upload, Calculator, ArrowLeft, FileText, TrendingUp, Building, Lock, Crown, AlertCircle } from 'lucide-react';
import { styles } from './styles';
import { supabase } from './lib/supabase';

const UnderwritePage = ({ setCurrentPage }) => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const [userLimits, setUserLimits] = useState(null);
  const [userUsage, setUserUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get current user, subscription plan, limits, and usage
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setError('Please log in to access underwriting features');
          setLoading(false);
          return;
        }

        // Get user profile with subscription info
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          setError('Error loading user profile');
          setLoading(false);
          return;
        }

        const userId = session.user.id;
        const plan = profile?.subscription_plan || 'starter';
  const status = profile?.subscription_status || 'inactive';

        setCurrentUser({
          id: userId,
          email: session.user.email,
          ...profile
        });
        setUserPlan(plan);

        // Get subscription limits
        const { data: limits, error: limitsError } = await supabase
          .from('subscription_limits')
          .select('*')
          .eq('plan_name', plan)
          .single();

        if (!limitsError && limits) {
          setUserLimits(limits);
        }

        // Get current usage
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
        const { data: usage, error: usageError } = await supabase
          .from('user_usage')
          .select('*')
          .eq('user_id', userId)
          .eq('month_year', currentMonth)
          .single();

        if (usage) {
          setUserUsage(usage);
        } else {
          // Initialize usage record if it doesn't exist
          setUserUsage({
            om_pdfs_parsed: 0,
            pages_processed: 0,
            underwriting_sessions: 0
          });
        }

        // Check if subscription is active
        if (status !== 'active' && plan !== 'starter') {
          setError('Your subscription is not active. Please update your payment method.');
        }

      } catch (err) {
        console.error('Error loading user data:', err);
        setError('Error loading user data');
      } finally {
        setLoading(false);
      }
    };

    getCurrentUser();
  }, []);

  // Define what each plan can access based on your actual plans
  const planAccess = {
    starter: {
      manual: true,
      upload: false,
      pfa: false,
      features: ['Heat maps & market reports', 'Basic document generation', 'Manual underwriting only', 'Market analysis tools'],
      limitations: ['No AI OCR parsing', 'Manual data entry only']
    },
    pro: {
      manual: true,
      upload: true,
      pfa: true,
      features: ['Everything in Starter', 'AI OCR parsing (10-15 PDFs/month)', '25 pages max per PDF', 'Automated underwriting', 'Property P&L analysis'],
      limitations: ['Monthly PDF limits apply']
    },
    power: {
      manual: true,
      upload: true,
      pfa: true,
      features: ['Everything in Pro', 'Unlimited AI OCR parsing', 'Priority processing', 'Export to CSV/Excel', 'White-label reports', 'Advanced analytics'],
      limitations: []
    }
  };

  const checkFeatureAccess = (feature) => {
    const currentPlanAccess = planAccess[userPlan] || planAccess.starter;
    
    if (!currentPlanAccess[feature]) {
      return { hasAccess: false, reason: 'plan' };
    }

    // Check usage limits for Pro plan
    if (userPlan === 'pro' && feature === 'upload' && userLimits && userUsage) {
      if (userUsage.om_pdfs_parsed >= userLimits.max_pdfs_per_month) {
        return { hasAccess: false, reason: 'limit', remaining: 0 };
      }
      return { 
        hasAccess: true, 
        remaining: userLimits.max_pdfs_per_month - userUsage.om_pdfs_parsed 
      };
    }

    return { hasAccess: true };
  };

  const handleOptionClick = (option) => {
    const accessCheck = checkFeatureAccess(option);
    
    if (!accessCheck.hasAccess) {
      if (accessCheck.reason === 'plan') {
        const requiredPlan = option === 'upload' || option === 'pfa' ? 'Pro or Power' : 'a higher';
        alert(`This feature requires ${requiredPlan} plan. Please upgrade your subscription to access this feature.`);
      } else if (accessCheck.reason === 'limit') {
        alert(`You've reached your monthly limit for PDF parsing. Upgrade to Power for unlimited parsing or wait until next month.`);
      }
      return;
    }
    
    // Route to the appropriate page
    if (option === 'upload') setCurrentPage('upload');
    else if (option === 'manual') setCurrentPage('manual');
    else if (option === 'pfa') setCurrentPage('pfa');
  };

  const getAnalysisOptions = () => {
    const uploadAccess = checkFeatureAccess('upload');
    const manualAccess = checkFeatureAccess('manual');
    const pfaAccess = checkFeatureAccess('pfa');

    return [
      {
        id: 'upload',
        icon: Upload,
        title: 'AI Document Analysis',
        text: 'Upload your offering memorandum, T12, or property documents for automatic AI-powered analysis',
        gradient: styles.iconBoxCyan,
        features: ['AI OCR Extraction', 'Multi-page PDF Support', 'Automatic Data Parsing', 'Instant Analysis'],
        hasAccess: uploadAccess.hasAccess,
        requiredPlan: 'Pro or Power',
        remaining: uploadAccess.remaining,
        accessReason: uploadAccess.reason
      },
      {
        id: 'manual',
        icon: Calculator,
        title: 'Manual Entry',
        text: 'Enter property and financial data manually for quick customized analysis',
        gradient: styles.iconBoxGreen,
        features: ['Custom Input Fields', 'Real-time Calculations', 'Flexible Assumptions', 'Quick Analysis'],
        hasAccess: manualAccess.hasAccess,
        requiredPlan: 'All Plans'
      },
      {
        id: 'pfa',
        icon: Building,
        title: 'Property Financial Analysis (PFA)',
        text: 'Upload rent rolls, T12s, or P&L spreadsheets for a full property financial health check and improvement insights',
        gradient: styles.iconBoxPurple,
        features: ['Expense Benchmarking', 'Revenue Optimization', 'Market Comparison', 'Improvement Suggestions'],
        hasAccess: pfaAccess.hasAccess,
        requiredPlan: 'Pro or Power'
      }
    ];
  };

  const getPlanPricing = (plan) => {
    const pricing = {
      starter: '$35',
      pro: '$99',
      power: '$199'
    };
    return pricing[plan] || '$35';
  };

  if (loading) {
    return (
      <div style={styles.pageContainer}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <div>Loading your subscription details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.pageContainer}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '16px' }} />
          <div style={{ color: '#ef4444', marginBottom: '16px' }}>{error}</div>
          <button
            onClick={() => setCurrentPage('home')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const analysisOptions = getAnalysisOptions();
  const currentPlanAccess = planAccess[userPlan] || planAccess.starter;

  return (
    <div style={styles.pageContainer}>
      <div style={styles.container}>
        <div style={{ paddingTop: '48px', paddingBottom: '48px' }}>
          <button
            style={styles.backButton}
            onClick={() => setCurrentPage('home')}
            onMouseEnter={(e) => e.target.style.color = '#06b6d4'}
            onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
          >
            <ArrowLeft size={16} /> Back to Home
          </button>

          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{
              ...styles.iconBox,
              ...styles.iconBoxCyan,
              margin: '0 auto 24px',
              width: '80px',
              height: '80px'
            }}>
              <TrendingUp size={48} color="white" />
            </div>
            <h1 style={styles.pageTitle}>Property Underwriting</h1>
            <p style={{
              ...styles.pageSubtitle,
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Choose your preferred method to analyze commercial real estate investments.
              Our AI-powered platform provides comprehensive underwriting analysis in seconds.
            </p>
            
            {/* Current Plan Display */}
            <div style={{
              marginTop: '24px',
              padding: '12px 24px',
              backgroundColor: '#f0f9ff',
              border: '1px solid #dbeafe',
              borderRadius: '8px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Crown size={16} color="#3b82f6" />
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e40af' }}>
                Current Plan: {userPlan?.charAt(0).toUpperCase() + userPlan?.slice(1)} ({getPlanPricing(userPlan)}/month)
              </span>
            </div>

            {/* Usage Display for Pro users */}
            {userPlan === 'pro' && userLimits && userUsage && (
              <div style={{
                marginTop: '12px',
                padding: '8px 16px',
                backgroundColor: '#fef3c7',
                border: '1px solid #fbbf24',
                borderRadius: '6px',
                display: 'inline-block'
              }}>
                <span style={{ fontSize: '12px', color: '#92400e' }}>
                  PDFs this month: {userUsage.om_pdfs_parsed}/{userLimits.max_pdfs_per_month} used
                </span>
              </div>
            )}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '32px',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            {analysisOptions.map((option, index) => {
              const isDisabled = !option.hasAccess;
              const isLimitReached = option.accessReason === 'limit';
              
              return (
                <div
                  key={index}
                  style={{
                    ...styles.card,
                    ...(hoveredCard === index && !isDisabled ? {
                      ...styles.cardHover,
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
                    } : {}),
                    padding: '32px',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    border: isDisabled ? '2px solid #ef4444' : '2px solid transparent',
                    transition: 'all 0.3s ease',
                    minHeight: '450px',
                    display: 'flex',
                    flexDirection: 'column',
                    opacity: isDisabled ? 0.6 : 1,
                    position: 'relative'
                  }}
                  onMouseEnter={() => !isDisabled && setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => handleOptionClick(option.id)}
                >
                  {/* Lock overlay for disabled options */}
                  {isDisabled && (
                    <div style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      backgroundColor: '#ef4444',
                      borderRadius: '50%',
                      padding: '8px',
                      zIndex: 1
                    }}>
                      <Lock size={16} color="white" />
                    </div>
                  )}

                  <div style={{
                    ...styles.iconBox,
                    ...option.gradient,
                    margin: '0 auto 24px',
                    width: '80px',
                    height: '80px',
                    opacity: isDisabled ? 0.5 : 1
                  }}>
                    <option.icon size={48} color="white" />
                  </div>

                  <h3 style={{
                    ...styles.cardTitle,
                    fontSize: '1.5rem',
                    marginBottom: '16px',
                    textAlign: 'center'
                  }}>
                    {option.title}
                  </h3>

                  <p style={{
                    ...styles.cardText,
                    marginBottom: '24px',
                    textAlign: 'center',
                    flex: 1
                  }}>
                    {option.text}
                  </p>

                  {/* Plan requirement badge */}
                  <div style={{
                    marginBottom: '16px',
                    textAlign: 'center'
                  }}>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: option.hasAccess ? '#10b981' : '#ef4444',
                      backgroundColor: option.hasAccess ? '#ecfdf5' : '#fef2f2',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      border: `1px solid ${option.hasAccess ? '#d1fae5' : '#fecaca'}`
                    }}>
                      {option.hasAccess 
                        ? (option.remaining !== undefined ? `✓ Available (${option.remaining} remaining)` : '✓ Available')
                        : (isLimitReached ? '⚠️ Monthly limit reached' : `Requires ${option.requiredPlan}`)
                      }
                    </span>
                  </div>

                  <div style={{
                    marginTop: 'auto'
                  }}>
                    <h4 style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#64748b',
                      marginBottom: '12px',
                      textAlign: 'center'
                    }}>
                      Features:
                    </h4>
                    <ul style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: 0
                    }}>
                      {option.features.map((feature, idx) => (
                        <li key={idx} style={{
                          fontSize: '13px',
                          color: '#64748b',
                          marginBottom: '8px',
                          paddingLeft: '20px',
                          position: 'relative'
                        }}>
                          <span style={{
                            position: 'absolute',
                            left: '0',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '6px',
                            height: '6px',
                            backgroundColor: isDisabled ? '#ef4444' : '#06b6d4',
                            borderRadius: '50%'
                          }} />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{
                    marginTop: '24px',
                    padding: '12px 24px',
                    backgroundColor: isDisabled ? '#fef2f2' : (hoveredCard === index ? '#f0f9ff' : '#f8fafc'),
                    borderRadius: '8px',
                    border: `1px solid ${isDisabled ? '#fecaca' : '#e2e8f0'}`,
                    textAlign: 'center',
                    transition: 'all 0.3s ease'
                  }}>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: isDisabled ? '#dc2626' : (hoveredCard === index ? '#0891b2' : '#64748b')
                    }}>
                      {isDisabled 
                        ? (isLimitReached ? '📊 Upgrade for more' : '🔒 Upgrade Required')
                        : 'Click to get started →'
                      }
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Plan-specific upgrade CTAs */}
          {userPlan === 'starter' && (
            <div style={{
              marginTop: '48px',
              padding: '24px',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              borderRadius: '12px',
              textAlign: 'center',
              color: 'white'
            }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '12px', color: 'white' }}>
                Unlock AI-Powered Analysis
              </h3>
              <p style={{ marginBottom: '20px', opacity: 0.9 }}>
                Upgrade to Pro ($99/mo) for AI document parsing or Power ($199/mo) for unlimited features
              </p>
              <button
                onClick={() => setCurrentPage('dashboard')}
                style={{
                  padding: '12px 32px',
                  backgroundColor: 'white',
                  color: '#3b82f6',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                View Plans & Upgrade
              </button>
            </div>
          )}

          {userPlan === 'pro' && userLimits && userUsage && userUsage.om_pdfs_parsed >= userLimits.max_pdfs_per_month && (
            <div style={{
              marginTop: '48px',
              padding: '24px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              borderRadius: '12px',
              textAlign: 'center',
              color: 'white'
            }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '12px', color: 'white' }}>
                Monthly Limit Reached
              </h3>
              <p style={{ marginBottom: '20px', opacity: 0.9 }}>
                You've used all {userLimits.max_pdfs_per_month} PDF analyses this month. Upgrade to Power for unlimited processing.
              </p>
              <button
                onClick={() => setCurrentPage('dashboard')}
                style={{
                  padding: '12px 32px',
                  backgroundColor: 'white',
                  color: '#f59e0b',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Upgrade to Power Plan
              </button>
            </div>
          )}

          {/* Current plan benefits */}
          <div style={{
            marginTop: '64px',
            padding: '32px',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            textAlign: 'center'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#1e293b',
              marginBottom: '16px'
            }}>
              Your {userPlan?.charAt(0).toUpperCase() + userPlan?.slice(1)} Plan Features
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginTop: '24px'
            }}>
              {currentPlanAccess.features.map((feature, idx) => (
                <div key={idx} style={{
                  padding: '12px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    backgroundColor: '#10b981',
                    borderRadius: '50%',
                    flexShrink: 0
                  }} />
                  <span style={{
                    fontSize: '13px',
                    fontWeight: '500',
                    color: '#1e293b'
                  }}>
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            {currentPlanAccess.limitations.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <h4 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#64748b',
                  marginBottom: '12px'
                }}>
                  Plan Limitations:
                </h4>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '12px',
                  justifyContent: 'center'
                }}>
                  {currentPlanAccess.limitations.map((limitation, idx) => (
                    <span key={idx} style={{
                      fontSize: '12px',
                      color: '#f59e0b',
                      backgroundColor: '#fef3c7',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      border: '1px solid #fcd34d'
                    }}>
                      {limitation}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnderwritePage;