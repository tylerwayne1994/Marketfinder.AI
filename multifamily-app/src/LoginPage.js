import React, { useState } from 'react';
import { supabase } from './lib/supabase';

const LoginPage = ({ setCurrentPage, setIsAuthenticated, setCurrentUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) {
        setError(error.message);
      } else if (data.user) {
        setIsAuthenticated(true);
        setCurrentUser(data.user);
        setCurrentPage('dashboard');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#fff' }}>
      <h1>Login</h1>
      <form onSubmit={handleSubmit} style={{ width: 300, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <button type="submit" disabled={isLoading}>{isLoading ? 'Logging in...' : 'Login'}</button>
      </form>
      <div style={{ marginTop: 16 }}>
        <span>Don't have an account? </span>
        <button onClick={() => setCurrentPage('signup')}>Sign up</button>
      </div>
    </div>
  );
};

export default LoginPage;