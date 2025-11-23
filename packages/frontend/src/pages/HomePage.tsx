import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  Dialog,
  DialogContent,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import { Close as CloseIcon, PlayCircleOutline as PlayIcon } from '@mui/icons-material';
import { HeroGallery } from '../components/HeroGallery';
import { AppButton } from '../components/AppButton';
import { IntroSlider, type SlideData } from '../components/IntroSlider';
import { useNavigate } from 'react-router-dom';
import type { LightboxImage } from '../components/Lightbox';

const HomePage: React.FC = () => {
  // 관리자 통계 상태
  const [adminStats, setAdminStats] = useState<any>(null);
  useEffect(() => {
    fetch('/api/dashboard/admin', { credentials: 'include' })
      .then((res) => res.json())
      .then(setAdminStats)
      .catch(() => setAdminStats(null));
  }, []);
  // 사건 의뢰 폼으로 이동
  const navigate = useNavigate();
  const [introModalOpen, setIntroModalOpen] = useState(false);
  // 환경변수에 소개 영상 URL이 있으면 임베드, 없으면 대체 콘텐츠 표시
  const introVideoUrl = (import.meta as any).env?.VITE_INTRO_VIDEO_URL as string | undefined;
  const toYouTubeEmbed = (url: string) => {
    try {
      const u = new URL(url);
      if (u.hostname.includes('youtube.com')) {
        const v = u.searchParams.get('v');
        if (v) return `https://www.youtube.com/embed/${v}`;
        // shorts, embed 등 기타 형태는 그대로 사용
        if (u.pathname.startsWith('/embed/')) return url;
        if (u.pathname.startsWith('/shorts/')) {
          const id = u.pathname.split('/').pop();
          if (id) return `https://www.youtube.com/embed/${id}`;
        }
      }
      if (u.hostname.includes('youtu.be')) {
        const id = u.pathname.replace('/', '');
        if (id) return `https://www.youtube.com/embed/${id}`;
      }
    } catch {
      /* ignore invalid url formats */
    }
    return url; // 기타 URL은 그대로 반환 (mp4 등)
  };

  // 갤러리 이미지 (임시 경로, 나중에 실제 이미지로 교체)
  const galleryImages: LightboxImage[] = [
    {
      src: '/images/탐정사진 기본.png',
      alt: '전문 탐정 서비스',
      caption: 'PIIP 플랫폼',
    },
  ];

  // 탐정 업무 유형
  const detectiveServices = [
    {
      icon: 'search',
      title: '행적 조사',
      description: '배우자 부정 의심, 직원 근태 확인 등 대상자의 동선과 행동 패턴 파악',
    },
    {
      icon: 'fact_check',
      title: '신원 조사',
      description: '결혼 전 신원조회, 채용 검증, 사업 파트너 신뢰도 확인',
    },
    {
      icon: 'gavel',
      title: '법적 증거 수집',
      description: '민사·형사 소송을 위한 법적 효력이 있는 증거 자료 확보',
    },
    {
      icon: 'business_center',
      title: '기업 조사',
      description: '산업 스파이, 내부 부정행위, 기업 실사 등 기업 관련 조사',
    },
    {
      icon: 'location_searching',
      title: '실종자 찾기',
      description: '가족, 친구, 채무자 등 연락이 끊긴 사람의 소재 파악',
    },
    {
      icon: 'security',
      title: '사이버 조사',
      description: '온라인 사기, 명예훼손, 개인정보 유출 등 디지털 증거 수집',
    },
  ];

  // 업무 처리 흐름
  const workflowSteps = [
    {
      label: '상담 신청',
      description: 'AI 챗봇 또는 전화 상담으로 사건 내용 접수',
      detail: '24시간 자동 응대 시스템으로 언제든 상담 가능',
    },
    {
      label: '견적 및 계약',
      description: '자동 견적 산출 후 계약서 전자 서명',
      detail: '투명한 비용 구조와 맞춤형 조사 계획 제공',
    },
    {
      label: '조사 진행',
      description: '전문 탐정의 현장 조사 및 증거 수집',
      detail: '실시간 진행 상황 공유 및 중간 보고',
    },
    {
      label: '증거 분석',
      description: 'AI 기반 이미지 분석 및 패턴 인식',
      detail: '블록체인 기반 증거 무결성 보장',
    },
    {
      label: '보고서 작성',
      description: '조사 결과 종합 및 법적 효력 있는 보고서 생성',
      detail: '사진, 동영상, 위치 정보 등 모든 증거 첨부',
    },
    {
      label: '사후 관리',
      description: '법적 자문 연계 및 추가 조치 지원',
      detail: '변호사 협력 네트워크를 통한 후속 조치',
    },
  ];

  // 플랫폼 특장점
  const platformBenefits = [
    {
      icon: 'speed',
      title: '빠른 대응',
      description: 'AI 챗봇 24시간 상담, 30분 내 전문가 배정',
      color: '#2563eb',
    },
    {
      icon: 'verified_user',
      title: '보안 보장',
      description: '블록체인 증거 보관, 엔드투엔드 암호화',
      color: '#059669',
    },
    {
      icon: 'insights',
      title: 'AI 분석',
      description: '얼굴 인식, 차량 추적, 패턴 분석 자동화',
      color: '#7c3aed',
    },
    {
      icon: 'attach_money',
      title: '합리적 비용',
      description: '자동화로 인한 운영 효율화, 투명한 가격 정책',
      color: '#ea580c',
    },
    {
      icon: 'groups',
      title: '전문 인력',
      description: '경찰 출신 등 검증된 탐정 네트워크',
      color: '#0891b2',
    },
    {
      icon: 'policy',
      title: '법적 보호',
      description: '변호사 협력, 법정 증거 효력 보장',
      color: '#dc2626',
    },
  ];

  // 소개 슬라이드 데이터 (영상이 없을 때 사용)
  const introSlides: SlideData[] = [
    {
      title: '올인원 탐정 플랫폼',
      description: '사건 관리부터 증거 수집, 보고서 생성까지 한 곳에서',
      backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      title: 'AI 기반 자동화',
      description: '얼굴 인식, 차량 추적, 패턴 분석으로 조사 시간 90% 단축',
      backgroundColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
      title: '블록체인 증거 보관',
      description: '법정 효력 인정, 무결성 보장, 안전한 데이터 관리',
      backgroundColor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
  ];

  // 실제 고객 사례
  const customerCases = [
    {
      title: '배우자 부정 조사',
      before: '의심만 있고 증거 없음',
      after: '법정 제출 가능한 영상·사진 확보',
      period: '7일',
      result: '이혼 소송에서 유리한 합의',
      color: '#2563eb',
    },
    {
      title: '산업 스파이 적발',
      before: '내부 정보 유출 의심',
      after: '범인 특정 및 유출 경로 파악',
      period: '14일',
      result: '형사 고발 성공',
      color: '#059669',
    },
    {
      title: '실종 가족 찾기',
      before: '3년간 연락 두절',
      after: '현재 거주지 및 근무처 파악',
      period: '5일',
      result: '가족 재회 성사',
      color: '#7c3aed',
    },
  ];

  // 주요 기능 카드
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
    {
      icon: 'calendar_month',
      title: '상담 예약',
      description: 'AI 인테이크 챗봇과 캘린더 일정 관리',
      link: '/dashboard',
    },
    {
      icon: 'request_quote',
      title: '견적 자동화',
      description: '자동 견적 생성 및 결제 시스템',
      link: '/dashboard',
    },
    {
      icon: 'people',
      title: '인물 관리',
      description: '조사 대상 인물 정보 및 관계망 시각화',
      link: '/persons',
    },
  ];

  return (
    <>
      {/* 실시간 관리자 통계 섹션 */}
      {adminStats && (
        <Box sx={{ py: 5 }}>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            실시간 플랫폼 통계
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6">총 사건</Typography>
                <Typography variant="h4">{adminStats.cases?.total ?? 0}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6">총 탐정</Typography>
                <Typography variant="h4">{adminStats.detectives?.total ?? 0}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6">총 배정</Typography>
                <Typography variant="h4">{adminStats.assignments?.total ?? 0}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6">총 견적</Typography>
                <Typography variant="h4">{adminStats.revenue?.totalQuotes ?? 0}</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}
      <HeroGallery
        images={galleryImages}
        title="전문 탐정 서비스"
        subtitle="PIIP 플랫폼으로 모든 조사 업무를 한 곳에서"
      />

      {/* Introduction Section */}
      <Container maxWidth="lg">
        <Box sx={{ py: 6, textAlign: 'center' }}>
          {/* 회원가입 버튼 상단 배치 */}
          <Box sx={{ mb: 4 }}>
            <AppButton variant="primary" size="lg" onClick={() => navigate('/signup')}>
              회원가입
            </AppButton>
          </Box>

          <Typography variant="h3" component="h2" gutterBottom fontWeight={700}>
            PIIP 플랫폼이란?
          </Typography>
          <Typography
            variant="body1"
            paragraph
            color="text.secondary"
            sx={{ maxWidth: '800px', mx: 'auto', fontSize: '1.125rem', mb: 3 }}
          >
            탐정 1인이 모든 업무를 하나의 플랫폼에서 끝낼 수 있는 올인원 솔루션. 사건 관리부터 증거
            수집, AI 분석, 보고서 생성까지 모든 프로세스를 자동화합니다.
          </Typography>
          <Box>
            <AppButton
              variant="secondary"
              onClick={() => setIntroModalOpen(true)}
              icon={<PlayIcon />}
            >
              {introVideoUrl ? '플랫폼 소개 영상 보기' : '플랫폼 소개 보기'}
            </AppButton>
          </Box>
        </Box>

        {/* Detective Services Section */}
        <Box
          sx={{
            py: 5,
            bgcolor: (theme) =>
              theme.palette.mode === 'light' ? '#f8fafc' : 'rgba(255,255,255,0.02)',
            borderRadius: 2,
            my: 5,
          }}
        >
          <Container maxWidth="lg">
            <Typography
              variant="h4"
              component="h3"
              gutterBottom
              fontWeight={600}
              textAlign="center"
              sx={{ mb: 4 }}
            >
              탐정 업무 영역
            </Typography>
            <Grid container spacing={3}>
              {detectiveServices.map((service, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card
                    sx={{
                      height: '100%',
                      transition: 'all 0.2s',
                      '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Box
                          component="span"
                          className="material-icons-outlined"
                          sx={{ fontSize: '40px', color: 'primary.main' }}
                        >
                          {service.icon}
                        </Box>
                        <Typography variant="h6" component="h4" fontWeight={600}>
                          {service.title}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {service.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* Workflow Timeline Section */}
        <Box sx={{ py: 5 }}>
          <Typography
            variant="h4"
            component="h3"
            gutterBottom
            fontWeight={600}
            textAlign="center"
            sx={{ mb: 4 }}
          >
            업무 처리 흐름
          </Typography>
          <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
            <Stepper orientation="vertical">
              {workflowSteps.map((step, index) => (
                <Step key={index} active={true} completed={false}>
                  <StepLabel
                    StepIconProps={{
                      sx: { fontSize: '2rem' },
                    }}
                  >
                    <Typography variant="h6" fontWeight={600}>
                      {step.label}
                    </Typography>
                  </StepLabel>
                  <StepContent>
                    <Typography variant="body1" paragraph>
                      {step.description}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {step.detail}
                    </Typography>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </Box>
        </Box>

        {/* Platform Benefits Section */}
        <Box
          sx={{
            py: 5,
            bgcolor: (theme) =>
              theme.palette.mode === 'light' ? '#f8fafc' : 'rgba(255,255,255,0.02)',
            borderRadius: 2,
            my: 5,
          }}
        >
          <Container maxWidth="lg">
            <Typography
              variant="h4"
              component="h3"
              gutterBottom
              fontWeight={600}
              textAlign="center"
              sx={{ mb: 4 }}
            >
              PIIP 플랫폼만의 특장점
            </Typography>
            <Grid container spacing={3}>
              {platformBenefits.map((benefit, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Paper
                    sx={{
                      p: 3,
                      height: '100%',
                      borderTop: `4px solid ${benefit.color}`,
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box
                        component="span"
                        className="material-icons-outlined"
                        sx={{ fontSize: '40px', color: benefit.color }}
                      >
                        {benefit.icon}
                      </Box>
                      <Typography variant="h6" component="h4" fontWeight={600}>
                        {benefit.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {benefit.description}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        <Divider sx={{ my: 5 }} />

        {/* Customer Case Studies Section */}
        <Box sx={{ py: 5 }}>
          <Typography
            variant="h4"
            component="h3"
            gutterBottom
            fontWeight={600}
            textAlign="center"
            sx={{ mb: 1 }}
          >
            실제 사례
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            sx={{ mb: 4, maxWidth: '600px', mx: 'auto' }}
          >
            PIIP 플랫폼을 통해 해결된 실제 고객 사건입니다
          </Typography>
          <Grid container spacing={3}>
            {customerCases.map((caseItem, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    borderTop: `4px solid ${caseItem.color}`,
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight={600}>
                      {caseItem.title}
                    </Typography>
                    <Box sx={{ my: 2 }}>
                      <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                        <Typography variant="body2" color="error" fontWeight={600}>
                          Before:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {caseItem.before}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Typography variant="body2" color="success.main" fontWeight={600}>
                          After:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {caseItem.after}
                        </Typography>
                      </Box>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        조사 기간:
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {caseItem.period}
                      </Typography>
                    </Box>
                    <Paper
                      sx={{
                        p: 1.5,
                        bgcolor: (theme) =>
                          theme.palette.mode === 'light' ? '#f0fdf4' : 'success.dark',
                        textAlign: 'center',
                      }}
                    >
                      <Typography variant="body2" fontWeight={600}>
                        ✓ {caseItem.result}
                      </Typography>
                    </Paper>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <AppButton variant="secondary" onClick={() => navigate('/about')}>
              더 많은 사례 보기
            </AppButton>
          </Box>
        </Box>

        <Divider sx={{ my: 5 }} />

        {/* Features Grid */}
        <Box sx={{ py: 5 }}>
          <Typography
            variant="h4"
            component="h3"
            gutterBottom
            fontWeight={600}
            textAlign="center"
            sx={{ mb: 3 }}
          >
            주요 기능
          </Typography>
          <Grid container spacing={3}>
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
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                  onClick={() => navigate(feature.link)}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                    }}
                  >
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
        </Box>

        {/* CTA Section */}
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <Typography variant="h4" component="h3" gutterBottom fontWeight={600}>
            지금 바로 시작하세요
          </Typography>
          <Typography variant="body1" paragraph color="text.secondary" sx={{ mb: 3 }}>
            무료 상담으로 PIIP 플랫폼의 강력한 기능을 경험해보세요
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <AppButton variant="primary" onClick={() => navigate('/dashboard')}>
              대시보드 보기
            </AppButton>
            <AppButton variant="secondary" onClick={() => navigate('/cases')}>
              사건 관리 시작
            </AppButton>
          </Box>
        </Box>
      </Container>

      {/* Introduction Video/Media Modal */}
      <Dialog
        open={introModalOpen}
        onClose={() => setIntroModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          <IconButton
            onClick={() => setIntroModalOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              zIndex: 1,
              bgcolor: 'rgba(0,0,0,0.5)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.7)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>

          {/* 영상 또는 이미지 슬라이드 영역 */}
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom fontWeight={700}>
              PIIP 플랫폼 소개
            </Typography>

            {/* 영상/이미지 영역: URL이 있으면 임베드, 없으면 대체 콘텐츠 */}
            <Box sx={{ mt: 3, width: '100%', mb: 3 }}>
              {introVideoUrl ? (
                introVideoUrl.match(/youtube\.com|youtu\.be/i) ? (
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      pt: '56.25%', // 16:9
                      borderRadius: 2,
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      component="iframe"
                      src={toYouTubeEmbed(introVideoUrl)}
                      title="PIIP 소개 영상"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        border: 0,
                      }}
                    />
                  </Box>
                ) : introVideoUrl.match(/\.(mp4|webm|ogg)(\?.*)?$/i) ? (
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      pt: '56.25%',
                      borderRadius: 2,
                      overflow: 'hidden',
                      bgcolor: (theme) =>
                        theme.palette.mode === 'light' ? '#000' : 'rgba(255,255,255,0.05)',
                    }}
                  >
                    <Box
                      component="video"
                      src={introVideoUrl}
                      controls
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </Box>
                ) : (
                  // 기타 URL은 링크로 제공
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="body1" gutterBottom>
                      소개 링크
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <a href={introVideoUrl} target="_blank" rel="noreferrer">
                        {introVideoUrl}
                      </a>
                    </Typography>
                  </Paper>
                )
              ) : (
                <IntroSlider slides={introSlides} autoPlayInterval={5000} />
              )}
            </Box>

            {/* 주요 포인트 */}
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} md={4}>
                <Paper
                  sx={{
                    p: 2,
                    bgcolor: (theme) =>
                      theme.palette.mode === 'light' ? '#dbeafe' : 'primary.dark',
                  }}
                >
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    올인원 플랫폼
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    사건부터 증거, 보고서까지 한 곳에서 관리
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper
                  sx={{
                    p: 2,
                    bgcolor: (theme) =>
                      theme.palette.mode === 'light' ? '#dcfce7' : 'success.dark',
                  }}
                >
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    AI 자동화
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    얼굴 인식, 패턴 분석으로 업무 효율 10배 향상
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper
                  sx={{
                    p: 2,
                    bgcolor: (theme) =>
                      theme.palette.mode === 'light' ? '#fef3c7' : 'warning.dark',
                  }}
                >
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    블록체인 보안
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    증거 무결성 보장, 법정 효력 인정
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
              <AppButton
                variant="primary"
                onClick={() => {
                  setIntroModalOpen(false);
                  navigate('/dashboard');
                }}
              >
                지금 시작하기
              </AppButton>
              <AppButton variant="secondary" onClick={() => setIntroModalOpen(false)}>
                닫기
              </AppButton>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HomePage;
