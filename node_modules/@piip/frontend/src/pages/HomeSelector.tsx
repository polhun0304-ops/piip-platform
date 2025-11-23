import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  AutoAwesome as AutoAwesomeIcon,
  Lightbulb as LightbulbIcon,
  Rocket as RocketIcon,
  ViewModule as ViewModuleIcon,
  PhoneAndroid as PhoneAndroidIcon,
} from '@mui/icons-material';

/**
 * 홈페이지 버전 선택 페이지
 * - 여러 버전의 홈페이지를 쉽게 비교하고 선택할 수 있습니다
 */
const HomeSelector: React.FC = () => {
  const navigate = useNavigate();

  const homeVersions = [
    {
      id: 'mobile-web',
      title: 'Mobile App (웹 버전)',
      description:
        'React Native Web으로 구현된 모바일 앱의 웹 버전. 포트 3000에서 실행 중이며, 모바일 UI/UX를 웹에서 확인할 수 있습니다.',
      path: '/mobile-web',
      icon: <PhoneAndroidIcon sx={{ fontSize: 48 }} />,
      color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      features: ['React Native Web', '모바일 UI', '포트 3000', 'Vite 실행'],
      status: 'working',
    },
    {
      id: 'legacy',
      title: 'Legacy Home (포트 8000)',
      description:
        '기존 작업 중이던 완전한 랜딩 페이지. 4738줄의 풍부한 컨텐츠와 상세한 섹션으로 구성된 루트 레벨 index.html 파일입니다.',
      path: '/legacy',
      icon: <LightbulbIcon sx={{ fontSize: 48 }} />,
      color: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
      features: ['4738줄 HTML', '완전한 랜딩 페이지', '포트 8000', '실제 작업 파일'],
      status: 'working',
    },
    {
      id: 'splash',
      title: '예비화면 (Splash Screen)',
      description:
        '사이버펑크 네온 스타일의 초기 로딩 화면. 브랜드 아이덴티티를 강조하며 2.5초 후 자동으로 메인으로 이동합니다.',
      path: '/splash',
      icon: <RocketIcon sx={{ fontSize: 48 }} />,
      color: 'linear-gradient(135deg, #00f5ff 0%, #ff00ff 100%)',
      features: ['네온 그라디언트', '로딩 애니메이션', '자동 내비게이션', '펄스 효과'],
      status: 'new',
    },
    {
      id: 'home-compact',
      title: 'HomePage (컴팩트 버전)',
      description:
        '컴포넌트 기반의 간결한 홈페이지. HeroGallery와 IntroSlider를 활용한 모던한 디자인입니다.',
      path: '/',
      icon: <ViewModuleIcon sx={{ fontSize: 48 }} />,
      color: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
      features: ['HeroGallery', 'IntroSlider', '컴포넌트 기반', '798줄 코드'],
      status: 'current',
    },
    {
      id: 'home-full',
      title: 'Home (풀 디자인 버전)',
      description:
        '풍부한 애니메이션과 스타일 컴포넌트로 구성된 완전한 랜딩 페이지. 다양한 시각 효과와 인터랙션을 제공합니다.',
      path: '/home-full',
      icon: <AutoAwesomeIcon sx={{ fontSize: 48 }} />,
      color: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
      features: ['풀 애니메이션', 'Styled Components', '상세한 섹션', '2013줄 코드'],
      status: 'featured',
    },
    {
      id: 'new-home',
      title: 'New Home (레거시)',
      description: '이전에 작업하던 홈페이지 버전. home-full과 동일한 컨텐츠입니다.',
      path: '/new-home',
      icon: <LightbulbIcon sx={{ fontSize: 48 }} />,
      color: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
      features: ['레거시 라우트', '호환성 유지', '실험적 디자인'],
      status: 'legacy',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'working':
        return '#f59e0b';
      case 'new':
        return '#00f5ff';
      case 'current':
        return '#2563eb';
      case 'featured':
        return '#ffd700';
      case 'legacy':
        return '#6b7280';
      default:
        return '#9ca3af';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'working':
        return '작업중';
      case 'new':
        return '신규';
      case 'current':
        return '현재';
      case 'featured':
        return '추천';
      case 'legacy':
        return '레거시';
      default:
        return '';
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        py: 8,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 배경 장식 */}
      <Box
        sx={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 70%)',
          top: '-10%',
          right: '-5%',
          animation: 'pulse 4s ease-in-out infinite',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)',
          bottom: '-5%',
          left: '-3%',
          animation: 'pulse 3s ease-in-out infinite 1s',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* 헤더 */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '2rem', sm: '3rem' },
              background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
            }}
          >
            PIIP 홈페이지 버전 선택
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: '#94a3b8',
              fontWeight: 400,
              maxWidth: '700px',
              margin: '0 auto',
            }}
          >
            다양한 홈페이지 디자인 버전을 탐색하고 비교해보세요
          </Typography>
        </Box>

        {/* 홈페이지 카드 그리드 */}
        <Grid container spacing={4}>
          {homeVersions.map((version) => (
            <Grid item xs={12} md={6} key={version.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'rgba(30, 41, 59, 0.7)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(148, 163, 184, 0.1)',
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                    borderColor: 'rgba(148, 163, 184, 0.3)',
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 4 }}>
                  {/* 아이콘 및 상태 */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: 2,
                        background: version.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                      }}
                    >
                      {version.icon}
                    </Box>
                    <Chip
                      label={getStatusLabel(version.status)}
                      size="small"
                      sx={{
                        bgcolor: getStatusColor(version.status),
                        color: '#fff',
                        fontWeight: 600,
                        height: 28,
                      }}
                    />
                  </Box>

                  {/* 제목 및 설명 */}
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color: '#fff',
                      mb: 2,
                    }}
                  >
                    {version.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#cbd5e1',
                      lineHeight: 1.7,
                      mb: 3,
                    }}
                  >
                    {version.description}
                  </Typography>

                  {/* 특징 태그 */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {version.features.map((feature, idx) => (
                      <Chip
                        key={idx}
                        label={feature}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(148, 163, 184, 0.1)',
                          color: '#94a3b8',
                          fontSize: '0.75rem',
                        }}
                      />
                    ))}
                  </Box>
                </CardContent>

                <CardActions sx={{ p: 3, pt: 0 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => navigate(version.path)}
                    sx={{
                      background: version.color,
                      color: '#fff',
                      fontWeight: 600,
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '1rem',
                      '&:hover': {
                        opacity: 0.9,
                        background: version.color,
                      },
                    }}
                  >
                    이 페이지 보기
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* 하단 안내 */}
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
            각 버전은 독립적으로 작동하며, 언제든지 전환할 수 있습니다
          </Typography>
          <Button
            variant="outlined"
            onClick={() => navigate('/dashboard')}
            sx={{
              borderColor: '#475569',
              color: '#94a3b8',
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              '&:hover': {
                borderColor: '#64748b',
                bgcolor: 'rgba(148, 163, 184, 0.1)',
              },
            }}
          >
            대시보드로 이동
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default HomeSelector;
