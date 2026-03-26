import React from 'react';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <span className="site-footer__title">SMARTMED</span>
          <span className="site-footer__caption">
            Appointments, records, and guidance in one place.
          </span>
        </div>
        <div className="site-footer__meta">
          <div>Built for dependable healthcare workflows.</div>
          <div>(c) 2026 SmartMed</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
