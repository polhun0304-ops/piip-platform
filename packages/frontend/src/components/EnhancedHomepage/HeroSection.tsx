import React from 'react';
import './HeroSection.css';

const HeroSection: React.FC = () => {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">PIIP Detective - 세계 최고의</h1>
        <p className="hero-description">전문 탐정과 의뢰인을 연결하는 신뢰할 수 있는 플랫폼.</p>
        <div className="hero-cta">
          <button className="btn btn-large btn-gradient">의뢰 시작하기</button>
          <button className="btn btn-large btn-outline">플랫폼 소개</button>
        </div>
      </div>
      <div className="hero-visual">
        <div className="hero-photo-wrap">
          <img src="탐정사진/탐정기본사진.png" alt="Hero Visual" className="hero-photo" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
