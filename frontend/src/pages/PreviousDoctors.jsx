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
        toast.error(getErrorMessage(error, "Failed to load previous doctors."));
      } finally {
        setLoading(false);
      }
    };

    loadDoctors();
  }, []);

  return (
    <main style={{ padding: '2rem', maxWidth: '1000px', margin: 'auto' }}>
      <button
        onClick={() => navigate(-1)}
        className="btn"
        style={{
          background: 'transparent',
          color: '#4b5563',
          padding: '0.5rem 0',
          marginBottom: '1rem',
          boxShadow: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          width: 'fit-content',
          cursor: 'pointer'
        }}
      >
        Back
      </button>

      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2>Your Care Team</h2>
        <p>Quickly review the doctors you have previously consulted.</p>
      </div>

      {loading ? (
        <div className="card" style={{ padding: '2rem' }}>
          <p>Loading your care team...</p>
        </div>
      ) : doctors.length === 0 ? (
        <div className="card" style={{ padding: '2rem' }}>
          <p>You have not consulted any doctors yet. Book a visit to start building your care history.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {doctors.map((doctor) => (
            <div key={doctor.id} className="card" style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h3 style={{ margin: 0 }}>{doctor.name}</h3>
                  <p style={{ color: '#2563eb', fontWeight: '600', margin: '0.25rem 0' }}>{doctor.specialty}</p>
                </div>
                <span style={{ background: '#f3f4f6', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                  {doctor.rating}
                </span>
              </div>

              <div style={{ margin: '1rem 0', fontSize: '0.9rem', color: '#4b5563' }}>
                <p><strong>Clinic:</strong> {doctor.clinic}</p>
                <p><strong>Last Visited:</strong> {doctor.lastVisit}</p>
                <p><strong>Location:</strong> {doctor.location}</p>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  className="btn"
                  style={{ flex: 1 }}
                  onClick={() => navigate('/doctors')}
                >
                  Book Again
                </button>

                <button
                  className="btn"
                  style={{ flex: 1, background: 'white', border: '1px solid #d1d5db', color: '#374151' }}
                  onClick={() => navigate('/chat')}
                >
                  Chat
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default PreviousDoctors;
