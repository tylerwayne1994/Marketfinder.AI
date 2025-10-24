import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

const ResetPasswordPage = ({ setCurrentPage }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  // Debug helpers to surface current URL and Supabase session-from-url result
  const [debugUrl, setDebugUrl] = useState('');
  const [sessionDebug, setSessionDebug] = useState(null);

  useEffect(() => {
    (async () => {
      const current = window.location.href;
      setDebugUrl(current);
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) setSessionDebug({ ok: false, error: error.message, data: null });
        else if (data?.session) setSessionDebug({ ok: true, data: { user: data.session.user }, error: null });
        else setSessionDebug({ ok: false, error: "no session", data: null });
      } catch (err) {
        setSessionDebug({ ok: false, error: err?.message || String(err), data: null });
      }
    })();
  }, []);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      
      setSuccess(true);
      setTimeout(() => {
        setCurrentPage('login');
      }, 2000);
    } catch (err) {
      setError(err?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8f8f8'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '32px',
        borderRadius: '12px',
        maxWidth: '400px',
        width: '90%',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '24px', textAlign: 'center' }}>
          Reset Your Password
        </h2>
        
        {success ? (
          <div style={{
            padding: '16px',
            backgroundColor: '#f0fdf4',
            border: '1px solid #10b981',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <p style={{ color: '#065f46', margin: 0 }}>
              Password reset successfully! Redirecting to login...
            </p>
          </div>
        ) : (
          <div style={{ marginBottom: '12px', fontSize: '0.75rem', color: '#6b7280' }}>
            <div><strong>Debug URL:</strong> {debugUrl || '—'}</div>
            <div><strong>Session Debug:</strong> {sessionDebug ? JSON.stringify(sessionDebug) : ' — '}</div>
          </div>
        )}
        {!success && (
          <form onSubmit={handleResetPassword}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '8px' }}>
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  fontSize: '0.875rem'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '8px' }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  fontSize: '0.875rem'
                }}
              />
            </div>
            
            {error && (
              <div style={{
                padding: '12px',
                backgroundColor: '#fef2f2',
                border: '1px solid #ef4444',
                borderRadius: '8px',
                marginBottom: '16px'
              }}>
                <p style={{ color: '#991b1b', margin: 0, fontSize: '0.875rem' }}>{error}</p>
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: loading ? '#94a3b8' : '#000000',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
