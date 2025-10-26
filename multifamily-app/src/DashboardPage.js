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
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { supabase } from './lib/supabase';

const BACKEND_URL = (process.env.REACT_APP_BACKEND_URL || '').replace(/\/+$/, '') || 'http://localhost:8000';

const PRICING_PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 0,
    priceId: 'price_starter',
    pagesIncluded: 5,
    additionalPagePrice: 25,
    additionalPages: 50
  },
  standard: {
    id: 'standard',
    name: 'Standard',
    price: 50,
    priceId: process.env.REACT_APP_STRIPE_STANDARD_PRICE_ID || 'price_standard',
    pagesIncluded: 50,
    additionalPagePrice: 25, // $25 for 50 additional pages
    additionalPages: 50
  }
};

const DashboardPage = ({ setCurrentPage, currentUser }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [feedbackType, setFeedbackType] = useState('recommendation');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [changePwError, setChangePwError] = useState(null);
  const [changePwSuccess, setChangePwSuccess] = useState(false);
  const [isChangingPw, setIsChangingPw] = useState(false);

  const handleChangePassword = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (newPassword.length < 6) {
      setChangePwError('Password must be at least 6 characters');
      return;
    }
    
    setChangePwError(null);
    setChangePwSuccess(false);
    setIsChangingPw(true);
    
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        console.error('supabase.updateUser error:', error);
        // Make sure we present a helpful message
        const msg = error.message || (typeof error === 'string' ? error : JSON.stringify(error));
        setChangePwError(msg || 'Failed to change password');
        setIsChangingPw(false);
        // Auto-close after 3 seconds on error
        setTimeout(() => {
          setShowChangePassword(false);
          setChangePwError(null);
        }, 3000);
        return;
      }

      // Success path
      console.log('Password updated successfully');
      setChangePwSuccess(true);
      setNewPassword('');
      setIsChangingPw(false);
      // Auto-close after 2 seconds on success
      setTimeout(() => {
        setShowChangePassword(false);
        setChangePwSuccess(false);
        setChangePwError(null);
      }, 2000);
    } catch (err) {
      console.error('Unexpected error changing password:', err);
      const msg = err?.message || (typeof err === 'string' ? err : JSON.stringify(err));
      setChangePwError(msg || 'Failed to change password');
      setIsChangingPw(false);
      // Auto-close after 3 seconds on error
      setTimeout(() => {
        setShowChangePassword(false);
        setChangePwError(null);
        setNewPassword('');
      }, 3000);
    }
  };
  const [showFeedbackSuccess, setShowFeedbackSuccess] = useState(false);
  const [userData, setUserData] = useState(null);
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    investorType: '',
    address: '',
    address2: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [profileSuccess, setProfileSuccess] = useState(null);
  const [usageData, setUsageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
    // DashboardPage deleted for rebuild
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
    let raw;
    try {
      setLoading(true);
      setError(null);
      // --- Stale/invalid session detection ---
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.access_token) {
        // Clear localStorage/sessionStorage and redirect to login
        localStorage.clear();
        sessionStorage.clear();
        setError('Session expired or invalid. Please log in again.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1200);
        return;
      }
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`
      };
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        localStorage.clear();
        sessionStorage.clear();
        setError('No authenticated user found. Please log in again.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1200);
        return;
      }
      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (profileError || !profile) {
        localStorage.clear();
        sessionStorage.clear();
        setError('Error loading user profile. Please log in again.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1200);
        return;
      }
      // Fetch usage data from backend using proxy
      const response = await fetch(`/api/proxy?endpoint=/api/dashboard/summary&user_id=${user.id}`, { headers });
      let usageSummary;
      try {
        raw = await response.text();
        usageSummary = raw ? JSON.parse(raw) : {};
        console.log('[Dashboard] Usage summary received:', usageSummary);
      } catch {
        usageSummary = {};
      }
      if (!response.ok || usageSummary.error || usageSummary.detail) {
        // Backend error or invalid usage data: clear session and redirect
        localStorage.clear();
        sessionStorage.clear();
        const msg = usageSummary.error || usageSummary.detail || raw || `HTTP ${response.status}`;
        setError(msg);
        setTimeout(() => {
          window.location.href = '/login';
        }, 1200);
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
        address: profile.address1 || profile.address || 'Not provided',
        address2: profile.address2 || '',
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
      setProfileForm({
        firstName: userDataObj.firstName,
        lastName: userDataObj.lastName,
        email: userDataObj.email,
        phone: userDataObj.phone,
        company: userDataObj.company,
        investorType: userDataObj.investorType,
        address: userDataObj.address,
        address2: userDataObj.address2,
        city: userDataObj.city,
        state: userDataObj.state,
        zipCode: userDataObj.zipCode
      });
      setUsageData(usageSummary);
    } catch (error) {
      // Catch-all: clear session and redirect if error is likely stale auth
      localStorage.clear();
      sessionStorage.clear();
      setError('Failed to load dashboard data. Please log in again.');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1200);
    } finally {
      setLoading(false);
    }
  };

  const getFeatureAccess = (feature) => {
    if (!usageData) return { allowed: false, reason: 'Loading...' };
    // Unlock all features for all plans
    switch (feature) {
      case 'upload':
      case 'manual':
      case 'pfa':
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
      const { data: { session } } = await supabase.auth.getSession();
      const headers = {
        'Content-Type': 'application/json',
        ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {})
      };
      const response = await fetch(`/api/proxy?endpoint=/api/checkout`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ userId: userData.id, priceId })
      });
      let raw, data;
      try {
        raw = await response.text();
        data = raw ? JSON.parse(raw) : {};
      } catch {
        data = {};
      }
      if (!response.ok) {
        setSubscriptionError(data.error || data.detail || raw || 'Failed to create checkout session');
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
      const { data: { session } } = await supabase.auth.getSession();
      const headers = {
        'Content-Type': 'application/json',
        ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {})
      };
      
      // Call backend directly
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const backendUrl = isLocal ? 'http://127.0.0.1:8010' : 'https://marketfinder-ai.onrender.com';
      const url = `${backendUrl}/api/cancel-subscription`;
      
      const res = await fetch(url, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ user_id: currentUser.id })
      });
      
      let raw = await res.text().catch(() => '');
      let data = {};
      try { data = raw ? JSON.parse(raw) : {}; } catch (_) { data = {}; }

      if (!res.ok) {
        const detail = data?.detail || raw || `Failed to cancel subscription (status ${res.status})`;
        throw new Error(detail);
      }

      // Success: update UI and refresh dashboard data
      setSubscriptionSuccess(data.message || 'Subscription cancelled');
      setShowCancelConfirm(false);
      await fetchDashboardData();
      setTimeout(() => setSubscriptionSuccess(null), 5000);
    } catch (error) {
      console.error('Cancel subscription error:', error.message);
      setSubscriptionError(error.message || 'Failed to cancel subscription');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleReactivateSubscription = async () => {
    try {
      setIsReactivating(true);
      setSubscriptionError(null);
      const { data: { session } } = await supabase.auth.getSession();
      const headers = {
        'Content-Type': 'application/json',
        ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {})
      };
      const response = await fetch(`/api/proxy?endpoint=/api/reactivate-subscription`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ subscriptionId: userData.subscriptionId })
      });
      let raw, data;
      try {
        raw = await response.text();
        data = raw ? JSON.parse(raw) : {};
      } catch {
        data = {};
      }
      if (!response.ok) {
        throw new Error(data.detail || raw || 'Failed to reactivate subscription');
      }
      setSubscriptionSuccess(data.message);
      await fetchDashboardData();
      setTimeout(() => setSubscriptionSuccess(null), 5000);
    } catch (error) {
      console.error('Reactivate subscription error:', error.message);
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
              {/* Usage Statistics section - HIDDEN */}
              <div style={{ display: 'none' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '16px'
              }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', margin: 0 }}>
                  Usage Statistics
                </h3>
                <button
                  onClick={() => window.location.reload()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    background: '#f3f4f6',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    color: '#374151',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.background = '#e5e7eb'}
                  onMouseOut={(e) => e.target.style.background = '#f3f4f6'}
                >
                  <RefreshCw size={14} />
                  Refresh Stats
                </button>
              </div>
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
              </div>
              {/* End of hidden Usage Statistics section */}

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
                    value={profileForm.firstName}
                    onChange={e => setProfileForm(f => ({ ...f, firstName: e.target.value }))}
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
                    value={profileForm.lastName}
                    onChange={e => setProfileForm(f => ({ ...f, lastName: e.target.value }))}
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
                    value={profileForm.email}
                    onChange={e => setProfileForm(f => ({ ...f, email: e.target.value }))}
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
                    value={profileForm.phone}
                    onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
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
                    value={profileForm.company}
                    onChange={e => setProfileForm(f => ({ ...f, company: e.target.value }))}
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
                    value={profileForm.investorType}
                    onChange={e => setProfileForm(f => ({ ...f, investorType: e.target.value }))}
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
                  <div style={{ marginBottom: '10px' }}>
                    <input
                      type="text"
                      value={profileForm.address}
                      onChange={e => setProfileForm(f => ({ ...f, address: e.target.value }))}
                      placeholder="Street Address"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #e5e5e5',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        backgroundColor: '#f8f8f8',
                        marginBottom: '8px'
                      }}
                    />
                    <input
                      type="text"
                      value={profileForm.address2}
                      onChange={e => setProfileForm(f => ({ ...f, address2: e.target.value }))}
                      placeholder="Apt, Suite, Unit, etc. (optional)"
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
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '8px' }}>
                    <input
                      type="text"
                      value={profileForm.city}
                      onChange={e => setProfileForm(f => ({ ...f, city: e.target.value }))}
                      placeholder="City"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #e5e5e5',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        backgroundColor: '#f8f8f8'
                      }}
                    />
                    <input
                      type="text"
                      value={profileForm.state}
                      onChange={e => setProfileForm(f => ({ ...f, state: e.target.value }))}
                      placeholder="State"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #e5e5e5',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        backgroundColor: '#f8f8f8'
                      }}
                    />
                    <input
                      type="text"
                      value={profileForm.zipCode}
                      onChange={e => setProfileForm(f => ({ ...f, zipCode: e.target.value }))}
                      placeholder="Zip"
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
                  cursor: profileLoading ? 'not-allowed' : 'pointer',
                  opacity: profileLoading ? 0.6 : 1,
                  transition: 'all 0.2s ease'
                }}
                disabled={profileLoading}
                onClick={async () => {
                  setProfileLoading(true);
                  setProfileError(null);
                  setProfileSuccess(null);
                  try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) throw new Error('No authenticated user');
                    const { error: updateError } = await supabase
                      .from('profiles')
                      .update({
                        first_name: profileForm.firstName,
                        last_name: profileForm.lastName,
                        email: profileForm.email,
                        phone: profileForm.phone,
                        company: profileForm.company,
                        investor_type: profileForm.investorType,
                        address1: profileForm.address,
                        address2: profileForm.address2,
                        city: profileForm.city,
                        state: profileForm.state,
                        zip_code: profileForm.zipCode
                      })
                      .eq('id', user.id);
                    if (updateError) throw new Error(updateError.message);
                    setProfileSuccess('Profile updated successfully!');
                    await fetchDashboardData();
                  } catch (err) {
                    setProfileError(err.message || 'Failed to update profile');
                  } finally {
                    setProfileLoading(false);
                  }
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#333333';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#000000';
                }}
              >
                {profileLoading ? 'Updating...' : 'Update Profile'}
              </button>
              {profileError && (
                <div style={{ color: '#ef4444', marginTop: '12px', textAlign: 'center' }}>{profileError}</div>
              )}
              {profileSuccess && (
                <div style={{ color: '#22c55e', marginTop: '12px', textAlign: 'center' }}>{profileSuccess}</div>
              )}
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
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '4px' }}>
                    Monthly Subscription
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#666666' }}>
                    $60/month • 60 pages included
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
                  {!userData?.cancelAtPeriodEnd && userData?.nextBilling && (
                    <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px', fontWeight: '600' }}>
                      {(() => {
                        try {
                          const nextBilling = new Date(userData.nextBilling);
                          const today = new Date();
                          const daysUntil = Math.ceil((nextBilling - today) / (1000 * 60 * 60 * 24));
                          return daysUntil > 0 ? `${daysUntil} days until renewal` : 'Renews today';
                        } catch {
                          return '';
                        }
                      })()}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => {
                    const userId = currentUser?.id;
                    window.location.href = `https://buy.stripe.com/test_aFacMY6Btb4Sd2RcLFf3a01?client_reference_id=${userId}`;
                  }}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#1d4ed8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#2563eb';
                  }}
                >
                  Buy 60 Pages - $29
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
                    onClick={() => setShowChangePassword(true)}
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

                  {showChangePassword && (
                    <div style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      width: '100vw',
                      height: '100vh',
                      background: 'rgba(0,0,0,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 1000
                    }}>
                      <div style={{
                        background: 'white',
                        padding: '2rem',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        minWidth: '320px',
                        maxWidth: '90vw',
                        position: 'relative'
                      }}>
                        <h3 style={{ marginBottom: '1rem' }}>Change Password</h3>
                        {/* Use JS validation instead of HTML constraint validation to avoid browser blocking the submit button */}
                        <form onSubmit={(e) => e.preventDefault()} noValidate>
                          <div style={{ position: 'relative' }}>
                            <input
                              type={showPassword ? 'text' : 'password'}
                              placeholder="New Password"
                              value={newPassword}
                              onChange={e => setNewPassword(e.target.value)}
                              style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '0.25rem', fontSize: '1rem', marginBottom: '1rem' }}
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
                              {showPassword ? 'Hide' : 'Show'}
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={handleChangePassword}
                            disabled={isChangingPw}
                            style={{ 
                              width: '100%', 
                              padding: '0.75rem', 
                              backgroundColor: changePwSuccess ? '#10b981' : isChangingPw ? '#94a3b8' : '#1a73e8',
                              color: 'white', 
                              border: 'none', 
                              borderRadius: '0.25rem', 
                              fontSize: '1rem', 
                              cursor: isChangingPw ? 'not-allowed' : 'pointer', 
                              opacity: isChangingPw ? 0.7 : 1,
                              transition: 'all 0.2s'
                            }}
                          >
                            {changePwSuccess ? 'Password Changed!' : isChangingPw ? 'Changing...' : 'Change Password'}
                          </button>
                        </form>
                        {changePwError && <p style={{ color: '#dc3545', marginTop: '1rem', whiteSpace: 'pre-wrap' }}>{changePwError}</p>}
                        {changePwSuccess && <p style={{ color: '#155724', marginTop: '1rem' }}>Password changed successfully!</p>}
                        <button onClick={() => {
                          setShowChangePassword(false);
                          setChangePwError(null);
                          setChangePwSuccess(false);
                          setNewPassword('');
                        }} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', fontSize: '1.5rem', color: '#666', cursor: 'pointer' }}>×</button>
                      </div>
                    </div>
                  )}
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
                      onClick={async () => {
                        if (!userData?.id) return;
                        try {
                          // Call backend to delete user from Auth and profiles
                          const resp = await fetch('http://localhost:8010/api/delete-user', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ user_id: userData.id })
                          });
                          const result = await resp.json();
                          if (!result.success) throw new Error(result.detail || 'Delete failed');
                          await supabase.auth.signOut();
                          setCurrentPage?.('landing');
                          alert('Account deleted.');
                        } catch (err) {
                          alert('Failed to delete account: ' + (err?.message || err));
                        }
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