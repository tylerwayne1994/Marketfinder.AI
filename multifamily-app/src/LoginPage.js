import React, { useState } from 'react';
import { supabase } from './lib/supabase';
import heroImg from './IMG_0108 (4).jpg';

const LoginPage = ({ setCurrentPage, setIsAuthenticated, setCurrentUser }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const validateForm = () => {
    const e = {};
    if (!formData.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Email is invalid';
    if (!formData.password) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validateForm();
    if (Object.keys(v).length) {
      setErrors(v);
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
      if (data?.user) {
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
    <svg width="28" height="28" viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <circle cx="50" cy="50" r="45" stroke="black" strokeWidth="6" fill="none" />
      <circle cx="50" cy="50" r="15" fill="none" stroke="black" strokeWidth="4" />
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
            d={`M 50 50 L ${x1} ${y1} Q ${50 + (length - 5) * Math.cos(rad - 0.08)} ${50 + (length - 5) * Math.sin(
              rad - 0.08
            )}, ${x2} ${y2} Q ${50 + (length - 5) * Math.cos(rad + 0.08)} ${50 + (length - 5) * Math.sin(
              rad + 0.08
            )}, ${x3} ${y3} Z`}
            fill="black"
          />
        );
      })}
    </svg>
  );

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* LEFT: Form */}
        <div style={styles.formCol}>
          <div style={styles.headerRow}>
            <div style={styles.brand}>
              <TerraLogo />
              <span style={styles.brandText}>Terra.AI</span>
            </div>

            <button type="button" onClick={() => setCurrentPage?.('landing')} style={styles.backBtn}>
              Back
            </button>
          </div>

          <h1 style={styles.title}>Sign in to your account</h1>

          <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
            {/* Email */}
            <div style={{ marginBottom: 18 }}>
              <label style={styles.label}>Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={{ ...styles.input, ...(errors.email ? styles.inputError : {}) }}
                placeholder="you@example.com"
                autoComplete="email"
              />
              {errors.email && <span style={styles.errorText}>{errors.email}</span>}
            </div>

            {/* Password */}
            <div style={{ marginBottom: 8, position: 'relative' }}>
              <label style={styles.label}>Password *</label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                style={{ ...styles.input, paddingRight: 76, ...(errors.password ? styles.inputError : {}) }}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                style={styles.showBtn}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
              {errors.password && <span style={styles.errorText}>{errors.password}</span>}
            </div>

            {/* Submit */}
            <button type="submit" disabled={isLoading} style={{ ...styles.submitBtn, ...(isLoading ? styles.btnDisabled : {}) }}>
              {isLoading ? 'Logging in…' : 'Login'}
            </button>

            {error && <div style={styles.formError}>{error}</div>}
          </form>

          <div style={styles.footerRow}>
            <span style={styles.smallText}>
              Don&apos;t have an account?{' '}
              <button type="button" onClick={() => setCurrentPage?.('signup')} style={styles.inlineLink}>
                Sign up today
              </button>
            </span>
          </div>
        </div>

        {/* RIGHT: Photo panel (PropStream-style) */}
        <div style={{ ...styles.photoCol, backgroundImage: `url(${heroImg})` }} aria-hidden="true" />
      </div>
    </div>
  );
};

/* ---------- inline styles ---------- */

const styles = {
  page: {
    minHeight: '100vh',
    width: '100%',
    background: '#f6f6f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  card: {
    width: '100%',
    maxWidth: 1100,
    minHeight: 560,
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 14px 50px rgba(0,0,0,0.10)',
    overflow: 'hidden',
    display: 'flex',
  },
  formCol: {
    flex: '0 0 55%', // ~left 55%
    padding: '32px 36px',
    display: 'flex',
    flexDirection: 'column',
  },
  photoCol: {
    flex: '0 0 45%', // ~right 45% (PropStream vibe)
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },

  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  brand: { display: 'flex', alignItems: 'center', gap: 10 },
  brandText: { fontWeight: 800, fontSize: 20, letterSpacing: 0.3 },
  backBtn: {
    background: 'transparent',
    border: '1px solid #e5e5e5',
    borderRadius: 8,
    padding: '8px 14px',
    fontSize: 13,
    color: '#444',
    cursor: 'pointer',
  },

  title: { margin: '10px 0 6px', fontSize: 22, fontWeight: 700, color: '#0a0a0a' },

  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6 },
  input: {
    width: '100%',
    height: 42,
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #e6e6e6',
    outline: 'none',
    fontSize: 14,
    background: '#fff',
  },
  inputError: { border: '2px solid #ef4444' },
  showBtn: {
    position: 'absolute',
    right: 8,
    top: 32,
    background: 'transparent',
    border: 'none',
    color: '#666',
    cursor: 'pointer',
    padding: '6px 10px',
    fontSize: 13,
  },
  submitBtn: {
    width: '100%',
    height: 46,
    background: '#000',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontWeight: 700,
    fontSize: 15,
    cursor: 'pointer',
    marginTop: 10,
  },
  btnDisabled: { opacity: 0.65, cursor: 'not-allowed' },
  errorText: { display: 'block', marginTop: 6, color: '#ef4444', fontSize: 12 },
  formError: {
    marginTop: 14,
    color: '#b00020',
    background: '#ffecec',
    border: '1px solid #ffc7c7',
    padding: '10px 12px',
    borderRadius: 8,
    fontSize: 13,
  },
  footerRow: { marginTop: 'auto', paddingTop: 18, borderTop: '1px solid #eee' },
  smallText: { fontSize: 13, color: '#666' },
  inlineLink: {
    background: 'none',
    border: 'none',
    color: '#000',
    textDecoration: 'underline',
    cursor: 'pointer',
    fontSize: 13,
    padding: 0,
  },
};

/* Simple responsiveness */
const mq = `
@media (max-width: 900px) {
  .hide-photo { display: none !important; }
}
`;
export default LoginPage;
