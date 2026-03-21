import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api, getErrorMessage } from '../lib/api';

const AppointmentHistory = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const data = await api.getAppointments();
        setAppointments(data.appointments);
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to load appointments."));
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, []);

  return (
    <main style={{ padding: '2rem', maxWidth: '800px', margin: 'auto' }}>
      <button onClick={() => navigate(-1)} className="btn" style={{ marginBottom: '1rem', background: 'transparent', color: 'var(--text-color)', border: '1px solid var(--border-color)' }}>Back</button>

      <h2 style={{ marginBottom: '2rem', textAlign: 'center', color: 'var(--primary)' }}>Appointment History</h2>

      {loading ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <h3>Loading appointments...</h3>
          <p>Please wait while we sync your booking history.</p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <h3>No appointments yet</h3>
          <p>Book your first doctor&apos;s visit today.</p>
          <button onClick={() => navigate('/doctors')} className="btn" style={{ marginTop: '1rem' }}>Book Now</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {appointments.map((appt) => (
            <div key={appt.id} className="card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', textAlign: 'left' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{appt.doctorName}</h3>
                <p style={{ margin: '0.2rem 0', color: 'var(--primary)', fontWeight: '500' }}>{appt.specialty}</p>
                <small style={{ opacity: 0.7 }}>{appt.date} at {appt.time}</small>
                <p style={{ margin: '0.4rem 0 0', opacity: 0.7, fontSize: '0.85rem' }}>{appt.location}</p>
              </div>

              <span style={{
                padding: '0.4rem 1rem',
                borderRadius: '99px',
                fontSize: '0.9rem',
                fontWeight: '600',
                backgroundColor: appt.status === 'Upcoming' ? '#dcfce7' : '#f3f4f6',
                color: appt.status === 'Upcoming' ? '#166534' : '#374151'
              }}>
                {appt.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default AppointmentHistory;
