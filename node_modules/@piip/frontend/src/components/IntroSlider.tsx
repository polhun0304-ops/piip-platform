import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

export interface SlideData {
  title: string;
  description: string;
  backgroundColor?: string;
}

export interface IntroSliderProps {
  slides: SlideData[];
  autoPlayInterval?: number;
}

// ...existing code...

export const IntroSlider: React.FC<IntroSliderProps> = ({ slides, autoPlayInterval = 5000 }) => {
  const [current, setCurrent] = React.useState(0);
  React.useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, autoPlayInterval);
    return () => clearTimeout(timer);
  }, [current, slides.length, autoPlayInterval]);
  const slide = slides[current];
  return (
    <Box sx={{ py: 6, textAlign: 'center' }}>
      <Paper
        sx={{
          p: 5,
          mx: 'auto',
          maxWidth: 600,
          background: slide.backgroundColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          borderRadius: 4,
          boxShadow: 4,
        }}
      >
        <Typography variant="h4" fontWeight={700} sx={{ mb: 2 }}>
          {slide.title}
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.95 }}>
          {slide.description}
        </Typography>
      </Paper>
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 1 }}>
        {slides.map((_, idx) => (
          <Box
            key={idx}
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: idx === current ? '#ffd700' : '#e5e7eb',
              transition: 'all 0.3s',
            }}
          />
        ))}
      </Box>
    </Box>
  );
};
