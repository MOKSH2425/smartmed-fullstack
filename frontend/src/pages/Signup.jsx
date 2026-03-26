import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/useAuth';
import { getErrorMessage } from '../lib/api';

const Signup = () => {
  const navigate = useNavigate();
  const { signup, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (event) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSignup = async (event) => {
    event.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill in all fields.');
      return;
    }

    try {
      setLoading(true);
      await signup(formData);
      toast.success('Account created successfully.');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error, 'Signup failed.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <section className="auth-shell">
        <aside className="auth-panel__aside">
          <span className="auth-panel__badge">New patient onboarding</span>
          <h1 style={{ marginTop: '1rem', fontSize: 'clamp(2.2rem, 4vw, 3.4rem)' }}>
            Create your health workspace in minutes.
          </h1>
          <p>
            Register once to unlock appointment booking, symptom support, profile
            management, reports, and your ongoing care history.
          </p>

          <ul className="auth-panel__list">
            <li>
              <span className="feature-card__icon">A</span>
              <div>
                <strong>Account-ready dashboard</strong>
                <span>Your account opens directly into the product, not a dead-end success page.</span>
              </div>
            </li>
            <li>
              <span className="feature-card__icon">B</span>
              <div>
                <strong>Persistent records</strong>
                <span>Bookings and profile changes are saved through the backend and database.</span>
              </div>
            </li>
            <li>
              <span className="feature-card__icon">C</span>
              <div>
                <strong>Patient-centered flow</strong>
                <span>Everything stays connected from registration to follow-up care.</span>
              </div>
            </li>
          </ul>
        </aside>

        <section className="auth-panel__form">
          <span className="auth-panel__badge" style={{ background: 'var(--bg-soft)', color: 'var(--primary)' }}>
            Create account
          </span>
          <h2 style={{ marginTop: '1rem', fontSize: '2rem' }}>Join SmartMed</h2>
          <p className="section-subtitle">
            Fill in your details below and we&apos;ll create your account instantly.
          </p>

          <form className="auth-form" onSubmit={handleSignup}>
            <div>
              <label htmlFor="signup-name">Full name</label>
              <input
                id="signup-name"
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="signup-email">Email address</label>
              <input
                id="signup-email"
                type="email"
                name="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="signup-password">Password</label>
              <input
                id="signup-password"
                type="password"
                name="password"
                placeholder="At least 8 characters"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="btn" disabled={loading} style={{ opacity: loading ? 0.75 : 1 }}>
              {loading ? 'Creating account...' : 'Create SmartMed account'}
            </button>
          </form>

          <p className="auth-inline-note">
            Already registered?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
              Sign in instead
            </Link>
          </p>
        </section>
      </section>
    </main>
  );
};

export default Signup;
