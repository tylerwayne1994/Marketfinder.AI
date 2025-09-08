import React, { useState } from 'react';
import { Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { supabase } from './lib/supabase';

const LoginPage = ({ setCurrentPage, setIsAuthenticated, setCurrentUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Terra.Ai Logo Component
  const TerraLogo = () => (
    <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" stroke="black" strokeWidth="5" fill="none"/>
      <circle cx="50" cy="50" r="15" fill="none" stroke="black" strokeWidth="3"/>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const radian = (angle * Math.PI) / 180;
        const isCardinal = angle % 90 === 0;
        const length = isCardinal ? 38 : 35;
        const innerRadius = 20;
        const outerRadius = length;
        
        const x1 = 50 + innerRadius * Math.cos(radian - 0.15);
        const y1 = 50 + innerRadius * Math.sin(radian - 0.15);
        const x2 = 50 + outerRadius * Math.cos(radian);
        const y2 = 50 + outerRadius * Math.sin(radian);
        const x3 = 50 + innerRadius * Math.cos(radian + 0.15);
        const y3 = 50 + innerRadius * Math.sin(radian + 0.15);
        
        return (
          <g key={i}>
            <path
              d={`M 50 50 L ${x1} ${y1} Q ${50 + (outerRadius-5) * Math.cos(radian - 0.08)} ${50 + (outerRadius-5) * Math.sin(radian - 0.08)}, ${x2} ${y2} Q ${50 + (outerRadius-5) * Math.cos(radian + 0.08)} ${50 + (outerRadius-5) * Math.sin(radian + 0.08)}, ${x3} ${y3} Z`}
              fill="black"
            />
            {isCardinal && (
              <line 
                x1={50 + 22 * Math.cos(radian)} 
                y1={50 + 22 * Math.sin(radian)} 
                x2={50 + 30 * Math.cos(radian)} 
                y2={50 + 30 * Math.sin(radian)} 
                stroke="white" 
                strokeWidth="2"
              />
            )}
          </g>
        );
      })}
    </svg>
  );

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
        email: email,
        password: password
      });

      if (error) {
        setError(error.message);
      } else if (data.user) {
        // Get user profile from database
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        const userData = {
          id: data.user.id,
          email: data.user.email,
          firstName: profile?.first_name || data.user.user_metadata?.firstName || 'User',
          lastName: profile?.last_name || data.user.user_metadata?.lastName || '',
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
        setCurrentPage('dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      backgroundColor: 'white',
      overflow: 'hidden'
    }}>
      {/* Left Side - Login Form */}
      <div style={{
        flex: '0 0 60%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white',
        position: 'relative'
      }}>
        {/* Logo Header */}
        <div style={{
          position: 'absolute',
          top: '40px',
          left: '40px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 10
        }}>
          <TerraLogo />
          <span style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#000000'
          }}>
            Terra.Ai
          </span>
        </div>

        {/* Login Form Container */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '400px'
          }}>
            <div style={{
              marginBottom: '48px'
            }}>
              <h1 style={{
                fontSize: '2.5rem',
                fontWeight: '800',
                color: '#000000',
                marginBottom: '12px'
              }}>
                Welcome back
              </h1>
              <p style={{
                fontSize: '1.125rem',
                color: '#666666',
                lineHeight: '1.5'
              }}>
                Enter your email and password to access your Terra.Ai dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#333333',
                  marginBottom: '8px'
                }}>
                  Email Address
                </label>
                <div style={{
                  position: 'relative'
                }}>
                  <Mail 
                    size={20} 
                    style={{ 
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#999999'
                    }}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="name@company.com"
                    required
                    style={{
                      width: '100%',
                      padding: '14px 14px 14px 46px',
                      border: error ? '2px solid #ef4444' : '2px solid #e5e5e5',
                      borderRadius: '10px',
                      fontSize: '1rem',
                      transition: 'all 0.2s ease',
                      outline: 'none',
                      backgroundColor: 'white'
                    }}
                    onFocus={(e) => {
                      if (!error) e.target.style.borderColor = '#000000';
                    }}
                    onBlur={(e) => {
                      if (!error) e.target.style.borderColor = '#e5e5e5';
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#333333',
                  marginBottom: '8px'
                }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Enter your password"
                  required
                  style={{
                    width: '100%',
                    padding: '14px',
                    border: error ? '2px solid #ef4444' : '2px solid #e5e5e5',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                    backgroundColor: 'white'
                  }}
                  onFocus={(e) => {
                    if (!error) e.target.style.borderColor = '#000000';
                  }}
                  onBlur={(e) => {
                    if (!error) e.target.style.borderColor = '#e5e5e5';
                  }}
                />
                {error && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginTop: '8px',
                    color: '#ef4444',
                    fontSize: '0.875rem'
                  }}>
                    <AlertCircle size={14} />
                    {error}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '16px',
                  backgroundColor: isLoading ? '#666666' : '#000000',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: isLoading ? 'wait' : 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = '#333333';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = '#000000';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
                {!isLoading && <ArrowRight size={18} />}
              </button>
            </form>

            <div style={{
              marginTop: '32px',
              paddingTop: '32px',
              borderTop: '1px solid #e5e5e5',
              textAlign: 'center'
            }}>
              <p style={{
                fontSize: '0.875rem',
                color: '#666666'
              }}>
                Don't have an account?{' '}
                <button
                  onClick={() => setCurrentPage('signup')}
                  style={{
                    color: '#000000',
                    fontWeight: '600',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    background: 'none',
                    border: 'none',
                    fontSize: '0.875rem'
                  }}
                >
                  Sign up
                </button>
              </p>
            </div>

            {/* Additional Links */}
            <div style={{
              marginTop: '48px',
              display: 'flex',
              justifyContent: 'center',
              gap: '24px'
            }}>
              <button
                style={{
                  color: '#999999',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  textDecoration: 'underline'
                }}
              >
                Privacy Policy
              </button>
              <button
                style={{
                  color: '#999999',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  textDecoration: 'underline'
                }}
              >
                Terms of Service
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Image */}
      <div style={{
        flex: '0 0 40%',
        position: 'relative',
        backgroundColor: '#f8f8f8'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url("/IMG_0108.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}>
          {/* Overlay gradient */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.4) 100%)'
          }} />
          
          {/* Text overlay */}
          <div style={{
            position: 'absolute',
            bottom: '40px',
            left: '40px',
            right: '40px',
            color: 'white'
          }}>
            <h2 style={{
              fontSize: '1.75rem',
              fontWeight: '700',
              marginBottom: '12px',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              AI-Powered Real Estate
            </h2>
            <p style={{
              fontSize: '1rem',
              lineHeight: '1.5',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              Analyze multifamily properties instantly with cutting-edge artificial intelligence
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;