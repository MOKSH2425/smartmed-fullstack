import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const dashboardItems = [
  {
    to: '/symptom',
    kicker: 'AI support',
    title: 'Symptom checker',
    description: 'Describe what you are feeling and get quick recommendations with next-step guidance.',
  },
  {
    to: '/doctors',
    kicker: 'Appointments',
    title: 'Find doctors',
    description: 'Browse specialists, compare locations, and move straight into booking.',
  },
  {
    to: '/history',
    kicker: 'Past care',
    title: 'Appointment history',
    description: 'Review the visits you have already booked and keep your care journey visible.',
  },
  {
    to: '/previous',
    kicker: 'Continuity',
    title: 'Previous doctors',
    description: 'See the doctors you have already consulted so follow-up care feels easier.',
  },
  {
    to: '/report',
    kicker: 'Records',
    title: 'Medical reports',
    description: 'Open and download stored reports whenever you need them.',
  },
  {
    to: '/chat',
    kicker: 'Conversation',
    title: 'AI health chat',
    description: 'Ask quick questions and get guided responses inside your care workspace.',
  },
];

const techStack = [
  {
    label: 'React 19',
    detail: 'Frontend UI',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6">
        <ellipse cx="12" cy="12" rx="10" ry="4.2" />
        <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(120 12 12)" />
        <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: 'Node.js + Express',
    detail: 'API server',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M12 2 3 7v10l9 5 9-5V7Z" />
        <path d="M8 12h8" />
      </svg>
    ),
  },
  {
    label: 'MongoDB',
    detail: 'Database',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M12 3c3 3 4.5 6.2 4.5 9.4A4.5 4.5 0 0 1 12 17a4.5 4.5 0 0 1-4.5-4.6C7.5 9.2 9 6 12 3Z" />
        <path d="M12 17v4" />
      </svg>
    ),
  },
  {
    label: 'JWT Auth',
    detail: 'Protected routes',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="5" y="11" width="14" height="9" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      </svg>
    ),
  },
];

const Dashboard = () => {
  const { user } = useAuth();
  const firstName = user?.name?.trim()?.split(' ')[0] || 'there';

  return (
    <main>
      <section className="dashboard-hero">
        <div className="dashboard-hero__row">
          <div>
            <p className="section-subtitle" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 800 }}>
              Patient dashboard
            </p>
            <h1 className="section-title" style={{ marginTop: '0.4rem' }}>
              Welcome back, {firstName}.
            </h1>
            <p style={{ maxWidth: '42rem' }}>
              Everything important is one step away, from symptom triage and doctor
              discovery to history, reports, and profile updates.
            </p>
          </div>

          <div className="dashboard-live-pill">
            <span className="dashboard-live-dot" />
            Live full-stack app
          </div>
        </div>

        <div className="tech-strip">
          <span className="tech-strip__label">Built with</span>
          <div className="tech-strip__items">
            {techStack.map((tech) => (
              <div key={tech.label} className="tech-chip">
                <span className="tech-chip__icon">{tech.icon}</span>
                <span className="tech-chip__text">
                  <strong>{tech.label}</strong>
                  <span>{tech.detail}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="dashboard-grid">
        {dashboardItems.map((item) => (
          <Link key={item.to} to={item.to} className="card dashboard-card">
            <span className="dashboard-card__kicker">{item.kicker}</span>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <span className="dashboard-card__arrow">Open module</span>
          </Link>
        ))}
      </section>
    </main>
  );
};

export default Dashboard;
