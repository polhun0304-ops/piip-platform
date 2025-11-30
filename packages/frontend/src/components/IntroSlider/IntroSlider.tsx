import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import {
  ArrowBackIos as PrevIcon,
  ArrowForwardIos as NextIcon,
  FiberManualRecord as DotIcon,
} from '@mui/icons-material';

export interface SlideData {
  title: string;
  description: string;
  imageUrl?: string;
  backgroundColor?: string;
}

interface IntroSliderProps {
  slides: SlideData[];
  autoPlayInterval?: number;
}

export const IntroSlider: React.FC<IntroSliderProps> = ({ slides, autoPlayInterval = 5000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (autoPlayInterval > 0) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % slides.length);
      }, autoPlayInterval);
      return () => clearInterval(timer);
    }
  }, [slides.length, autoPlayInterval]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16/9',
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: (theme) =>
          slides[currentIndex]?.backgroundColor ||
          (theme.palette.mode === 'light' ? '#e2e8f0' : 'rgba(255,255,255,0.05)'),
        transition: 'background-color 0.5s ease',
      }}
    >
      {/* 슬라이드 콘텐츠 */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
        }}
      >
        {slides[currentIndex]?.imageUrl ? (
          <Box
            component="img"
            src={slides[currentIndex].imageUrl}
            alt={slides[currentIndex].title}
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : null}

        {/* 텍스트 오버레이 */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            textAlign: 'center',
            color: 'white',
            textShadow: '0 2px 8px rgba(0,0,0,0.7)',
            maxWidth: '80%',
          }}
        >
          <Typography variant="h4" component="h3" gutterBottom fontWeight={700}>
            {slides[currentIndex]?.title}
          </Typography>
          <Typography variant="body1" sx={{ fontSize: '1.125rem' }}>
            {slides[currentIndex]?.description}
          </Typography>
        </Box>
      </Box>

      {/* 좌우 화살표 */}
      {slides.length > 1 && (
        <>
          <IconButton
            onClick={handlePrev}
            sx={{
              position: 'absolute',
              left: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(0,0,0,0.5)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.7)',
              },
            }}
          >
            <PrevIcon />
          </IconButton>
          <IconButton
            onClick={handleNext}
            sx={{
              position: 'absolute',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(0,0,0,0.5)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.7)',
              },
            }}
          >
            <NextIcon />
          </IconButton>
        </>
      )}

      {/* 인디케이터 점 */}
      {slides.length > 1 && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 1,
          }}
        >
          {slides.map((_, index) => (
            <IconButton
              key={index}
              onClick={() => handleDotClick(index)}
              sx={{
                p: 0.5,
                color: index === currentIndex ? 'primary.main' : 'rgba(255,255,255,0.5)',
                transition: 'color 0.3s',
              }}
            >
              <DotIcon sx={{ fontSize: 12 }} />
            </IconButton>
          ))}
        </Box>
      )}
    </Box>
  );
};
