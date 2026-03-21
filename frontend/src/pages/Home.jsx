import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <main className="hero" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--primary)' }}>
        Your Health, Simplified.
      </h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: 'var(--text-color)', opacity: 0.8 }}>
        Book doctors, track symptoms, and manage your history—all in one place.
      </p>
      
      {/* Button now sends you to the Login Page */}
      <button 
        onClick={() => navigate('/login')} 
        className="btn" 
        style={{ fontSize: '1.2rem', padding: '1rem 2.5rem' }}
      >
        Get Started / Login
      </button>

      <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
        <div className="card" style={{ padding: '1.5rem', width: '200px' }}>
          <span style={{ fontSize: '2rem' }}>⚡</span>
          <h3>Fast Booking</h3>
        </div>
        <div className="card" style={{ padding: '1.5rem', width: '200px' }}>
          <span style={{ fontSize: '2rem' }}>🔒</span>
          <h3>Secure Data</h3>
        </div>
        <div className="card" style={{ padding: '1.5rem', width: '200px' }}>
          <span style={{ fontSize: '2rem' }}>🤖</span>
          <h3>AI Support</h3>
        </div>
      </div>
    </main>
  );
};

export default Home;