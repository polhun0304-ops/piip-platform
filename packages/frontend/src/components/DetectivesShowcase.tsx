import React, { useEffect, useState } from 'react';
import './DetectivesShowcase.css';

type Detective = {
  avatar: string;
  name: string;
  specialty: string;
  stats: {
    cases: number;
    successRate: string;
    years: number;
  };
};

const DetectivesShowcase = () => {
  const [detectives, setDetectives] = useState<Detective[]>([]);

  useEffect(() => {
    const fetchDetectives = async () => {
      try {
        const response = await fetch('/api/detectives');
        const data: Detective[] = await response.json();
        setDetectives(data);
      } catch (error) {
        console.error('Error fetching detectives:', error);
      }
    };

    fetchDetectives();
  }, []);

  return (
    <section className="detectives-showcase">
      <div className="detectives-container">
        <h2 className="section-title">Meet Our Detectives</h2>
        <div className="detectives-grid">
          {detectives.map((detective, index) => (
            <div className="detective-card" key={index}>
              <div className="detective-avatar">{detective.avatar}</div>
              <h3 className="detective-name">{detective.name}</h3>
              <p className="detective-specialty">{detective.specialty}</p>
              <div className="detective-stats">
                <div className="detective-stat">
                  <span className="stat-value">{detective.stats.cases}</span>
                  Cases
                </div>
                <div className="detective-stat">
                  <span className="stat-value">{detective.stats.successRate}</span>
                  Success Rate
                </div>
                <div className="detective-stat">
                  <span className="stat-value">{detective.stats.years}</span>
                  Years Experience
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DetectivesShowcase;
