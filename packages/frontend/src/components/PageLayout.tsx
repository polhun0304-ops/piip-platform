import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Container, IconButton, Toolbar, Paper, Tooltip, Chip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import HomeIcon from '@mui/icons-material/Home';
import RefreshIcon from '@mui/icons-material/Refresh';

interface PageLayoutProps {
  children: React.ReactNode;
}

const getPageName = (path: string): string => {
  const routes: { [key: string]: string } = {
    '/': '대시보드',
    '/admin': '관리자 대시보드',
    '/cases': '사건 목록',
    '/persons': '인물 목록',
    '/evidence': '증거 목록',
  };
  return routes[path] || path;
};

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    navigate(-1);
  };

  const handleForward = () => {
    navigate(1);
  };

  const handleHome = () => {
    navigate('/');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Toolbar /> {/* AppBar 높이만큼 여백 */}
      <Container
        component="main"
        maxWidth="xl"
        sx={{
          flexGrow: 1,
          py: 3,
          mb: 9, // 하단 네비게이션 바 높이만큼 여백
        }}
      >
        {children}
      </Container>
      {/* 하단 네비게이션 바 */}
      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1100,
          bgcolor: 'primary.main',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 3,
            py: 1.5,
          }}
        >
          {/* 왼쪽: 네비게이션 버튼 */}
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="뒤로 가기" arrow>
              <IconButton
                onClick={handleBack}
                size="medium"
                sx={{
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.15)',
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.2s',
                }}
              >
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="앞으로 가기" arrow>
              <IconButton
                onClick={handleForward}
                size="medium"
                sx={{
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.15)',
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.2s',
                }}
              >
                <ArrowForwardIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="새로고침" arrow>
              <IconButton
                onClick={handleRefresh}
                size="medium"
                sx={{
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.15)',
                    transform: 'rotate(180deg)',
                  },
                  transition: 'all 0.3s',
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {/* 가운데: 현재 페이지 */}
          <Chip
            label={getPageName(location.pathname)}
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.95rem',
              px: 2,
              height: 36,
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.3)',
            }}
          />

          {/* 오른쪽: 홈 버튼 */}
          <Tooltip title="홈으로" arrow>
            <IconButton
              onClick={handleHome}
              size="medium"
              sx={{
                color: 'white',
                bgcolor: 'rgba(255,255,255,0.15)',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.25)',
                  transform: 'scale(1.15)',
                },
                transition: 'all 0.2s',
              }}
            >
              <HomeIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>
    </Box>
  );
};

export default PageLayout;
