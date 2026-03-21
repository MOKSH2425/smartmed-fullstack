import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api, getErrorMessage } from '../lib/api';

const Doctors = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const data = await api.getDoctors({
          location: selectedLocation,
          specialty: selectedSpecialty,
        });
        setDoctors(data.doctors);
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to load doctors."));
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [selectedLocation, selectedSpecialty]);

  const locations = ['All', ...new Set(doctors.map((doc) => doc.location))];
  const specialties = ['All', ...new Set(doctors.map((doc) => doc.specialty))];

  const openBookingModal = (doctor) => {
    setSelectedDoctor(doctor);
    setSelectedDate('');
    setSelectedTime('');
    setShowModal(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedDate || !selectedTime || !selectedDoctor) {
      toast.error("Please select a date and time.");
      return;
    }

    try {
      setBooking(true);
      await api.createAppointment({
        doctorId: selectedDoctor.id,
        date: selectedDate,
        time: selectedTime,
      });
      toast.success(`Booked with ${selectedDoctor.name}.`);
      setShowModal(false);
      navigate('/history');
    } catch (error) {
      toast.error(getErrorMessage(error, "Booking failed."));
    } finally {
      setBooking(false);
    }
  };

  return (
    <main style={{ padding: '2rem', position: 'relative', maxWidth: '1200px', margin: 'auto' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <button onClick={() => navigate(-1)} className="btn" style={{ width: 'fit-content', background: 'transparent', color: 'var(--text-color)', border: '1px solid var(--border-color)' }}>Back</button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ color: 'var(--primary)', margin: 0 }}>Find a Specialist</h2>
            <p style={{ margin: 0, opacity: 0.7 }}>
              {loading ? "Connecting to server..." : "Book appointments with top doctors near you."}
            </p>
          </div>

          {!loading && (
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-color)', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid var(--primary)' }}>
                <span>Specialty</span>
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  style={{ border: 'none', background: 'transparent', color: 'var(--text-color)', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer', outline: 'none' }}
                >
                  {specialties.map((spec) => (
                    <option key={spec} value={spec} style={{ background: 'var(--bg-color)' }}>{spec === 'All' ? 'All Specialists' : spec}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-color)', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid var(--primary)' }}>
                <span>Location</span>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  style={{ border: 'none', background: 'transparent', color: 'var(--text-color)', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer', outline: 'none' }}
                >
                  {locations.map((loc) => (
                    <option key={loc} value={loc} style={{ background: 'var(--bg-color)' }}>{loc === 'All' ? 'All Locations' : loc}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <h3>Loading doctors...</h3>
          <p>Fetching live data from your backend.</p>
        </div>
      ) : doctors.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {doctors.map((doc) => (
            <div key={doc.id} className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', position: 'relative', overflow: 'hidden', textAlign: 'left' }}>
              <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'flex-end' }}>
                <span style={{ background: 'rgba(34, 211, 238, 0.1)', color: 'var(--primary)', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                  {doc.location}
                </span>
              </div>

              <h3 style={{ margin: 0 }}>{doc.name}</h3>
              <p style={{ margin: 0, color: 'var(--primary)', fontWeight: '600' }}>
                {doc.specialty}
              </p>

              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', opacity: 0.7 }}>
                <span>{doc.exp} Exp</span>
                <span>{doc.rating} Rating</span>
              </div>

              <p style={{ margin: 0, opacity: 0.75, fontSize: '0.92rem' }}>{doc.clinic}</p>
              <p style={{ margin: 0, opacity: 0.7, fontSize: '0.9rem' }}>{doc.about}</p>

              <button onClick={() => openBookingModal(doc)} className="btn" style={{ marginTop: '1rem' }}>Book Visit</button>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem', opacity: 0.6 }}>
          <h3>No matches found</h3>
          <p>Try changing your filters.</p>
        </div>
      )}

      {showModal && selectedDoctor && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 2000, padding: '1rem'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
            <h3 style={{ marginTop: 0, color: 'var(--primary)' }}>Book Appointment</h3>
            <p style={{ marginBottom: '0.5rem' }}>with <strong>{selectedDoctor.name}</strong></p>
            <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem', opacity: 0.8 }}>{selectedDoctor.specialty} <br /> {selectedDoctor.location}</p>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Select Date</label>
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }} />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Select Time Slot</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {selectedDoctor.availableSlots.map((time) => (
                  <button key={time} onClick={() => setSelectedTime(time)} style={{ padding: '0.5rem 0.8rem', borderRadius: '8px', border: '1px solid var(--primary)', background: selectedTime === time ? 'var(--primary)' : 'transparent', color: selectedTime === time ? 'white' : 'var(--primary)', cursor: 'pointer', transition: '0.2s', fontSize: '0.85rem' }}>{time}</button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '0.8rem', borderRadius: '99px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-color)', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleConfirmBooking} className="btn" style={{ flex: 1, opacity: booking ? 0.75 : 1 }} disabled={booking}>{booking ? 'Booking...' : 'Confirm'}</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Doctors;
