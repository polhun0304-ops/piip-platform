import React from 'react';
import './FeaturesSection.css';

const features = [
  {
    icon: '🚀',
    title: 'Fast Performance',
    description: 'Experience blazing fast speeds with our optimized platform.',
  },
  {
    icon: '🔒',
    title: 'Secure Platform',
    description: 'Your data is safe with our top-notch security measures.',
  },
  {
    icon: '🌍',
    title: 'Global Access',
    description: 'Access our platform from anywhere in the world.',
  },
];

const FeaturesSection = () => {
  return (
    <section className="features-premium">
      <div className="section-header">
        <span className="section-badge">Features</span>
        <h2 className="section-title">Why Choose Us</h2>
        <p className="section-description">
          Discover the unique features that make our platform stand out.
        </p>
      </div>
      <div className="features-grid">
        {features.map((feature, index) => (
          <div className="feature-card" key={index}>
            <div className="feature-icon">{feature.icon}</div>
            <h3 className="feature-title">{feature.title}</h3>
            <p className="feature-description">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
