import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <main className="hero-page">
      <section className="hero-panel">
        <span className="hero-panel__eyebrow">Smart healthcare workspace</span>
        <h1 className="hero-panel__title">Healthcare management that feels calm, fast, and clear.</h1>
        <p className="hero-panel__text">
          SmartMed helps patients move from symptom checks to appointments, reports,
          and follow-up care without bouncing between disconnected tools.
        </p>

        <div className="hero-panel__actions">
          <button type="button" className="btn" onClick={() => navigate('/signup')}>
            Start your care journey
          </button>
          <Link to="/login" className="hero-panel__secondary">
            Login to your account
          </Link>
        </div>

        <div className="hero-metrics">
          <div className="hero-metric">
            <strong>One place</strong>
            <span>Appointments, records, and symptom support in one flow.</span>
          </div>
          <div className="hero-metric">
            <strong>Live data</strong>
            <span>Profile updates and bookings persist through the full backend.</span>
          </div>
          <div className="hero-metric">
            <strong>Patient-ready</strong>
            <span>Built for everyday use, not just a static demo screen.</span>
          </div>
        </div>
      </section>

      <section className="feature-grid">
        <article className="feature-card">
          <span className="feature-card__icon">AP</span>
          <h3>Appointment-first flow</h3>
          <p>
            Browse specialists, filter by location or field, and confirm visits with
            a clean booking experience.
          </p>
        </article>

        <article className="feature-card">
          <span className="feature-card__icon">AI</span>
          <h3>Symptom and chat support</h3>
          <p>
            Users can ask questions, get guidance, and discover likely care paths
            before booking the next step.
          </p>
        </article>

        <article className="feature-card">
          <span className="feature-card__icon">MR</span>
          <h3>Medical history that stays connected</h3>
          <p>
            Reports, previous doctors, and profile details stay accessible so the
            user always sees the same journey.
          </p>
        </article>
      </section>
    </main>
  );
};

export default Home;
