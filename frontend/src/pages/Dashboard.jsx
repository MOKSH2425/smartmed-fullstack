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

          <div className="dashboard-badge">
            Full-stack mode active
          </div>
        </div>

        <div className="dashboard-badges">
          <div className="dashboard-badge">MongoDB-backed records</div>
          <div className="dashboard-badge">Protected patient routes</div>
          <div className="dashboard-badge">Live booking workflow</div>
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
