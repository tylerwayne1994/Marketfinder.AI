import React, { useState, useEffect } from 'react';
import { ArrowRight, BarChart3, Home, Calculator, Chrome, Map, FileText, Play, ChevronLeft, ChevronRight, Check, Star, Shield, Zap, X, Eye, EyeOff, Sun, Moon, CreditCard, Clock } from 'lucide-react';
import { useTheme } from './App'; // Import your existing theme hook
import { useAuth } from './hooks/useAuth'; // Import the auth hook

// Feature Slideshow Component (same as before)
const FeatureSlideshow = () => {
  const { currentTheme, currentAccent } = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);

  const features = [
    {
      title: "Dashboard & Portfolio Management",
      description: "Track your entire multifamily portfolio with advanced analytics. Monitor cash flow, ROI, and property performance metrics in real-time. Get instant alerts on market changes affecting your investments.",
      icon: Home,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      benefits: ["Real-time portfolio analytics", "Cash flow tracking", "Performance metrics", "Market alerts"],
      image: "/api/placeholder/600/400"
    },
    {
      title: "AI-Powered Underwriting",
      description: "Upload property documents and get instant financial analysis. Our AI processes rent rolls, operating statements, and market data to provide accurate cap rates, NOI projections, and investment recommendations.",
      icon: Calculator,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      benefits: ["Instant PDF analysis", "Accurate cap rate calculations", "AI investment recommendations", "Risk assessment"],
      image: "/api/placeholder/600/400"
    },
    {
      title: "Property Scraping Engine",
      description: "Automatically scan Zillow, Crexi, and LoopNet for new listings. Our Chrome extension and web scraping tools collect property data and run preliminary analysis on every listing that matches your criteria.",
      icon: Chrome,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      benefits: ["Multi-platform scraping", "Automated analysis", "Custom search criteria", "Deal alerts"],
      image: "/api/placeholder/600/400"
    },
    {
      title: "Market Heat Map",
      description: "Visualize emerging markets and identify investment opportunities with our interactive heat map. Analyze price trends, rental yields, and demographic data to spot the next hot market before others.",
      icon: Map,
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      benefits: ["Interactive market visualization", "Trend analysis", "Demographic insights", "Opportunity scoring"],
      image: "/api/placeholder/600/400"
    },
    {
      title: "Legal Document Generator",
      description: "Generate professional legal documents with AI assistance. Create promissory notes, operating agreements, purchase contracts, and partnership agreements tailored to your specific deals and jurisdiction.",
      icon: FileText,
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      benefits: ["AI-powered document creation", "Legal compliance", "Custom templates", "State-specific forms"],
      image: "/api/placeholder/600/400"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % features.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + features.length) % features.length);
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, []);

  const styles = {
    container: {
      position: 'relative',
      borderRadius: '20px',
      overflow: 'hidden',
      background: currentTheme.cardBg,
      border: `1px solid ${currentTheme.borderColor}`,
      minHeight: '500px'
    },
    slide: {
      display: 'flex',
      alignItems: 'center',
      padding: '48px',
      gap: '48px',
      minHeight: '500px'
    },
    content: {
      flex: 1,
      maxWidth: '50%'
    },
    iconBox: {
      width: '80px',
      height: '80px',
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '24px',
      background: features[currentSlide].gradient
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: currentTheme.textPrimary,
      marginBottom: '16px'
    },
    description: {
      fontSize: '1.125rem',
      color: currentTheme.textSecondary,
      lineHeight: '1.7',
      marginBottom: '32px'
    },
    benefitsList: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '12px'
    },
    benefit: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '0.875rem',
      color: currentTheme.textPrimary
    },
    imageContainer: {
      flex: 1,
      maxWidth: '50%',
      height: '400px',
      borderRadius: '12px',
      background: `linear-gradient(135deg, ${currentAccent.secondary}20, ${currentAccent.primary}20)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: currentTheme.textSecondary,
      fontSize: '1.125rem'
    },
    navigation: {
      position: 'absolute',
      bottom: '24px',
      left: '48px',
      display: 'flex',
      gap: '16px',
      alignItems: 'center'
    },
    navButton: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      background: currentTheme.cardBg,
      border: `1px solid ${currentTheme.borderColor}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    dots: {
      display: 'flex',
      gap: '8px'
    },
    dot: {
      width: '10px',
      height: '10px',
      borderRadius: '50%',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    dotActive: {
      background: currentAccent.primary
    },
    dotInactive: {
      background: currentTheme.borderColor
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.slide}>
        <div style={styles.content}>
          <div style={styles.iconBox}>
            {React.createElement(features[currentSlide].icon, { size: 32, color: 'white' })}
          </div>
          <h3 style={styles.title}>{features[currentSlide].title}</h3>
          <p style={styles.description}>{features[currentSlide].description}</p>
          <div style={styles.benefitsList}>
            {features[currentSlide].benefits.map((benefit, index) => (
              <div key={index} style={styles.benefit}>
                <Check size={16} color={currentAccent.primary} />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={styles.imageContainer}>
          <span>Feature Screenshot Preview</span>
        </div>
      </div>
      
      <div style={styles.navigation}>
        <div 
          style={styles.navButton}
          onClick={prevSlide}
          onMouseEnter={(e) => e.currentTarget.style.background = currentTheme.hover}
          onMouseLeave={(e) => e.currentTarget.style.background = currentTheme.cardBg}
        >
          <ChevronLeft size={20} color={currentTheme.textPrimary} />
        </div>
        <div 
          style={styles.navButton}
          onClick={nextSlide}
          onMouseEnter={(e) => e.currentTarget.style.background = currentTheme.hover}
          onMouseLeave={(e) => e.currentTarget.style.background = currentTheme.cardBg}
        >
          <ChevronRight size={20} color={currentTheme.textPrimary} />
        </div>
        <div style={styles.dots}>
          {features.map((_, index) => (
            <div
              key={index}
              style={{
                ...styles.dot,
                ...(index === currentSlide ? styles.dotActive : styles.dotInactive)
              }}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Subscription Modal Component
const SubscriptionModal = ({ isOpen, onClose, onStartTrial }) => {
  const { currentTheme, currentAccent } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(8px)'
    },
    modal: {
      background: currentTheme.cardBg,
      borderRadius: '16px',
      padding: '0',
      width: '100%',
      maxWidth: '600px',
      maxHeight: '90vh',
      overflow: 'hidden',
      border: `1px solid ${currentTheme.borderColor}`,
      position: 'relative'
    },
    header: {
      padding: '32px 48px 0',
      position: 'relative'
    },
    closeButton: {
      position: 'absolute',
      top: '24px',
      right: '24px',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: currentTheme.textSecondary,
      padding: '8px'
    },
    title: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: currentTheme.textPrimary,
      marginBottom: '8px',
      textAlign: 'center'
    },
    subtitle: {
      color: currentTheme.textSecondary,
      textAlign: 'center',
      marginBottom: '32px'
    },
    content: {
      padding: '0 48px 48px'
    },
    trialBanner: {
      background: `linear-gradient(135deg, ${currentAccent.primary}15, ${currentAccent.secondary}15)`,
      border: `1px solid ${currentAccent.primary}30`,
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '32px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    trialContent: {
      flex: 1
    },
    trialTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: currentTheme.textPrimary,
      marginBottom: '4px'
    },
    trialText: {
      color: currentTheme.textSecondary,
      fontSize: '0.875rem'
    },
    planCard: {
      background: currentTheme.background,
      border: `2px solid ${currentAccent.primary}`,
      borderRadius: '16px',
      padding: '32px',
      marginBottom: '32px',
      position: 'relative',
      boxShadow: `0 8px 32px rgba(${currentAccent.primary.match(/\d+/g).slice(0,3).join(',')}, 0.15)`
    },
    popularBadge: {
      position: 'absolute',
      top: '-12px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: `linear-gradient(135deg, ${currentAccent.primary}, ${currentAccent.secondary})`,
      color: 'white',
      padding: '8px 20px',
      borderRadius: '20px',
      fontSize: '0.875rem',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    planHeader: {
      textAlign: 'center',
      marginBottom: '24px'
    },
    planName: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: currentTheme.textPrimary,
      marginBottom: '8px'
    },
    planPrice: {
      fontSize: '3rem',
      fontWeight: 'bold',
      color: currentTheme.textPrimary,
      marginBottom: '4px'
    },
    planPeriod: {
      fontSize: '1rem',
      color: currentTheme.textSecondary
    },
    planDescription: {
      color: currentTheme.textSecondary,
      textAlign: 'center',
      marginBottom: '24px'
    },
    featuresList: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
      marginBottom: '32px'
    },
    feature: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontSize: '0.875rem',
      color: currentTheme.textPrimary
    },
    ctaButton: {
      width: '100%',
      padding: '18px',
      borderRadius: '12px',
      border: 'none',
      background: `linear-gradient(135deg, ${currentAccent.primary}, ${currentAccent.secondary})`,
      color: 'white',
      fontSize: '1.125rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      opacity: loading ? 0.6 : 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px'
    },
    errorMessage: {
      background: '#fee2e2',
      border: '1px solid #fecaca',
      color: '#dc2626',
      padding: '12px',
      borderRadius: '8px',
      marginBottom: '20px',
      fontSize: '0.875rem'
    },
    footer: {
      textAlign: 'center',
      marginTop: '20px',
      fontSize: '0.75rem',
      color: currentTheme.textSecondary
    }
  };

  const features = [
    "Unlimited property analyses",
    "Advanced market heat map",
    "Property scraping tools",
    "Document generator",
    "Portfolio tracking",
    "Real-time alerts",
    "AI-powered insights",
    "Priority support"
  ];

  const handleStartTrial = async () => {
    setLoading(true);
    setError('');

    try {
      // This will trigger the signup process
      await onStartTrial();
    } catch (err) {
      setError('Failed to start trial. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <button style={styles.closeButton} onClick={onClose}>
            <X size={24} />
          </button>
          
          <h2 style={styles.title}>Start Your Free Trial</h2>
          <p style={styles.subtitle}>
            Get full access to MultifamilyAI for 3 days, then continue for just $99/month
          </p>
        </div>

        <div style={styles.content}>
          {/* Trial Banner */}
          <div style={styles.trialBanner}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${currentAccent.primary}, ${currentAccent.secondary})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Clock size={24} color="white" />
            </div>
            <div style={styles.trialContent}>
              <div style={styles.trialTitle}>3-Day Free Trial</div>
              <div style={styles.trialText}>
                No credit card required • Full access to all features • Cancel anytime
              </div>
            </div>
          </div>

          {error && (
            <div style={styles.errorMessage}>
              {error}
            </div>
          )}

          {/* Plan Card */}
          <div style={styles.planCard}>
            <div style={styles.popularBadge}>
              <Star size={14} />
              Most Popular Plan
            </div>
            
            <div style={styles.planHeader}>
              <h3 style={styles.planName}>MultifamilyAI</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '4px' }}>
                <span style={styles.planPrice}>$99</span>
                <span style={styles.planPeriod}>/month</span>
              </div>
            </div>
            
            <p style={styles.planDescription}>
              Complete AI-powered platform for multifamily real estate investing
            </p>

            <div style={styles.featuresList}>
              {features.map((feature, index) => (
                <div key={index} style={styles.feature}>
                  <Check size={16} color={currentAccent.primary} />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <button
              style={styles.ctaButton}
              onClick={handleStartTrial}
              disabled={loading}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <CreditCard size={20} />
              {loading ? 'Starting Trial...' : 'Start 3-Day Free Trial'}
            </button>

            <div style={styles.footer}>
              Secure payment powered by Stripe • Cancel anytime during trial
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Auth Modal Component
const AuthModal = ({ isOpen, onClose, mode, setMode, onLogin }) => {
  const { currentTheme, currentAccent } = useTheme();
  const { signUp, signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: ''
  });

  if (!isOpen) return null;

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(8px)'
    },
    modal: {
      background: currentTheme.cardBg,
      borderRadius: '16px',
      padding: '48px',
      width: '100%',
      maxWidth: '500px',
      border: `1px solid ${currentTheme.borderColor}`,
      position: 'relative',
      maxHeight: '90vh',
      overflowY: 'auto'
    },
    closeButton: {
      position: 'absolute',
      top: '24px',
      right: '24px',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: currentTheme.textSecondary,
      padding: '8px'
    },
    title: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: currentTheme.textPrimary,
      marginBottom: '8px',
      textAlign: 'center'
    },
    subtitle: {
      color: currentTheme.textSecondary,
      textAlign: 'center',
      marginBottom: '32px'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    },
    label: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: currentTheme.textPrimary
    },
    input: {
      padding: '12px 16px',
      borderRadius: '8px',
      border: `1px solid ${currentTheme.borderColor}`,
      background: currentTheme.cardBg,
      color: currentTheme.textPrimary,
      fontSize: '1rem',
      transition: 'border-color 0.2s ease'
    },
    passwordContainer: {
      position: 'relative'
    },
    passwordToggle: {
      position: 'absolute',
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: currentTheme.textSecondary
    },
    nameRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px'
    },
    button: {
      padding: '16px',
      borderRadius: '8px',
      border: 'none',
      background: `linear-gradient(135deg, ${currentAccent.primary}, ${currentAccent.secondary})`,
      color: 'white',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'transform 0.2s ease',
      marginTop: '8px',
      opacity: loading ? 0.6 : 1
    },
    switchMode: {
      textAlign: 'center',
      marginTop: '24px',
      color: currentTheme.textSecondary
    },
    switchLink: {
      color: currentAccent.primary,
      cursor: 'pointer',
      textDecoration: 'underline'
    },
    errorMessage: {
      background: '#fee2e2',
      border: '1px solid #fecaca',
      color: '#dc2626',
      padding: '12px',
      borderRadius: '8px',
      marginBottom: '20px',
      fontSize: '0.875rem'
    }
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      if (mode === 'signup') {
        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        // Sign up with Supabase
        const { data, error } = await signUp({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          address: formData.address
        });

        if (error) {
          setError(error.message);
        } else {
          // Success - user created
          onLogin();
          onClose();
        }
      } else {
        // Sign in with Supabase
        const { data, error } = await signIn({
          email: formData.email,
          password: formData.password
        });

        if (error) {
          setError(error.message);
        } else {
          // Success - user signed in
          onLogin();
          onClose();
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <button style={styles.closeButton} onClick={onClose}>
          <X size={24} />
        </button>
        
        <h2 style={styles.title}>
          {mode === 'login' ? 'Welcome Back' : 'Create Your Account'}
        </h2>
        <p style={styles.subtitle}>
          {mode === 'login' 
            ? 'Sign in to access your MultifamilyAI dashboard' 
            : 'Join thousands of investors using MultifamilyAI'
          }
        </p>

        {error && (
          <div style={styles.errorMessage}>
            {error}
          </div>
        )}

        <div style={styles.form}>
          {mode === 'signup' && (
            <>
              <div style={styles.nameRow}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>First Name</label>
                  <input
                    style={styles.input}
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="John"
                    required
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Last Name</label>
                  <input
                    style={styles.input}
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              style={styles.input}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="john@example.com"
              required
            />
          </div>

          {mode === 'signup' && (
            <>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Phone Number</label>
                <input
                  style={styles.input}
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(555) 123-4567"
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Address</label>
                <input
                  style={styles.input}
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="123 Main St, City, State 12345"
                  required
                />
              </div>
            </>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.passwordContainer}>
              <input
                style={styles.input}
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                style={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirm Password</label>
              <input
                style={styles.input}
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                required
              />
            </div>
          )}

          <button
            style={styles.button}
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
          >
            {loading ? 'Please wait...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </div>

        <div style={styles.switchMode}>
          {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <span 
            style={styles.switchLink}
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </span>
        </div>
      </div>
    </div>
  );
};

// Simple Pricing Section Component
const PricingSection = ({ onStartTrial }) => {
  const { currentTheme, currentAccent } = useTheme();

  const styles = {
    container: {
      padding: '80px 48px',
      textAlign: 'center'
    },
    title: {
      fontSize: '3rem',
      fontWeight: 'bold',
      color: currentTheme.textPrimary,
      marginBottom: '16px'
    },
    subtitle: {
      fontSize: '1.25rem',
      color: currentTheme.textSecondary,
      marginBottom: '64px',
      maxWidth: '600px',
      margin: '0 auto 64px'
    },
    planContainer: {
      maxWidth: '500px',
      margin: '0 auto'
    },
    planCard: {
      background: currentTheme.cardBg,
      borderRadius: '20px',
      padding: '48px 40px',
      border: `2px solid ${currentAccent.primary}`,
      position: 'relative',
      boxShadow: `0 20px 60px rgba(${currentAccent.primary.match(/\d+/g).slice(0,3).join(',')}, 0.15)`
    },
    popularBadge: {
      position: 'absolute',
      top: '-16px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: `linear-gradient(135deg, ${currentAccent.primary}, ${currentAccent.secondary})`,
      color: 'white',
      padding: '12px 32px',
      borderRadius: '25px',
      fontSize: '0.875rem',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    planName: {
      fontSize: '2rem',
      fontWeight: '600',
      color: currentTheme.textPrimary,
      marginBottom: '16px'
    },
    planPrice: {
      fontSize: '4rem',
      fontWeight: 'bold',
      color: currentTheme.textPrimary,
      marginBottom: '8px'
    },
    planPeriod: {
      fontSize: '1.125rem',
      color: currentTheme.textSecondary,
      marginBottom: '32px'
    },
    planDescription: {
      color: currentTheme.textSecondary,
      fontSize: '1.125rem',
      marginBottom: '40px',
      lineHeight: '1.6'
    },
    featuresList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      marginBottom: '40px',
      textAlign: 'left'
    },
    feature: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '1rem',
      color: currentTheme.textPrimary
    },
    planButton: {
      width: '100%',
      padding: '20px',
      borderRadius: '12px',
      border: 'none',
      fontSize: '1.125rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      background: `linear-gradient(135deg, ${currentAccent.primary}, ${currentAccent.secondary})`,
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px'
    },
    guarantee: {
      marginTop: '24px',
      fontSize: '0.875rem',
      color: currentTheme.textSecondary
    }
  };

  const features = [
    "Unlimited property analyses",
    "Advanced AI-powered underwriting", 
    "Property scraping from major platforms",
    "Interactive market heat maps",
    "Legal document generator",
    "Portfolio tracking & analytics",
    "Real-time deal alerts",
    "Priority customer support"
  ];

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Simple, Transparent Pricing</h2>
      <p style={styles.subtitle}>
        Everything you need to scale your multifamily investments. Start with a 3-day free trial.
      </p>

      <div style={styles.planContainer}>
        <div style={styles.planCard}>
          <div style={styles.popularBadge}>
            <Star size={16} />
            Complete Platform
          </div>
          
          <h3 style={styles.planName}>MultifamilyAI</h3>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '4px' }}>
            <span style={styles.planPrice}>$99</span>
            <span style={styles.planPeriod}>/month</span>
          </div>
          
          <p style={styles.planDescription}>
            Complete AI-powered platform for multifamily real estate investing. Everything you need to find, analyze, and close profitable deals.
          </p>

          <div style={styles.featuresList}>
            {features.map((feature, index) => (
              <div key={index} style={styles.feature}>
                <Check size={18} color={currentAccent.primary} />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <button
            style={styles.planButton}
            onClick={onStartTrial}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Clock size={20} />
            Start 3-Day Free Trial
          </button>

          <div style={styles.guarantee}>
            No credit card required • Cancel anytime • Full access during trial
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Landing Page Component
const LandingPage = ({ setCurrentPage }) => {
  const { currentTheme, currentAccent, currentFontSize, toggleTheme } = useTheme();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [authMode, setAuthMode] = useState('signup');
  const [hoveredFeature, setHoveredFeature] = useState(null);

  const handleLogin = () => {
    // After successful login, navigate to home
    setCurrentPage('home');
  };

  const handleStartTrial = () => {
    // Show auth modal for signup first
    setShowSubscriptionModal(false);
    setAuthMode('signup');
    setShowAuthModal(true);
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: currentTheme.background,
      color: currentTheme.textPrimary,
      fontSize: currentFontSize.base
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '24px 48px',
      borderBottom: `1px solid ${currentTheme.borderColor}`,
      background: currentTheme.cardBg,
      position: 'sticky',
      top: 0,
      zIndex: 100
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '1.5rem',
      fontWeight: 'bold'
    },
    logoIcon: {
      width: '40px',
      height: '40px',
      background: `linear-gradient(135deg, ${currentAccent.secondary}, ${currentAccent.primary})`,
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    nav: {
      display: 'flex',
      alignItems: 'center',
      gap: '32px'
    },
    navButton: {
      padding: '10px 20px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '500',
      transition: 'all 0.2s ease'
    },
    primaryButton: {
      background: `linear-gradient(135deg, ${currentAccent.primary}, ${currentAccent.secondary})`,
      color: 'white'
    },
    secondaryButton: {
      background: 'transparent',
      color: currentTheme.textPrimary,
      border: `1px solid ${currentTheme.borderColor}`
    },
    themeToggle: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: currentTheme.textSecondary,
      padding: '8px'
    },
    hero: {
      textAlign: 'center',
      padding: '120px 48px 80px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    heroTitle: {
      fontSize: currentFontSize.title,
      fontWeight: 'bold',
      marginBottom: '24px',
      background: `linear-gradient(135deg, ${currentAccent.secondary} 0%, ${currentAccent.primary} 50%, #8b5cf6 100%)`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      lineHeight: '1.1'
    },
    heroSubtitle: {
      fontSize: currentFontSize.subtitle,
      color: currentTheme.textSecondary,
      lineHeight: '1.6',
      maxWidth: '800px',
      margin: '0 auto 48px'
    },
    ctaButtons: {
      display: 'flex',
      gap: '24px',
      justifyContent: 'center',
      marginBottom: '80px'
    },
    ctaButton: {
      padding: '18px 36px',
      borderRadius: '12px',
      border: 'none',
      fontSize: '1.125rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    section: {
      padding: '80px 48px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    sectionTitle: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: '16px',
      color: currentTheme.textPrimary
    },
    sectionSubtitle: {
      fontSize: '1.25rem',
      color: currentTheme.textSecondary,
      textAlign: 'center',
      marginBottom: '64px',
      maxWidth: '600px',
      margin: '0 auto 64px'
    },
    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '32px',
      marginTop: '64px'
    },
    featureCard: {
      background: currentTheme.cardBg,
      borderRadius: '16px',
      padding: '32px',
      border: `1px solid ${currentTheme.borderColor}`,
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    },
    featureCardHover: {
      transform: 'translateY(-8px)',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
      borderColor: currentAccent.primary
    },
    featureIcon: {
      width: '60px',
      height: '60px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '24px'
    },
    featureTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: currentTheme.textPrimary,
      marginBottom: '12px'
    },
    featureText: {
      color: currentTheme.textSecondary,
      lineHeight: '1.6'
    }
  };

  const quickFeatures = [
    {
      icon: Zap,
      title: "Instant Analysis",
      description: "Upload property docs and get detailed financial analysis in seconds with our AI engine.",
      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)'
    },
    {
      icon: Shield,
      title: "Bank-Level Security",
      description: "Your financial data is protected with enterprise-grade encryption and security protocols.",
      gradient: 'linear-gradient(135deg, #10b981, #059669)'
    },
    {
      icon: Star,
      title: "Proven Results",
      description: "Join 10,000+ investors who've closed $2.3B in deals using our platform.",
      gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
    }
  ];

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>
            <BarChart3 size={24} color="white" />
          </div>
          <span>MultifamilyAI</span>
        </div>
        
        <nav style={styles.nav}>
          <button style={styles.themeToggle} onClick={toggleTheme}>
            {currentTheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button 
            style={{...styles.navButton, ...styles.secondaryButton}}
            onClick={() => {
              setAuthMode('login');
              setShowAuthModal(true);
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = currentTheme.hover}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            Sign In
          </button>
          <button 
            style={{...styles.navButton, ...styles.primaryButton}}
            onClick={() => setShowSubscriptionModal(true)}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Start Free Trial
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>
          AI-Powered Multifamily Investment Platform
        </h1>
        <p style={styles.heroSubtitle}>
          Analyze properties instantly, discover hidden deals, and manage your entire portfolio with the most advanced AI tools in real estate investing. Join thousands of investors maximizing their returns.
        </p>
        
        <div style={styles.ctaButtons}>
          <button 
            style={{...styles.ctaButton, ...styles.primaryButton}}
            onClick={() => setShowSubscriptionModal(true)}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Clock size={20} />
            Start 3-Day Free Trial
          </button>
          <button 
            style={{...styles.ctaButton, ...styles.secondaryButton}}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = currentTheme.hover;
              e.currentTarget.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Play size={20} />
            Watch Demo
          </button>
        </div>

        {/* Quick Features */}
        <div style={styles.featuresGrid}>
          {quickFeatures.map((feature, index) => (
            <div 
              key={index}
              style={{
                ...styles.featureCard,
                ...(hoveredFeature === index ? styles.featureCardHover : {})
              }}
              onMouseEnter={() => setHoveredFeature(index)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              <div style={{...styles.featureIcon, background: feature.gradient}}>
                <feature.icon size={24} color="white" />
              </div>
              <h3 style={styles.featureTitle}>{feature.title}</h3>
              <p style={styles.featureText}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Slideshow Section */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Complete Investment Platform</h2>
        <p style={styles.sectionSubtitle}>
          Everything you need to find, analyze, and manage profitable multifamily investments
        </p>
        <FeatureSlideshow />
      </section>

      {/* Pricing Section */}
      <PricingSection onStartTrial={() => setShowSubscriptionModal(true)} />

      {/* Subscription Modal */}
      <SubscriptionModal 
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        onStartTrial={handleStartTrial}
      />

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        setMode={setAuthMode}
        onLogin={handleLogin}
      />
    </div>
  );
};

export default LandingPage;