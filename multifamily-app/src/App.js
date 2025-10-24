import React, { useState, useEffect } from 'react';
import ErrorBoundary from './ErrorBoundary';
import HomePage, { ThemeProvider } from './HomePage';
import CountyChoroplethMap from './MarketHeatMap';
import CensusMapViewer from './CensusMapViewer';
import MarketHighlightsPage from './markethighlightspage';
import MarketAnalysisPage from './MarketAnalysisPage';
import LandingPage from './LandingPage';
import UnderwritePage from './UnderwritePage';
import UploadPage from './UploadPage';
import ManualUnderwritePage from './ManualUnderwritePage';
import DocumentGenerator from './DocumentGenerator';
import PropertyScrapePage from './PropertyScrapePage';
import PFA from './PFA';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage'; // <-- ensure file/path matches
import DashboardPage from './DashboardPage';
import CheckoutReturnPage from './CheckoutReturnPage';
import { supabase } from './lib/supabase';
import ForgotPasswordPage from './ForgotPasswordPage'; // Import ForgotPasswordPage
import ResetPasswordPage from './ResetPasswordPage'; // Import ResetPasswordPage

// Local storage keys
const AUTH_STATE_KEY = 'terra_auth_state';
const USER_DATA_KEY = 'terra_user_data';
const RECOVERY_LOCK_KEY = 'terra_recovery_lock';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [propertyData, setPropertyData] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [underwritingResult, setUnderwritingResult] = useState(null);
  const [documentData, setDocumentData] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // URL-based routing (path/hash/query param)
  useEffect(() => {
    const url = new URL(window.location.href);
    const search = new URLSearchParams(url.search);
    const hashStr = window.location.hash || "";
    const hash = new URLSearchParams(hashStr.startsWith("#") ? hashStr.slice(1) : hashStr);

    const tryInstallRecoverySession = async () => {
      const type = (hash.get("type") || search.get("type") || "").toLowerCase();
      const access_token = hash.get("access_token") || search.get("access_token");
      const refresh_token = hash.get("refresh_token") || search.get("refresh_token");

      if (type === "recovery" && access_token && refresh_token) {
        try {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token });
          if (error) console.warn("setSession (recovery) error:", error.message);
          else console.log("Recovery session installed");
        } catch (e) {
          console.warn("setSession (recovery) threw:", e?.message || e);
        }
        // clean the URL but keep the path
        window.history.replaceState({}, document.title, "/reset-password");
      }
    };

    (async () => {
      // 1) Handle recovery tokens
      const hasRecovery =
        (search.get("type") === "recovery" || search.get("access_token")) ||
        (hash.get("type")?.toLowerCase() === "recovery" || hash.get("access_token"));

      if (hasRecovery) {
        console.log("Detected recovery tokens");
        await tryInstallRecoverySession();
        setCurrentPage("reset-password");
        return;
      }

      // 2) If user deep-linked /refresh to /reset-password without tokens, still show reset UI
      if (window.location.pathname === "/reset-password") {
        setCurrentPage("reset-password");
        return;
      }

      // --- keep your existing Stripe/dashboard/page logic below unchanged ---
      const urlParams = new URLSearchParams(window.location.search);

      // Always show landing page on fresh visit to root URL
      if (window.location.pathname === '/' && !window.location.search && !window.location.hash) {
        localStorage.removeItem('terra_last_page');
        setCurrentPage('landing');
        return;
      }

      if (urlParams.get('subscription') === 'success') {
        // Check if user is authenticated
        const savedAuthState = localStorage.getItem(AUTH_STATE_KEY);
        const savedUserData = localStorage.getItem(USER_DATA_KEY);

        const recoveryLocked = localStorage.getItem(RECOVERY_LOCK_KEY) === '1';
        if (recoveryLocked) {
          console.log('Recovery lock: skipping saved-auth redirects');
          setCurrentPage('reset-password');
          setIsLoading(false);
          return;
        }

        if (savedAuthState === 'true' && savedUserData) {
          // User is logged in - redirect to appropriate page
          try {
            const userData = JSON.parse(savedUserData);
            setCurrentUser(userData);
            setIsAuthenticated(true);

            const redirectTo = urlParams.get('redirect');
            if (redirectTo === 'underwrite') {
              console.log('Detected 60 page pack purchase, redirecting to underwrite');
              setCurrentPage('underwrite');
              localStorage.setItem('terra_last_page', 'underwrite');
            } else {
              // Monthly subscription - go to dashboard
              console.log('Detected monthly subscription, redirecting to dashboard');
              setCurrentPage('dashboard');
              localStorage.setItem('terra_last_page', 'dashboard');
            }
          } catch (e) {
            console.error('Error parsing user data:', e);
            setCurrentPage('login');
          }
        } else {
          // User not logged in - save redirect intent and go to login
          const redirectTo = urlParams.get('redirect');
          localStorage.setItem('stripe_payment_complete', 'true');
          localStorage.setItem('stripe_redirect_to', redirectTo || 'dashboard');
          console.log('Payment complete but user not logged in - redirecting to login');
          setCurrentPage('login');
        }

        // Clean up URL
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
        return;
      }

      // direct path
      if (window.location.pathname === '/dashboard') {
        setCurrentPage('dashboard');
        localStorage.setItem('terra_last_page', 'dashboard');
        return;
      }
      // hash
      if (window.location.hash) {
        const hashPath = window.location.hash.substring(1);
        if (hashPath === '/dashboard') {
          setCurrentPage('dashboard');
          localStorage.setItem('terra_last_page', 'dashboard');
          return;
        }
      }
      // query ?page=
      const pageParam = urlParams.get('page');
      if (pageParam) {
        setCurrentPage(pageParam);
        localStorage.setItem('terra_last_page', pageParam);
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
        return;
      }
      // Restore last visited page if available
      const lastPage = localStorage.getItem('terra_last_page');
      if (lastPage) {
        setCurrentPage(lastPage);
      }
    })();
  }, []);

  // Restore saved state if Supabase session is still valid
  useEffect(() => {
    const checkSavedAuthState = async () => {
      try {
        console.log("Starting auth state check...");
        const savedAuthState = localStorage.getItem(AUTH_STATE_KEY);
        const savedUserData = localStorage.getItem(USER_DATA_KEY);

        // Force exit loading state after 3 seconds as a failsafe
        setTimeout(() => {
          console.log("Failsafe timeout triggered");
          if (isLoading) {
            setIsLoading(false);
          }
        }, 3000);

        if (savedAuthState === 'true' && savedUserData) {
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              let userData;
              try {
                userData = JSON.parse(savedUserData);
              } catch (e) {
                console.log("Error parsing user data:", e);
                localStorage.removeItem(AUTH_STATE_KEY);
                localStorage.removeItem(USER_DATA_KEY);
                setCurrentPage('login');
                setIsLoading(false);
                return;
              }
              // Restore last visited page if available, otherwise dashboard
              const lastPage = localStorage.getItem('terra_last_page');
              setCurrentUser(userData);
              setIsAuthenticated(true);
              setCurrentPage(lastPage || 'dashboard');
            } else {
              // No valid Supabase session, force logout
              console.log("No user found in session, forcing logout");
              localStorage.removeItem(AUTH_STATE_KEY);
              localStorage.removeItem(USER_DATA_KEY);
              setCurrentUser(null);
              setIsAuthenticated(false);
              setCurrentPage('login');
            }
          } catch (error) {
            console.error('Error checking saved auth state:', error);
            localStorage.removeItem(AUTH_STATE_KEY);
            localStorage.removeItem(USER_DATA_KEY);
            setCurrentPage('landing');
          }
        } else {
          console.log("No saved auth state found");
          setCurrentPage('landing');
        }
      } catch (err) {
        console.error("Unexpected error in auth check:", err);
      } finally {
        console.log("Auth check complete, setting isLoading to false");
        setIsLoading(false);
      }
    };
    
    checkSavedAuthState();
  }, [isLoading]);

  // Single Supabase auth listener
  useEffect(() => {
    let isMounted = true;

    const handleAuthChange = async (_event, session) => {
      if (!isMounted) return;
      console.log('Auth event:', _event, session ? 'with session' : 'no session');

      // If we’re in recovery, force stay on reset-password
      const recoveryLocked = localStorage.getItem(RECOVERY_LOCK_KEY) === '1';
      if (recoveryLocked) {
        console.log('Recovery lock active — ignoring auth redirect:', _event);
        setIsLoading(false);
        setIsAuthenticated(!!session?.user);
        setCurrentPage('reset-password');
        return;
      }

      // Always make sure we're not stuck in loading state
      setIsLoading(false);
      
      // Special case for SIGNED_IN event - restore last page or go to dashboard if none
      if (_event === 'SIGNED_IN' && session?.user) {
        console.log('SIGNED_IN event detected - setting authenticated and redirecting');
        const savedUserData = localStorage.getItem(USER_DATA_KEY);
        if (savedUserData) {
          try {
            const userData = JSON.parse(savedUserData);
            setCurrentUser(userData);
            setIsAuthenticated(true);
            const lastPage = localStorage.getItem('terra_last_page');
            setCurrentPage(lastPage || 'dashboard');
            return;
          } catch (e) {
            console.error('Failed to parse saved user data:', e);
          }
        }
        // If no saved user data, fall through to general session handling below
      }
      
      try {
        if (session?.user) {
          console.log("Auth session detected - user authenticated");
          // Try to fetch profile (non-fatal if missing)
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (!isMounted) return;

          if (profileError && profileError.code !== 'PGRST116') {
            console.warn('Profile fetch failed:', profileError.message);
          }

          const userData = {
            id: session.user.id,
            email: session.user.email,
            firstName: profile?.first_name || session.user.user_metadata?.firstName || 'User',
            lastName: profile?.last_name || session.user.user_metadata?.lastName || '',
            company: profile?.company || '',
            phone: profile?.phone || '',
            investorType: profile?.investor_type || '',
            address: profile?.address || '',
            city: profile?.city || '',
            state: profile?.state || '',
            zipCode: profile?.zip_code || '',
            subscriptionStatus: profile?.subscription_status || 'inactive',
          };

          localStorage.setItem(AUTH_STATE_KEY, 'true');
          localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));

          setCurrentUser(userData);
          setIsAuthenticated(true);
          console.log('User authenticated successfully');
        } else {
          // Signed out / no session
          localStorage.removeItem(AUTH_STATE_KEY);
          localStorage.removeItem(USER_DATA_KEY);
          setCurrentUser(null);
          setIsAuthenticated(false);
          setCurrentPage('landing');

          // Clear cached page data
          setPropertyData(null);
          setUploadedFile(null);
          setExtractedData(null);
          setUnderwritingResult(null);
          setDocumentData(null);

          console.log('User not authenticated');
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('Auth handler error:', error);
        setCurrentUser(null);
        setIsAuthenticated(false);
        setCurrentPage('landing');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handlePageChange = (page, data = null) => {
    console.log(`Navigating to "${page}"`, data ? 'with data' : 'without data');
    if (data) {
      if (data.extracted) setExtractedData(data.extracted);
      if (data.underwriting) setUnderwritingResult(data.underwriting);
      if (data.document) setDocumentData(data.document);
      if (data.property) setPropertyData(data.property);
    }
    if (page) {
      setCurrentPage(page);
      localStorage.setItem('terra_last_page', page);
    }
  };

  const handleFileUpload = (file) => {
    setUploadedFile(file);
    if (!file) {
      console.log('File cleared');
      setExtractedData(null);
      setUnderwritingResult(null);
      return;
    }
    console.log('File uploaded:', file.name, file.type, file.size);
  };

  const handleLogout = async () => {
    try {
      console.log('Initiating logout...');
      const { error } = await supabase.auth.signOut();
      if (error) console.error('Logout error:', error);
      // State will be reset by onAuthStateChange
    } catch (error) {
      console.error('Logout failed:', error);
      setIsAuthenticated(false);
      setCurrentUser(null);
      setCurrentPage('landing');
    }
  };

  // Initial loading screen
  useEffect(() => {
    // Force exit loading state after 3 seconds as a global failsafe
    const timer = setTimeout(() => {
      console.log("Global failsafe timeout triggered");
      setIsLoading(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #000000',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#666666', fontSize: '1rem' }}>Loading Terra.Ai...</p>
          <button onClick={() => setIsLoading(false)} style={{ marginTop: '20px', padding: '8px 16px', backgroundColor: '#f0f0f0', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}>
            Click if stuck
          </button>
        </div>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  const renderPage = () => {
    try {
      console.log(`Rendering page: ${currentPage}`);
      switch (currentPage) {
        case 'landing':
          return <LandingPage setCurrentPage={handlePageChange} />;

        case 'login':
          return (
            <LoginPage
              setCurrentPage={handlePageChange}
              setIsAuthenticated={setIsAuthenticated}
              setCurrentUser={setCurrentUser}
            />
          );

        case 'signup':
          return <SignupPage setCurrentPage={handlePageChange} />;

        case 'dashboard':
          // Guard: if not authenticated, show login directly
          if (!isAuthenticated || !currentUser) {
            console.log("Not authenticated, showing login directly");
            return (
              <LoginPage
                setCurrentPage={handlePageChange}
                setIsAuthenticated={setIsAuthenticated}
                setCurrentUser={setCurrentUser}
              />
            );
          }
          console.log("Rendering dashboard with current user:", currentUser?.email);
          return (
            <DashboardPage
              setCurrentPage={handlePageChange}
              currentUser={currentUser}
              onLogout={handleLogout}
            />
          );

        case 'checkout-return':
          return <CheckoutReturnPage setCurrentPage={handlePageChange} />;

        case 'home':
          return (
            <HomePage
              setCurrentPage={handlePageChange}
              isAuthenticated={isAuthenticated}
              currentUser={currentUser}
              onLogout={handleLogout}
            />
          );

        case 'underwrite':
          return <UnderwritePage setCurrentPage={handlePageChange} />;

        case 'upload':
          return (
            <UploadPage
              setCurrentPage={handlePageChange}
              propertyData={propertyData}
              setPropertyData={setPropertyData}
              uploadedFile={uploadedFile}
              handleFileUpload={handleFileUpload}
              extractedData={extractedData}
              setExtractedData={setExtractedData}
              underwritingResult={underwritingResult}
              setUnderwritingResult={setUnderwritingResult}
            />
          );

        case 'manual':
          return (
            <ManualUnderwritePage
              setCurrentPage={handlePageChange}
              propertyData={propertyData}
              setPropertyData={setPropertyData}
              underwritingResult={underwritingResult}
              setUnderwritingResult={setUnderwritingResult}
            />
          );

        case 'pfa':
          return <PFA setCurrentPage={handlePageChange} />;

        case 'financing':
          return (
            <div style={{ padding: '48px', minHeight: '100vh', backgroundColor: 'white', color: 'black', textAlign: 'center' }}>
              <h1>Financing Options</h1>
              {underwritingResult && (
                <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '8px', textAlign: 'left' }}>
                  <h3>Based on your analysis:</h3>
                  <p><strong>Loan Amount:</strong> ${underwritingResult.loan_amount?.toLocaleString() || 'N/A'}</p>
                  <p><strong>Annual Debt Service:</strong> ${underwritingResult.annual_debt_service?.toLocaleString() || 'N/A'}</p>
                  <p><strong>Cash Flow:</strong> ${underwritingResult.annual_cashflow?.toLocaleString() || 'N/A'}</p>
                  <p><strong>Cash-on-Cash Return:</strong> {underwritingResult.cash_on_cash_pct?.toFixed(2) || 'N/A'}%</p>
                </div>
              )}
              <p>Detailed financing options and lender matching coming soon!</p>
              <div style={{ marginTop: '20px' }}>
                <button onClick={() => handlePageChange('upload')} style={{ marginRight: '10px', padding: '10px 20px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Back to Upload</button>
                <button onClick={() => handlePageChange('home')} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Back to Home</button>
              </div>
            </div>
          );

        case 'marketHeatMap':
        case 'heatMapSelector':
          return <CountyChoroplethMap setCurrentPage={handlePageChange} />;

        case 'censusMapViewer':
          return <CensusMapViewer setCurrentPage={handlePageChange} />;

        case 'marketHighlights':
          return <MarketHighlightsPage setCurrentPage={handlePageChange} />;

        case 'market-analysis':
          return <MarketAnalysisPage setCurrentPage={handlePageChange} />;

        case 'documentGenerator':
          return <DocumentGenerator setCurrentPage={handlePageChange} />;

        case 'propertyScrape':
        case 'propertyScraper':
          return <PropertyScrapePage setCurrentPage={handlePageChange} />;

        case 'settings':
          return (
            <div style={{ padding: '48px', minHeight: '100vh', backgroundColor: 'white', color: 'black', textAlign: 'center' }}>
              <h1>Settings</h1>
              <p>Customize your application preferences.</p>
              <button onClick={() => handlePageChange('home')} style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Back to Home</button>
            </div>
          );

        case 'forgot-password':
          return <ForgotPasswordPage setCurrentPage={handlePageChange} />;

        case 'reset-password':
          return <ResetPasswordPage setCurrentPage={handlePageChange} />;

        case 'docsigner':
          return (
            <div style={{ padding: '48px', minHeight: '100vh', backgroundColor: 'white', color: 'black', textAlign: 'center' }}>
              <h1>DocSigner</h1>
              <p>Electronic document signing platform coming soon!</p>
              {documentData && (
                <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f0f8ff', borderRadius: '8px' }}>
                  <h3>Document Ready for Signing:</h3>
                  <p><strong>Document:</strong> {documentData.documentTitle}</p>
                  <p><strong>Recipients:</strong> {documentData.recipients?.length || 0}</p>
                  <p><strong>Created:</strong> {documentData.createdAt ? new Date(documentData.createdAt).toLocaleDateString() : 'N/A'}</p>
                </div>
              )}
              <button onClick={() => handlePageChange('home')} style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Back to Home</button>
            </div>
          );

        default:
          console.error(`Unknown page: ${currentPage}`);
          return <LandingPage setCurrentPage={handlePageChange} />;
      }
    } catch (err) {
      console.error('renderPage() failed:', err);
      return (
        <div style={{ color: 'red', padding: '20px', backgroundColor: 'white', minHeight: '100vh' }}>
          Error: {err.message}
          <button onClick={() => handlePageChange('landing')} style={{ marginLeft: '20px', padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Back to Landing
          </button>
        </div>
      );
    }
  };

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <div className="App" style={{ backgroundColor: 'white', minHeight: '100vh', color: 'black' }}>
          {renderPage()}
        </div>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
