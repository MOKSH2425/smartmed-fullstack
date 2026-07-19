import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api, getErrorMessage } from '../lib/api';

const MedicalReports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const data = await api.getReports();
        setReports(data.reports);
      } catch (error) {
        toast.error(getErrorMessage(error, 'Failed to load reports.'));
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  const handleDownload = async (report) => {
    try {
      setDownloadingId(report.id);
      await api.downloadReport(report.id, report.title);
      toast.success(`Downloaded ${report.title}.`);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Download failed.'));
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <main className="content-shell">
      <button type="button" onClick={() => navigate(-1)} className="btn" style={{ width: 'fit-content' }}>
        Back to previous page
      </button>

      <section className="dashboard-hero">
        <p className="section-subtitle" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 800 }}>
          Digital records
        </p>
        <h1 className="section-title" style={{ marginTop: '0.35rem' }}>
          Medical reports
        </h1>
        <p>
          Open and download your health documents from one secure workspace whenever
          you need them.
        </p>
      </section>

      {loading ? (
        <section className="card content-card">
          <p>Loading your reports...</p>
        </section>
      ) : reports.length === 0 ? (
        <section className="card content-card empty-state">
          <h3>No reports yet</h3>
          <p>
            Reports are generated automatically once you run the Symptom Checker
            and it finds a confident match — nothing is pre-filled here.
          </p>
          <button
            type="button"
            className="btn"
            style={{ marginTop: '1rem', width: 'fit-content' }}
            onClick={() => navigate('/symptom')}
          >
            Run symptom checker
          </button>
        </section>
      ) : (
        <section className="report-list">
          {reports.map((report) => (
            <article key={report.id} className="card report-item">
              <div style={{ flex: 1, minWidth: '16rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <p className="section-subtitle" style={{ margin: 0 }}>{report.type}</p>
                  {report.source === 'symptom-checker' && (
                    <span className="status-pill status-pill--complete">Auto-generated</span>
                  )}
                </div>
                <h3 style={{ marginTop: '0.25rem' }}>{report.title}</h3>
                <p style={{ marginTop: '0.35rem' }}>
                  Referenced by <strong>{report.doctorName}</strong> on {report.date}
                </p>
              </div>

              {report.status === 'Ready' ? (
                <button
                  type="button"
                  className="btn"
                  onClick={() => handleDownload(report)}
                  disabled={downloadingId === report.id}
                  style={{ opacity: downloadingId === report.id ? 0.75 : 1 }}
                >
                  {downloadingId === report.id ? 'Downloading...' : 'Download report'}
                </button>
              ) : (
                <span className="status-pill status-pill--complete">Processing</span>
              )}
            </article>
          ))}
        </section>
      )}
    </main>
  );
};

export default MedicalReports;
