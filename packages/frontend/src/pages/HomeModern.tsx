import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  IconButton,
  Avatar,
  Rating,
  Divider,
  Stack,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Shield,
  VerifiedUser,
  Description,
  CloudUpload,
  CheckCircle,
  Star,
  LocationOn,
  Phone,
  Chat,
  Gavel,
  ViewInAr,
  Timeline,
  Assignment,
  PersonSearch,
  Close,
  Email,
  Lock,
  Psychology,
  Public,
  Store,
  AutoAwesome,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const HomeModern: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // 신뢰 지표 데이터
  const trustMetrics = [
    {
      icon: <PersonSearch />,
      value: '1,247',
      label: '등록 탐정',
      color: theme.palette.primary.main,
    },
    {
      icon: <CheckCircle />,
      value: '8,352',
      label: '완료 사건',
      color: theme.palette.success.main,
    },
    { icon: <Star />, value: '4.8', label: '평균 평점', color: theme.palette.warning.main },
    { icon: <Shield />, value: '99.9%', label: '보안 수준', color: theme.palette.info.main },
  ];

  // 핵심 서비스 카드
  const coreServices = [
    {
      icon: <Assignment sx={{ fontSize: 48 }} />,
      title: '사건 의뢰',
      description: '복잡한 사건도 간편하게 의뢰하고, 전문 탐정의 매칭을 받아보세요.',
      features: ['빠른 접수', '전문가 매칭', '투명한 견적'],
      action: () => navigate('/cases/new'),
      actionLabel: '의뢰하기',
      color: theme.palette.primary.main,
    },
    {
      icon: <PersonSearch sx={{ fontSize: 48 }} />,
      title: '탐정 검색',
      description: '검증된 전문 탐정을 지역, 전문분야, 평점으로 검색하고 직접 선택하세요.',
      features: ['실명 인증', '경력 검증', '후기 보장'],
      action: () => navigate('/detectives'),
      actionLabel: '탐정 찾기',
      color: theme.palette.secondary.main,
    },
    {
      icon: <CloudUpload sx={{ fontSize: 48 }} />,
      title: '증거 보관소',
      description: '수집한 증거를 안전하게 보관하고 법적 효력을 보장받으세요.',
      features: ['암호화 저장', '법적 효력', '영구 보관'],
      action: () => navigate('/evidence'),
      actionLabel: '업로드',
      color: theme.palette.info.main,
    },
  ];

  // 6단계 프로세스
  const processSteps = [
    {
      step: '01',
      icon: <Description />,
      title: '사건 의뢰',
      desc: '온라인으로 사건 상세 내용 등록',
    },
    { step: '02', icon: <PersonSearch />, title: '탐정 매칭', desc: 'AI 기반 최적 탐정 추천' },
    { step: '03', icon: <Gavel />, title: '계약 체결', desc: '전자 계약 및 에스크로 결제' },
    { step: '04', icon: <Timeline />, title: '조사 진행', desc: '실시간 진행 상황 공유' },
    { step: '05', icon: <CloudUpload />, title: '증거 제출', desc: '블록체인 기반 증거 보관' },
    { step: '06', icon: <Description />, title: '보고서 완료', desc: '법적 효력 보장 최종 보고서' },
  ];

  // 추천 탐정 프로필
  const featuredDetectives = [
    {
      name: '김민수',
      avatar: '/images/detective1.jpg',
      specialty: '기업 조사 전문',
      location: '서울 강남구',
      rating: 4.9,
      cases: 342,
      verified: true,
    },
    {
      name: '박지연',
      avatar: '/images/detective2.jpg',
      specialty: '가족 문제 전문',
      location: '서울 서초구',
      rating: 4.8,
      cases: 289,
      verified: true,
    },
    {
      name: '이준호',
      avatar: '/images/detective3.jpg',
      specialty: '디지털 포렌식',
      location: '경기 성남시',
      rating: 5.0,
      cases: 156,
      verified: true,
    },
  ];

  const handleLogin = () => {
    // TODO: Redux loginThunk 연동
    console.log('Login:', { email, password, rememberMe });
    setLoginOpen(false);
  };

  const handleRegisterType = (type: 'client' | 'detective' | 'enterprise') => {
    setRegisterOpen(false);
    navigate(`/register?type=${type}`);
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          height: '600px',
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.primary.dark,
            0.95
          )} 0%, ${alpha(theme.palette.primary.main, 0.85)} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url(/images/hero-pattern.svg)',
            opacity: 0.1,
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <Typography
            variant="h1"
            sx={{
              color: 'white',
              fontWeight: 800,
              fontSize: { xs: '2.5rem', md: '4rem' },
              mb: 2,
              textShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}
          >
            진실을 밝히는
            <br />
            신뢰의 탐정 플랫폼
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: 'rgba(255,255,255,0.9)',
              mb: 4,
              fontWeight: 300,
              maxWidth: '800px',
              mx: 'auto',
            }}
          >
            대한민국 1위 탐정 매칭 플랫폼, PIIP에서 검증된 전문가를 만나보세요
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/cases/new')}
              sx={{
                bgcolor: '#FFB74D',
                background: 'linear-gradient(145deg, #FFD54F, #FFB74D)',
                color: '#1a1a1a',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 800,
                border: 'none',
                borderRadius: 2,
                boxShadow:
                  '0 8px 16px rgba(255, 183, 77, 0.4), inset 0 -2px 8px rgba(0,0,0,0.1), inset 0 2px 8px rgba(255,255,255,0.3)',
                textShadow: '0 1px 2px rgba(255,255,255,0.5)',
                '&:hover': {
                  background: 'linear-gradient(145deg, #FFE082, #FFCC80)',
                  transform: 'translateY(-2px)',
                  boxShadow:
                    '0 12px 24px rgba(255, 183, 77, 0.5), inset 0 -2px 8px rgba(0,0,0,0.15), inset 0 2px 8px rgba(255,255,255,0.4)',
                },
                '&:active': {
                  transform: 'translateY(0px)',
                  boxShadow: '0 4px 8px rgba(255, 183, 77, 0.3), inset 0 2px 8px rgba(0,0,0,0.2)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              사건 의뢰하기
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/detectives')}
              sx={{
                borderColor: 'white',
                bgcolor: 'rgba(255,255,255,0.1)',
                color: 'white',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 700,
                borderRadius: 2,
                borderWidth: 2,
                boxShadow:
                  '0 6px 12px rgba(0,0,0,0.3), inset 0 -1px 4px rgba(0,0,0,0.2), inset 0 1px 4px rgba(255,255,255,0.3)',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.2)',
                  transform: 'translateY(-2px)',
                  boxShadow:
                    '0 8px 16px rgba(0,0,0,0.4), inset 0 -1px 4px rgba(0,0,0,0.2), inset 0 1px 4px rgba(255,255,255,0.4)',
                },
                '&:active': {
                  transform: 'translateY(0px)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3), inset 0 2px 8px rgba(0,0,0,0.3)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              탐정 찾기
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Trust Metrics Bar */}
      <Box
        sx={{
          bgcolor: 'white',
          py: 3,
          borderBottom: `1px solid ${theme.palette.divider}`,
          position: 'sticky',
          top: 64,
          zIndex: 10,
          boxShadow: theme.shadows[2],
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={2}>
            {trustMetrics.map((metric, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center">
                  <Box sx={{ color: metric.color }}>{metric.icon}</Box>
                  <Box>
                    <Typography variant="h5" fontWeight={700} color={metric.color}>
                      {metric.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {metric.label}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Core Services Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" fontWeight={700} textAlign="center" mb={6}>
          핵심 서비스
        </Typography>
        <Grid container spacing={4}>
          {coreServices.map((service, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: theme.shadows[12],
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 4 }}>
                  <Box sx={{ color: service.color, mb: 2 }}>{service.icon}</Box>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    {service.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" mb={3}>
                    {service.description}
                  </Typography>
                  <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
                    {service.features.map((feature, i) => (
                      <Chip
                        key={i}
                        label={feature}
                        size="small"
                        sx={{
                          bgcolor: alpha(service.color, 0.1),
                          color: service.color,
                          fontWeight: 600,
                          mb: 1,
                        }}
                      />
                    ))}
                  </Stack>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                  <Button
                    variant="contained"
                    onClick={service.action}
                    sx={{
                      bgcolor: '#FFB74D',
                      background: 'linear-gradient(145deg, #FFD54F, #FFB74D)',
                      color: '#1a1a1a',
                      fontWeight: 700,
                      px: 4,
                      borderRadius: 2,
                      boxShadow:
                        '0 6px 12px rgba(255, 183, 77, 0.3), inset 0 -2px 6px rgba(0,0,0,0.1), inset 0 2px 6px rgba(255,255,255,0.3)',
                      textShadow: '0 1px 2px rgba(255,255,255,0.5)',
                      '&:hover': {
                        background: 'linear-gradient(145deg, #FFE082, #FFCC80)',
                        transform: 'translateY(-2px)',
                        boxShadow:
                          '0 8px 16px rgba(255, 183, 77, 0.4), inset 0 -2px 6px rgba(0,0,0,0.15), inset 0 2px 6px rgba(255,255,255,0.4)',
                      },
                      '&:active': {
                        transform: 'translateY(0px)',
                        boxShadow:
                          '0 3px 6px rgba(255, 183, 77, 0.3), inset 0 2px 6px rgba(0,0,0,0.2)',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {service.actionLabel}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Process Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.secondary.dark,
            0.05
          )} 0%, ${alpha(theme.palette.secondary.light, 0.05)} 100%)`,
          py: 8,
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h3" fontWeight={700} textAlign="center" mb={2}>
            진행 프로세스
          </Typography>
          <Typography variant="h6" color="text.secondary" textAlign="center" mb={6}>
            투명하고 체계적인 6단계 조사 과정
          </Typography>
          <Grid container spacing={3}>
            {processSteps.map((step, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    bgcolor: 'white',
                    borderTop: `4px solid ${theme.palette.primary.main}`,
                  }}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography
                      variant="h4"
                      fontWeight={800}
                      color="primary"
                      sx={{ opacity: 0.2, mb: 1 }}
                    >
                      {step.step}
                    </Typography>
                    <Box sx={{ color: theme.palette.primary.main, mb: 2 }}>{step.icon}</Box>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      {step.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {step.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Featured Detectives Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" fontWeight={700} textAlign="center" mb={2}>
          추천 전문 탐정
        </Typography>
        <Typography variant="h6" color="text.secondary" textAlign="center" mb={6}>
          검증된 최고의 전문가들을 만나보세요
        </Typography>
        <Grid container spacing={4}>
          {featuredDetectives.map((detective, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <CardContent sx={{ textAlign: 'center', pt: 4 }}>
                  <Avatar
                    src={detective.avatar}
                    sx={{
                      width: 100,
                      height: 100,
                      mx: 'auto',
                      mb: 2,
                      border: `4px solid ${theme.palette.primary.main}`,
                    }}
                  >
                    {detective.name[0]}
                  </Avatar>
                  <Stack direction="row" spacing={0.5} justifyContent="center" mb={1}>
                    <Typography variant="h6" fontWeight={700}>
                      {detective.name}
                    </Typography>
                    {detective.verified && <VerifiedUser color="primary" sx={{ fontSize: 20 }} />}
                  </Stack>
                  <Chip
                    label={detective.specialty}
                    size="small"
                    color="primary"
                    sx={{ mb: 2, fontWeight: 600 }}
                  />
                  <Stack direction="row" spacing={0.5} justifyContent="center" mb={1}>
                    <Rating value={detective.rating} precision={0.1} readOnly size="small" />
                    <Typography variant="body2" fontWeight={700}>
                      {detective.rating}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" mb={0.5}>
                    <LocationOn sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                    {detective.location}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    완료 사건: {detective.cases}건
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<Chat />}
                      onClick={() => navigate(`/detectives/${index + 1}`)}
                      sx={{
                        bgcolor: '#FFB74D',
                        background: 'linear-gradient(145deg, #FFD54F, #FFB74D)',
                        color: '#1a1a1a',
                        fontWeight: 700,
                        borderRadius: 2,
                        boxShadow:
                          '0 4px 8px rgba(255, 183, 77, 0.3), inset 0 -1px 4px rgba(0,0,0,0.1), inset 0 1px 4px rgba(255,255,255,0.3)',
                        '&:hover': {
                          background: 'linear-gradient(145deg, #FFE082, #FFCC80)',
                          boxShadow:
                            '0 6px 12px rgba(255, 183, 77, 0.4), inset 0 -1px 4px rgba(0,0,0,0.15), inset 0 1px 4px rgba(255,255,255,0.4)',
                        },
                        '&:active': {
                          boxShadow:
                            '0 2px 4px rgba(255, 183, 77, 0.3), inset 0 2px 4px rgba(0,0,0,0.2)',
                        },
                      }}
                    >
                      상담하기
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => navigate(`/detectives/${index + 1}`)}
                      sx={{
                        borderColor: theme.palette.primary.main,
                        color: theme.palette.primary.main,
                        borderWidth: 2,
                        borderRadius: 2,
                        fontWeight: 600,
                        boxShadow:
                          '0 4px 8px rgba(21, 101, 192, 0.2), inset 0 -1px 2px rgba(0,0,0,0.05)',
                        '&:hover': {
                          borderColor: theme.palette.primary.dark,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          boxShadow:
                            '0 6px 12px rgba(21, 101, 192, 0.3), inset 0 -1px 2px rgba(0,0,0,0.1)',
                        },
                        '&:active': {
                          boxShadow:
                            '0 2px 4px rgba(21, 101, 192, 0.2), inset 0 2px 4px rgba(0,0,0,0.1)',
                        },
                      }}
                    >
                      프로필
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Box textAlign="center" mt={4}>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/detectives')}
            sx={{
              px: 4,
              borderColor: theme.palette.primary.main,
              color: theme.palette.primary.main,
              borderWidth: 2,
              borderRadius: 2,
              fontWeight: 600,
              boxShadow: '0 4px 8px rgba(21, 101, 192, 0.2), inset 0 -1px 2px rgba(0,0,0,0.05)',
              '&:hover': {
                borderColor: theme.palette.primary.dark,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                boxShadow: '0 6px 12px rgba(21, 101, 192, 0.3), inset 0 -1px 2px rgba(0,0,0,0.1)',
              },
              '&:active': {
                boxShadow: '0 2px 4px rgba(21, 101, 192, 0.2), inset 0 2px 4px rgba(0,0,0,0.1)',
              },
            }}
          >
            전체 탐정 보기
          </Button>
        </Box>
      </Container>

      {/* v2.0 Advanced Features Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.info.dark,
            0.03
          )} 0%, ${alpha(theme.palette.info.light, 0.05)} 100%)`,
          py: 8,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -100,
            right: -100,
            width: 300,
            height: 300,
            background: `radial-gradient(circle, ${alpha(
              theme.palette.primary.main,
              0.1
            )} 0%, transparent 70%)`,
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} mb={1}>
            <Chip
              label="NEW v2.0"
              color="primary"
              size="small"
              sx={{ fontWeight: 700, fontSize: '0.8rem' }}
            />
          </Stack>
          <Typography variant="h3" fontWeight={700} textAlign="center" mb={2}>
            차세대 확장 기능
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            textAlign="center"
            mb={6}
            sx={{ maxWidth: 700, mx: 'auto' }}
          >
            AI 기술과 글로벌 네트워크로 더욱 강력해진 탐정 서비스를 경험하세요
          </Typography>

          <Grid container spacing={4}>
            {/* AI 증거 분석 */}
            <Grid item xs={12} md={6} lg={3}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  background: `linear-gradient(135deg, ${alpha(
                    theme.palette.primary.light,
                    0.05
                  )} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
                  border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-12px)',
                    boxShadow: theme.shadows[16],
                    borderColor: theme.palette.primary.main,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 4 }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3,
                    }}
                  >
                    <Psychology sx={{ fontSize: 48, color: theme.palette.primary.main }} />
                  </Box>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    AI 증거 분석
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    mb={3}
                    sx={{ lineHeight: 1.8 }}
                  >
                    CCTV 영상, 음성 파일, 이미지를 AI가 자동 분석하여 핵심 증거를 추출합니다
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={0.5}
                    justifyContent="center"
                    flexWrap="wrap"
                    mb={2}
                  >
                    <Chip label="자동 분석" size="small" variant="outlined" />
                    <Chip label="신뢰도 %" size="small" variant="outlined" />
                    <Chip label="법적 검토" size="small" variant="outlined" />
                  </Stack>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      color: theme.palette.success.dark,
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  >
                    <AutoAwesome sx={{ fontSize: 14, mr: 0.5 }} />
                    AI 기반
                  </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/ai-evidence')}
                    sx={{
                      bgcolor: '#FFB74D',
                      background: 'linear-gradient(145deg, #FFD54F, #FFB74D)',
                      color: '#1a1a1a',
                      px: 4,
                      fontWeight: 700,
                      borderRadius: 2,
                      boxShadow:
                        '0 6px 12px rgba(255, 183, 77, 0.3), inset 0 -2px 6px rgba(0,0,0,0.1), inset 0 2px 6px rgba(255,255,255,0.3)',
                      '&:hover': {
                        background: 'linear-gradient(145deg, #FFE082, #FFCC80)',
                        transform: 'translateY(-2px)',
                        boxShadow:
                          '0 8px 16px rgba(255, 183, 77, 0.4), inset 0 -2px 6px rgba(0,0,0,0.15), inset 0 2px 6px rgba(255,255,255,0.4)',
                      },
                      '&:active': {
                        transform: 'translateY(0px)',
                        boxShadow:
                          '0 3px 6px rgba(255, 183, 77, 0.3), inset 0 2px 6px rgba(0,0,0,0.2)',
                      },
                    }}
                  >
                    자세히 보기
                  </Button>
                </CardActions>
              </Card>
            </Grid>

            {/* 국제 의뢰 */}
            <Grid item xs={12} md={6} lg={3}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  background: `linear-gradient(135deg, ${alpha(
                    theme.palette.info.light,
                    0.05
                  )} 0%, ${alpha(theme.palette.info.main, 0.02)} 100%)`,
                  border: `2px solid ${alpha(theme.palette.info.main, 0.1)}`,
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-12px)',
                    boxShadow: theme.shadows[16],
                    borderColor: theme.palette.info.main,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 4 }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: alpha(theme.palette.info.main, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3,
                    }}
                  >
                    <Public sx={{ fontSize: 48, color: theme.palette.info.main }} />
                  </Box>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    국제 의뢰
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    mb={3}
                    sx={{ lineHeight: 1.8 }}
                  >
                    85개국 342명의 글로벌 파트너와 함께 국경을 넘는 조사를 수행합니다
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={0.5}
                    justifyContent="center"
                    flexWrap="wrap"
                    mb={2}
                  >
                    <Chip label="85개국" size="small" variant="outlined" />
                    <Chip label="AI 번역" size="small" variant="outlined" />
                    <Chip label="실시간" size="small" variant="outlined" />
                  </Stack>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      bgcolor: alpha(theme.palette.info.main, 0.1),
                      color: theme.palette.info.dark,
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  >
                    🌏 글로벌
                  </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/international')}
                    sx={{
                      bgcolor: '#FFB74D',
                      background: 'linear-gradient(145deg, #FFD54F, #FFB74D)',
                      color: '#1a1a1a',
                      px: 4,
                      fontWeight: 700,
                      borderRadius: 2,
                      boxShadow:
                        '0 6px 12px rgba(255, 183, 77, 0.3), inset 0 -2px 6px rgba(0,0,0,0.1), inset 0 2px 6px rgba(255,255,255,0.3)',
                      '&:hover': {
                        background: 'linear-gradient(145deg, #FFE082, #FFCC80)',
                        transform: 'translateY(-2px)',
                        boxShadow:
                          '0 8px 16px rgba(255, 183, 77, 0.4), inset 0 -2px 6px rgba(0,0,0,0.15), inset 0 2px 6px rgba(255,255,255,0.4)',
                      },
                      '&:active': {
                        transform: 'translateY(0px)',
                        boxShadow:
                          '0 3px 6px rgba(255, 183, 77, 0.3), inset 0 2px 6px rgba(0,0,0,0.2)',
                      },
                    }}
                  >
                    자세히 보기
                  </Button>
                </CardActions>
              </Card>
            </Grid>

            {/* 법률 챗봇 */}
            <Grid item xs={12} md={6} lg={3}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  background: `linear-gradient(135deg, ${alpha(
                    theme.palette.secondary.light,
                    0.05
                  )} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
                  border: `2px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-12px)',
                    boxShadow: theme.shadows[16],
                    borderColor: theme.palette.secondary.main,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 4 }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: alpha(theme.palette.secondary.main, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3,
                    }}
                  >
                    <Gavel sx={{ fontSize: 48, color: theme.palette.secondary.main }} />
                  </Box>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    법률 챗봇
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    mb={3}
                    sx={{ lineHeight: 1.8 }}
                  >
                    AI 법률 자문과 실제 변호사 검토로 법적 쟁점을 명확히 파악합니다
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={0.5}
                    justifyContent="center"
                    flexWrap="wrap"
                    mb={2}
                  >
                    <Chip label="판례 검색" size="small" variant="outlined" />
                    <Chip label="법조문" size="small" variant="outlined" />
                    <Chip label="변호사" size="small" variant="outlined" />
                  </Stack>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      bgcolor: alpha(theme.palette.secondary.main, 0.1),
                      color: theme.palette.secondary.dark,
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  >
                    ⚖️ 법률
                  </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/legal-chatbot')}
                    sx={{
                      bgcolor: '#FFB74D',
                      background: 'linear-gradient(145deg, #FFD54F, #FFB74D)',
                      color: '#1a1a1a',
                      px: 4,
                      fontWeight: 700,
                      borderRadius: 2,
                      boxShadow:
                        '0 6px 12px rgba(255, 183, 77, 0.3), inset 0 -2px 6px rgba(0,0,0,0.1), inset 0 2px 6px rgba(255,255,255,0.3)',
                      '&:hover': {
                        background: 'linear-gradient(145deg, #FFE082, #FFCC80)',
                        transform: 'translateY(-2px)',
                        boxShadow:
                          '0 8px 16px rgba(255, 183, 77, 0.4), inset 0 -2px 6px rgba(0,0,0,0.15), inset 0 2px 6px rgba(255,255,255,0.4)',
                      },
                      '&:active': {
                        transform: 'translateY(0px)',
                        boxShadow:
                          '0 3px 6px rgba(255, 183, 77, 0.3), inset 0 2px 6px rgba(0,0,0,0.2)',
                      },
                    }}
                  >
                    자세히 보기
                  </Button>
                </CardActions>
              </Card>
            </Grid>

            {/* 프랜차이즈 */}
            <Grid item xs={12} md={6} lg={3}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  background: `linear-gradient(135deg, ${alpha(
                    theme.palette.success.light,
                    0.05
                  )} 0%, ${alpha(theme.palette.success.main, 0.02)} 100%)`,
                  border: `2px solid ${alpha(theme.palette.success.main, 0.1)}`,
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-12px)',
                    boxShadow: theme.shadows[16],
                    borderColor: theme.palette.success.main,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 4 }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3,
                    }}
                  >
                    <Store sx={{ fontSize: 48, color: theme.palette.success.main }} />
                  </Box>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    프랜차이즈
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    mb={3}
                    sx={{ lineHeight: 1.8 }}
                  >
                    본사와 지점을 연결하는 통합 관리 시스템으로 사업을 확장하세요
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={0.5}
                    justifyContent="center"
                    flexWrap="wrap"
                    mb={2}
                  >
                    <Chip label="지점 관리" size="small" variant="outlined" />
                    <Chip label="매출 분석" size="small" variant="outlined" />
                    <Chip label="정산" size="small" variant="outlined" />
                  </Stack>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      color: theme.palette.success.dark,
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  >
                    🏢 B2B
                  </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/franchise')}
                    sx={{
                      bgcolor: '#FFB74D',
                      background: 'linear-gradient(145deg, #FFD54F, #FFB74D)',
                      color: '#1a1a1a',
                      px: 4,
                      fontWeight: 700,
                      borderRadius: 2,
                      boxShadow:
                        '0 6px 12px rgba(255, 183, 77, 0.3), inset 0 -2px 6px rgba(0,0,0,0.1), inset 0 2px 6px rgba(255,255,255,0.3)',
                      '&:hover': {
                        background: 'linear-gradient(145deg, #FFE082, #FFCC80)',
                        transform: 'translateY(-2px)',
                        boxShadow:
                          '0 8px 16px rgba(255, 183, 77, 0.4), inset 0 -2px 6px rgba(0,0,0,0.15), inset 0 2px 6px rgba(255,255,255,0.4)',
                      },
                      '&:active': {
                        transform: 'translateY(0px)',
                        boxShadow:
                          '0 3px 6px rgba(255, 183, 77, 0.3), inset 0 2px 6px rgba(0,0,0,0.2)',
                      },
                    }}
                  >
                    자세히 보기
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>

          {/* 추가 설명 */}
          <Box
            sx={{
              mt: 6,
              p: 4,
              bgcolor: alpha(theme.palette.primary.main, 0.03),
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={8}>
                <Typography variant="h6" fontWeight={700} mb={1}>
                  🚀 v2.0으로 더욱 강력해진 PIIP
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  최신 AI 기술과 글로벌 네트워크를 활용하여 더 빠르고 정확한 조사를 제공합니다.
                  국내를 넘어 전 세계 어디서나 신뢰할 수 있는 탐정 서비스를 이용하세요.
                </Typography>
              </Grid>
              <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'center', md: 'right' } }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/modern')}
                  sx={{
                    bgcolor: '#FFB74D',
                    background: 'linear-gradient(145deg, #FFD54F, #FFB74D)',
                    color: '#1a1a1a',
                    px: 4,
                    py: 1.5,
                    fontWeight: 800,
                    borderRadius: 2,
                    boxShadow:
                      '0 6px 12px rgba(255, 183, 77, 0.3), inset 0 -2px 6px rgba(0,0,0,0.1), inset 0 2px 6px rgba(255,255,255,0.3)',
                    textShadow: '0 1px 2px rgba(255,255,255,0.5)',
                    '&:hover': {
                      background: 'linear-gradient(145deg, #FFE082, #FFCC80)',
                      transform: 'translateY(-2px)',
                      boxShadow:
                        '0 8px 16px rgba(255, 183, 77, 0.4), inset 0 -2px 6px rgba(0,0,0,0.15), inset 0 2px 6px rgba(255,255,255,0.4)',
                    },
                    '&:active': {
                      transform: 'translateY(0px)',
                      boxShadow:
                        '0 3px 6px rgba(255, 183, 77, 0.3), inset 0 2px 6px rgba(0,0,0,0.2)',
                    },
                  }}
                >
                  모든 기능 둘러보기
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          bgcolor: theme.palette.primary.main,
          color: 'white',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" fontWeight={700} mb={2}>
            지금 바로 시작하세요
          </Typography>
          <Typography variant="h6" mb={4} sx={{ opacity: 0.9 }}>
            복잡한 문제도 PIIP와 함께라면 해결할 수 있습니다
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/cases/new')}
              sx={{
                bgcolor: '#FFB74D',
                background: 'linear-gradient(145deg, #FFD54F, #FFB74D)',
                color: '#1a1a1a',
                px: 4,
                fontWeight: 800,
                borderRadius: 2,
                boxShadow:
                  '0 6px 12px rgba(255, 183, 77, 0.3), inset 0 -2px 6px rgba(0,0,0,0.1), inset 0 2px 6px rgba(255,255,255,0.3)',
                textShadow: '0 1px 2px rgba(255,255,255,0.5)',
                '&:hover': {
                  background: 'linear-gradient(145deg, #FFE082, #FFCC80)',
                  transform: 'translateY(-2px)',
                  boxShadow:
                    '0 8px 16px rgba(255, 183, 77, 0.4), inset 0 -2px 6px rgba(0,0,0,0.15), inset 0 2px 6px rgba(255,255,255,0.4)',
                },
                '&:active': {
                  transform: 'translateY(0px)',
                  boxShadow: '0 3px 6px rgba(255, 183, 77, 0.3), inset 0 2px 6px rgba(0,0,0,0.2)',
                },
              }}
            >
              사건 의뢰하기
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/detectives')}
              sx={{
                borderColor: 'white',
                borderWidth: 2,
                color: 'white',
                px: 4,
                fontWeight: 700,
                borderRadius: 2,
                boxShadow:
                  '0 4px 10px rgba(0,0,0,0.2), inset 0 -2px 4px rgba(0,0,0,0.15), inset 0 2px 4px rgba(255,255,255,0.15)',
                '&:hover': {
                  borderColor: 'white',
                  borderWidth: 2,
                  bgcolor: alpha(theme.palette.common.white, 0.15),
                  transform: 'translateY(-2px)',
                  boxShadow:
                    '0 6px 14px rgba(0,0,0,0.25), inset 0 -2px 4px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.2)',
                },
                '&:active': {
                  transform: 'translateY(0px)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2), inset 0 2px 4px rgba(0,0,0,0.25)',
                },
              }}
            >
              탐정 찾기
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: theme.palette.grey[900], color: 'white', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={3}>
              <Typography variant="h6" fontWeight={700} mb={2}>
                PIIP
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                대한민국 No.1 탐정 플랫폼
                <br />
                진실을 밝히는 신뢰의 파트너
              </Typography>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle1" fontWeight={700} mb={2}>
                서비스
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ opacity: 0.7, cursor: 'pointer' }}>
                  사건 의뢰
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.7, cursor: 'pointer' }}>
                  탐정 검색
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.7, cursor: 'pointer' }}>
                  증거 보관소
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.7, cursor: 'pointer' }}>
                  요금 안내
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle1" fontWeight={700} mb={2}>
                지원
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ opacity: 0.7, cursor: 'pointer' }}>
                  FAQ
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.7, cursor: 'pointer' }}>
                  고객센터
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.7, cursor: 'pointer' }}>
                  이용 가이드
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.7, cursor: 'pointer' }}>
                  공지사항
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle1" fontWeight={700} mb={2}>
                법률
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ opacity: 0.7, cursor: 'pointer' }}>
                  이용약관
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.7, cursor: 'pointer' }}>
                  개인정보처리방침
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.7, cursor: 'pointer' }}>
                  위치기반서비스
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="subtitle1" fontWeight={700} mb={2}>
                회사
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                  <Phone sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                  1588-0000
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                  <Email sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                  support@piip.kr
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.7, mt: 2 }}>
                  사업자등록번호: 000-00-00000
                  <br />
                  대표: 홍길동
                </Typography>
              </Stack>
            </Grid>
          </Grid>
          <Divider sx={{ my: 4, borderColor: alpha(theme.palette.common.white, 0.1) }} />
          <Typography variant="body2" textAlign="center" sx={{ opacity: 0.5 }}>
            © 2024 PIIP. All rights reserved.
          </Typography>
        </Container>
      </Box>

      {/* Login Dialog */}
      <Dialog open={loginOpen} onClose={() => setLoginOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          로그인
          <IconButton
            onClick={() => setLoginOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="이메일"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            InputProps={{
              startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
          <TextField
            fullWidth
            label="비밀번호"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            InputProps={{
              startAdornment: <Lock sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
          <FormControlLabel
            control={
              <Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
            }
            label="로그인 상태 유지"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setLoginOpen(false)}
            sx={{
              color: 'text.secondary',
              fontWeight: 600,
              '&:hover': {
                bgcolor: alpha(theme.palette.grey[500], 0.1),
              },
            }}
          >
            취소
          </Button>
          <Button
            variant="contained"
            onClick={handleLogin}
            sx={{
              bgcolor: '#FFB74D',
              background: 'linear-gradient(145deg, #FFD54F, #FFB74D)',
              color: '#1a1a1a',
              px: 4,
              fontWeight: 700,
              borderRadius: 2,
              boxShadow:
                '0 6px 12px rgba(255, 183, 77, 0.3), inset 0 -2px 6px rgba(0,0,0,0.1), inset 0 2px 6px rgba(255,255,255,0.3)',
              '&:hover': {
                background: 'linear-gradient(145deg, #FFE082, #FFCC80)',
                transform: 'translateY(-2px)',
                boxShadow:
                  '0 8px 16px rgba(255, 183, 77, 0.4), inset 0 -2px 6px rgba(0,0,0,0.15), inset 0 2px 6px rgba(255,255,255,0.4)',
              },
              '&:active': {
                transform: 'translateY(0px)',
                boxShadow: '0 3px 6px rgba(255, 183, 77, 0.3), inset 0 2px 6px rgba(0,0,0,0.2)',
              },
            }}
          >
            로그인
          </Button>
        </DialogActions>
        <Box sx={{ textAlign: 'center', pb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            계정이 없으신가요?{' '}
            <Typography
              component="span"
              variant="body2"
              color="primary"
              sx={{ cursor: 'pointer', fontWeight: 600 }}
              onClick={() => {
                setLoginOpen(false);
                setRegisterOpen(true);
              }}
            >
              회원가입
            </Typography>
          </Typography>
        </Box>
      </Dialog>

      {/* Register Type Selection Dialog */}
      <Dialog open={registerOpen} onClose={() => setRegisterOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          회원가입 유형 선택
          <IconButton
            onClick={() => setRegisterOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                }}
                onClick={() => handleRegisterType('client')}
              >
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <Assignment sx={{ fontSize: 64, color: theme.palette.primary.main, mb: 2 }} />
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    의뢰인
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    사건을 의뢰하고
                    <br />
                    전문가를 찾고 계신가요?
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                }}
                onClick={() => handleRegisterType('detective')}
              >
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <PersonSearch sx={{ fontSize: 64, color: theme.palette.secondary.main, mb: 2 }} />
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    탐정
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    전문 탐정으로서
                    <br />
                    활동하고 싶으신가요?
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                }}
                onClick={() => handleRegisterType('enterprise')}
              >
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <ViewInAr sx={{ fontSize: 64, color: theme.palette.info.main, mb: 2 }} />
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    기업
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    기업 단위로
                    <br />
                    서비스를 이용하시나요?
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>

      {/* Floating Action Buttons */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={() => setLoginOpen(true)}
          sx={{
            minWidth: 120,
            py: 1.5,
            fontWeight: 700,
            bgcolor: '#FFB74D',
            background: 'linear-gradient(145deg, #FFD54F, #FFB74D)',
            color: '#1a1a1a',
            borderRadius: 2,
            boxShadow:
              '0 8px 16px rgba(255, 183, 77, 0.4), inset 0 -2px 6px rgba(0,0,0,0.1), inset 0 2px 6px rgba(255,255,255,0.3)',
            textShadow: '0 1px 2px rgba(255,255,255,0.5)',
            '&:hover': {
              background: 'linear-gradient(145deg, #FFE082, #FFCC80)',
              transform: 'translateY(-2px)',
              boxShadow:
                '0 10px 20px rgba(255, 183, 77, 0.5), inset 0 -2px 6px rgba(0,0,0,0.15), inset 0 2px 6px rgba(255,255,255,0.4)',
            },
            '&:active': {
              transform: 'translateY(0px)',
              boxShadow: '0 4px 8px rgba(255, 183, 77, 0.4), inset 0 2px 6px rgba(0,0,0,0.2)',
            },
          }}
        >
          로그인
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => setRegisterOpen(true)}
          sx={{
            minWidth: 120,
            py: 1.5,
            fontWeight: 700,
            bgcolor: '#FFB74D',
            background: 'linear-gradient(145deg, #FFD54F, #FFB74D)',
            color: '#1a1a1a',
            borderRadius: 2,
            boxShadow:
              '0 8px 16px rgba(255, 183, 77, 0.4), inset 0 -2px 6px rgba(0,0,0,0.1), inset 0 2px 6px rgba(255,255,255,0.3)',
            textShadow: '0 1px 2px rgba(255,255,255,0.5)',
            '&:hover': {
              background: 'linear-gradient(145deg, #FFE082, #FFCC80)',
              transform: 'translateY(-2px)',
              boxShadow:
                '0 10px 20px rgba(255, 183, 77, 0.5), inset 0 -2px 6px rgba(0,0,0,0.15), inset 0 2px 6px rgba(255,255,255,0.4)',
            },
            '&:active': {
              transform: 'translateY(0px)',
              boxShadow: '0 4px 8px rgba(255, 183, 77, 0.4), inset 0 2px 6px rgba(0,0,0,0.2)',
            },
          }}
        >
          회원가입
        </Button>
      </Box>
    </Box>
  );
};

export default HomeModern;
