import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Paper, Button, Alert, CircularProgress } from '@mui/material';
import { PhoneAndroid as PhoneAndroidIcon, OpenInNew as OpenInNewIcon } from '@mui/icons-material';

/**
 * 포트 3000에서 실행 중인 Mobile App 웹버전
 * - React Native Web으로 구현된 모바일 앱
 */
const Port3000HomePage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);
  const mobileUrl = 'http://localhost:3000';

  useEffect(() => {
    document.title = 'PIIP Platform - Mobile App (웹버전)';

    // 포트 3000 서버 확인
    const checkServer = async () => {
      try {
        await fetch(mobileUrl, { mode: 'no-cors' });
        setIsAvailable(true);
      } catch (error) {
        setIsAvailable(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkServer();
  }, []);

  if (isLoading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isAvailable) {
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
          src={mobileUrl}
          title="PIIP Mobile App Web Version"
          sx={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block',
          }}
        />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper
        sx={{
          p: 6,
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(5,150,105,0.1) 100%)',
          border: '1px solid rgba(16,185,129,0.3)',
        }}
      >
        <PhoneAndroidIcon sx={{ fontSize: 80, color: '#10b981', mb: 3 }} />

        <Typography variant="h3" fontWeight={700} gutterBottom>
          Mobile App (웹 버전)
        </Typography>

        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          React Native Web으로 구현된 모바일 앱
        </Typography>

        <Alert severity="info" sx={{ mb: 4, textAlign: 'left' }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            서버가 실행되지 않았습니다
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Mobile App 웹버전을 보려면 포트 3000에서 서버를 실행해야 합니다.
          </Typography>
          <Typography
            variant="body2"
            component="div"
            sx={{ fontFamily: 'monospace', bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}
          >
            <strong>실행 방법:</strong>
            <br />
            cd packages/mobile
            <br />
            npm run dev
          </Typography>
        </Alert>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<OpenInNewIcon />}
            onClick={() => window.open(mobileUrl, '_blank')}
            sx={{
              bgcolor: '#10b981',
              '&:hover': { bgcolor: '#059669' },
            }}
          >
            새 탭에서 열기 시도
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => window.location.reload()}
            sx={{
              borderColor: '#10b981',
              color: '#10b981',
              '&:hover': { borderColor: '#059669', bgcolor: 'rgba(16,185,129,0.1)' },
            }}
          >
            다시 확인
          </Button>
        </Box>

        <Box sx={{ mt: 4, p: 3, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            주요 특징
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap', mt: 2 }}>
            {['React Native Web', '모바일 UI/UX', '포트 3000', 'Vite 실행'].map((feature) => (
              <Box
                key={feature}
                sx={{
                  px: 2,
                  py: 0.5,
                  bgcolor: 'rgba(16,185,129,0.1)',
                  borderRadius: 1,
                  fontSize: '0.875rem',
                  color: '#059669',
                }}
              >
                {feature}
              </Box>
            ))}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Port3000HomePage;
