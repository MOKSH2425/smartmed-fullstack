import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api, getErrorMessage } from '../lib/api';

const SymptomChecker = () => {
  const navigate = useNavigate();
  const [symptom, setSymptom] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const getRecommendation = async () => {
    if (!symptom) {
      toast.error("Please enter a symptom.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const data = await api.getSymptomRecommendation(symptom);

      if (data.found) {
        setResult(data);
        toast.success("Analysis complete.");
      } else {
        toast.error(data.message || "No recommendation found.");
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to analyze symptoms."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
      <button onClick={() => navigate(-1)} className="btn" style={{ marginBottom: '1rem', background: 'transparent', color: 'var(--text-color)', border: '1px solid var(--border-color)' }}>Back</button>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ color: 'var(--primary)', margin: 0 }}>AI Health Assistant</h2>
        <p style={{ opacity: 0.7 }}>Tell me what you are feeling.</p>
      </div>

      <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input
          type="text"
          placeholder="e.g. fever, headache, cold, acidity..."
          value={symptom}
          onChange={(e) => setSymptom(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && getRecommendation()}
          style={{ padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)', fontSize: '1.1rem' }}
        />

        <button onClick={getRecommendation} disabled={loading} className="btn" style={{ padding: '1rem', fontSize: '1.1rem', opacity: loading ? 0.7 : 1 }}>
          {loading ? "Analyzing..." : "Get Advice"}
        </button>
      </div>

      {result && (
        <div className="card" style={{ marginTop: '2rem', padding: '2rem', borderLeft: '5px solid var(--accent)', animation: 'fadeIn 0.5s ease', textAlign: 'left' }}>
          <h3 style={{ marginTop: 0, color: 'var(--primary)' }}>Recommendation</h3>

          <div style={{ marginBottom: '1rem' }}>
            <span style={{ opacity: 0.6, fontSize: '0.9rem' }}>Medicine:</span>
            <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>{result.medicine}</p>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <span style={{ opacity: 0.6, fontSize: '0.9rem' }}>Home Advice:</span>
            <p style={{ margin: 0, fontSize: '1.1rem' }}>{result.advice}</p>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <span style={{ opacity: 0.6, fontSize: '0.9rem' }}>Suggested Specialist:</span>
            <p style={{ margin: 0, color: 'var(--accent)', fontWeight: 'bold' }}>{result.visit}</p>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <span style={{ opacity: 0.6, fontSize: '0.9rem' }}>Severity:</span>
            <p style={{ margin: 0 }}>{result.severity}</p>
          </div>

          <p style={{ marginBottom: 0, fontSize: '0.85rem', opacity: 0.7 }}>{result.disclaimer}</p>
        </div>
      )}
    </main>
  );
};

export default SymptomChecker;
