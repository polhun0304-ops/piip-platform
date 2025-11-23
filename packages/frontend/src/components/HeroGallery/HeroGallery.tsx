import React, { useState } from 'react';
import { Lightbox, LightboxImage } from '../Lightbox';
import styles from './HeroGallery.module.css';

export interface HeroGalleryProps {
  images: LightboxImage[];
  title?: string;
  subtitle?: string;
}

export const HeroGallery: React.FC<HeroGalleryProps> = ({
  images,
  title = '전문 탐정 서비스',
  subtitle = 'PIIP 플랫폼으로 모든 조사 업무를 한 곳에서',
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleImageClick = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleImageClick(index);
    }
  };

  return (
    <>
      <section className={styles.heroGallery}>
        <div className={styles.heroHeader}>
          <div>
            <h1 className={styles.heroTitle}>{title}</h1>
            <p className={styles.heroSubtitle}>{subtitle}</p>
          </div>
        </div>

        <div className={styles.heroGrid}>
          {images.map((image, index) => (
            <div
              key={index}
              className={`${styles.heroCard} ${index === 0 ? styles.large : ''}`}
              onClick={() => handleImageClick(index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              role="button"
              tabIndex={0}
              aria-label={`${image.alt} 확대 보기`}
            >
              <img src={image.src} alt={image.alt} loading="lazy" />
              <div className={styles.overlay}>
                <span className="material-icons-outlined">zoom_in</span>
              </div>
              {image.caption && <div className={styles.badge}>{image.caption}</div>}
            </div>
          ))}
        </div>
      </section>

      {lightboxOpen && (
        <Lightbox
          images={images}
          currentIndex={currentIndex}
          onClose={() => setLightboxOpen(false)}
          onNavigate={setCurrentIndex}
        />
      )}
    </>
  );
};

export default HeroGallery;
