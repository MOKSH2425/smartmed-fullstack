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
        toast.error(getErrorMessage(error, "Failed to load reports."));
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
      toast.error(getErrorMessage(error, "Download failed."));
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <main style={{ padding: '2rem', maxWidth: '1000px', margin: 'auto' }}>
      <button
        onClick={() => navigate(-1)}
        className="btn"
        style={{
          background: 'transparent',
          color: '#4b5563',
          padding: '0.5rem 0',
          marginBottom: '1rem',
          boxShadow: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          width: 'fit-content',
          cursor: 'pointer'
        }}
      >
        Back
      </button>

      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2>Medical Reports</h2>
        <p>Access and download your digital health records securely.</p>
      </div>

      {loading ? (
        <div className="card" style={{ padding: '2rem' }}>
          <p>Loading your reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="card" style={{ padding: '2rem' }}>
          <p>You do not have any reports yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {reports.map((report) => (
            <div key={report.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', textAlign: 'left' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>Report</span>
                  <h3 style={{ margin: 0 }}>{report.title}</h3>
                </div>
                <p style={{ margin: '0.5rem 0 0 0', color: '#6b7280', fontSize: '0.9rem' }}>
                  Referenced by: <strong>{report.doctorName}</strong> | {report.date}
                </p>
              </div>

              <span style={{
                background: '#f3f4f6',
                padding: '0.25rem 0.75rem',
                borderRadius: '99px',
                fontSize: '0.85rem',
                color: '#374151'
              }}>
                {report.type}
              </span>

              <div style={{ textAlign: 'right' }}>
                {report.status === "Ready" ? (
                  <button
                    className="btn"
                    style={{ padding: '0.5rem 1.5rem', opacity: downloadingId === report.id ? 0.75 : 1 }}
                    onClick={() => handleDownload(report)}
                    disabled={downloadingId === report.id}
                  >
                    {downloadingId === report.id ? 'Downloading...' : 'Download'}
                  </button>
                ) : (
                  <span style={{
                    color: '#d97706',
                    background: '#fef3c7',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '0.9rem'
                  }}>
                    Processing...
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default MedicalReports;
