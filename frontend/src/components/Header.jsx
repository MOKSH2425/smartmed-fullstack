import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/useAuth';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  const dropdownStyle = {
    position: 'absolute', right: 0, top: '120%',
    backgroundColor: darkMode ? '#1e293b' : '#ffffff',
    color: darkMode ? '#e2e8f0' : '#0f172a',
    minWidth: '180px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    borderRadius: '12px', overflow: 'hidden', zIndex: 100, textAlign: 'left',
    border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0'
  };

  const linkStyle = {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '0.75rem 1rem', textDecoration: 'none',
    color: darkMode ? '#e2e8f0' : '#0f172a',
    borderBottom: darkMode ? '1px solid #334155' : '1px solid #f1f5f9',
    fontSize: '0.95rem', fontWeight: '500'
  };

  const publicPaths = ['/', '/login', '/signup'];
  const isPublicPage = publicPaths.includes(location.pathname) && !isAuthenticated;
  const logoLink = isPublicPage ? '/' : '/dashboard';

  const handleLogout = (e) => {
    e.preventDefault();
    setIsMenuOpen(false);
    logout();
    toast.success("Logged out successfully.");
    navigate('/');
  };

  return (
    <header style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      background: 'linear-gradient(90deg, #0f172a, #1e40af)',
      color: 'white', padding: '1rem 2rem', position: 'sticky', top: 0, zIndex: 1000,
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }}>
      <Link to={logoLink} className="logo-link" style={{ color: 'white', textDecoration: 'none', fontWeight: '700', fontSize: '1.4rem', display: 'flex', alignItems: 'center', letterSpacing: '0.5px' }}>
        <span>SMARTMED</span>
        <span className="logo-slogan" style={{ marginLeft: '8px', fontWeight: '400', opacity: 0.9, fontSize: '1rem' }}> - Health First</span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button onClick={toggleTheme} style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', marginRight: '15px', color: 'white' }}>
          {darkMode ? 'Light' : 'Dark'}
        </button>

        {isAuthenticated && (
          <div style={{ position: 'relative' }}>
            <button onClick={() => setIsMenuOpen((value) => !value)} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '99px', padding: '0.4rem 0.8rem', color: 'white', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
              <span style={{ fontSize: '1.1rem' }}>User</span>
              <span className="profile-text">{user?.name?.split(' ')[0] || 'Profile'} v</span>
            </button>

            {isMenuOpen && (
              <div style={dropdownStyle}>
                <Link to="/profile" onClick={() => setIsMenuOpen(false)} style={linkStyle}>My Profile</Link>
                <Link to="/settings" onClick={() => setIsMenuOpen(false)} style={linkStyle}>Settings</Link>
                <button onClick={handleLogout} style={{ ...linkStyle, width: '100%', background: 'none', cursor: 'pointer', fontFamily: 'inherit', color: '#ef4444', fontWeight: '600', borderBottom: 'none' }}>Logout</button>
              </div>
            )}

            {isMenuOpen && (
              <div onClick={() => setIsMenuOpen(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 90, cursor: 'default' }} />
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
