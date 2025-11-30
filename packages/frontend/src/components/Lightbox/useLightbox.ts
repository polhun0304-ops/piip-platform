import { useState, useEffect, useCallback, useRef } from 'react';

export interface LightboxImage {
  src: string;
  alt: string;
  caption?: string;
}

interface UseLightboxProps {
  images: LightboxImage[];
  currentIndex: number;
  onNavigate: (index: number) => void;
  onClose: () => void;
}

export const useLightbox = ({ images, currentIndex, onNavigate, onClose }: UseLightboxProps) => {
  const [isAutoplay, setIsAutoplay] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handlePrev = useCallback(() => {
    const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    onNavigate(newIndex);
  }, [currentIndex, images.length, onNavigate]);

  const handleNext = useCallback(() => {
    if (isShuffle && images.length > 1) {
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * images.length);
      } while (newIndex === currentIndex);
      onNavigate(newIndex);
    } else {
      const newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
      onNavigate(newIndex);
    }
  }, [currentIndex, images.length, isShuffle, onNavigate]);

  const toggleShuffle = useCallback(() => {
    setIsShuffle((prev) => !prev);
  }, []);

  const toggleAutoplay = useCallback(() => {
    setIsAutoplay((prev) => !prev);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handlePrev();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleNext();
          break;
      }
    },
    [onClose, handlePrev, handleNext]
  );

  // Autoplay effect
  useEffect(() => {
    if (isAutoplay) {
      autoplayTimerRef.current = setInterval(handleNext, 3000);
    } else {
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current);
        autoplayTimerRef.current = null;
      }
    }

    return () => {
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current);
      }
    };
  }, [isAutoplay, handleNext]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current);
      }
    };
  }, []);

  return {
    isAutoplay,
    isShuffle,
    toggleAutoplay,
    toggleShuffle,
    handlePrev,
    handleNext,
    handleKeyDown,
  };
};
