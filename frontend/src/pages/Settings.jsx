import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api, getErrorMessage } from '../lib/api';

const defaultSettings = {
  notifications: {
    email: true,
    sms: false,
    promos: true,
  },
  security: {
    twoFactorAuth: false,
    publicProfile: false,
  },
};

const Toggle = ({ label, checked, onChange }) => (
  <div className="settings-toggle">
    <span style={{ fontWeight: 600 }}>{label}</span>
    <label className="switch">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="switch__track" />
      <span className="switch__thumb" />
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
        toast.error(getErrorMessage(error, 'Failed to load settings.'));
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
      toast.success('Settings saved successfully.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to save settings.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="content-shell">
        <section className="card content-card">
          <p>Loading settings...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="content-shell">
      <button type="button" onClick={() => navigate(-1)} className="btn" style={{ width: 'fit-content' }}>
        Back to previous page
      </button>

      <section className="dashboard-hero">
        <p className="section-subtitle" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 800 }}>
          Preferences and privacy
        </p>
        <h1 className="section-title" style={{ marginTop: '0.35rem' }}>
          Settings
        </h1>
        <p>
          Control how SmartMed notifies you and how much of your profile is visible
          in the product.
        </p>
      </section>

      <section className="settings-stack">
        <article className="card settings-card">
          <h3>Notifications</h3>
          <Toggle
            label="Email notifications"
            checked={settings.notifications.email}
            onChange={() =>
              setSettings((current) => ({
                ...current,
                notifications: {
                  ...current.notifications,
                  email: !current.notifications.email,
                },
              }))
            }
          />
          <Toggle
            label="SMS alerts"
            checked={settings.notifications.sms}
            onChange={() =>
              setSettings((current) => ({
                ...current,
                notifications: {
                  ...current.notifications,
                  sms: !current.notifications.sms,
                },
              }))
            }
          />
          <Toggle
            label="Marketing emails"
            checked={settings.notifications.promos}
            onChange={() =>
              setSettings((current) => ({
                ...current,
                notifications: {
                  ...current.notifications,
                  promos: !current.notifications.promos,
                },
              }))
            }
          />
        </article>

        <article className="card settings-card">
          <h3>Security</h3>
          <Toggle
            label="Two-factor authentication"
            checked={settings.security.twoFactorAuth}
            onChange={() =>
              setSettings((current) => ({
                ...current,
                security: {
                  ...current.security,
                  twoFactorAuth: !current.security.twoFactorAuth,
                },
              }))
            }
          />
          <Toggle
            label="Public profile"
            checked={settings.security.publicProfile}
            onChange={() =>
              setSettings((current) => ({
                ...current,
                security: {
                  ...current.security,
                  publicProfile: !current.security.publicProfile,
                },
              }))
            }
          />
        </article>
      </section>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="button"
          className="btn"
          onClick={handleSave}
          disabled={saving}
          style={{ opacity: saving ? 0.75 : 1 }}
        >
          {saving ? 'Saving...' : 'Save settings'}
        </button>
      </div>
    </main>
  );
};

export default Settings;
