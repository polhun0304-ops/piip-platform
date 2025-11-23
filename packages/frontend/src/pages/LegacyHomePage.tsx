import React, { useEffect } from 'react';
import { Box } from '@mui/material';

/**
 * 루트 레벨 index.html을 iframe으로 임베드하는 컴포넌트
 * - 기존 작업 중이던 홈페이지 (포트 8000)
 * - 4738줄의 완전한 랜딩 페이지
 */
const LegacyHomePage: React.FC = () => {
  useEffect(() => {
    // 페이지 타이틀 업데이트
    document.title = 'PIIP Detective - 세계 최고의 탐정 플랫폼';
  }, []);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <Box
        component="iframe"
        src="http://localhost:8000/"
        title="PIIP Legacy Home Page"
        sx={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block',
        }}
      />
    </Box>
  );
};

export default LegacyHomePage;
