import React, { useEffect } from 'react';
import { supabase } from './lib/supabase';

function CheckoutReturnPage({ setCurrentPage }) {
  useEffect(() => {
    // Check if the user is authenticated
    const checkAuthAndRedirect = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // User is logged in, redirect to dashboard
        setCurrentPage('dashboard');
      } else {
        // User is not logged in, redirect to landing page
        setCurrentPage('landing');
      }
    };

    checkAuthAndRedirect();
  }, [setCurrentPage]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column' 
    }}>
      <h2>Redirecting you...</h2>
      <p>Please wait while we take you back to your dashboard.</p>
    </div>
  );
}

export default CheckoutReturnPage;