import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, AlertCircle, Eye, EyeOff, CreditCard, Star, Zap, Crown } from 'lucide-react';
import { supabase } from './lib/supabase';

const SignUpPage = ({ setCurrentPage }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    company: '',
    investorType: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    termsAccepted: false,
    marketingEmails: false,
    selectedPlan: 'pro'
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPaymentStep, setShowPaymentStep] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Handle payment redirect parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const sessionId = urlParams.get('session_id');
    
    if (paymentStatus === 'success' && sessionId) {
      console.log('Payment successful, session:', sessionId);
      setPaymentSuccess(true);
      // Clear URL parameters to prevent loops
      window.history.replaceState({}, document.title, window.location.pathname);
      // Redirect to dashboard after showing success message
      setTimeout(() => {
        setCurrentPage('dashboard');
      }, 3000);
      return;
    }
    
    if (paymentStatus === 'cancelled') {
      console.log('Payment cancelled');
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      // Show cancellation message
      setErrors({ general: 'Payment was cancelled. Please try again when you\'re ready to proceed.' });
    }
  }, [setCurrentPage]);

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  const investorTypes = [
    'Individual Investor',
    'Syndication/GP',
    'Property Manager',
    'Real Estate Agent/Broker',
    'Institutional Investor',
    'Family Office',
    'REIT',
    'Other'
  ];

  const pricingPlans = {
    starter: {
      id: 'starter',
      name: 'Starter',
      price: 35,
      icon: Star,
      popular: false,
      features: [
        'Heat maps & market reports',
        'Basic document generation',
        'Manual underwriting only',
        'Market analysis tools'
      ],
      limitations: [
        'No AI OCR parsing',
        'Manual data entry only'
      ]
    },
    pro: {
      id: 'pro',
      name: 'Pro',
      price: 99,
      icon: Zap,
      popular: true,
      features: [
        'Everything in Starter',
        'AI OCR parsing (10-15 PDFs/month)',
        '25 pages max per PDF',
        'Automated underwriting',
        'Property P&L analysis'
      ],
      limitations: [
        'Monthly PDF limits apply'
      ]
    },
    power: {
      id: 'power',
      name: 'Power',
      price: 199,
      icon: Crown,
      popular: false,
      features: [
        'Everything in Pro',
        'Unlimited AI OCR parsing',
        'Priority processing',
        'Export to CSV/Excel',
        'White-label reports',
        'Advanced analytics'
      ],
      limitations: []
    }
  };

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
   
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.investorType) newErrors.investorType = 'Please select investor type';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'Zip code is required';
   
    if (!formData.termsAccepted) {
      newErrors.termsAccepted = 'You must accept the terms and conditions';
    }
   
    return newErrors;
  };

  const handleSubmit = () => {
    const newErrors = validateForm();
   
    if (Object.keys(newErrors).length === 0) {
      console.log('Form validated, showing payment step');
      setShowPaymentStep(true);
    } else {
      setErrors(newErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStripeCheckout = async () => {
    setIsProcessing(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            company: formData.company,
            phone: formData.phone,
            investorType: formData.investorType,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            selectedPlan: formData.selectedPlan
          }
        }
      });

      if (error) {
        setErrors({ general: error.message });
        setIsProcessing(false);
      } else if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              first_name: formData.firstName,
              last_name: formData.lastName,
              company: formData.company,
              phone: formData.phone,
              investor_type: formData.investorType,
              address: formData.address,
              city: formData.city,
              state: formData.state,
              zip_code: formData.zipCode,
              subscription_status: 'inactive',
              subscription_plan: formData.selectedPlan
            }
          ]);

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }

        const priceIds = {
          starter: 'price_1S1cAc2VFAlQshuqsVTF14Op',
          pro: 'price_1S1cCR2VFAlQshuqGK9uNtSK',
          power: 'price_1S1cBM2VFAlQshuqgj3lNfja'
        };

        const response = await fetch(`${process.env.REACT_APP_STRIPE_URL}/api/create-checkout-session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: data.user.id,
            priceId: priceIds[formData.selectedPlan]
          })
        });

        const checkoutData = await response.json();
        
        if (checkoutData.checkout_url) {
          window.location.href = checkoutData.checkout_url;
        } else {
          setErrors({ general: 'Failed to create checkout session' });
          setIsProcessing(false);
        }
      }
    } catch (err) {
      console.error('Signup error:', err);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
      setIsProcessing(false);
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

  // Show payment success message
  if (paymentSuccess) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f8f8f8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          maxWidth: '500px',
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            backgroundColor: '#10b981',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <Check size={40} color="white" />
          </div>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#000000',
            marginBottom: '12px'
          }}>
            Payment Successful!
          </h1>
          <p style={{
            color: '#666666',
            marginBottom: '24px',
            lineHeight: '1.5'
          }}>
            Your Terra.Ai account has been created successfully. You're being redirected to your dashboard...
          </p>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #10b981',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }} />
          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f8f8',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: showPaymentStep ? '900px' : '800px',
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
            <ArrowLeft size={16} />
            Back
          </button>
        </div>

        <div style={{ padding: '32px' }}>
          {!showPaymentStep ? (
            <>
          {errors.general && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '24px',
              color: '#991b1b',
              fontSize: '0.875rem',
              textAlign: 'center'
            }}>
              {errors.general}
            </div>
          )}

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
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {errors.confirmPassword && (
                  <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                    {errors.confirmPassword}
                  </span>
                )}
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: '6px',
                  color: '#333333'
                }}>
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(555) 123-4567"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: errors.phone ? '2px solid #ef4444' : '1px solid #e5e5e5',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    transition: 'border-color 0.2s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    if (!errors.phone) e.target.style.borderColor = '#000000';
                  }}
                  onBlur={(e) => {
                    if (!errors.phone) e.target.style.borderColor = '#e5e5e5';
                  }}
                />
                {errors.phone && (
                  <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                    {errors.phone}
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
                  Company Name (Optional)
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e5e5e5',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    transition: 'border-color 0.2s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#000000';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e5e5';
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              marginBottom: '20px',
              color: '#000000'
            }}>
              Professional Information
            </h2>
           
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '6px',
                color: '#333333'
              }}>
                Investor Type *
              </label>
              <select
                name="investorType"
                value={formData.investorType}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: errors.investorType ? '2px solid #ef4444' : '1px solid #e5e5e5',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  if (!errors.investorType) e.target.style.borderColor = '#000000';
                }}
                onBlur={(e) => {
                  if (!errors.investorType) e.target.style.borderColor = '#e5e5e5';
                }}
              >
                <option value="">Select investor type</option>
                {investorTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.investorType && (
                <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                  {errors.investorType}
                </span>
              )}
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              marginBottom: '20px',
              color: '#000000'
            }}>
              Address Information
            </h2>
           
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '6px',
                color: '#333333'
              }}>
                Street Address *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Main Street, Apt 4B"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: errors.address ? '2px solid #ef4444' : '1px solid #e5e5e5',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  transition: 'border-color 0.2s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  if (!errors.address) e.target.style.borderColor = '#000000';
                }}
                onBlur={(e) => {
                  if (!errors.address) e.target.style.borderColor = '#e5e5e5';
                }}
              />
              {errors.address && (
                <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                  {errors.address}
                </span>
              )}
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr',
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
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: errors.city ? '2px solid #ef4444' : '1px solid #e5e5e5',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    transition: 'border-color 0.2s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    if (!errors.city) e.target.style.borderColor = '#000000';
                  }}
                  onBlur={(e) => {
                    if (!errors.city) e.target.style.borderColor = '#e5e5e5';
                  }}
                />
                {errors.city && (
                  <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                    {errors.city}
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
                  State *
                </label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: errors.state ? '2px solid #ef4444' : '1px solid #e5e5e5',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    if (!errors.state) e.target.style.borderColor = '#000000';
                  }}
                  onBlur={(e) => {
                    if (!errors.state) e.target.style.borderColor = '#e5e5e5';
                  }}
                >
                  <option value="">Select</option>
                  {states.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                {errors.state && (
                  <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                    {errors.state}
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
                  Zip Code *
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  maxLength="10"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: errors.zipCode ? '2px solid #ef4444' : '1px solid #e5e5e5',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    transition: 'border-color 0.2s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    if (!errors.zipCode) e.target.style.borderColor = '#000000';
                  }}
                  onBlur={(e) => {
                    if (!errors.zipCode) e.target.style.borderColor = '#e5e5e5';
                  }}
                />
                {errors.zipCode && (
                  <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                    {errors.zipCode}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <div style={{
              backgroundColor: '#f8f8f8',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleChange}
                  style={{
                    marginRight: '10px',
                    marginTop: '2px',
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer'
                  }}
                />
                <span style={{
                  fontSize: '0.875rem',
                  color: '#333333',
                  lineHeight: '1.5'
                }}>
                  I accept the Terms of Service and Privacy Policy *
                </span>
              </label>
              {errors.termsAccepted && (
                <span style={{
                  color: '#ef4444',
                  fontSize: '0.75rem',
                  marginTop: '8px',
                  display: 'block',
                  marginLeft: '28px'
                }}>
                  {errors.termsAccepted}
                </span>
              )}

              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                cursor: 'pointer',
                marginTop: '12px'
              }}>
                <input
                  type="checkbox"
                  name="marketingEmails"
                  checked={formData.marketingEmails}
                  onChange={handleChange}
                  style={{
                    marginRight: '10px',
                    marginTop: '2px',
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer'
                  }}
                />
                <span style={{
                  fontSize: '0.875rem',
                  color: '#333333',
                  lineHeight: '1.5'
                }}>
                  I would like to receive marketing emails about Terra.Ai products, services, and industry insights
                </span>
              </label>
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
              Choose Your Plan
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
            </>
          ) : (
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <h2 style={{
                fontSize: '1.75rem',
                fontWeight: '700',
                marginBottom: '8px',
                color: '#000000',
                textAlign: 'center'
              }}>
                Choose Your Plan
              </h2>
              <p style={{
                fontSize: '1rem',
                color: '#666666',
                marginBottom: '40px',
                textAlign: 'center'
              }}>
                Select the plan that fits your real estate investment needs
              </p>

              {errors.general && (
                <div style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '24px',
                  color: '#991b1b',
                  fontSize: '0.875rem',
                  textAlign: 'center'
                }}>
                  {errors.general}
                </div>
              )}

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: '20px', 
                marginBottom: '40px',
                maxWidth: '100%'
              }}>
                {Object.values(pricingPlans).map(plan => {
                  const IconComponent = plan.icon;
                  const isSelected = formData.selectedPlan === plan.id;
                  
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setFormData({...formData, selectedPlan: plan.id})}
                      style={{
                        border: isSelected ? '3px solid #000000' : '2px solid #e5e5e5',
                        borderRadius: '16px',
                        padding: '28px',
                        cursor: 'pointer',
                        backgroundColor: isSelected ? '#f8f8f8' : 'white',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = '#fafafa';
                          e.currentTarget.style.borderColor = '#d1d5db';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = 'white';
                          e.currentTarget.style.borderColor = '#e5e5e5';
                        }
                      }}
                    >
                      {plan.popular && (
                        <div style={{
                          position: 'absolute',
                          top: '-12px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          backgroundColor: '#000000',
                          color: 'white',
                          padding: '6px 16px',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}>
                          MOST POPULAR
                        </div>
                      )}
                      
                      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <div style={{
                          width: '60px',
                          height: '60px',
                          backgroundColor: isSelected ? '#000000' : '#f3f4f6',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 16px auto'
                        }}>
                          <IconComponent 
                            size={28} 
                            style={{ 
                              color: isSelected ? 'white' : '#6b7280' 
                            }} 
                          />
                        </div>
                        
                        <h3 style={{ 
                          fontSize: '1.5rem', 
                          fontWeight: '700', 
                          margin: '0 0 8px 0',
                          color: '#000000'
                        }}>
                          {plan.name}
                        </h3>
                        
                        <div style={{ fontSize: '3rem', fontWeight: '800', color: '#000000', marginBottom: '4px' }}>
                          ${plan.price}
                          <span style={{ fontSize: '1rem', fontWeight: '500', color: '#666666' }}>
                            /month
                          </span>
                        </div>
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <div style={{ marginBottom: '20px' }}>
                          <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '12px', color: '#000000' }}>
                            Features included:
                          </h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {plan.features.map((feature, idx) => (
                              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Check size={16} style={{ color: '#10b981', flexShrink: 0 }} />
                                <span style={{ fontSize: '0.875rem', color: '#333333' }}>{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {plan.limitations.length > 0 && (
                          <div>
                            <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '12px', color: '#666666' }}>
                              Limitations:
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {plan.limitations.map((limitation, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <AlertCircle size={16} style={{ color: '#f59e0b', flexShrink: 0 }} />
                                  <span style={{ fontSize: '0.875rem', color: '#666666' }}>{limitation}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
                <button
                  onClick={() => setShowPaymentStep(false)}
                  style={{
                    flex: 1,
                    backgroundColor: 'transparent',
                    color: '#666666',
                    padding: '16px 32px',
                    borderRadius: '8px',
                    border: '2px solid #e5e5e5',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  disabled={isProcessing}
                  onMouseEnter={(e) => {
                    if (!isProcessing) {
                      e.currentTarget.style.backgroundColor = '#f5f5f5';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isProcessing) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  Back to Form
                </button>
               
                <button
                  onClick={handleStripeCheckout}
                  disabled={isProcessing}
                  style={{
                    flex: 2,
                    backgroundColor: isProcessing ? '#666666' : '#000000',
                    color: 'white',
                    padding: '16px 32px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: isProcessing ? 'wait' : 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    if (!isProcessing) {
                      e.currentTarget.style.backgroundColor = '#333333';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isProcessing) {
                      e.currentTarget.style.backgroundColor = '#000000';
                    }
                  }}
                >
                  <CreditCard size={20} />
                  {isProcessing ? 'Creating Account...' : `Create Account - $${pricingPlans[formData.selectedPlan].price}/mo`}
                </button>
              </div>

              <div style={{
                textAlign: 'center',
                padding: '24px',
                backgroundColor: '#f8f8f8',
                borderRadius: '12px'
              }}>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#666666',
                  margin: '0 0 12px 0',
                  lineHeight: '1.5'
                }}>
                  By creating an account, you agree to Terra.Ai's Terms of Service and Privacy Policy.
                </p>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#333333',
                  margin: 0,
                  fontWeight: '500'
                }}>
                  Your account will be created and redirected to Stripe for payment processing.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;