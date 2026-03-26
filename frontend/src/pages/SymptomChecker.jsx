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
      toast.error('Please enter a symptom.');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const data = await api.getSymptomRecommendation(symptom);

      if (data.found) {
        setResult(data);
        toast.success('Analysis complete.');
      } else {
        toast.error(data.message || 'No recommendation found.');
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to analyze symptoms.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="content-shell">
      <button type="button" onClick={() => navigate(-1)} className="btn" style={{ width: 'fit-content' }}>
        Back to previous page
      </button>

      <section className="support-grid">
        <div className="dashboard-hero">
          <p className="section-subtitle" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 800 }}>
            AI triage support
          </p>
          <h1 className="section-title" style={{ marginTop: '0.35rem' }}>
            Symptom checker
          </h1>
          <p>
            Describe what you are feeling and SmartMed will return a quick medicine
            suggestion, home advice, and a specialist direction.
          </p>
        </div>

        <section className="card content-card assistant-input">
          <div>
            <label htmlFor="symptom-input" style={{ display: 'block', marginBottom: '0.6rem', fontWeight: 700 }}>
              Enter a symptom
            </label>
            <input
              id="symptom-input"
              type="text"
              placeholder="Examples: fever, headache, cold, acidity"
              value={symptom}
              onChange={(event) => setSymptom(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && getRecommendation()}
            />
          </div>

          <button type="button" onClick={getRecommendation} disabled={loading} className="btn" style={{ opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Analyzing...' : 'Get advice'}
          </button>
        </section>
      </section>

      {result && (
        <section className="card assistant-result">
          <h3>Recommendation</h3>

          <div className="info-list" style={{ marginTop: '1rem' }}>
            <div className="info-field">
              <label>Medicine</label>
              <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-main)' }}>{result.medicine}</p>
            </div>

            <div className="info-field">
              <label>Suggested specialist</label>
              <p style={{ margin: 0, fontWeight: 700, color: 'var(--primary)' }}>{result.visit}</p>
            </div>

            <div className="info-field info-field--wide">
              <label>Home advice</label>
              <p style={{ margin: 0 }}>{result.advice}</p>
            </div>

            <div className="info-field">
              <label>Severity</label>
              <p style={{ margin: 0 }}>{result.severity}</p>
            </div>

            <div className="info-field info-field--wide">
              <label>Disclaimer</label>
              <p style={{ margin: 0 }}>{result.disclaimer}</p>
            </div>
          </div>
        </section>
      )}
    </main>
  );
};

export default SymptomChecker;
