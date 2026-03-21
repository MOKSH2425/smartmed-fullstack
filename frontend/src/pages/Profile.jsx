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
  address: ''
};

const Profile = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [user, setProfile] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await api.getProfile();
        setProfile(data.profile);
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to load profile."));
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((current) => ({ ...current, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      const data = await api.updateProfile(user);
      setProfile(data.profile);
      setUser(data.profile);
      setIsEditing(false);
      toast.success("Profile updated successfully.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update profile."));
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    background: isEditing ? '#ffffff' : 'transparent',
    color: isEditing ? '#000000' : 'inherit',
    border: isEditing ? '1px solid #d1d5db' : '1px solid transparent',
    borderRadius: '8px',
    padding: '0.75rem',
    width: '100%',
    cursor: isEditing ? 'text' : 'default',
    fontWeight: '500'
  };

  if (loading) {
    return (
      <main style={{ padding: '2rem', maxWidth: '800px', margin: 'auto' }}>
        <div className="card" style={{ padding: '2rem' }}>
          <p>Loading profile...</p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ padding: '2rem', maxWidth: '800px', margin: 'auto' }}>
      <button
        onClick={() => navigate(-1)}
        className="btn"
        style={{
          background: 'transparent',
          color: 'var(--text-color)',
          padding: '0.5rem 0',
          marginBottom: '1rem',
          boxShadow: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          width: 'fit-content'
        }}
      >
        Back
      </button>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2>My Profile</h2>
          <button
            className="btn"
            style={{ background: isEditing ? '#dc2626' : '#2563eb' }}
            onClick={() => setIsEditing((value) => !value)}
          >
            {isEditing ? "Cancel Edit" : "Edit Profile"}
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Full Name</label>
              <input type="text" name="name" value={user.name} onChange={handleChange} disabled={!isEditing} style={inputStyle} />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Email</label>
              <input
                type="email"
                name="email"
                value={user.email}
                disabled
                style={{
                  ...inputStyle,
                  background: isEditing ? '#e5e7eb' : 'transparent',
                  color: isEditing ? '#6b7280' : 'inherit',
                  cursor: 'not-allowed'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Phone Number</label>
              <input type="tel" name="phone" value={user.phone || ''} onChange={handleChange} disabled={!isEditing} style={inputStyle} />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Address</label>
              <input type="text" name="address" value={user.address || ''} onChange={handleChange} disabled={!isEditing} style={inputStyle} />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Age</label>
                <input type="number" name="age" value={user.age ?? ''} onChange={handleChange} disabled={!isEditing} style={inputStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Gender</label>
                <select name="gender" value={user.gender || 'Prefer not to say'} onChange={handleChange} disabled={!isEditing} style={inputStyle}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>Blood Group</label>
              <input type="text" name="bloodGroup" value={user.bloodGroup || ''} onChange={handleChange} disabled={!isEditing} style={inputStyle} />
            </div>
          </div>

          {isEditing && (
            <div style={{ marginTop: '2rem', textAlign: 'right' }}>
              <button type="submit" className="btn" style={{ padding: '0.75rem 3rem', opacity: saving ? 0.75 : 1 }} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </form>
      </div>
    </main>
  );
};

export default Profile;
