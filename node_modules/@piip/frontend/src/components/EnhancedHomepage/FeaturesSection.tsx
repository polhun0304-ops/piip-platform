import React from 'react';
import './FeaturesSection.css';

const FeaturesSection: React.FC = () => {
  const features = [
    {
      title: '검증된 전문가',
      description: '자격증과 경력이 검증된 탐정만 등록',
      icon: '🔍',
    },
    {
      title: '투명한 프로세스',
      description: '실시간 진행상황 확인 및 증거 관리',
      icon: '📊',
    },
    {
      title: '안전한 거래',
      description: '에스크로 결제 시스템으로 안심 거래',
      icon: '🔒',
    },
  ];

  return (
    <section className="features-section">
      <h2 className="section-title">핵심 기능</h2>
      <ul className="features-grid">
        {features.map((feature, index) => (
          <li key={index} className="feature-card">
            <div className="feature-icon">{feature.icon}</div>
            <h3 className="feature-title">{feature.title}</h3>
            <p className="feature-description">{feature.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default FeaturesSection;
