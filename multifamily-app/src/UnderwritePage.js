import React, { useState, useEffect } from 'react';
import { Upload, Calculator, ArrowLeft, FileText, Building, Lock, Crown, AlertCircle } from 'lucide-react';
import { styles } from './styles';
import { supabase } from './lib/supabase';
import PageLimitExceededModal from './components/PageLimitExceededModal';
import { useDocumentAccess } from './hooks/useDocumentAccess';

// Works with Vite AND CRA, plus sane localhost defaults
export const UPLOAD_API = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_UPLOAD_API)
  ? import.meta.env.VITE_UPLOAD_API
  : (process.env.REACT_APP_UPLOAD_API || 'https://marketfinder-ai.onrender.com');
export const PFA_API = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_PFA_API)
  ? import.meta.env.VITE_PFA_API
  : (process.env.REACT_APP_PFA_API || 'https://marketfinder-ai.onrender.com');

const UnderwritePage = ({ setCurrentPage }) => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const [userLimits, setUserLimits] = useState(null);
  const [userUsage, setUserUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // New state for page limit modal
  const [showPageLimitModal, setShowPageLimitModal] = useState(false);
  const [pageModalData, setPageModalData] = useState({
    remainingPages: 0,
    pagesRequested: 0
  });

  // Get current user, subscription plan, limits, and usage
  useEffect(() => {
    let timeoutId;
    
    const getCurrentUser = async () => {
      try {
        console.log('UnderwritePage: Starting to load user data...');
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('UnderwritePage: Session error:', sessionError);
          setError('Authentication error. Please try logging in again.');
          setLoading(false);
          return;
        }
        
        if (!session) {
          console.log('UnderwritePage: No session found');
          setError('Please log in to access underwriting features');
          setLoading(false);
          return;
        }

        console.log('UnderwritePage: Session found, loading profile...');

        // Get user profile with subscription info
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('UnderwritePage: Profile error:', profileError);
          setError('Error loading user profile');
          setLoading(false);
          return;
        }

        const userId = session.user.id;
        const plan = profile?.subscription_plan || 'starter';
        const status = profile?.subscription_status || 'inactive';

        console.log('UnderwritePage: Profile loaded, plan:', plan, 'status:', status);

        setCurrentUser({
          id: userId,
          email: session.user.email,
          ...profile
        });
        setUserPlan(plan);


        // --- NEW: Get limits and usage from backend ---
        try {
          const res = await fetch(`${UPLOAD_API}/api/user/usage?user_id=${userId}`, { credentials: 'include' });
          const j = await res.json();
          const pagesPerMonth = j?.limits?.pages_per_month ?? j?.limits?.max_pages_per_month ?? 50;
          const maxPagesPerPdf = j?.limits?.max_pages_per_pdf ?? 25;
          const pagesUsed = j?.usage?.pages_used ?? j?.usage?.pages_processed ?? 0;
          setUserLimits({ pagesPerMonth, maxPagesPerPdf });
          setUserUsage({ ...j?.usage, pages_used: pagesUsed });
        } catch (err) {
          setUserLimits({ pagesPerMonth: 50, maxPagesPerPdf: 25 });
          setUserUsage({ pages_used: 0, om_pdfs_parsed: 0, pages_processed: 0, underwriting_sessions: 0 });
        }
  // ...existing code...

        // Check if subscription is active
        if (status !== 'active' && plan !== 'starter') {
          setError('Your subscription is not active. Please update your payment method.');
        }

        console.log('UnderwritePage: User data loading complete');

      } catch (err) {
        console.error('UnderwritePage: Error loading user data:', err);
        setError('Error loading user data. Please try refreshing the page.');
      } finally {
        setLoading(false);
        console.log('UnderwritePage: Loading state set to false');
      }
    };

    // Set a timeout to prevent infinite loading
    timeoutId = setTimeout(() => {
      console.error('UnderwritePage: Loading timeout reached');
      setError('Loading timeout. Please try refreshing the page.');
      setLoading(false);
    }, 10000); // 10 second timeout

    getCurrentUser();
    
    // Cleanup function
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  // Define what each plan can access based on your actual plans
  const planAccess = {
    starter: {
      manual: true,
      upload: true,
      pfa: true,
      name: 'Starter',
      price: '$50/month',
      icon: Crown,
      color: '#f59e0b',
      bgColor: '#fef3c7',
      capabilities: ['Basic document extraction', 'Standard underwriting metrics', 'Up to 50 pages/month'],
      features: ['Heat maps & market reports', 'Basic document generation', 'Manual underwriting', 'Market analysis tools'],
      limitations: []
    },
    pro: {
      manual: true,
      upload: true,
      pfa: true,
      name: 'Pro',
      price: '$100/month',
      icon: Crown,
      color: '#6366f1',
      bgColor: '#eef2ff',
      capabilities: ['Advanced document extraction', 'Pro forma builder', 'Enhanced metrics', 'Up to 200 pages/month'],
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

  // --- NEW: Feature access check via backend ---
  const checkFeatureAccess = async (feature) => {
    if (!currentUser || !currentUser.id) return { hasAccess: false, reason: 'auth' };
    try {
      const accessRes = await fetch(`${UPLOAD_API}/api/user/access-check?user_id=${currentUser.id}&feature=${feature}`);
      const accessJson = await accessRes.json();
      return { hasAccess: accessJson.allowed === true, reason: accessJson.error || null };
    } catch (err) {
      console.error('Error checking feature access:', err);
      return { hasAccess: false, reason: 'backend' };
    }
  };

  // Initialize our document access hook
  const { checkFileAccess } = useDocumentAccess(
    currentUser, 
    setShowPageLimitModal, 
    setPageModalData
  );
  
  // Handle file upload with page limit checking
  const handleFileUpload = async (event, type) => {
    try {
      const file = event.target.files[0];
      if (!file) return;
      
      // For PDF files, check page count
      if (file.type === 'application/pdf') {
        // Check if the user has enough pages
        const accessResult = await checkFileAccess(file);
        
        if (!accessResult.allowed) {
          // If access denied but not due to page limits, show alert
          if (!accessResult.needsAddon) {
            alert(accessResult.error || 'Access denied');
          }
          return;
        }
        
        // Access allowed, continue with normal file processing
        alert(`Document accepted for processing. You have ${accessResult.remainingPages} pages remaining this month.`);
        
        // Continue with existing upload logic...
        console.log('Continuing with file processing...');
      }
    } catch (err) {
      console.error('Error handling file upload:', err);
      alert('Error uploading file. Please try again.');
    }
  };
  
  // Function to refresh user data after purchasing additional pages
  const handlePurchaseComplete = async () => {
    try {
      // Refresh user limits and usage data
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      // Get updated usage summary
      const response = await fetch(`${UPLOAD_API}/api/user/usage?user_id=${session.user.id}`);
      const usageData = await response.json();
      if (usageData) {
        const pagesPerMonth =
          usageData?.limits?.pages_per_month ??
          usageData?.limits?.max_pages_per_month ??
          50;
        const pagesUsed =
          usageData?.usage?.pages_used ??
          usageData?.usage?.pages_processed ??
          0;
        setUserLimits({
          pagesPerMonth,
          maxPagesPerPdf: usageData?.limits?.max_pages_per_pdf ?? 25,
        });
        setUserUsage({
          ...usageData?.usage,
          pages_used: pagesUsed,
        });
      }
    } catch (err) {
      console.error('Error refreshing user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionClick = async (option) => {
    const accessCheck = await checkFeatureAccess(option);
    if (!accessCheck.hasAccess) {
      alert(accessCheck.reason || 'Access denied.');
      return;
    }
    // Route to the appropriate page
    if (option === 'upload') setCurrentPage('upload');
    else if (option === 'manual') setCurrentPage('manual');
    else if (option === 'pfa') setCurrentPage('pfa');
  };

  // Compute remaining pages once, above getAnalysisOptions
  const remainingPages = Math.max(0, (userLimits?.pagesPerMonth || 0) - (userUsage?.pages_used || 0));

  const getAnalysisOptions = () => {
    // All features available for all plans
    return [
      {
        id: 'upload',
        icon: Upload,
        title: 'AI Document Analysis',
        text: 'Upload your offering memorandum, T12, or property documents for automatic AI-powered analysis',
        gradient: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
        features: ['AI OCR Extraction', 'Multi-page PDF Support', 'Automatic Data Parsing', 'Instant Analysis'],
        hasAccess: true,
        requiredPlan: 'All Plans',
  remaining: Number.isFinite(remainingPages) ? remainingPages : undefined,
        accessReason: null
      },
      {
        id: 'manual',
        icon: Calculator,
        title: 'Manual Entry',
        text: 'Enter property and financial data manually for quick customized analysis',
        gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        features: ['Custom Input Fields', 'Real-time Calculations', 'Flexible Assumptions', 'Quick Analysis'],
        hasAccess: true,
        requiredPlan: 'All Plans'
      },
      {
        id: 'pfa',
        icon: Building,
        title: 'Property Financial Analysis (PFA)',
        text: 'Upload rent rolls, T12s, or P&L spreadsheets for a full property financial health check and improvement insights',
        gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
        features: ['Expense Benchmarking', 'Revenue Optimization', 'Market Comparison', 'Improvement Suggestions'],
        hasAccess: true,
        requiredPlan: 'All Plans'
      }
    ];
  };

  // ...existing code...

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
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      {/* Back button */}
      <button 
        onClick={() => setCurrentPage('dashboard')}
        style={{
          display: 'flex', 
          alignItems: 'center',
          background: 'none',
          border: 'none',
          color: '#3b82f6',
          fontWeight: 500,
          cursor: 'pointer',
          padding: '8px 0',
          marginBottom: '24px'
        }}
      >
        <ArrowLeft size={16} style={{ marginRight: '8px' }} />
        Back to Dashboard
      </button>
      
      <h1 style={{
        fontSize: '28px',
        fontWeight: '700',
        marginBottom: '16px',
        color: '#0f172a'
      }}>
        Underwriting Tools
      </h1>
      
      <p style={{
        fontSize: '16px',
        color: '#475569',
        marginBottom: '32px'
      }}>
        Choose a method to analyze your property data and generate comprehensive underwriting insights.
      </p>
      
      {/* Analysis options */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        {analysisOptions.map(option => (
          <div 
            key={option.id}
            onMouseEnter={() => setHoveredCard(option.id)}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              backgroundColor: 'white',
              position: 'relative',
              transition: 'all 0.2s ease-in-out',
              transform: hoveredCard === option.id ? 'translateY(-4px)' : 'none',
              boxShadow: hoveredCard === option.id ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' : 'none',
              cursor: option.hasAccess ? 'pointer' : 'default',
              opacity: option.hasAccess ? 1 : 0.7,
            }}
            onClick={() => option.hasAccess && handleOptionClick(option.id)}
          >
            {!option.hasAccess && (
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#f8fafc',
                padding: '6px 12px',
                borderRadius: '16px',
                border: '1px solid #e2e8f0'
              }}>
                <Lock size={12} style={{ marginRight: '6px' }} />
                <span style={{ fontSize: '12px', fontWeight: '500' }}>
                  {option.requiredPlan} only
                </span>
              </div>
            )}
            
            {typeof option.remaining === 'number' && (
              <div style={{
                position: 'absolute',
                top: option.hasAccess ? '12px' : '40px',
                right: '12px',
                display: 'flex',
                alignItems: 'center',
                backgroundColor: option.remaining > 0 ? '#ecfdf5' : '#fef2f2',
                padding: '6px 12px',
                borderRadius: '16px',
                border: `1px solid ${option.remaining > 0 ? '#a7f3d0' : '#fecaca'}`
              }}>
                <span style={{ 
                  fontSize: '12px', 
                  fontWeight: '500',
                  color: option.remaining > 0 ? '#10b981' : '#ef4444'
                }}>
                  {option.remaining > 0 ? `${option.remaining} left this month` : 'Limit reached'}
                </span>
              </div>
            )}
            
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '8px',
              background: option.gradient,
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              {option.icon && React.createElement(option.icon, { color: "white", size: 24 })}
            </div>
            
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#0f172a' }}>
              {option.title}
            </h3>
            
            <p style={{ fontSize: '14px', lineHeight: '1.5', color: '#64748b', marginBottom: '16px' }}>
              {option.text}
            </p>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
              {option.features.map((feature, idx) => (
                <span key={idx} style={{
                  fontSize: '12px',
                  color: '#6366f1',
                  backgroundColor: '#eef2ff',
                  padding: '4px 10px',
                  borderRadius: '12px'
                }}>
                  {feature}
                </span>
              ))}
            </div>
            
            {option.hasAccess && option.id === 'upload' && (
              <div>
                <label 
                  htmlFor="document-upload"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    backgroundColor: '#eef2ff',
                    color: '#6366f1',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  <FileText size={16} style={{ marginRight: '8px' }} />
                  Upload Document
                </label>
                <input
                  id="document-upload"
                  type="file"
                  accept=".pdf,.xls,.xlsx,.csv,.doc,.docx"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Current Plan */}
      <div style={{
        padding: '24px',
        borderRadius: '12px',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        marginBottom: '40px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>
              Current Subscription
            </h2>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: currentPlanAccess.bgColor || '#f8fafc',
                color: currentPlanAccess.color || '#64748b',
                padding: '4px 12px',
                borderRadius: '16px',
                marginRight: '12px',
                fontWeight: '600'
              }}>
                {currentPlanAccess.icon ? <Crown size={16} /> : <Crown size={16} />}
                <span style={{ marginLeft: '6px' }}>{currentPlanAccess.name || 'Starter'}</span>
              </div>
              <span style={{ color: '#64748b', fontSize: '14px' }}>
                {currentPlanAccess.price}
              </span>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: '#64748b', marginRight: '8px' }}>Document Pages:</span>
                <div style={{ 
                  height: '8px', 
                  width: '160px', 
                  backgroundColor: '#e2e8f0', 
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(100, ((userUsage?.pages_used || 0) / (userLimits?.pagesPerMonth || 1)) * 100)}%`,
                    backgroundColor: (userUsage?.pages_used || 0) > (userLimits?.pagesPerMonth || 0) * 0.9 ? '#ef4444' : '#3b82f6',
                    borderRadius: '4px'
                  }} />
                </div>
                <span style={{ marginLeft: '8px', fontSize: '14px', fontWeight: '500' }}>
                  {userUsage?.pages_used || 0} / {userLimits?.pagesPerMonth || 0}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                {userLimits?.pagesPerMonth - (userUsage?.pages_used || 0) <= 0 ? (
                  <span style={{ color: '#ef4444' }}>
                    You've reached your monthly page limit. Upgrade your plan or purchase additional pages.
                  </span>
                ) : userUsage?.pages_used > userLimits?.pagesPerMonth * 0.9 ? (
                  <span style={{ color: '#f59e0b' }}>
                    You're approaching your monthly page limit. Consider upgrading soon.
                  </span>
                ) : (
                  <span>
                    {userLimits?.pagesPerMonth - (userUsage?.pages_used || 0)} pages remaining this month.
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Page limit modal */}
      <PageLimitExceededModal
        isOpen={showPageLimitModal}
        onClose={() => setShowPageLimitModal(false)}
        currentUser={currentUser}
        remainingPages={pageModalData.remainingPages}
        pagesRequested={pageModalData.pagesRequested}
        onPurchaseComplete={handlePurchaseComplete}
      />
    </div>
  );
};

export default UnderwritePage;