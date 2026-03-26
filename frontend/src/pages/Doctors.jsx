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
        toast.error(getErrorMessage(error, 'Failed to load doctors.'));
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [selectedLocation, selectedSpecialty]);

  const locations = ['All', ...new Set(doctors.map((doctor) => doctor.location))];
  const specialties = ['All', ...new Set(doctors.map((doctor) => doctor.specialty))];

  const openBookingModal = (doctor) => {
    setSelectedDoctor(doctor);
    setSelectedDate('');
    setSelectedTime('');
    setShowModal(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedDate || !selectedTime || !selectedDoctor) {
      toast.error('Please select a date and time.');
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
      toast.error(getErrorMessage(error, 'Booking failed.'));
    } finally {
      setBooking(false);
    }
  };

  return (
    <main className="doctors-page">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="btn"
        style={{ width: 'fit-content' }}
      >
        Back to previous page
      </button>

      <section className="section-head">
        <div>
          <p className="section-subtitle" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 800 }}>
            Specialist network
          </p>
          <h1 className="section-title" style={{ marginTop: '0.4rem' }}>
            Book the right doctor with less friction.
          </h1>
          <p style={{ maxWidth: '42rem' }}>
            Filter by specialty or location, review each doctor&apos;s profile, and
            confirm a visit from the same screen.
          </p>
        </div>

        <div className="filter-bar">
          <div className="filter-chip">
            <label htmlFor="specialty-filter">Specialty</label>
            <select
              id="specialty-filter"
              value={selectedSpecialty}
              onChange={(event) => setSelectedSpecialty(event.target.value)}
            >
              {specialties.map((specialty) => (
                <option key={specialty} value={specialty}>
                  {specialty === 'All' ? 'All specialists' : specialty}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-chip">
            <label htmlFor="location-filter">Location</label>
            <select
              id="location-filter"
              value={selectedLocation}
              onChange={(event) => setSelectedLocation(event.target.value)}
            >
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location === 'All' ? 'All locations' : location}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {loading ? (
        <section className="card empty-state">
          <h3>Loading doctors...</h3>
          <p>Fetching specialist data from your backend.</p>
        </section>
      ) : doctors.length > 0 ? (
        <section className="doctor-grid">
          {doctors.map((doctor) => (
            <article key={doctor.id} className="card doctor-card">
              <div className="doctor-card__top">
                <div>
                  <p className="section-subtitle" style={{ marginTop: 0 }}>
                    {doctor.specialty}
                  </p>
                  <h3 style={{ marginTop: '0.25rem' }}>{doctor.name}</h3>
                </div>
                <span className="doctor-chip">{doctor.location}</span>
              </div>

              <div className="doctor-card__meta">
                <span className="doctor-chip">{doctor.exp} experience</span>
                <span className="doctor-chip">{doctor.rating} rating</span>
                <span className="doctor-chip">{doctor.clinic}</span>
              </div>

              <p>{doctor.about}</p>

              <button type="button" className="btn doctor-card__cta" onClick={() => openBookingModal(doctor)}>
                Book appointment
              </button>
            </article>
          ))}
        </section>
      ) : (
        <section className="card empty-state">
          <h3>No doctors match these filters</h3>
          <p>Try changing the specialty or location to broaden the search.</p>
        </section>
      )}

      {showModal && selectedDoctor && (
        <div className="booking-overlay">
          <div className="card booking-modal">
            <p className="section-subtitle" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 800 }}>
              Confirm visit
            </p>
            <h3 style={{ marginTop: '0.5rem' }}>{selectedDoctor.name}</h3>
            <p style={{ marginTop: '0.4rem' }}>
              {selectedDoctor.specialty} at {selectedDoctor.clinic}, {selectedDoctor.location}
            </p>

            <div style={{ marginTop: '1.4rem' }}>
              <label htmlFor="appointment-date" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700 }}>
                Appointment date
              </label>
              <input
                id="appointment-date"
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
              />
            </div>

            <div style={{ marginTop: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: 700 }}>
                Available slots
              </label>
              <div className="booking-slots">
                {selectedDoctor.availableSlots.map((time) => (
                  <button
                    key={time}
                    type="button"
                    className={`booking-slot${selectedTime === time ? ' booking-slot--selected' : ''}`}
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.9rem', marginTop: '1.6rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="hero-panel__secondary"
                style={{ color: 'var(--text-main)', borderColor: 'var(--border-soft)', background: 'transparent' }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn"
                onClick={handleConfirmBooking}
                disabled={booking}
                style={{ opacity: booking ? 0.75 : 1 }}
              >
                {booking ? 'Booking...' : 'Confirm booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Doctors;
