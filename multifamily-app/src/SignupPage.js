import React, { useState } from 'react';
import { supabase } from './lib/supabase';
import propertyImage from './IMG_0108 (4).jpg';

const SignupPage = ({ setCurrentPage, setIsAuthenticated, setCurrentUser }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    company: '',
    phone: '',
    investorType: '',
    address: '',
    city: '',
    state: '',
    zip: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
  if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
  if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
  if (!formData.investorType.trim()) newErrors.investorType = 'Investor type is required';
  if (!formData.address.trim()) newErrors.address = 'Address is required';
  if (!formData.city.trim()) newErrors.city = 'City is required';
  if (!formData.state.trim()) newErrors.state = 'State is required';
  if (!formData.zip.trim()) newErrors.zip = 'Zip is required';
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
      // 1. Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName
          }
        }
      });

      if (authError) throw authError;

      if (authData?.user) {
        // 2. Upsert profile in the profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert([
            {
              id: authData.user.id,
              first_name: formData.firstName,
              last_name: formData.lastName,
              email: formData.email,
              company: formData.company || null,
              phone: formData.phone || null,
              investor_type: formData.investorType,
              address1: formData.address,
              address2: '',
              city: formData.city,
              state: formData.state,
              zip_code: formData.zip,
              created_at: new Date(),
              updated_at: new Date(),
              subscription_status: 'inactive',
              plan: 'free'
            }
          ], { onConflict: 'id' });

        if (profileError) throw profileError;
        
        setSuccess(true);
        
        // Redirect to Stripe checkout for $60/month subscription
        console.log('✅ Account created, redirecting to Stripe checkout...');
        
        // Use the monthly subscription payment link with user ID
        const stripeCheckoutUrl = `https://buy.stripe.com/test_7sY28k0d5fl82od12Xf3a00?client_reference_id=${authData.user.id}`;
        
        // Show success message briefly, then redirect
        setTimeout(() => {
          window.location.href = stripeCheckoutUrl;
        }, 1500);
      }
    } catch (err) {
      setError(err?.message || 'An unexpected error occurred during registration');
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
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        width: '100vw',
        backgroundColor: '#f6f6f6',
      }}
    >
      {/* LEFT — 35%: Signup form */}
      <div
        style={{
          flex: 35,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}
      >
        <div style={{ width: '100%', maxWidth: '450px' }}>
          <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <TerraLogo />
              <h1 style={{ marginLeft: '1rem', fontSize: '2rem', fontWeight: '700' }}>
                MarketFinder.AI
              </h1>
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem' }}>
              Create your account
            </h2>
            <p style={{ color: '#666', fontSize: '1rem' }}>
              Join thousands of multifamily investors making better decisions
            </p>
          </div>

          {success ? (
            <div
              style={{
                backgroundColor: '#e6f7e6',
                border: '1px solid #c3e6cb',
                color: '#155724',
                padding: '1rem',
                borderRadius: '0.25rem',
                marginBottom: '1rem'
              }}
            >
              <h3 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Account Created Successfully! 🎉</h3>
              <p>Redirecting you to complete your $60/month subscription...</p>
              <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', opacity: 0.8 }}>
                Your subscription includes full platform access + 60 pages per month.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div
                  style={{
                    backgroundColor: '#f8d7da',
                    border: '1px solid #f5c6cb',
                    color: '#721c24',
                    padding: '0.75rem 1.25rem',
                    marginBottom: '1rem',
                    borderRadius: '0.25rem',
                  }}
                >
                  {error}
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label
                    htmlFor="firstName"
                    style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: '500',
                      fontSize: '0.875rem',
                    }}
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: errors.firstName ? '1px solid #dc3545' : '1px solid #ddd',
                      borderRadius: '0.25rem',
                      fontSize: '1rem',
                    }}
                  />
                  {errors.firstName && (
                    <p style={{ color: '#dc3545', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <label
                    htmlFor="lastName"
                    style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: '500',
                      fontSize: '0.875rem',
                    }}
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: errors.lastName ? '1px solid #dc3545' : '1px solid #ddd',
                      borderRadius: '0.25rem',
                      fontSize: '1rem',
                    }}
                  />
                  {errors.lastName && (
                    <p style={{ color: '#dc3545', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label
                  htmlFor="email"
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                    fontSize: '0.875rem',
                  }}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors.email ? '1px solid #dc3545' : '1px solid #ddd',
                    borderRadius: '0.25rem',
                    fontSize: '1rem',
                  }}
                />
                {errors.email && (
                  <p style={{ color: '#dc3545', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {errors.email}
                  </p>
                )}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="company" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>Company (Optional)</label>
                <input type="text" id="company" name="company" value={formData.company} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '0.25rem', fontSize: '1rem' }} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="phone" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>Phone Number (Optional)</label>
                <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '0.25rem', fontSize: '1rem' }} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="investorType" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>Investor Type</label>
                <select id="investorType" name="investorType" value={formData.investorType} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', border: errors.investorType ? '1px solid #dc3545' : '1px solid #ddd', borderRadius: '0.25rem', fontSize: '1rem' }}>
                  <option value="">Select type</option>
                  <option value="Individual Investor">Individual Investor</option>
                  <option value="Company">Company</option>
                  <option value="Syndicator">Syndicator</option>
                  <option value="Other">Other</option>
                </select>
                {errors.investorType && (<p style={{ color: '#dc3545', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.investorType}</p>)}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="address" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>Address</label>
                <input type="text" id="address" name="address" value={formData.address} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', border: errors.address ? '1px solid #dc3545' : '1px solid #ddd', borderRadius: '0.25rem', fontSize: '1rem' }} />
                {errors.address && (<p style={{ color: '#dc3545', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.address}</p>)}
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label htmlFor="city" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>City</label>
                  <input type="text" id="city" name="city" value={formData.city} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', border: errors.city ? '1px solid #dc3545' : '1px solid #ddd', borderRadius: '0.25rem', fontSize: '1rem' }} />
                  {errors.city && (<p style={{ color: '#dc3545', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.city}</p>)}
                </div>
                <div style={{ flex: 1 }}>
                  <label htmlFor="state" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>State</label>
                  <input type="text" id="state" name="state" value={formData.state} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', border: errors.state ? '1px solid #dc3545' : '1px solid #ddd', borderRadius: '0.25rem', fontSize: '1rem' }} />
                  {errors.state && (<p style={{ color: '#dc3545', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.state}</p>)}
                </div>
                <div style={{ flex: 1 }}>
                  <label htmlFor="zip" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>Zip</label>
                  <input type="text" id="zip" name="zip" value={formData.zip} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', border: errors.zip ? '1px solid #dc3545' : '1px solid #ddd', borderRadius: '0.25rem', fontSize: '1rem' }} />
                  {errors.zip && (<p style={{ color: '#dc3545', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.zip}</p>)}
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label
                  htmlFor="password"
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                    fontSize: '0.875rem',
                  }}
                >
                  Password
                </label>
                <div
                  style={{
                    position: 'relative',
                  }}
                >
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: errors.password ? '1px solid #dc3545' : '1px solid #ddd',
                      borderRadius: '0.25rem',
                      fontSize: '1rem',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      color: '#666',
                      fontSize: '0.875rem',
                    }}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {errors.password && (
                  <p style={{ color: '#dc3545', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {errors.password}
                  </p>
                )}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  htmlFor="confirmPassword"
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                    fontSize: '0.875rem',
                  }}
                >
                  Confirm Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors.confirmPassword ? '1px solid #dc3545' : '1px solid #ddd',
                    borderRadius: '0.25rem',
                    fontSize: '1rem',
                  }}
                />
                {errors.confirmPassword && (
                  <p style={{ color: '#dc3545', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#1a73e8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  fontSize: '1rem',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1,
                }}
              >
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>
          )}
          
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <p>
              Already have an account?{' '}
              <button
                onClick={() => setCurrentPage?.('login')}
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
                Log in
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT — 65%: Image and value prop */}
      <div
        style={{
          flex: 65,
          backgroundImage: `url(${propertyImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            bottom: '2rem',
            left: '2rem',
            maxWidth: '500px',
            color: 'white',
            textShadow: '0 1px 3px rgba(0,0,0,0.7)',
            padding: '2rem',
            backgroundColor: 'rgba(0,0,0,0.4)',
            borderRadius: '0.5rem',
          }}
        >
          <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '1rem' }}>
            Find the best multifamily investment opportunities
          </h2>
          <p style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>
            Unlock access to comprehensive market analytics, property insights, and investment 
            opportunities. Make data-driven decisions to maximize your ROI.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>✓</span>
              <span>Analyze 30,000+ markets</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>✓</span>
              <span>Advanced ROI calculators</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>✓</span>
              <span>Demographic insights</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;