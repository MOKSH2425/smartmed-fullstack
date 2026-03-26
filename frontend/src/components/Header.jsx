import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/useAuth';

const publicLinks = [
  { to: '/', label: 'Home' },
  { to: '/login', label: 'Login' },
  { to: '/signup', label: 'Create account' },
];

const privateLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/doctors', label: 'Doctors' },
  { to: '/history', label: 'History' },
  { to: '/report', label: 'Reports' },
  { to: '/symptom', label: 'Assistant' },
  { to: '/chat', label: 'Chat' },
];

const Header = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  const toggleTheme = () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    localStorage.setItem('theme', nextMode ? 'dark' : 'light');
  };

  const handleNavigation = () => {
    setIsMenuOpen(false);
    setMobileNavOpen(false);
  };

  const handleLogout = (event) => {
    event.preventDefault();
    setIsMenuOpen(false);
    logout();
    toast.success('Logged out successfully.');
    navigate('/');
  };

  const navLinks = isAuthenticated ? privateLinks : publicLinks;
  const logoLink = isAuthenticated ? '/dashboard' : '/';
  const firstName = user?.name?.trim()?.split(' ')[0] || 'Profile';
  const initials = user?.name
    ? user.name
        .trim()
        .split(' ')
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || '')
        .join('')
    : 'SM';

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <NavLink to={logoLink} className="site-brand" onClick={handleNavigation}>
          <span className="site-brand__mark">SM</span>
          <span>
            <span className="site-brand__title">SMARTMED</span>
            <span className="site-brand__subtitle">Connected care, calmer decisions</span>
          </span>
        </NavLink>

        <nav className={`site-nav${mobileNavOpen ? ' site-nav--open' : ''}`}>
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={handleNavigation}
              className={({ isActive }) =>
                `site-nav__link${isActive ? ' site-nav__link--active' : ''}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="site-header__actions">
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {darkMode ? 'Light' : 'Dark'}
          </button>

          <button
            type="button"
            className="menu-toggle"
            onClick={() => setMobileNavOpen((current) => !current)}
            aria-label="Toggle navigation"
          >
            Menu
          </button>

          {isAuthenticated && (
            <div className="profile-menu">
              <button
                type="button"
                className="profile-menu__trigger"
                onClick={() => setIsMenuOpen((current) => !current)}
              >
                <span className="profile-menu__avatar">{initials}</span>
                <span className="profile-menu__meta">
                  <span className="profile-menu__label">Signed in</span>
                  <span className="profile-menu__name">{firstName}</span>
                </span>
                <span className="profile-menu__caret">v</span>
              </button>

              {isMenuOpen && (
                <div className="profile-menu__panel">
                  <NavLink
                    to="/profile"
                    className="profile-menu__panel-link"
                    onClick={handleNavigation}
                  >
                    Profile
                  </NavLink>
                  <NavLink
                    to="/settings"
                    className="profile-menu__panel-link"
                    onClick={handleNavigation}
                  >
                    Settings
                  </NavLink>
                  <button
                    type="button"
                    className="profile-menu__panel-button profile-menu__panel-button--danger"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                  <div
                    className="profile-menu__backdrop"
                    onClick={() => setIsMenuOpen(false)}
                    aria-hidden="true"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
