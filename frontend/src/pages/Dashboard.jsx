import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <main style={{ padding: '2rem', width: '95%', margin: '0 auto', minHeight: '80vh' }}>
      
      <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2rem' }}>
        Welcome to SMARTMED
      </h2>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '2rem',
        width: '100%'
      }}>
        
        <Link to="/symptom" className="card" style={{ textDecoration: 'none', color: 'inherit', padding: '2rem' }}>
          <h3>🩺 Symptom Checker</h3>
          <p>Check your symptoms and get medicine recommendations.</p>
        </Link>

        <Link to="/doctors" className="card" style={{ textDecoration: 'none', color: 'inherit', padding: '2rem' }}>
          <h3>👨‍⚕️ Find Doctors</h3>
          <p>Browse doctors and book an appointment easily.</p>
        </Link>

        <Link to="/history" className="card" style={{ textDecoration: 'none', color: 'inherit', padding: '2rem' }}>
          <h3>📜 Appointment History</h3>
          <p>View your past appointments in detail.</p>
        </Link>

        <Link to="/previous" className="card" style={{ textDecoration: 'none', color: 'inherit', padding: '2rem' }}>
          <h3>👩‍⚕️ Previous Doctors</h3>
          <p>See the doctors you’ve previously consulted.</p>
        </Link>

        <Link to="/report" className="card" style={{ textDecoration: 'none', color: 'inherit', padding: '2rem' }}>
          <h3>📄 Medical Report</h3>
          <p>Access your medical report for reference.</p>
        </Link>

        <Link to="/chat" className="card" style={{ textDecoration: 'none', color: 'inherit', padding: '2rem', border: '2px solid #2563eb' }}>
          <h3>💬 AI Health Chat</h3>
          <p>Chat instantly with our AI assistant for quick advice.</p>
        </Link>

      </div>
    </main>
  );
};

export default Dashboard;