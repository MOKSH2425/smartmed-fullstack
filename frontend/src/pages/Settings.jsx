import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api, getErrorMessage } from '../lib/api';

const defaultSettings = {
  notifications: {
    email: true,
    sms: false,
    promos: true
  },
  security: {
    twoFactorAuth: false,
    publicProfile: false
  }
};

const Toggle = ({ label, checked, onChange }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #f3f4f6' }}>
    <span style={{ fontWeight: '500' }}>{label}</span>
    <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '26px' }}>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ opacity: 0, width: 0, height: 0 }} />
      <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: checked ? '#2563eb' : '#ccc', transition: '.4s', borderRadius: '34px' }}></span>
      <span style={{ position: 'absolute', height: '20px', width: '20px', left: '3px', bottom: '3px', backgroundColor: 'white', transition: '.4s', borderRadius: '50%', transform: checked ? 'translateX(24px)' : 'translateX(0px)' }}></span>
    </label>
  </div>
);

const Settings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await api.getSettings();
        setSettings(data.settings);
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to load settings."));
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const data = await api.updateSettings(settings);
      setSettings(data.settings);
      toast.success("Settings saved successfully.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save settings."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main style={{ padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
        <div className="card" style={{ padding: '2rem' }}>
          <p>Loading settings...</p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
      <button onClick={() => navigate(-1)} className="btn" style={{ background: 'transparent', color: '#4b5563', padding: '0.5rem 0', marginBottom: '1rem', boxShadow: 'none' }}>
        Back
      </button>

      <h2>Settings</h2>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h3 style={{ borderBottom: '2px solid #f3f4f6', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Notifications</h3>
        <Toggle label="Email Notifications" checked={settings.notifications.email} onChange={() => setSettings((current) => ({ ...current, notifications: { ...current.notifications, email: !current.notifications.email } }))} />
        <Toggle label="SMS Alerts" checked={settings.notifications.sms} onChange={() => setSettings((current) => ({ ...current, notifications: { ...current.notifications, sms: !current.notifications.sms } }))} />
        <Toggle label="Marketing Emails" checked={settings.notifications.promos} onChange={() => setSettings((current) => ({ ...current, notifications: { ...current.notifications, promos: !current.notifications.promos } }))} />
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h3 style={{ borderBottom: '2px solid #f3f4f6', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Security</h3>
        <Toggle label="Two-Factor Authentication" checked={settings.security.twoFactorAuth} onChange={() => setSettings((current) => ({ ...current, security: { ...current.security, twoFactorAuth: !current.security.twoFactorAuth } }))} />
        <Toggle label="Make Profile Public" checked={settings.security.publicProfile} onChange={() => setSettings((current) => ({ ...current, security: { ...current.security, publicProfile: !current.security.publicProfile } }))} />
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'right' }}>
        <button className="btn" onClick={handleSave} style={{ padding: '0.75rem 2rem', opacity: saving ? 0.75 : 1 }} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </main>
  );
};

export default Settings;
