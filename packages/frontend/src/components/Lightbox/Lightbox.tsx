import React, { useEffect, useRef } from 'react';
import { useLightbox, LightboxImage } from './useLightbox';
import { AppButton } from '../AppButton';
import styles from './Lightbox.module.css';

export interface LightboxProps {
  images: LightboxImage[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export const Lightbox: React.FC<LightboxProps> = ({
  images,
  currentIndex,
  onClose,
  onNavigate,
}) => {
  const {
    isAutoplay,
    isShuffle,
    toggleAutoplay,
    toggleShuffle,
    handlePrev,
    handleNext,
    handleKeyDown,
  } = useLightbox({
    images,
    currentIndex,
    onNavigate,
    onClose,
  });

  const dialogRef = useRef<HTMLDivElement>(null);
  const currentImage = images[currentIndex];

  // Focus management
  useEffect(() => {
    dialogRef.current?.focus();

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Focus trap
  const handleTabKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (!focusableElements || focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    handleKeyDown(e);
    handleTabKey(e);
  };

  return (
    <div
      ref={dialogRef}
      className={styles.lightbox}
      role="dialog"
      aria-modal="true"
      aria-label="이미지 갤러리"
      tabIndex={-1}
      onKeyDown={handleKeyPress}
    >
      {/* Backdrop */}
      <div className={styles.backdrop} onClick={onClose} />

      {/* Dialog */}
      <div className={styles.dialog}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.title}>
            <h2>{currentImage.caption || currentImage.alt}</h2>
            <p className={styles.counter}>
              {currentIndex + 1} / {images.length}
            </p>
          </div>
          <AppButton variant="icon" icon="close" onClick={onClose} ariaLabel="닫기" />
        </div>

        {/* Body */}
        <div className={styles.body}>
          <img src={currentImage.src} alt={currentImage.alt} className={styles.image} />

          {/* Navigation overlay */}
          <div className={styles.navLeft}>
            <AppButton
              variant="icon"
              icon="chevron_left"
              onClick={handlePrev}
              ariaLabel="이전 이미지"
              className={styles.navBtn}
            />
          </div>
          <div className={styles.navRight}>
            <AppButton
              variant="icon"
              icon="chevron_right"
              onClick={handleNext}
              ariaLabel="다음 이미지"
              className={styles.navBtn}
            />
          </div>
        </div>

        {/* Footer Controls */}
        <div className={styles.footer}>
          <div className={styles.controls}>
            <AppButton
              variant="icon"
              icon={isAutoplay ? 'pause' : 'play_arrow'}
              onClick={toggleAutoplay}
              ariaLabel={isAutoplay ? '자동재생 중지' : '자동재생 시작'}
            />
            <AppButton
              variant="icon"
              icon="shuffle"
              onClick={toggleShuffle}
              ariaLabel={isShuffle ? '셔플 끄기' : '셔플 켜기'}
              className={isShuffle ? styles.active : ''}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lightbox;
