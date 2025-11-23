import React from 'react';
import './CasesSection.css';

const cases = [
  {
    quote: 'This platform helped me solve my case efficiently.',
    author: {
      name: 'Alice Johnson',
      role: 'Client',
      avatar: '👩',
    },
    rating: 5,
  },
  {
    quote: 'Professional and reliable service.',
    author: {
      name: 'Bob Williams',
      role: 'Client',
      avatar: '👨',
    },
    rating: 4,
  },
];

const CasesSection = () => {
  return (
    <section className="cases-section">
      <h2 className="section-title">Success Stories</h2>
      <div className="cases-grid">
        {cases.map((caseItem, index) => (
          <div className="case-card" key={index}>
            <blockquote className="case-quote">
              <p className="case-text">{caseItem.quote}</p>
            </blockquote>
            <div className="case-author">
              <div className="author-avatar">{caseItem.author.avatar}</div>
              <div className="author-info">
                <p className="author-name">{caseItem.author.name}</p>
                <p className="author-role">{caseItem.author.role}</p>
              </div>
              <div className="case-rating">
                {'★'.repeat(caseItem.rating)}
                {'☆'.repeat(5 - caseItem.rating)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CasesSection;
