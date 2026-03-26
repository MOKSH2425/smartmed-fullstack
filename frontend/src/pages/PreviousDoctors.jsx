import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api, getErrorMessage } from '../lib/api';

const PreviousDoctors = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const data = await api.getPreviousDoctors();
        setDoctors(data.doctors);
      } catch (error) {
        toast.error(getErrorMessage(error, 'Failed to load previous doctors.'));
      } finally {
        setLoading(false);
      }
    };

    loadDoctors();
  }, []);

  return (
    <main className="content-shell">
      <button type="button" onClick={() => navigate(-1)} className="btn" style={{ width: 'fit-content' }}>
        Back to previous page
      </button>

      <section className="dashboard-hero">
        <p className="section-subtitle" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 800 }}>
          Continuing care
        </p>
        <h1 className="section-title" style={{ marginTop: '0.35rem' }}>
          Your care team
        </h1>
        <p>
          Revisit the doctors you have already consulted and quickly move into a
          follow-up booking or support flow.
        </p>
      </section>

      {loading ? (
        <section className="card content-card">
          <p>Loading your care team...</p>
        </section>
      ) : doctors.length === 0 ? (
        <section className="card content-card empty-state">
          <h3>No previous doctors yet</h3>
          <p>Book a doctor to start building your connected care history.</p>
        </section>
      ) : (
        <section className="doctor-grid">
          {doctors.map((doctor) => (
            <article key={doctor.id} className="card doctor-card">
              <div className="doctor-card__top">
                <div>
                  <p className="section-subtitle">{doctor.specialty}</p>
                  <h3 style={{ marginTop: '0.25rem' }}>{doctor.name}</h3>
                </div>
                <span className="doctor-chip">{doctor.rating}</span>
              </div>

              <div className="doctor-card__meta">
                <span className="doctor-chip">{doctor.clinic}</span>
                <span className="doctor-chip">{doctor.location}</span>
                <span className="doctor-chip">Last visit {doctor.lastVisit}</span>
              </div>

              <div className="inline-actions doctor-card__cta">
                <button type="button" className="btn" onClick={() => navigate('/doctors')}>
                  Book again
                </button>
                <button
                  type="button"
                  className="hero-panel__secondary"
                  style={{ color: 'var(--text-main)', borderColor: 'var(--border-soft)', background: 'transparent' }}
                  onClick={() => navigate('/chat')}
                >
                  Open chat
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
};

export default PreviousDoctors;
