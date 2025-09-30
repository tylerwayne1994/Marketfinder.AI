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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      // data.user is set when sign-in succeeds
      if (data?.user) {
        // Let App own the global auth state (matches your App.js)
        setIsAuthenticated?.(true);
        setCurrentUser?.(data.user);
        setCurrentPage?.('dashboard');
      } else {
        setError('Login failed. No user returned.');
      }
    } catch (err) {
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
            fill="black"
          />
        );
      })}
    </svg>
  );

  return (
    <div className="login-bg">
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
        display: 'flex'
      }}>
        {/* Left content - 75% */}
        <div style={{
          width: '75%',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            padding: '32px',
            borderBottom: '1px solid #e5e5e5',
            display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <TerraLogo />
            <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#000000', margin: 0 }}>
              Welcome Back
            </h1>
          </div>

          <button
            onClick={() => setCurrentPage('landing')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              backgroundColor: 'transparent',
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              cursor: 'pointer',
              color: '#666666',
              fontSize: '0.875rem',
              transition: 'all 0.2s ease'
            }}
          >
            Back
          </button>
        </div>

        <div style={{ padding: '32px' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '6px',
                color: '#333333'
              }}>
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
                  outline: 'none'
                }}
              />
              {errors.email && (
                <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                  {errors.email}
                </span>
              )}
            </div>

            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '6px',
                color: '#333333'
              }}>
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
                  outline: 'none'
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
                  color: '#666666'
                }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
              {errors.password && (
                <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
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
                  opacity: isLoading ? 0.6 : 1
                }}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </div>

            {error && <div className="error" style={{ marginTop: '16px', textAlign: 'center', color: '#c00' }}>{error}</div>}
          </form>

          <div style={{
            textAlign: 'center',
            marginTop: '24px',
            paddingTop: '24px',
            borderTop: '1px solid #e5e5e5'
          }}>
            <span style={{ fontSize: '0.875rem', color: '#666666' }}>
              Don't have an account?{' '}
              <button
                onClick={() => setCurrentPage('signup')}
                style={{
                  color: '#000000',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  fontSize: '0.875rem'
                }}
              >
                Sign up here
              </button>
            </span>
          </div>
        </div>
        
        {/* Right section - 25% width with the image */}
        <div style={{
          width: '25%',
          position: 'relative',
          overflow: 'hidden',
          borderTopRightRadius: '12px',
          borderBottomRightRadius: '12px'
        }}>
          <img 
            src={propertyImage}
            alt="Property visual" 
            style={{
              position: 'absolute',
              right: '0',
              height: '100%',
              width: 'auto',
              objectFit: 'cover',
              objectPosition: 'center right'
            }}
          />
        </div>
      </div>

      <style jsx>{`
        .login-bg {
          min-height: 100vh;
          width: 100vw;
          background: url('./modern-house.jpg') center center/cover no-repeat;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
