import React, { useEffect, useState } from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const SplashScreen: React.FC = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setProgress((p) => Math.min(100, p + 5)), 125);
    const n = setTimeout(() => navigate('/'), 2500);
    return () => {
      clearInterval(t);
      clearTimeout(n);
    };
  }, [navigate]);

  return (
    <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Box sx={{ width: 360 }}>
        <Typography variant="h4" align="center" gutterBottom>
          PIIP
        </Typography>
        <LinearProgress variant="determinate" value={progress} />
        <Typography variant="caption" display="block" align="center" sx={{ mt: 1 }}>
          플랫폼 초기화 중... {progress}%
        </Typography>
      </Box>
    </Box>
  );
};

export default SplashScreen;
