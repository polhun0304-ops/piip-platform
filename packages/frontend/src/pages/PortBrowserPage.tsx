import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Paper, Button, Alert, CircularProgress } from '@mui/material';
import { OpenInNew as OpenInNewIcon } from '@mui/icons-material';

interface PortBrowserPageProps {
  port: number;
  title?: string;
  description?: string;
}

const PortBrowserPage: React.FC<PortBrowserPageProps> = ({ port, title, description }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);
  const url = `http://localhost:${port}`;

  useEffect(() => {
    document.title = title || `PIIP Platform - 포트 ${port} 브라우저`;
    const checkServer = async () => {
      try {
        await fetch(url, { mode: 'no-cors' });
        setIsAvailable(true);
      } catch (error) {
        setIsAvailable(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkServer();
  }, [port, title, url]);

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
          src={url}
          title={title || `포트 ${port} 브라우저`}
          sx={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
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
          background: 'linear-gradient(135deg, #e0e7ff 0%, #f0fdf4 100%)',
          border: '1px solid #a5b4fc',
        }}
      >
        <Typography variant="h3" fontWeight={700} gutterBottom>
          {title || `포트 ${port} 브라우저`}
        </Typography>
        {description && (
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            {description}
          </Typography>
        )}
        <Alert severity="info" sx={{ mb: 4, textAlign: 'left' }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            서버가 실행되지 않았습니다
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            해당 포트에서 서버를 실행해야 브라우저를 볼 수 있습니다.
          </Typography>
          <Typography
            variant="body2"
            component="div"
            sx={{ fontFamily: 'monospace', bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}
          >
            <strong>실행 방법 예시:</strong>
            <br />
            cd packages/mobile
            <br />
            npm run dev -- --port {port}
          </Typography>
        </Alert>
        <Button
          variant="contained"
          size="large"
          startIcon={<OpenInNewIcon />}
          onClick={() => window.open(url, '_blank')}
          sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}
        >
          새 탭에서 열기 시도
        </Button>
      </Paper>
    </Container>
  );
};

export default PortBrowserPage;
