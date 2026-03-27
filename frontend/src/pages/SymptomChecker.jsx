import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api, getErrorMessage } from '../lib/api';

const quickSymptoms = [
  'fever',
  'cough',
  'body ache',
  'headache',
  'burning while peeing',
  'itchy skin',
  'red eyes',
  'acidity',
];

const modeLabels = {
  condition_match: 'Condition match',
  fallback: 'Fallback guidance',
  unknown: 'Need more details',
  emergency: 'Urgent warning',
};

const SymptomChecker = () => {
  const navigate = useNavigate();
  const [symptom, setSymptom] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setHistoryLoading(true);
        const data = await api.getSymptomHistory();
        setHistory(data.history || []);
      } catch (error) {
        toast.error(getErrorMessage(error, 'Failed to load recommendation history.'));
      } finally {
        setHistoryLoading(false);
      }
    };

    loadHistory();
  }, []);

  const appendQuickSymptom = (value) => {
    setSymptom((current) => {
      const trimmed = current.trim();
      if (!trimmed) {
        return value;
      }

      if (trimmed.toLowerCase().includes(value.toLowerCase())) {
        return current;
      }

      return `${trimmed}, ${value}`;
    });
  };

  const getRecommendation = async () => {
    if (!symptom.trim()) {
      toast.error('Please enter one or more symptoms.');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const data = await api.getSymptomRecommendation(symptom);

      if (data.found) {
        setResult(data);
        if (data.historyEntry) {
          setHistory((current) => [data.historyEntry, ...current].slice(0, 12));
        }
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

  const isEmergency = result?.mode === 'emergency';

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
            Enter one or more symptoms and SmartMed will score likely conditions,
            show matched symptom patterns, surface fallback guidance, and highlight
            red-flag warnings when needed.
          </p>
        </div>

        <section className="card content-card assistant-input">
          <div>
            <label htmlFor="symptom-input" style={{ display: 'block', marginBottom: '0.6rem', fontWeight: 700 }}>
              Enter symptoms
            </label>
            <input
              id="symptom-input"
              type="text"
              placeholder="Examples: fever, cough, body ache or itchy skin and redness"
              value={symptom}
              onChange={(event) => setSymptom(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && getRecommendation()}
            />
          </div>

          <div>
            <p className="section-subtitle" style={{ marginBottom: '0.6rem' }}>
              Quick symptom starters
            </p>
            <div className="symptom-chip-row">
              {quickSymptoms.map((item) => (
                <button
                  key={item}
                  type="button"
                  className="symptom-chip"
                  onClick={() => appendQuickSymptom(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <button type="button" onClick={getRecommendation} disabled={loading} className="btn" style={{ opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Analyzing...' : 'Analyze symptoms'}
          </button>
        </section>
      </section>

      {result && (
        <section className="card assistant-result">
          <div className="result-head">
            <div>
              <p className="section-subtitle" style={{ marginTop: 0 }}>
                {result.confidence ? `${result.confidence} confidence` : 'triage result'}
              </p>
              <h3 style={{ marginTop: '0.35rem' }}>{result.symptom}</h3>
            </div>
            <span className={`result-mode-badge${isEmergency ? ' result-mode-badge--emergency' : ''}`}>
              {modeLabels[result.mode] || 'Recommendation'}
            </span>
          </div>

          {result.matchedSymptoms?.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                Matched symptoms
              </label>
              <div className="pill-row">
                {result.matchedSymptoms.map((item) => (
                  <span key={item} className="soft-pill">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.bodySystems?.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                Body system focus
              </label>
              <div className="pill-row">
                {result.bodySystems.map((item) => (
                  <span key={item} className="soft-pill">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="result-grid">
            <div className="result-card">
              <label style={{ display: 'block', marginBottom: '0.45rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                Suggested action
              </label>
              <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-main)' }}>{result.visit}</p>
            </div>

            <div className="result-card">
              <label style={{ display: 'block', marginBottom: '0.45rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                Severity / urgency
              </label>
              <p style={{ margin: 0, fontWeight: 700, color: isEmergency ? '#dc2626' : 'var(--text-main)' }}>
                {result.severity}
                {result.urgency ? ` - ${result.urgency}` : ''}
              </p>
            </div>

            <div className="result-card">
              <label style={{ display: 'block', marginBottom: '0.45rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                Medicine guidance
              </label>
              <p style={{ margin: 0 }}>{result.medicine}</p>
            </div>

            <div className="result-card">
              <label style={{ display: 'block', marginBottom: '0.45rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                Home advice
              </label>
              <p style={{ margin: 0 }}>{result.advice}</p>
            </div>
          </div>

          {result.alternatives?.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                Alternative matches
              </label>
              <div className="pill-row">
                {result.alternatives.map((item) => (
                  <span key={item.key} className="soft-pill">
                    {item.name} ({item.score})
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.explanation?.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                Why this recommendation appeared
              </label>
              <ul className="list-block">
                {result.explanation.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {result.possibleAreas?.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                Related areas
              </label>
              <div className="pill-row">
                {result.possibleAreas.map((item) => (
                  <span key={item} className="soft-pill">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.45rem', fontWeight: 800, color: 'var(--text-muted)' }}>
              Disclaimer
            </label>
            <p style={{ margin: 0 }}>{result.disclaimer}</p>
          </div>
        </section>
      )}

      <section className="card content-card">
        <div className="result-head">
          <div>
            <p className="section-subtitle" style={{ marginTop: 0 }}>
              Stored on your account
            </p>
            <h3 style={{ marginTop: '0.35rem' }}>Recent symptom analyses</h3>
          </div>
        </div>

        {historyLoading ? (
          <p style={{ marginTop: '1rem' }}>Loading your recent analyses...</p>
        ) : history.length === 0 ? (
          <p style={{ marginTop: '1rem' }}>
            Your recommendation history will appear here after you analyze symptoms.
          </p>
        ) : (
          <div className="history-mini-list" style={{ marginTop: '1rem' }}>
            {history.map((item, index) => (
              <article key={`${item.query}-${item.createdAt || index}`} className="history-mini-item">
                <div className="result-head">
                  <div>
                    <p className="section-subtitle" style={{ marginTop: 0 }}>
                      {item.confidence || item.mode}
                    </p>
                    <h4 style={{ marginTop: '0.2rem' }}>{item.symptom}</h4>
                  </div>
                  <span className={`result-mode-badge${item.mode === 'emergency' ? ' result-mode-badge--emergency' : ''}`}>
                    {modeLabels[item.mode] || 'Recommendation'}
                  </span>
                </div>
                <p style={{ marginTop: '0.55rem' }}>
                  <strong>Input:</strong> {item.query}
                </p>
                <p style={{ marginTop: '0.25rem' }}>
                  <strong>Action:</strong> {item.visit}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default SymptomChecker;
