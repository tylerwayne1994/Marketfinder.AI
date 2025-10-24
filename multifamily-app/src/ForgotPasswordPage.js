import React, { useState } from 'react';
import { supabase } from './lib/supabase';

const ForgotPasswordPage = ({ setCurrentPage }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);
    try {
      const redirectTo = `${window.location.origin}/reset-password`;
      console.log('Sending reset email, redirectTo=', redirectTo);
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      console.log('resetPasswordForEmail response:', { data, error });
      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      console.error('Failed to send reset email:', err);
      setError(err?.message || 'Failed to send password reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f6f6f6' }}>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px' }}>
  <h2 style={{ marginBottom: '1rem' }}>Send Password Reset Link</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Email Address</label>
          <input type="email" id="email" name="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '0.25rem', fontSize: '1rem', marginBottom: '1rem' }} />
          <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '0.75rem', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '0.25rem', fontSize: '1rem', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1 }}>
            {isLoading ? 'Sending...' : 'Send Password Reset Email'}
          </button>
        </form>
        {error && <p style={{ color: '#dc3545', marginTop: '1rem' }}>{error}</p>}
        {success && <p style={{ color: '#155724', marginTop: '1rem' }}>Password reset email sent! Check your inbox.</p>}
        <button onClick={() => setCurrentPage('login')} style={{ marginTop: '1.5rem', background: 'none', border: 'none', color: '#1a73e8', cursor: 'pointer', fontWeight: '500', textDecoration: 'underline' }}>Back to Login</button>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
