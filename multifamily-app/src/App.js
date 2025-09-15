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

// DEBUG: Show backend URL at top of page for deployment troubleshooting
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

  // Authentication state management
  useEffect(() => {
    // Check current auth session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Get user profile from database
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
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
        setIsLoading(false);
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
        setCurrentPage('landing');
        setIsLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Get user profile from database
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

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
          setIsAuthenticated(false);
          setCurrentUser(null);
          setCurrentPage('landing');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

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
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
    } else {
      setIsAuthenticated(false);
      setCurrentUser(null);
      setCurrentPage('landing');
    }
  };

  // Error state for loading/auth
  // (removed duplicate loadingError declaration)

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
            <>
              <p style={{ color: 'red', marginTop: 16 }}>{loadingError}</p>
              <button
                onClick={async () => {
                  setIsLoading(true);
                  setLoadingError(null);
                  try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session) {
                      const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();
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
                    } else {
                      setLoadingError('No active session. Please log in.');
                      setIsAuthenticated(false);
                      setCurrentUser(null);
                      setCurrentPage('landing');
                    }
                  } catch (err) {
                    setLoadingError('Error loading authentication. Please try again.');
                  }
                  setIsLoading(false);
                }}
                style={{ marginTop: 20, padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
              >
                Retry
              </button>
            </>
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
  // removed extra closing brace
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

  // DEBUG: Show backend URL visibly
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