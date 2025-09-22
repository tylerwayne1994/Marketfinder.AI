import React, { useState } from 'react';
import { supabase } from './lib/supabase';

const SignUpPage = ({ setCurrentPage }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
   
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
   
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
   
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }
   
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
   
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            firstName: formData.firstName,
            lastName: formData.lastName,
          }
        }
      });
      if (error) {
        setErrors({ general: error.message });
      } else if (data.user) {
        setCurrentPage('dashboard');
      }
    } catch (err) {
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    }
  };

  const TerraLogo = () => (
    <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" stroke="black" strokeWidth="5" fill="none"/>
      <circle cx="50" cy="50" r="15" fill="none" stroke="black" strokeWidth="3"/>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const radian = (angle * Math.PI) / 180;
        const isCardinal = angle % 90 === 0;
        const length = isCardinal ? 38 : 35;
        const x1 = 50 + 20 * Math.cos(radian - 0.15);
        const y1 = 50 + 20 * Math.sin(radian - 0.15);
        const x2 = 50 + length * Math.cos(radian);
        const y2 = 50 + length * Math.sin(radian);
        const x3 = 50 + 20 * Math.cos(radian + 0.15);
        const y3 = 50 + 20 * Math.sin(radian + 0.15);
       
        return (
          <path
            key={i}
            d={`M 50 50 L ${x1} ${y1} Q ${50 + (length-5) * Math.cos(radian - 0.08)} ${50 + (length-5) * Math.sin(radian - 0.08)}, ${x2} ${y2} Q ${50 + (length-5) * Math.cos(radian + 0.08)} ${50 + (length-5) * Math.sin(radian + 0.08)}, ${x3} ${y3} Z`}
            fill="black"
          />
        );
      })}
    </svg>
  );

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f8f8',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '32px',
          borderBottom: '1px solid #e5e5e5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <TerraLogo />
            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: '700',
              color: '#000000',
              margin: 0
            }}>
              Create Your Terra.Ai Account
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
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f5f5f5';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            Back
          </button>
        </div>

        <div style={{ padding: '32px' }}>
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              marginBottom: '20px',
              color: '#000000'
            }}>
              Personal Information
            </h2>
           
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              marginBottom: '20px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: '6px',
                  color: '#333333'
                }}>
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: errors.firstName ? '2px solid #ef4444' : '1px solid #e5e5e5',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    transition: 'border-color 0.2s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    if (!errors.firstName) e.target.style.borderColor = '#000000';
                  }}
                  onBlur={(e) => {
                    if (!errors.firstName) e.target.style.borderColor = '#e5e5e5';
                  }}
                />
                {errors.firstName && (
                  <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                    {errors.firstName}
                  </span>
                )}
              </div>
             
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: '6px',
                  color: '#333333'
                }}>
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: errors.lastName ? '2px solid #ef4444' : '1px solid #e5e5e5',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    transition: 'border-color 0.2s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    if (!errors.lastName) e.target.style.borderColor = '#000000';
                  }}
                  onBlur={(e) => {
                    if (!errors.lastName) e.target.style.borderColor = '#e5e5e5';
                  }}
                />
                {errors.lastName && (
                  <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                    {errors.lastName}
                  </span>
                )}
              </div>
            </div>

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
                  transition: 'border-color 0.2s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  if (!errors.email) e.target.style.borderColor = '#000000';
                }}
                onBlur={(e) => {
                  if (!errors.email) e.target.style.borderColor = '#e5e5e5';
                }}
              />
              {errors.email && (
                <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                  {errors.email}
                </span>
              )}
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              marginBottom: '20px'
            }}>
              <div style={{ position: 'relative' }}>
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
                    transition: 'border-color 0.2s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    if (!errors.password) e.target.style.borderColor = '#000000';
                  }}
                  onBlur={(e) => {
                    if (!errors.password) e.target.style.borderColor = '#e5e5e5';
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
             
              <div style={{ position: 'relative' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: '6px',
                  color: '#333333'
                }}>
                  Confirm Password *
                </label>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px 40px 10px 12px',
                    border: errors.confirmPassword ? '2px solid #ef4444' : '1px solid #e5e5e5',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    transition: 'border-color 0.2s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    if (!errors.confirmPassword) e.target.style.borderColor = '#000000';
                  }}
                  onBlur={(e) => {
                    if (!errors.confirmPassword) e.target.style.borderColor = '#e5e5e5';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
                {errors.confirmPassword && (
                  <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                    {errors.confirmPassword}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'space-between' }}>
            <button
              onClick={handleSubmit}
              style={{
                flex: 1,
                backgroundColor: '#000000',
                color: 'white',
                padding: '14px 32px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#333333';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#000000';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Sign Up
            </button>
          </div>

          <div style={{
            textAlign: 'center',
            marginTop: '24px',
            paddingTop: '24px',
            borderTop: '1px solid #e5e5e5'
          }}>
            <span style={{
              fontSize: '0.875rem',
              color: '#666666'
            }}>
              Already have an account? {' '}
              <button
                onClick={() => setCurrentPage('login')}
                style={{
                  color: '#000000',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  fontSize: '0.875rem'
                }}
              >
                Log in here
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;