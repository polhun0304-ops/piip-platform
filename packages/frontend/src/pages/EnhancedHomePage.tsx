import React, { useEffect } from 'react';
import { Container, Box, Typography, Grid, Paper, Divider } from '@mui/material';
import { HeroGallery } from '../components/HeroGallery';
import { useNavigate } from 'react-router-dom';

const EnhancedHomePage: React.FC = () => {
  const navigate = useNavigate();

  // Legacy Home iframe URL
  const legacyHomeUrl = 'http://localhost:8000/';

  // HeroGallery images
  const galleryImages = [
    {
      src: '/images/탐정사진 기본.png',
      alt: '전문 탐정 서비스',
      title: 'PIIP 플랫폼',
    },
  ];

  // Features
  const features = [
    {
      icon: 'folder_open',
      title: '사건 관리',
      description: '조사 사건 생성부터 종료까지 체계적으로 관리',
      link: '/cases',
    },
    {
      icon: 'photo_library',
      title: '증거 관리',
      description: '파일 업로드, 태그, 블록체인 보관으로 무결성 보장',
      link: '/evidence',
    },
    {
      icon: 'psychology',
      title: 'AI 분석',
      description: '이미지 인식, 패턴 분석으로 조사 효율 극대화',
      link: '/dashboard',
    },
  ];

  useEffect(() => {
    document.title = 'PIIP Detective - 세계 최고의 탐정 플랫폼';
  }, []);

  return (
    <Box>
      {/* Hero Section */}
      <HeroGallery images={galleryImages} />

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" component="h2" gutterBottom textAlign="center">
          주요 기능
        </Typography>
        <Grid container spacing={4} sx={{ mt: 4 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': { transform: 'translateY(-6px)', boxShadow: 6 },
                }}
                onClick={() => navigate(feature.link)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    component="span"
                    className="material-icons-outlined"
                    sx={{ fontSize: '32px', color: 'primary.main' }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" component="h4" fontWeight={600}>
                    {feature.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Divider sx={{ my: 5 }} />

      {/* Legacy Home Section */}
      <Box
        component="iframe"
        src={legacyHomeUrl}
        title="Legacy Home"
        sx={{
          width: '100%',
          height: '80vh',
          border: 'none',
          display: 'block',
        }}
      />
    </Box>
  );
};

export default EnhancedHomePage;
