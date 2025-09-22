import React, { useState, useEffect } from 'react';
import { 
  User, 
  CreditCard, 
  BarChart3, 
  Calendar, 
  Settings, 
  LogOut, 
  Building2,
  Mail,
  Phone,
  MapPin,
  TrendingUp,
  FileText,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Home,
  Star,
  Zap,
  Crown,
  Shield,
  Lock,
  Upload,
  Calculator,
  PieChart,
  X,
  AlertTriangle
} from 'lucide-react';
import { supabase } from './lib/supabase';

const PRICING_PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 35,
  priceId: process.env.REACT_APP_STRIPE_STARTER_PRICE_ID || 'price_1S6Khq2Xp6FKKwINgUI5caDQ'
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 99,
  priceId: process.env.REACT_APP_STRIPE_PRO_PRICE_ID || 'price_1S6Kk62Xp6FKKwINIyh13ZGN'
  },
  power: {
    id: 'power',
    name: 'Power',
    price: 199,
  priceId: process.env.REACT_APP_STRIPE_POWER_PRICE_ID || 'price_1S6Kit2Xp6FKKwINQBHnNglZ'
  }
};

const DashboardPage = ({ setCurrentPage, currentUser }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [feedbackType, setFeedbackType] = useState('recommendation');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [showFeedbackSuccess, setShowFeedbackSuccess] = useState(false);
  const [userData, setUserData] = useState(null);
  const [usageData, setUsageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // New state for subscription management
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState(null);
  const [subscriptionSuccess, setSubscriptionSuccess] = useState(null);

  useEffect(() => {
    if (!currentUser?.id) return;
    fetchDashboardData();
  }, [currentUser?.id]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('No authenticated user found');
        return;
      }

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        setError('Error loading user profile');
        return;
      }

      // Fetch usage data from backend
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/api/dashboard/summary?user_id=${user.id}`);
      const usageSummary = await response.json();

      if (!response.ok) {
        console.error('Error fetching usage summary:', usageSummary.error);
        setError('Error loading usage data');
        return;
      }

      // Set user data
      const userDataObj = {
        id: user.id,
        firstName: profile.first_name || 'User',
        lastName: profile.last_name || '',
        email: user.email,
        phone: profile.phone || 'Not provided',
        company: profile.company || 'Not provided',
        investorType: profile.investor_type || 'Individual Investor',
        address: profile.address || 'Not provided',
        city: profile.city || 'Not provided',
        state: profile.state || '',
        zipCode: profile.zip_code || '',
        joinDate: new Date(profile.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long', 
          day: 'numeric'
        }),
        subscriptionPlan: profile.subscription_plan || 'starter',
  subscriptionStatus: profile.subscription_status || 'inactive',
        cancelAtPeriodEnd: profile.cancel_at_period_end || false,
        periodEndDate: profile.period_end_date || null,
        planPrice: PRICING_PLANS[profile.subscription_plan]?.price || PRICING_PLANS.starter.price,
        nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
  subscriptionId: profile.stripe_subscription_id || ''
      };
      
      setUserData(userDataObj);
      setUsageData(usageSummary);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getFeatureAccess = (feature) => {
    if (!usageData) return { allowed: false, reason: 'Loading...' };
    
    const plan = usageData.plan;
    
    switch (feature) {
      case 'upload':
        if (plan === 'starter') {
          return { allowed: false, reason: 'Upgrade to Pro or Power for AI Document Analysis' };
        }
        return { allowed: true, reason: null };
        
      case 'manual':
        return { allowed: true, reason: null }; // All plans
        
      case 'pfa':
        if (plan === 'starter') {
          return { allowed: false, reason: 'Upgrade to Pro or Power for Property Financial Analysis' };
        }
        return { allowed: true, reason: null };
        
      default:
        return { allowed: false, reason: 'Unknown feature' };
    }
  };

  const handleFeedbackSubmit = async () => {
    if (feedbackMessage.trim()) {
      try {
        // Send feedback to backend (implement this endpoint)
        console.log('Feedback submitted:', { type: feedbackType, message: feedbackMessage });
        setShowFeedbackSuccess(true);
        setFeedbackMessage('');
        setTimeout(() => setShowFeedbackSuccess(false), 3000);
      } catch (error) {
        console.error('Error submitting feedback:', error);
      }
    }
  };

  const handleCompletePayment = async () => {
    try {
      setIsUpgrading(true);
      setSubscriptionError(null);
      // Validate user data before sending request
      if (!userData || !userData.id || !userData.subscriptionPlan || !PRICING_PLANS[userData.subscriptionPlan]) {
        setSubscriptionError('User data is missing or invalid. Please refresh and try again.');
        setIsUpgrading(false);
        return;
      }
      const priceId = PRICING_PLANS[userData.subscriptionPlan].priceId;
      if (!priceId) {
        setSubscriptionError('No priceId found for selected plan.');
        setIsUpgrading(false);
        return;
      }
      const response = await fetch(`/api/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userData.id,
          priceId
        })
      });
      let data = {};
      try {
        data = await response.json();
      } catch (e) {
        setSubscriptionError('Invalid response from server.');
        setIsUpgrading(false);
        return;
      }
      if (!response.ok) {
        setSubscriptionError(data.error || data.detail || 'Failed to create checkout session');
        setIsUpgrading(false);
        return;
      }
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        setSubscriptionError('No checkout URL received');
      }
    } catch (error) {
      setSubscriptionError(error.message || 'Failed to start upgrade process');
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setIsCancelling(true);
      setSubscriptionError(null);
      
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
  const response = await fetch(`${backendUrl}/api/cancel-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: userData.subscriptionId
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to cancel subscription');
      }
      
      setSubscriptionSuccess(data.message);
      setShowCancelConfirm(false);
      
      // Refresh dashboard data to show updated status
      await fetchDashboardData();
      
      // Clear success message after 5 seconds
      setTimeout(() => setSubscriptionSuccess(null), 5000);
      
    } catch (error) {
      console.error('Cancel subscription error:', error);
      setSubscriptionError(error.message || 'Failed to cancel subscription');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleReactivateSubscription = async () => {
    try {
      setIsReactivating(true);
      setSubscriptionError(null);
      
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
  const response = await fetch(`${backendUrl}/api/reactivate-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: userData.subscriptionId
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to reactivate subscription');
      }
      
      setSubscriptionSuccess(data.message);
      
      // Refresh dashboard data to show updated status
      await fetchDashboardData();
      
      // Clear success message after 5 seconds
      setTimeout(() => setSubscriptionSuccess(null), 5000);
      
    } catch (error) {
      console.error('Reactivate subscription error:', error);
      setSubscriptionError(error.message || 'Failed to reactivate subscription');
    } finally {
      setIsReactivating(false);
    }
  };

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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f8f8f8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid #e5e5e5',
            borderTop: '3px solid #000000',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px auto'
          }}></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f8f8f8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          textAlign: 'center',
          backgroundColor: 'white',
          padding: '32px',
          borderRadius: '12px',
          border: '1px solid #e5e5e5',
          maxWidth: '400px'
        }}>
          <AlertCircle size={48} style={{ color: '#ef4444', margin: '0 auto 16px auto' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px' }}>
            Error Loading Dashboard
          </h3>
          <p style={{ color: '#666666', marginBottom: '24px' }}>{error}</p>
          <button
            onClick={() => {
              setError(null);
              fetchDashboardData();
            }}
            style={{
              padding: '12px 24px',
              backgroundColor: '#000000',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const uploadAccess = getFeatureAccess('upload');
  const manualAccess = getFeatureAccess('manual');
  const pfaAccess = getFeatureAccess('pfa');

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f8f8',
      position: 'relative'
    }}>
      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '400px',
            width: '90%',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowCancelConfirm(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#666666'
              }}
            >
              <X size={20} />
            </button>
            
            <div style={{ textAlign: 'center' }}>
              <AlertTriangle size={48} style={{ color: '#f59e0b', margin: '0 auto 16px auto' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '16px' }}>
                Cancel Subscription?
              </h3>
              <p style={{ color: '#666666', marginBottom: '24px', lineHeight: '1.5' }}>
                Your subscription will be cancelled but you'll keep access to all features until your current billing period ends.
              </p>
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  disabled={isCancelling}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: 'transparent',
                    color: '#666666',
                    border: '1px solid #e5e5e5',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Keep Subscription
                </button>
                <button
                  onClick={handleCancelSubscription}
                  disabled={isCancelling}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: isCancelling ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    opacity: isCancelling ? 0.6 : 1
                  }}
                >
                  {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
              Terra.Ai Dashboard
            </span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <button
              onClick={() => setCurrentPage('home')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                backgroundColor: '#000000',
                color: 'white',
                borderRadius: '8px',
                border: 'none',
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
              <Home size={18} />
              Go to App
            </button>

            <button
              onClick={() => setCurrentPage('landing')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                backgroundColor: 'transparent',
                color: '#666666',
                border: '1px solid #e5e5e5',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '24px',
        display: 'flex',
        gap: '24px'
      }}>
        <div style={{
          width: '250px',
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          height: 'fit-content',
          position: 'sticky',
          top: '90px'
        }}>
          <div style={{
            marginBottom: '24px',
            paddingBottom: '24px',
            borderBottom: '1px solid #e5e5e5'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              backgroundColor: '#000000',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto',
              color: 'white',
              fontSize: '1.5rem',
              fontWeight: '700'
            }}>
              {userData?.firstName?.[0] || 'U'}{userData?.lastName?.[0] || 'N'}
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: '600', fontSize: '1.125rem' }}>
                {userData?.firstName} {userData?.lastName}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#666666' }}>
                {userData?.email}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {tabs.map(tab => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    backgroundColor: activeTab === tab.id ? '#f5f5f5' : 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    color: activeTab === tab.id ? '#000000' : '#666666',
                    fontSize: '0.875rem',
                    fontWeight: activeTab === tab.id ? '600' : '500',
                    transition: 'all 0.2s ease',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.backgroundColor = '#f8f8f8';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <IconComponent size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          {/* Success/Error Messages */}
          {(subscriptionSuccess || subscriptionError) && (
            <div style={{
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '24px',
              backgroundColor: subscriptionSuccess ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${subscriptionSuccess ? '#10b981' : '#ef4444'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {subscriptionSuccess ? (
                <CheckCircle size={20} style={{ color: '#10b981' }} />
              ) : (
                <AlertCircle size={20} style={{ color: '#ef4444' }} />
              )}
              <span style={{ 
                color: subscriptionSuccess ? '#065f46' : '#991b1b',
                fontSize: '0.875rem'
              }}>
                {subscriptionSuccess || subscriptionError}
              </span>
              <button
                onClick={() => {
                  setSubscriptionSuccess(null);
                  setSubscriptionError(null);
                }}
                style={{
                  marginLeft: 'auto',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: subscriptionSuccess ? '#065f46' : '#991b1b'
                }}
              >
                <X size={16} />
              </button>
            </div>
          )}

          {activeTab === 'overview' && (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px',
                marginBottom: '24px'
              }}>
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid #e5e5e5'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <Upload size={20} style={{ color: '#3b82f6' }} />
                    <div style={{ fontSize: '0.75rem', fontWeight: '600', color: usageData?.plan === 'pro' ? '#f59e0b' : '#10b981' }}>
                      {usageData?.plan === 'pro' && usageData?.limits ? 
                        `${usageData.remaining?.pdfs || 0}/${usageData.limits.max_pdfs_per_month} left` : 
                        'Unlimited'
                      }
                    </div>
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '4px' }}>
                    {usageData?.usage?.om_pdfs_parsed || 0}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#666666' }}>
                    PDFs Analyzed
                  </div>
                </div>

                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid #e5e5e5'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <FileText size={20} style={{ color: '#8b5cf6' }} />
                    <div style={{ fontSize: '0.75rem', color: '#666666', fontWeight: '600' }}>Pages</div>
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '4px' }}>
                    {usageData?.usage?.pages_processed || 0}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#666666' }}>
                    Pages Processed
                  </div>
                </div>

                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid #e5e5e5'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <Calculator size={20} style={{ color: '#f59e0b' }} />
                    <div style={{ fontSize: '0.75rem', color: '#666666', fontWeight: '600' }}>Sessions</div>
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '4px' }}>
                    {usageData?.usage?.underwriting_sessions || 0}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#666666' }}>
                    Underwriting Sessions
                  </div>
                </div>

                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid #e5e5e5'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <Shield size={20} style={{ color: '#10b981' }} />
                    <div style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: '600',
                      color: usageData?.status === 'active' ? '#10b981' : 
                             usageData?.status === 'cancelling' ? '#f59e0b' : '#f59e0b'
                    }}>
                      {usageData?.status?.toUpperCase() || 'LOADING'}
                    </div>
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px', textTransform: 'capitalize' }}>
                    {usageData?.plan || 'Loading...'} Plan
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '6px',
                      fontSize: '0.75rem'
                    }}>
                      {uploadAccess.allowed ? (
                        <CheckCircle size={14} style={{ color: '#10b981' }} />
                      ) : (
                        <Lock size={14} style={{ color: '#ef4444' }} />
                      )}
                      <span style={{ 
                        color: uploadAccess.allowed ? '#10b981' : '#ef4444' 
                      }}>
                        AI Documents
                      </span>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '6px',
                      fontSize: '0.75rem'
                    }}>
                      {manualAccess.allowed ? (
                        <CheckCircle size={14} style={{ color: '#10b981' }} />
                      ) : (
                        <Lock size={14} style={{ color: '#ef4444' }} />
                      )}
                      <span style={{ 
                        color: manualAccess.allowed ? '#10b981' : '#ef4444' 
                      }}>
                        Manual Underwriting
                      </span>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '6px',
                      fontSize: '0.75rem'
                    }}>
                      {pfaAccess.allowed ? (
                        <CheckCircle size={14} style={{ color: '#10b981' }} />
                      ) : (
                        <Lock size={14} style={{ color: '#ef4444' }} />
                      )}
                      <span style={{ 
                        color: pfaAccess.allowed ? '#10b981' : '#ef4444' 
                      }}>
                        Financial Analysis
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {(!uploadAccess.allowed || !pfaAccess.allowed) && usageData?.plan === 'starter' && (
                <div style={{
                  backgroundColor: '#fff3cd',
                  border: '1px solid #ffeaa7',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '24px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <AlertCircle size={20} style={{ color: '#b45309' }} />
                    <span style={{ fontSize: '0.875rem', color: '#b45309', fontWeight: '600' }}>
                      Upgrade Required
                    </span>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: '#92400e', margin: '0 0 12px 28px' }}>
                    AI Document Analysis and Property Financial Analysis require Pro or Power plans. Upgrade to access these features.
                  </p>
                  <button
                    onClick={() => setActiveTab('subscription')}
                    style={{
                      marginLeft: '28px',
                      padding: '8px 16px',
                      backgroundColor: '#b45309',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    View Plans
                  </button>
                </div>
              )}

              {usageData?.plan === 'pro' && usageData?.remaining?.pdfs <= 3 && (
                <div style={{
                  backgroundColor: '#fef3c7',
                  border: '1px solid #fbbf24',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '24px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <AlertCircle size={20} style={{ color: '#d97706' }} />
                    <span style={{ fontSize: '0.875rem', color: '#d97706', fontWeight: '600' }}>
                      PDF Limit Warning
                    </span>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: '#92400e', margin: '0 0 12px 28px' }}>
                    You have {usageData.remaining.pdfs} PDF analyses remaining this month. Upgrade to Power for unlimited processing.
                  </p>
                  <button
                    onClick={() => setActiveTab('subscription')}
                    style={{
                      marginLeft: '28px',
                      padding: '8px 16px',
                      backgroundColor: '#d97706',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Upgrade to Power
                  </button>
                </div>
              )}

              {userData?.cancelAtPeriodEnd && (
                <div style={{
                  backgroundColor: '#fef3c7',
                  border: '1px solid #fbbf24',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '24px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <AlertTriangle size={20} style={{ color: '#d97706' }} />
                    <span style={{ fontSize: '0.875rem', color: '#d97706', fontWeight: '600' }}>
                      Subscription Ending
                    </span>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: '#92400e', margin: '0 0 12px 28px' }}>
                    Your subscription will end on {userData.periodEndDate ? new Date(userData.periodEndDate).toLocaleDateString() : 'your next billing date'}. You'll keep access until then.
                  </p>
                  <button
                    onClick={handleReactivateSubscription}
                    disabled={isReactivating}
                    style={{
                      marginLeft: '28px',
                      padding: '8px 16px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      cursor: isReactivating ? 'not-allowed' : 'pointer',
                      opacity: isReactivating ? 0.6 : 1
                    }}
                  >
                    {isReactivating ? 'Reactivating...' : 'Reactivate Subscription'}
                  </button>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '24px',
                  border: '1px solid #e5e5e5'
                }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '20px' }}>
                    Usage Summary
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px',
                      backgroundColor: '#f8f8f8',
                      borderRadius: '8px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <Upload size={16} style={{ color: '#3b82f6' }} />
                        <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>PDF Documents</span>
                      </div>
                      <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                        {usageData?.usage?.om_pdfs_parsed || 0}
                        {usageData?.plan === 'pro' && usageData?.limits ? `/${usageData.limits.max_pdfs_per_month}` : ''}
                      </span>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px',
                      backgroundColor: '#f8f8f8',
                      borderRadius: '8px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <FileText size={16} style={{ color: '#8b5cf6' }} />
                        <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Pages Processed</span>
                      </div>
                      <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                        {usageData?.usage?.pages_processed || 0}
                      </span>
                    </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px',
                      backgroundColor: '#f8f8f8',
                      borderRadius: '8px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <Calculator size={16} style={{ color: '#f59e0b' }} />
                        <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Underwriting Sessions</span>
                      </div>
                      <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                        {usageData?.usage?.underwriting_sessions || 0}
                      </span>
                    </div>

                    <div style={{
                      padding: '12px',
                      backgroundColor: '#f0f9ff',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: '600', marginBottom: '4px' }}>
                        Current Billing Period
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#0369a1', fontWeight: '500' }}>
                        {usageData?.current_month || 'Loading...'}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '24px',
                  border: '1px solid #e5e5e5'
                }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '20px' }}>
                    Send Feedback
                  </h3>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                      <button
                        onClick={() => setFeedbackType('recommendation')}
                        style={{
                          flex: 1,
                          padding: '8px 16px',
                          backgroundColor: feedbackType === 'recommendation' ? '#000000' : 'white',
                          color: feedbackType === 'recommendation' ? 'white' : '#666666',
                          border: feedbackType === 'recommendation' ? '1px solid #000000' : '1px solid #e5e5e5',
                          borderRadius: '8px',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Recommendation
                      </button>
                      <button
                        onClick={() => setFeedbackType('issue')}
                        style={{
                          flex: 1,
                          padding: '8px 16px',
                          backgroundColor: feedbackType === 'issue' ? '#000000' : 'white',
                          color: feedbackType === 'issue' ? 'white' : '#666666',
                          border: feedbackType === 'issue' ? '1px solid #000000' : '1px solid #e5e5e5',
                          borderRadius: '8px',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Report Issue
                      </button>
                    </div>

                    <textarea
                      value={feedbackMessage}
                      onChange={(e) => setFeedbackMessage(e.target.value)}
                      placeholder={feedbackType === 'recommendation' 
                        ? 'Share your ideas to improve Terra.Ai...' 
                        : 'Describe the issue you encountered...'}
                      style={{
                        width: '100%',
                        minHeight: '120px',
                        padding: '12px',
                        border: '1px solid #e5e5e5',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        resize: 'vertical',
                        outline: 'none',
                        transition: 'border-color 0.2s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#000000';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e5e5';
                      }}
                    />
                  </div>

                  {showFeedbackSuccess && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px',
                      backgroundColor: '#f0fdf4',
                      border: '1px solid #10b981',
                      borderRadius: '8px',
                      marginBottom: '16px'
                    }}>
                      <CheckCircle size={16} style={{ color: '#10b981' }} />
                      <span style={{ fontSize: '0.875rem', color: '#065f46' }}>
                        Thank you! Your feedback has been sent.
                      </span>
                    </div>
                  )}

                  <button
                    onClick={handleFeedbackSubmit}
                    disabled={!feedbackMessage.trim()}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: feedbackMessage.trim() ? '#000000' : '#e5e5e5',
                      color: feedbackMessage.trim() ? 'white' : '#999999',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: feedbackMessage.trim() ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <MessageSquare size={16} />
                    Send Feedback
                  </button>

                  <div style={{
                    marginTop: '16px',
                    padding: '12px',
                    backgroundColor: '#f8f8f8',
                    borderRadius: '8px'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: '#666666', marginBottom: '4px' }}>
                      Or email directly:
                    </div>
                    <a 
                      href="mailto:support@terra.ai" 
                      style={{ 
                        fontSize: '0.875rem', 
                        color: '#000000', 
                        textDecoration: 'underline',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Mail size={14} />
                      support@terra.ai
                    </a>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'profile' && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '32px',
              border: '1px solid #e5e5e5'
            }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '32px' }}>
                Profile Information
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#666666', marginBottom: '8px' }}>
                    First Name
                  </label>
                  <input
                    type="text"
                    value={userData?.firstName || ''}
                    readOnly
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e5e5e5',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      backgroundColor: '#f8f8f8'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#666666', marginBottom: '8px' }}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={userData?.lastName || ''}
                    readOnly
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e5e5e5',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      backgroundColor: '#f8f8f8'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#666666', marginBottom: '8px' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={userData?.email || ''}
                    readOnly
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e5e5e5',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      backgroundColor: '#f8f8f8'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#666666', marginBottom: '8px' }}>
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={userData?.phone || ''}
                    readOnly
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e5e5e5',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      backgroundColor: '#f8f8f8'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#666666', marginBottom: '8px' }}>
                    Company
                  </label>
                  <input
                    type="text"
                    value={userData?.company || ''}
                    readOnly
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e5e5e5',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      backgroundColor: '#f8f8f8'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#666666', marginBottom: '8px' }}>
                    Investor Type
                  </label>
                  <input
                    type="text"
                    value={userData?.investorType || ''}
                    readOnly
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e5e5e5',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      backgroundColor: '#f8f8f8'
                    }}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#666666', marginBottom: '8px' }}>
                    Address
                  </label>
                  <input
                    type="text"
                    value={`${userData?.address || ''}, ${userData?.city || ''}, ${userData?.state || ''} ${userData?.zipCode || ''}`.replace(/^, |, , |, $/, '')}
                    readOnly
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e5e5e5',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      backgroundColor: '#f8f8f8'
                    }}
                  />
                </div>
              </div>

              <button
                style={{
                  marginTop: '24px',
                  padding: '12px 24px',
                  backgroundColor: '#000000',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#333333';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#000000';
                }}
              >
                Update Profile
              </button>
            </div>
          )}

          {activeTab === 'subscription' && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '32px',
              border: '1px solid #e5e5e5'
            }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '32px' }}>
                Subscription Details
              </h2>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '24px',
                backgroundColor: '#f8f8f8',
                borderRadius: '12px',
                marginBottom: '24px'
              }}>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#666666', marginBottom: '4px' }}>
                    Current Plan
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '4px', textTransform: 'capitalize' }}>
                    {usageData?.plan || 'Loading...'} Plan
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#666666' }}>
                    ${userData?.planPrice || 0}/month
                  </div>
                </div>
                <div style={{
                  backgroundColor: usageData?.status === 'active' ? '#10b981' : 
                                   usageData?.status === 'pending' ? '#f59e0b' : 
                                   usageData?.status === 'cancelling' ? '#f59e0b' : '#6b7280',
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  textTransform: 'uppercase'
                }}>
                  {usageData?.status || 'LOADING'}
                </div>
              </div>

              {userData?.cancelAtPeriodEnd && (
                <div style={{
                  padding: '20px',
                  backgroundColor: '#fef3c7',
                  border: '1px solid #fbbf24',
                  borderRadius: '12px',
                  marginBottom: '24px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <AlertTriangle size={20} style={{ color: '#d97706' }} />
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#d97706' }}>
                      Subscription Ending
                    </h3>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: '#92400e', margin: '0 0 16px 28px' }}>
                    Your subscription will end on {userData.periodEndDate ? new Date(userData.periodEndDate).toLocaleDateString() : 'your next billing date'}. You'll keep access to all features until then.
                  </p>
                  <button
                    onClick={handleReactivateSubscription}
                    disabled={isReactivating}
                    style={{
                      marginLeft: '28px',
                      padding: '12px 24px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: isReactivating ? 'not-allowed' : 'pointer',
                      opacity: isReactivating ? 0.6 : 1
                    }}
                  >
                    {isReactivating ? 'Reactivating...' : 'Reactivate Subscription'}
                  </button>
                </div>
              )}

              {usageData?.plan === 'pro' && usageData?.limits && (
                <div style={{
                  padding: '20px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '12px',
                  marginBottom: '24px'
                }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '16px' }}>
                    Plan Limits
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{
                      padding: '16px',
                      backgroundColor: 'white',
                      borderRadius: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <Upload size={16} style={{ color: '#3b82f6' }} />
                        <span style={{ fontSize: '0.875rem', color: '#666666' }}>PDFs per Month</span>
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                        {usageData.usage.om_pdfs_parsed}/{usageData.limits.max_pdfs_per_month}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#666666' }}>
                        {usageData.remaining.pdfs} remaining
                      </div>
                    </div>

                    <div style={{
                      padding: '16px',
                      backgroundColor: 'white',
                      borderRadius: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <FileText size={16} style={{ color: '#8b5cf6' }} />
                        <span style={{ fontSize: '0.875rem', color: '#666666' }}>Max Pages per PDF</span>
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                        {usageData.limits.max_pages_per_pdf}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#666666' }}>
                        Per document limit
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                <div style={{
                  padding: '16px',
                  backgroundColor: '#f8f8f8',
                  borderRadius: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Calendar size={16} style={{ color: '#666666' }} />
                    <span style={{ fontSize: '0.875rem', color: '#666666' }}>Member Since</span>
                  </div>
                  <div style={{ fontSize: '1.125rem', fontWeight: '600' }}>
                    {userData?.joinDate || 'Loading...'}
                  </div>
                </div>

                <div style={{
                  padding: '16px',
                  backgroundColor: '#f8f8f8',
                  borderRadius: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <CreditCard size={16} style={{ color: '#666666' }} />
                    <span style={{ fontSize: '0.875rem', color: '#666666' }}>Next Billing Date</span>
                  </div>
                  <div style={{ fontSize: '1.125rem', fontWeight: '600' }}>
                    {userData?.cancelAtPeriodEnd ? 'N/A (Cancelled)' : userData?.nextBilling || 'Loading...'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={handleCompletePayment}
                  disabled={isUpgrading || !userData || !userData.id || !userData.subscriptionPlan || !PRICING_PLANS[userData.subscriptionPlan]}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: isUpgrading ? '#6b7280' : '#000000',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: isUpgrading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    opacity: isUpgrading ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!isUpgrading) {
                      e.currentTarget.style.backgroundColor = '#333333';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isUpgrading) {
                      e.currentTarget.style.backgroundColor = '#000000';
                    }
                  }}
                >
                  {isUpgrading ? 'Processing...' : usageData?.status === 'pending' ? 'Complete Payment' : 'Upgrade Plan'}
                </button>

                {!userData?.cancelAtPeriodEnd && (
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    disabled={isCancelling}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: 'transparent',
                      color: isCancelling ? '#999999' : '#666666',
                      border: '1px solid #e5e5e5',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: isCancelling ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      opacity: isCancelling ? 0.6 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!isCancelling) {
                        e.currentTarget.style.backgroundColor = '#f5f5f5';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isCancelling) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    {isCancelling ? 'Cancelling...' : 'Cancel Subscription'}
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '32px',
              border: '1px solid #e5e5e5'
            }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '32px' }}>
                Account Settings
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '16px' }}>
                    Email Notifications
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                      <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px' }} />
                      <span style={{ fontSize: '0.875rem' }}>Weekly usage reports</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                      <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px' }} />
                      <span style={{ fontSize: '0.875rem' }}>New feature announcements</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                      <input type="checkbox" style={{ width: '18px', height: '18px' }} />
                      <span style={{ fontSize: '0.875rem' }}>Marketing emails</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '16px' }}>
                    Security
                  </h3>
                  <button
                    style={{
                      padding: '12px 24px',
                      backgroundColor: 'transparent',
                      color: '#000000',
                      border: '1px solid #000000',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#000000';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#000000';
                    }}
                  >
                    Change Password
                  </button>
                </div>

                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '16px' }}>
                    Data & Privacy
                  </h3>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      style={{
                        padding: '12px 24px',
                        backgroundColor: 'transparent',
                        color: '#666666',
                        border: '1px solid #e5e5e5',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f5f5f5';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      Export Data
                    </button>
                    <button
                      style={{
                        padding: '12px 24px',
                        backgroundColor: 'transparent',
                        color: '#ef4444',
                        border: '1px solid #ef4444',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#fef2f2';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>

              <button
                style={{
                  marginTop: '32px',
                  padding: '12px 24px',
                  backgroundColor: '#000000',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#333333';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#000000';
                }}
              >
                Save Settings
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;