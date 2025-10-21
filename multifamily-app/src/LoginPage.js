import React, { useState } from 'react';
import { supabase } from './lib/supabase';
import propertyImage from './IMG_0108 (4).jpg';

const LoginPage = ({ setCurrentPage, setIsAuthenticated, setCurrentUser }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      console.log('Attempting login with:', formData.email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        console.error('Login error:', error.message);
        setError(error.message);
        return;
      }

      console.log('Login successful:', data);
      
      // Simplify the login process - focus on successful auth without profile fetch
      // which might be causing issues if profiles table is not set up correctly
      const userData = {
        id: data.user.id,
        email: data.user.email,
        firstName: data.user.user_metadata?.firstName || 'User',
        lastName: data.user.user_metadata?.lastName || '',
        // Default values for other properties
        company: '',
        phone: '',
        investorType: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        subscriptionStatus: 'inactive',
      };

      // Save auth state and user data to localStorage
      localStorage.setItem('terra_auth_state', 'true');
      localStorage.setItem('terra_user_data', JSON.stringify(userData));

      console.log('Setting auth state and user data...');
      
      // Update state synchronously
      console.log('Applying auth state changes...');
      setIsAuthenticated(true);
      setCurrentUser(userData);
      
      // Check if user just completed Stripe payment
      const paymentComplete = localStorage.getItem('stripe_payment_complete');
      const redirectTo = localStorage.getItem('stripe_redirect_to');
      
      if (paymentComplete === 'true' && redirectTo) {
        console.log('Payment was completed, redirecting to:', redirectTo);
        localStorage.removeItem('stripe_payment_complete');
        localStorage.removeItem('stripe_redirect_to');
        setCurrentPage(redirectTo);
      } else {
        console.log('Navigating to dashboard...');
        setCurrentPage('dashboard');
      }
    } catch (err) {
      console.error('Unexpected login error:', err);
      setError(err?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const TerraLogo = () => (
    <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" stroke="black" strokeWidth="5" fill="none"/>
      <circle cx="50" cy="50" r="15" fill="none" stroke="black" strokeWidth="3"/>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const isCardinal = angle % 90 === 0;
        const length = isCardinal ? 38 : 35;
        const x1 = 50 + 20 * Math.cos(rad - 0.15);
        const y1 = 50 + 20 * Math.sin(rad - 0.15);
        const x2 = 50 + length * Math.cos(rad);
        const y2 = 50 + length * Math.sin(rad);
        const x3 = 50 + 20 * Math.cos(rad + 0.15);
        const y3 = 50 + 20 * Math.sin(rad + 0.15);
        return (
          <path
            key={i}
            d={`M 50 50 L ${x1} ${y1} Q ${50 + (length-5) * Math.cos(rad - 0.08)} ${50 + (length-5) * Math.sin(rad - 0.08)}, ${x2} ${y2} Q ${50 + (length-5) * Math.cos(rad + 0.08)} ${50 + (length-5) * Math.sin(rad + 0.08)}, ${x3} ${y3} Z`}
            stroke="black"
            fill="none"
            strokeWidth={isCardinal ? 2.5 : 1.5}
          />
        );
      })}
    </svg>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', backgroundColor: '#f6f6f6' }}>
      {/* LEFT — 35%: Login form */}
      <div style={{ flex: 35, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: '450px' }}>
          <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <TerraLogo />
              <h1 style={{ marginLeft: '1rem', fontSize: '2rem', fontWeight: '700' }}>
                MarketFinder.AI
              </h1>
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem' }}>
              Log in to your account
            </h2>
            <p style={{ color: '#666', fontSize: '1rem' }}>
              Welcome back! Please enter your credentials to continue.
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: '6px',
                  color: '#333333',
                }}
              >
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: errors.email ? '2px solid #ef4444' : '1px solid #e5e5e5',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              />
              {errors.email && (
                <span
                  style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}
                >
                  {errors.email}
                </span>
              )}
            </div>

            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: '6px',
                  color: '#333333',
                }}
              >
                Password *
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px 40px 10px 12px',
                  border: errors.password ? '2px solid #ef4444' : '1px solid #e5e5e5',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '32px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: '#666666',
                }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
              {errors.password && (
                <span
                  style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}
                >
                  {errors.password}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'space-between' }}>
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  flex: 1,
                  backgroundColor: '#000000',
                  color: 'white',
                  padding: '14px 32px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: isLoading ? 0.6 : 1,
                }}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </div>

            {error && (
              <div className="error" style={{ marginTop: '16px', textAlign: 'center', color: '#c00' }}>
                {error}
              </div>
            )}
          </form>
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => setCurrentPage('forgot-password')}
              style={{
                background: 'none',
                border: 'none',
                color: '#1a73e8',
                cursor: 'pointer',
                fontWeight: '500',
                padding: 0,
                textDecoration: 'underline',
                marginBottom: '1rem',
              }}
            >
              Forgot Password?
            </button>
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setCurrentPage('signup')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#1a73e8',
                  cursor: 'pointer',
                  fontWeight: '500',
                  padding: 0,
                  textDecoration: 'underline',
                }}
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
      {/* RIGHT — 65%: Image */}
      <div
        className="login-right-image"
        style={{
          flex: 65,
          position: 'relative',
          minHeight: '100vh',
          overflow: 'hidden',
        }}
      >
        <img
          src={propertyImage}
          alt="Property"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>
      {/* Simple responsive rule: hide right image on narrow screens */}
      <style>{`
        @media (max-width: 900px) {
          .login-right-image { display: none; }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;