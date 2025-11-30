import React from 'react';
import './CTASection.css';

const CTASection = () => {
  return (
    <section className="cta-section">
      <div className="cta-container">
        <h2 className="cta-title">Ready to Get Started?</h2>
        <p className="cta-description">
          Join our platform today and let us help you solve your cases efficiently and securely.
        </p>
        <div className="cta-actions">
          <button className="btn btn-primary">Sign Up</button>
          <button className="btn btn-secondary">Learn More</button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
