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
        toast.error(getErrorMessage(error, 'Failed to load appointments.'));
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, []);

  return (
    <main className="content-shell">
      <button type="button" onClick={() => navigate(-1)} className="btn" style={{ width: 'fit-content' }}>
        Back to previous page
      </button>

      <section className="dashboard-hero">
        <p className="section-subtitle" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 800 }}>
          Care timeline
        </p>
        <h1 className="section-title" style={{ marginTop: '0.35rem' }}>
          Appointment history
        </h1>
        <p>
          Review upcoming and completed visits, and jump back into booking whenever
          you need another consultation.
        </p>
      </section>

      {loading ? (
        <section className="card content-card empty-state">
          <h3>Loading appointments...</h3>
          <p>Please wait while we sync your booking history.</p>
        </section>
      ) : appointments.length === 0 ? (
        <section className="card content-card empty-state">
          <h3>No appointments yet</h3>
          <p>Book your first doctor visit to start your care history.</p>
          <button type="button" onClick={() => navigate('/doctors')} className="btn" style={{ marginTop: '1rem' }}>
            Book a doctor
          </button>
        </section>
      ) : (
        <section className="history-list">
          {appointments.map((appointment) => {
            const isUpcoming = appointment.status === 'Upcoming';

            return (
              <article key={appointment.id} className="card history-item">
                <div>
                  <h3>{appointment.doctorName}</h3>
                  <p style={{ marginTop: '0.3rem' }}>{appointment.specialty}</p>
                  <p style={{ marginTop: '0.4rem' }}>
                    {appointment.date} at {appointment.time}
                  </p>
                  <p style={{ marginTop: '0.25rem' }}>{appointment.location}</p>
                </div>
                <span className={`status-pill ${isUpcoming ? 'status-pill--upcoming' : 'status-pill--complete'}`}>
                  {appointment.status}
                </span>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
};

export default AppointmentHistory;
