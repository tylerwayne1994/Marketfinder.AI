import React, { useState, useEffect } from 'react';
import ErrorBoundary from './ErrorBoundary';
import HomePage from './HomePage';
import { ThemeProvider } from './HomePage';
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
import SignupPage from './SignupPage';
import DashboardPage from './DashboardPage';
import { supabase } from './lib/supabase';

const backendUrl = process.env.REACT_APP_BACKEND_URL;

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [propertyData, setPropertyData] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [underwritingResult, setUnderwritingResult] = useState(null);
  const [viewingProperty, setViewingProperty] = useState(null);
  const [documentData, setDocumentData] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(null);

  // Authentication state management with timeout and error handling
  useEffect(() => {
    let isMounted = true;
    let timeoutId = null;

    const getSessionWithTimeout = async () => {
      try {
        console.log('🔍 Starting auth check...');
        setIsLoading(true);
        setLoadingError(null);

        // Set a timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          if (isMounted) {
            console.error('⏰ Auth timeout - forcing fallback');
            setLoadingError('Authentication timeout. Please refresh the page.');
            setIsLoading(false);
            setIsAuthenticated(false);
            setCurrentUser(null);
            setCurrentPage('landing');
          }
        }, 10000); // 10 second timeout

        // Get session with explicit error handling
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (!isMounted) return;

        if (sessionError) {
          console.error('❌ Session error:', sessionError);
          throw new Error(`Session error: ${sessionError.message}`);
        }

        if (session?.user) {
          console.log('✅ Valid session found, fetching profile...');
          
          // Get user profile with timeout
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (!isMounted) return;

          if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
            console.error('❌ Profile error:', profileError);
            // Don't fail completely if profile fetch fails - continue with basic user data
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
            subscriptionStatus: profile?.subscription_status || 'inactive'
          };

          console.log('✅ User data loaded successfully');
          setCurrentUser(userData);
          setIsAuthenticated(true);
        } else {
          console.log('ℹ️ No active session found');
          setIsAuthenticated(false);
          setCurrentUser(null);
          setCurrentPage('landing');
        }

        // Clear timeout since we completed successfully
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }

      } catch (error) {
        if (!isMounted) return;

        console.error('❌ Auth check failed:', error);
        setLoadingError(`Authentication failed: ${error.message}`);
        setIsAuthenticated(false);
        setCurrentUser(null);
        setCurrentPage('landing');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      }
    };

    getSessionWithTimeout();

    // Listen for auth changes with error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        console.log('🔄 Auth state changed:', event);

        try {
          if (event === 'SIGNED_IN' && session) {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profileError && profileError.code !== 'PGRST116') {
              console.error('❌ Profile error on sign in:', profileError);
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
              subscriptionStatus: profile?.subscription_status || 'inactive'
            };

            setCurrentUser(userData);
            setIsAuthenticated(true);
          } else if (event === 'SIGNED_OUT') {
            console.log('🚪 User signed out');
            setIsAuthenticated(false);
            setCurrentUser(null);
            setCurrentPage('landing');
            
            // Clear any cached data
            setPropertyData(null);
            setUploadedFile(null);
            setExtractedData(null);
            setUnderwritingResult(null);
            setDocumentData(null);
          }
        } catch (error) {
          console.error('❌ Auth state change error:', error);
          setIsAuthenticated(false);
          setCurrentUser(null);
          setCurrentPage('landing');
        }
      }
    );

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up auth effect');
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array is correct here

  const handlePageChange = (page, data = null) => {
    console.log(`🔄 App.js: Navigating to "${page}"`, data ? 'with data' : 'without data');
    if (data) {
      if (data.extracted) setExtractedData(data.extracted);
      if (data.underwriting) setUnderwritingResult(data.underwriting);
      if (data.document) setDocumentData(data.document);
      if (data.property) setPropertyData(data.property);
    }
    if (page) setCurrentPage(page);
  };

  const handleFileUpload = (file) => {
    setUploadedFile(file);
    if (file) {
      console.log('File uploaded:', file.name, file.type, file.size);
    } else {
      console.log('File cleared');
      setExtractedData(null);
      setUnderwritingResult(null);
    }
  };

  const handleLogout = async () => {
    try {
      console.log('🚪 Initiating logout...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      } else {
        console.log('✅ Logout successful');
        setIsAuthenticated(false);
        setCurrentUser(null);
        setCurrentPage('landing');
        
        // Clear all app state
        setPropertyData(null);
        setUploadedFile(null);
        setExtractedData(null);
        setUnderwritingResult(null);
        setDocumentData(null);
      }
    } catch (error) {
      console.error('❌ Logout failed:', error);
      // Force logout even if API call fails
      setIsAuthenticated(false);
      setCurrentUser(null);
      setCurrentPage('landing');
    }
  };

  // Show loading screen with better error handling
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
          }}></div>
          <p style={{ color: '#666666', fontSize: '1rem' }}>Loading Terra.Ai...</p>
          
          {loadingError && (
            <div style={{ 
              marginTop: '24px', 
              padding: '16px', 
              backgroundColor: '#fef2f2', 
              border: '1px solid #ef4444',
              borderRadius: '8px',
              maxWidth: '400px',
              margin: '24px auto 0'
            }}>
              <p style={{ color: '#ef4444', marginBottom: '16px', fontSize: '0.875rem' }}>
                {loadingError}
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  onClick={() => window.location.reload()}
                  style={{ 
                    padding: '8px 16px', 
                    backgroundColor: '#ef4444', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '6px', 
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}
                >
                  Refresh Page
                </button>
                <button
                  onClick={() => {
                    // Clear all storage and reload
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.reload();
                  }}
                  style={{ 
                    padding: '8px 16px', 
                    backgroundColor: '#666666', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '6px', 
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}
                >
                  Clear Data & Reload
                </button>
              </div>
            </div>
          )}
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
      console.log(`🎯 Rendering page: ${currentPage}`);
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
          return (
            <SignupPage 
              setCurrentPage={handlePageChange}
            />
          );
        case 'dashboard':
          return (
            <DashboardPage 
              setCurrentPage={handlePageChange} 
              currentUser={currentUser}
              onLogout={handleLogout}
            />
          );
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
          console.error(`❌ Unknown page: ${currentPage}`);
          return <LandingPage setCurrentPage={handlePageChange} />;
      }
    } catch (err) {
      console.error("❌ renderPage() failed:", err);
      return (
        <div style={{ color: 'red', padding: '20px', backgroundColor: 'white', minHeight: '100vh' }}>
          Error: {err.message}
          <button onClick={() => handlePageChange('landing')} style={{ marginLeft: '20px', padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Back to Landing</button>
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