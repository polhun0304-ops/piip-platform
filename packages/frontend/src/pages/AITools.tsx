import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const AITools: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Box>
      <Typography variant="h4">AI 도구</Typography>
      <Typography color="text.secondary">AI 기반 분석 도구 모음(플레이스홀더)</Typography>
      <Button sx={{ mt: 2 }} variant="contained" onClick={() => navigate('/ai-evidence')}>
        AI 증거분석 페이지로 이동
      </Button>
    </Box>
  );
};

export default AITools;
