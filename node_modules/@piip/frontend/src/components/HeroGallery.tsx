import React from 'react';
import { Box, Typography } from '@mui/material';

export interface HeroGalleryProps {
  images?: Array<{ src: string; alt?: string; caption?: string }>;
  title?: string;
  subtitle?: string;
}

export const HeroGallery: React.FC<HeroGalleryProps> = ({ images, title, subtitle }) => {
  return (
    <Box
      sx={{
        py: 8,
        textAlign: 'center',
        background: 'linear-gradient(135deg, #0a2540 0%, #1e293b 100%)',
      }}
    >
      {title && (
        <Typography variant="h2" fontWeight={800} sx={{ mb: 2, color: '#ffd700' }}>
          {title}
        </Typography>
      )}
      {subtitle && (
        <Typography variant="h5" sx={{ mb: 4, color: '#fff', opacity: 0.85 }}>
          {subtitle}
        </Typography>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap', mt: 4 }}>
        {images?.map((img, idx) => (
          <Box
            key={idx}
            sx={{
              maxWidth: 320,
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: 3,
              bgcolor: '#fff',
            }}
          >
            <img src={img.src} alt={img.alt || ''} style={{ width: '100%', display: 'block' }} />
            {img.caption && (
              <Typography
                variant="caption"
                sx={{ display: 'block', p: 1, color: '#333', bgcolor: '#f9fafb' }}
              >
                {img.caption}
              </Typography>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
};
