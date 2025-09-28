import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';

const LoginPage = ({ setCurrentPage }) => {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      setCurrentPage('dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-bg">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
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
        <button type="submit" disabled={loading}>Login</button>
        {error && <div className="error">{error}</div>}
        <div className="login-footer">
          <button
            onClick={() => setCurrentPage('signup')}
            disabled={loading}
            className="signup-button"
          >
            Create account
          </button>
          <button
            onClick={() => setCurrentPage('forgot-password')}
            disabled={loading}
            className="forgot-password-button"
          >
            Forgot password?
          </button>
        </div>
      </form>
      <style jsx>{`
        .login-bg {
          min-height: 100vh;
          width: 100vw;
          background: url('./modern-house.jpg') center center/cover no-repeat;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .login-form {
          background: rgba(255,255,255,0.85);
          padding: 2rem 2.5rem;
          border-radius: 12px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.12);
          display: flex;
          flex-direction: column;
          gap: 1rem;
          min-width: 320px;
        }
        .login-form input {
          padding: 0.75rem;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 1rem;
        }
        .login-form button {
          padding: 0.75rem;
          background: #222;
          color: #fff;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          cursor: pointer;
        }
        .error {
          color: #c00;
          font-size: 0.95rem;
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;