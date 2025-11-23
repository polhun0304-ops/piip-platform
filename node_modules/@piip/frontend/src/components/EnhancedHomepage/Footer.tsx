import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; 2025 Your Company. All rights reserved.</p>
        <ul className="social-links">
          <li>
            <a href="#" className="social-link">
              FB
            </a>
          </li>
          <li>
            <a href="#" className="social-link">
              TW
            </a>
          </li>
          <li>
            <a href="#" className="social-link">
              IG
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
