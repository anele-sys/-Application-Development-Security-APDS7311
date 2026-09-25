import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-text">
          <p>&copy; {new Date().getFullYear()} <strong>HustleHub+</strong>. Secure Full-Stack Freelance Platform. All rights reserved.</p>
        </div>
        <ul className="footer-links">
          <li><span className="footer-link">Security First</span></li>
          <li><span className="footer-link">JWT &amp; RBAC Protected</span></li>
          <li><span className="footer-link">HTTPS Ready</span></li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
