import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api, getErrorMessage } from '../lib/api';
import { useAuth } from '../context/useAuth';

const emptyProfile = {
  name: '',
  email: '',
  phone: '',
  age: '',
  gender: 'Prefer not to say',
  bloodGroup: '',
  address: '',
};

const Profile = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [user, setProfile] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadProfile = async () => {
    try {
      setLoadError('');
      setLoading(true);
      const data = await api.getProfile();
      setProfile(data.profile);
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to load profile.');
      setLoadError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      const data = await api.updateProfile(user);
      setProfile(data.profile);
      setUser(data.profile);
      setIsEditing(false);
      toast.success('Profile updated successfully.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update profile.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="content-shell">
        <section className="card content-card">
          <p>Loading profile...</p>
        </section>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="content-shell">
        <section className="card content-card empty-state">
          <h3>We couldn&apos;t load your profile right now.</h3>
          <p>{loadError}</p>
          <button type="button" className="btn" onClick={loadProfile} style={{ marginTop: '1rem' }}>
            Retry
          </button>
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
        <div className="dashboard-hero__row">
          <div>
            <p className="section-subtitle" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 800 }}>
              Account details
            </p>
            <h1 className="section-title" style={{ marginTop: '0.35rem' }}>
              My profile
            </h1>
            <p>
              Keep your personal details accurate so booking, reports, and follow-up
              care stay smooth.
            </p>
          </div>

          <button
            type="button"
            className="btn"
            onClick={() => setIsEditing((current) => !current)}
            style={{
              background: isEditing
                ? 'linear-gradient(135deg, #dc2626, #fb7185)'
                : 'linear-gradient(135deg, var(--primary), var(--secondary))',
            }}
          >
            {isEditing ? 'Cancel editing' : 'Edit profile'}
          </button>
        </div>
      </section>

      <section className="card content-card">
        <form onSubmit={handleSave} className="info-list">
          <div className="info-field">
            <label htmlFor="profile-name">Full name</label>
            <input
              id="profile-name"
              type="text"
              name="name"
              value={user.name}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className="info-field">
            <label htmlFor="profile-email">Email</label>
            <input id="profile-email" type="email" name="email" value={user.email} disabled />
          </div>

          <div className="info-field">
            <label htmlFor="profile-phone">Phone number</label>
            <input
              id="profile-phone"
              type="tel"
              name="phone"
              value={user.phone || ''}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className="info-field">
            <label htmlFor="profile-blood-group">Blood group</label>
            <input
              id="profile-blood-group"
              type="text"
              name="bloodGroup"
              value={user.bloodGroup || ''}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className="info-field">
            <label htmlFor="profile-age">Age</label>
            <input
              id="profile-age"
              type="number"
              name="age"
              value={user.age ?? ''}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className="info-field">
            <label htmlFor="profile-gender">Gender</label>
            <select
              id="profile-gender"
              name="gender"
              value={user.gender || 'Prefer not to say'}
              onChange={handleChange}
              disabled={!isEditing}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>

          <div className="info-field info-field--wide">
            <label htmlFor="profile-address">Address</label>
            <input
              id="profile-address"
              type="text"
              name="address"
              value={user.address || ''}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          {isEditing && (
            <div className="info-field info-field--wide" style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn" disabled={saving} style={{ opacity: saving ? 0.75 : 1 }}>
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          )}
        </form>
      </section>
    </main>
  );
};

export default Profile;
