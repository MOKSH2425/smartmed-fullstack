import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/useAuth';
import { getErrorMessage } from '../lib/api';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (event) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields.');
      return;
    }

    try {
      setLoading(true);
      await login(formData);
      toast.success('Login successful. Welcome back.');
      const nextPath = location.state?.from?.pathname || '/dashboard';
      navigate(nextPath, { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error, 'Login failed.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <section className="auth-shell">
        <aside className="auth-panel__aside">
          <span className="auth-panel__badge">Existing patient access</span>
          <h1 style={{ marginTop: '1rem', fontSize: 'clamp(2.2rem, 4vw, 3.4rem)' }}>
            Welcome back to your care dashboard.
          </h1>
          <p>
            Sign in to manage appointments, review reports, talk to the AI assistant,
            and keep your medical details up to date.
          </p>

          <ul className="auth-panel__list">
            <li>
              <span className="feature-card__icon">01</span>
              <div>
                <strong>Secure account recovery</strong>
                <span>Your session restores cleanly when you refresh and come back.</span>
              </div>
            </li>
            <li>
              <span className="feature-card__icon">02</span>
              <div>
                <strong>Unified patient timeline</strong>
                <span>Appointments, previous doctors, and reports stay in one place.</span>
              </div>
            </li>
            <li>
              <span className="feature-card__icon">03</span>
              <div>
                <strong>Fast next actions</strong>
                <span>Move straight from the dashboard into booking or symptom support.</span>
              </div>
            </li>
          </ul>
        </aside>

        <section className="auth-panel__form">
          <span className="auth-panel__badge" style={{ background: 'var(--bg-soft)', color: 'var(--primary)' }}>
            Sign in
          </span>
          <h2 style={{ marginTop: '1rem', fontSize: '2rem' }}>Access SmartMed</h2>
          <p className="section-subtitle">
            Use your email and password to continue into your dashboard.
          </p>

          <form className="auth-form" onSubmit={handleLogin}>
            <div>
              <label htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                type="email"
                name="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="btn" disabled={loading} style={{ opacity: loading ? 0.75 : 1 }}>
              {loading ? 'Signing in...' : 'Sign in to SmartMed'}
            </button>
          </form>

          <div className="demo-strip">
            Demo access: <strong>demo@smartmed.app</strong> / <strong>Demo@12345</strong>
          </div>

          <p className="auth-inline-note">
            Don&apos;t have an account yet?{' '}
            <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
              Create one here
            </Link>
          </p>
        </section>
      </section>
    </main>
  );
};

export default Login;
