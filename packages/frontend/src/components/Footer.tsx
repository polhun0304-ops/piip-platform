import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="premium-footer">
      <div className="footer-container">
        <div className="footer-main">
          <div className="footer-brand">
            <h3 className="nav-brand">Detective Platform</h3>
            <p className="footer-description">
              Your trusted platform for professional detective services.
            </p>
          </div>
          <div className="footer-links">
            <h3>Quick Links</h3>
            <ul>
              <li>
                <a href="#">Home</a>
              </li>
              <li>
                <a href="#">About</a>
              </li>
              <li>
                <a href="#">Services</a>
              </li>
              <li>
                <a href="#">Contact</a>
              </li>
            </ul>
          </div>
          <div className="footer-social">
            <h3>Follow Us</h3>
            <div className="social-links">
              <a href="#" className="social-link">
                🔗
              </a>
              <a href="#" className="social-link">
                🔗
              </a>
              <a href="#" className="social-link">
                🔗
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="footer-credits">© 2025 Detective Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
