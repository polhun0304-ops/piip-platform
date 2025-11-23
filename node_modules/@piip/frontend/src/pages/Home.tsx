import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogContent,
  IconButton,
  Chip,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Divider,
  Paper,
  Link as MuiLink,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import {
  ExpandMore as ExpandMoreIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  BusinessCenter as BusinessCenterIcon,
  Close as CloseIcon,
  PlayCircleOutline as PlayCircleOutlineIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Verified as VerifiedIcon,
  Star as StarIcon,
  ArrowForward as ArrowForwardIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationOnIcon,
} from '@mui/icons-material';
import { PersonSearch as PersonSearchIcon } from '@mui/icons-material';
import {
  Search as SearchIcon,
  FactCheck as FactCheckIcon,
  Gavel as GavelIcon,
  LocationSearching as LocationSearchingIcon,
  PhotoLibrary as PhotoLibraryIcon,
  FolderOpen as FolderOpenIcon,
  Psychology as PsychologyIcon,
  CalendarMonth as CalendarMonthIcon,
  RequestQuote as RequestQuoteIcon,
  AttachMoney as AttachMoneyIcon,
  Policy as PolicyIcon,
} from '@mui/icons-material';
import { HeroGallery } from '../components/HeroGallery';
import PlatformIntroContent from '../components/PlatformIntroContent';
import { IntroSlider, type SlideData } from '../components/IntroSlider';
import type { LightboxImage } from '../components/Lightbox';
import { useNavigate } from 'react-router-dom';

// ============================================
// ANIMATIONS
// ============================================
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// (removed unused slideInLeft, slideInRight keyframes)

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

const gradientShift = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

// ============================================
// STYLED COMPONENTS
// ============================================

// Header & Navigation
const Header = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(10,37,64,0.98) 0%, rgba(30,41,59,0.95) 100%)',
  backdropFilter: 'blur(10px)',
  color: '#fff',
  padding: theme.spacing(2, 0),
  boxShadow: '0 4px 30px rgba(0,0,0,0.1)',
  position: 'sticky',
  top: 0,
  zIndex: 1100,
  borderBottom: '1px solid rgba(255,215,0,0.1)',
}));

const Nav = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  maxWidth: '1400px',
  margin: '0 auto',
  padding: theme.spacing(0, 3),
}));

const Logo = styled(Typography)(() => ({
  fontSize: '1.8rem',
  fontWeight: 'bold',
  letterSpacing: '-0.5px',
  background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  cursor: 'pointer',
  transition: 'transform 0.25s ease',
  '&:hover': {
    transform: 'scale(1.1)',
  },
  '&:focus': {
    outline: 'none',
  },
}));

// Logo container and avatar for home navigation
const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  cursor: 'pointer',
  transition: 'transform 0.25s ease',
  '&:hover': {
    transform: 'scale(1.1)',
  },
  '&:focus': {
    outline: 'none',
  },
}));

const LogoAvatar = styled(Avatar)(() => ({
  width: 44,
  height: 44,
  background: 'linear-gradient(135deg, rgba(255,215,0,0.2) 0%, rgba(255,237,78,0.25) 100%)',
  border: '1px solid rgba(255,215,0,0.6)',
  boxShadow: '0 6px 18px rgba(255,215,0,0.25)',
  color: '#ffd700',
  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: '0 10px 24px rgba(255,215,0,0.35)',
  },
}));

const NavLinks = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(4),
  alignItems: 'center',
  '& a': {
    color: '#fff',
    textDecoration: 'none',
    fontWeight: 500,
    fontSize: '1rem',
    transition: 'all 0.3s',
    position: 'relative',
    '&:after': {
      content: '""',
      position: 'absolute',
      bottom: '-5px',
      left: 0,
      width: '0%',
      height: '2px',
      background: '#ffd700',
      transition: 'width 0.3s',
    },
    '&:hover': {
      color: '#ffd700',
      '&:after': {
        width: '100%',
      },
    },
  },
  [theme.breakpoints.down('md')]: {
    gap: theme.spacing(2),
    fontSize: '0.9rem',
  },
}));

// Hero Section
const HeroSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  backgroundImage:
    "linear-gradient(135deg, rgba(10,37,64,0.92) 0%, rgba(30,41,59,0.88) 100%), url('/images/탐정사진 기본.png')",
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundAttachment: 'fixed',
  color: '#fff',
  textAlign: 'center',
  padding: theme.spacing(15, 2),
  overflow: 'hidden',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 30% 50%, rgba(255,215,0,0.15) 0%, transparent 50%)',
    pointerEvents: 'none',
  },
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(10, 2),
    backgroundAttachment: 'scroll',
  },
}));

const HeroTitle = styled(Typography)(({ theme }) => ({
  fontSize: '4.5rem',
  fontWeight: 800,
  marginBottom: theme.spacing(3),
  lineHeight: 1.1,
  background: 'linear-gradient(135deg, #ffffff 0%, #ffd700 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  animation: `${fadeIn} 1s ease-out`,
  textShadow: '0 4px 20px rgba(255,215,0,0.3)',
  [theme.breakpoints.down('md')]: {
    fontSize: '2.5rem',
  },
}));

const HeroSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  marginBottom: theme.spacing(5),
  opacity: 0.95,
  fontWeight: 300,
  letterSpacing: '0.5px',
  animation: `${fadeIn} 1s ease-out 0.3s both`,
  [theme.breakpoints.down('md')]: {
    fontSize: '1.2rem',
  },
}));

const CTAButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
  color: '#0a2540',
  padding: theme.spacing(2, 5),
  borderRadius: '50px',
  fontWeight: 700,
  fontSize: '1.1rem',
  textTransform: 'none',
  boxShadow: '0 8px 25px rgba(255, 215, 0, 0.4)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${pulse} 2s ease-in-out infinite`,
  '&:hover': {
    background: 'linear-gradient(135deg, #ffed4e 0%, #ffd700 100%)',
    transform: 'translateY(-3px) scale(1.05)',
    boxShadow: '0 12px 35px rgba(255, 215, 0, 0.5)',
  },
}));

const CTAButtonSecondary = styled(Button)(({ theme }) => ({
  background: 'transparent',
  color: '#fff',
  padding: theme.spacing(2, 5),
  borderRadius: '50px',
  fontWeight: 600,
  fontSize: '1.1rem',
  textTransform: 'none',
  border: '2px solid #ffd700',
  transition: 'all 0.3s',
  '&:hover': {
    background: 'rgba(255, 215, 0, 0.1)',
    borderColor: '#ffed4e',
    transform: 'translateY(-2px)',
  },
}));

// Stats Section
const StatsSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #0a2540 0%, #1e293b 100%)',
  padding: theme.spacing(8, 2),
  color: '#fff',
  position: 'relative',
  overflow: 'hidden',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `repeating-linear-gradient(
      45deg,
      transparent,
      transparent 10px,
      rgba(255,215,0,0.03) 10px,
      rgba(255,215,0,0.03) 20px
    )`,
    pointerEvents: 'none',
  },
}));

const StatCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 215, 0, 0.2)',
  borderRadius: theme.spacing(3),
  padding: theme.spacing(4),
  textAlign: 'center',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-10px) scale(1.03)',
    background: 'rgba(255, 215, 0, 0.1)',
    borderColor: '#ffd700',
    boxShadow: '0 15px 40px rgba(255, 215, 0, 0.3)',
  },
}));

// Feature Section
const FeatureSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(12, 2),
  background: '#fff',
  position: 'relative',
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  textAlign: 'center',
  padding: theme.spacing(5, 3),
  borderRadius: theme.spacing(3),
  background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
  border: '1px solid rgba(10, 37, 64, 0.08)',
  boxShadow: '0 10px 40px rgba(0,0,0,0.06)',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #ffd700, #ffed4e, #ffd700)',
    backgroundSize: '200% 100%',
    animation: `${gradientShift} 3s ease infinite`,
    opacity: 0,
    transition: 'opacity 0.3s',
  },
  '&:hover': {
    transform: 'translateY(-12px)',
    boxShadow: '0 20px 60px rgba(255, 215, 0, 0.2)',
    borderColor: 'rgba(255, 215, 0, 0.4)',
    '&:before': {
      opacity: 1,
    },
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  fontSize: '4rem',
  marginBottom: theme.spacing(3),
  color: '#0a2540',
  display: 'inline-block',
  padding: theme.spacing(2),
  background: 'linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(255,237,78,0.1) 100%)',
  borderRadius: '50%',
  animation: `${float} 3s ease-in-out infinite`,
}));

// Process Timeline
const TimelineSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%)',
  padding: theme.spacing(12, 2),
}));

const TimelineStep = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  background: '#fff',
  borderRadius: theme.spacing(3),
  border: '2px solid rgba(255, 215, 0, 0.2)',
  boxShadow: '0 8px 30px rgba(0,0,0,0.05)',
  transition: 'all 0.4s',
  '&:hover': {
    transform: 'translateX(10px)',
    borderColor: '#ffd700',
    boxShadow: '0 12px 40px rgba(255, 215, 0, 0.2)',
  },
}));

// Testimonial Section
const TestimonialSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
  padding: theme.spacing(12, 2),
  textAlign: 'center',
  color: '#fff',
  position: 'relative',
  overflow: 'hidden',
}));

const TestimonialCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.08)',
  backdropFilter: 'blur(10px)',
  padding: theme.spacing(5),
  borderRadius: theme.spacing(3),
  border: '1px solid rgba(255, 215, 0, 0.2)',
  height: '100%',
  transition: 'all 0.4s',
  '&:hover': {
    transform: 'translateY(-8px)',
    background: 'rgba(255, 215, 0, 0.12)',
    boxShadow: '0 15px 50px rgba(255, 215, 0, 0.3)',
  },
}));

// FAQ Section
const FAQSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(12, 2),
  maxWidth: '1000px',
  margin: '0 auto',
  background: '#fff',
}));

const FAQItem = styled(Accordion)(({ theme }) => ({
  borderRadius: `${theme.spacing(2)} !important`,
  marginBottom: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  border: '1px solid rgba(10, 37, 64, 0.08)',
  '&:before': {
    display: 'none',
  },
  '&:hover': {
    boxShadow: '0 8px 30px rgba(255, 215, 0, 0.2)',
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
}));

// CTA Section
const CTASection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
  padding: theme.spacing(12, 2),
  textAlign: 'center',
  position: 'relative',
  overflow: 'hidden',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    background: `radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)`,
    backgroundSize: '50px 50px',
    animation: `${shimmer} 20s linear infinite`,
  },
}));

// Footer
const FooterSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #0a2540 0%, #1e293b 100%)',
  color: '#fff',
  padding: theme.spacing(8, 2),
}));

const FooterLinks = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  gap: theme.spacing(4),
  marginTop: theme.spacing(3),
  flexWrap: 'wrap',
  '& a': {
    color: 'rgba(255, 255, 255, 0.8)',
    textDecoration: 'none',
    transition: 'all 0.3s',
    '&:hover': {
      color: '#ffd700',
      transform: 'translateY(-2px)',
    },
  },
}));

// ============================================
// MAIN COMPONENT
// ============================================

const Home: React.FC = () => {
  const navigate = useNavigate();

  const [introModalOpen, setIntroModalOpen] = useState(false);
  // 환경변수 기반 소개 미디어 URL (영상/링크/슬라이드 대체)
  const introVideoUrl = (import.meta as any).env?.VITE_INTRO_VIDEO_URL as string | undefined;
  const toYouTubeEmbed = (url: string) => {
    try {
      const u = new URL(url);
      if (u.hostname.includes('youtube.com')) {
        const v = u.searchParams.get('v');
        if (v) return `https://www.youtube.com/embed/${v}`;
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
      /* ignore */
    }
    return url;
  };
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });
  const [showPlatformIntro, setShowPlatformIntro] = useState(false);

  // Counter animations
  const [counters, setCounters] = useState({
    clients: 0,
    cases: 0,
    successRate: 0,
    experience: 0,
  });

  useEffect(() => {
    const targets = {
      clients: 10000,
      cases: 50000,
      successRate: 98,
      experience: 15,
    };

    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setCounters({
        clients: Math.floor(targets.clients * progress),
        cases: Math.floor(targets.cases * progress),
        successRate: Math.floor(targets.successRate * progress),
        experience: Math.floor(targets.experience * progress),
      });

      if (currentStep >= steps) {
        clearInterval(interval);
        setCounters(targets);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
    document.documentElement.setAttribute('data-theme', newMode ? 'dark' : 'light');
  };

  // 갤러리 이미지
  const galleryImages: LightboxImage[] = [
    {
      src: '/images/탐정사진 기본.png',
      alt: '전문 탐정 서비스',
      caption: 'PIIP 탐정 플랫폼 - 세계 최고의 탐정 서비스',
    },
  ];

  // 인트로 슬라이드
  const introSlides: SlideData[] = [
    {
      title: 'PIIP 탐정 플랫폼에 오신 것을 환영합니다',
      description: 'AI 기반 스마트 탐정 서비스로 당신의 문제를 해결하세요',
    },
    {
      title: '빠르고 정확한 조사',
      description: '전문 탐정과 AI 기술의 결합으로 최고의 결과를 제공합니다',
    },
    {
      title: '완벽한 보안과 신뢰',
      description: '블록체인 기반 증거 관리로 안전하게 보호됩니다',
    },
  ];

  // 탐정 업무 영역
  const detectiveServices = [
    {
      icon: <SearchIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: '행적 조사',
      description: '배우자 부정 의심, 직원 근태 확인 등 대상자의 동선과 행동 패턴 파악',
    },
    {
      icon: <FactCheckIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: '신원 조사',
      description: '결혼 전 신원조회, 채용 검증, 사업 파트너 신뢰도 확인',
    },
    {
      icon: <GavelIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: '법적 증거 수집',
      description: '민사·형사 소송을 위한 법적 효력이 있는 증거 자료 확보',
    },
    {
      icon: <BusinessCenterIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: '기업 조사',
      description: '산업 스파이, 내부 부정행위, 기업 실사 등 기업 관련 조사',
    },
    {
      icon: <LocationSearchingIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: '실종자 찾기',
      description: '가족, 친구, 채무자 등 연락이 끊긴 사람의 소재 파악',
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: '사이버 조사',
      description: '온라인 사기, 명예훼손, 개인정보 유출 등 디지털 증거 수집',
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

  // 주요 기능 그리드
  const coreFeatures = [
    {
      icon: <FolderOpenIcon sx={{ fontSize: 32, color: 'primary.main' }} />,
      title: '사건 관리',
      description: '조사 사건 생성부터 종료까지 체계적으로 관리',
      link: '/cases',
    },
    {
      icon: <PhotoLibraryIcon sx={{ fontSize: 32, color: 'primary.main' }} />,
      title: '증거 관리',
      description: '파일 업로드, 태그, 블록체인 보관으로 무결성 보장',
      link: '/evidence',
    },
    {
      icon: <PsychologyIcon sx={{ fontSize: 32, color: 'primary.main' }} />,
      title: 'AI 분석',
      description: '이미지 인식, 패턴 분석으로 조사 효율 극대화',
      link: '/dashboard',
    },
    {
      icon: <CalendarMonthIcon sx={{ fontSize: 32, color: 'primary.main' }} />,
      title: '상담 예약',
      description: 'AI 인테이크 챗봇과 캘린더 일정 관리',
      link: '/dashboard',
    },
    {
      icon: <RequestQuoteIcon sx={{ fontSize: 32, color: 'primary.main' }} />,
      title: '견적 자동화',
      description: '자동 견적 생성 및 결제 시스템',
      link: '/dashboard',
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 32, color: 'primary.main' }} />,
      title: '인물 관리',
      description: '조사 대상 인물 정보 및 관계망 시각화',
      link: '/persons',
    },
  ];

  const features = [
    {
      icon: <SpeedIcon sx={{ fontSize: '3.5rem' }} />,
      title: '신속한 대응',
      description: '24시간 AI 챗봇 상담과 30분 이내 전문가 배정으로 빠른 사건 해결',
      color: '#2563eb',
    },
    {
      icon: <SecurityIcon sx={{ fontSize: '3.5rem' }} />,
      title: '완벽한 보안',
      description: '블록체인 기반 증거 보관과 엔드투엔드 암호화로 정보 보호',
      color: '#059669',
    },
    {
      icon: <BusinessCenterIcon sx={{ fontSize: '3.5rem' }} />,
      title: '전문성',
      description: '공인 탐정 자격증 보유자와 법률 전문가 네트워크',
      color: '#7c3aed',
    },
    {
      icon: <VerifiedIcon sx={{ fontSize: '3.5rem' }} />,
      title: 'AI 분석',
      description: '얼굴 인식, 차량 추적, 패턴 분석 등 첨단 기술 활용',
      color: '#dc2626',
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: '3.5rem' }} />,
      title: '투명한 진행',
      description: '실시간 진행 상황 공유와 증거 자료 즉시 확인',
      color: '#ea580c',
    },
    {
      icon: <PeopleIcon sx={{ fontSize: '3.5rem' }} />,
      title: '고객 만족',
      description: '98% 고객 만족도와 24/7 고객 지원 서비스',
      color: '#0891b2',
    },
    {
      icon: <AttachMoneyIcon sx={{ fontSize: '3.5rem' }} />,
      title: '합리적 비용',
      description: '자동화 기반 운영 효율화와 투명한 가격 정책',
      color: '#f59e0b',
    },
    {
      icon: <PolicyIcon sx={{ fontSize: '3.5rem' }} />,
      title: '법적 보호',
      description: '변호사 협력 네트워크와 법정 증거 효력 보장',
      color: '#ef4444',
    },
  ];

  const processSteps = [
    {
      title: '상담 신청',
      description: 'AI 챗봇 또는 전화 상담으로 사건 내용 접수',
      detail: '24시간 자동 응대 시스템으로 언제든 상담 가능',
    },
    {
      title: '견적 및 계약',
      description: '자동 견적 산출 후 계약서 전자 서명',
      detail: '투명한 비용 구조와 맞춤형 조사 계획 제공',
    },
    {
      title: '조사 진행',
      description: '전문 탐정의 현장 조사 및 증거 수집',
      detail: '실시간 진행 상황 공유 및 중간 보고',
    },
    {
      title: '증거 분석',
      description: 'AI 기반 이미지 분석 및 패턴 인식',
      detail: '블록체인 기반 증거 무결성 보장',
    },
    {
      title: '보고서 작성',
      description: '조사 결과 종합 및 법적 효력 있는 보고서 생성',
      detail: '사진, 동영상, 위치 정보 등 모든 증거 첨부',
    },
    {
      title: '사후 관리',
      description: '법적 자문 연계 및 추가 조치 지원',
      detail: '변호사 협력 네트워크를 통한 후속 조치',
    },
  ];

  const testimonials = [
    {
      text: '정말 믿을 수 있는 서비스였습니다! 전문적인 조사와 빠른 대응에 감사드립니다.',
      author: '김OO',
      role: '가족 문제 해결',
      rating: 5,
    },
    {
      text: '신속하게 사건이 해결되어 만족합니다. AI 분석 기술이 정말 인상적이었어요.',
      author: '이OO',
      role: '기업 조사',
      rating: 5,
    },
    {
      text: '전문적이고 체계적인 대응에 감사드립니다. 보안도 철저해서 안심할 수 있었습니다.',
      author: '박OO',
      role: '법률 증거 수집',
      rating: 5,
    },
  ];

  return (
    <Box sx={{ bgcolor: darkMode ? '#1a1a1a' : '#fff', minHeight: '100vh' }}>
      {/* Header */}
      <Header sx={{ bgcolor: darkMode ? 'rgba(10,10,10,0.98)' : undefined }}>
        <Nav>
          <LogoContainer
            role="button"
            tabIndex={0}
            aria-label="홈으로 이동"
            title="홈으로 이동"
            onClick={() => navigate('/')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate('/');
              }
            }}
          >
            <LogoAvatar>
              <PersonSearchIcon fontSize="medium" />
            </LogoAvatar>
            <Logo sx={{ color: darkMode ? '#ffd700' : undefined }}>PIIP DETECTIVE</Logo>
          </LogoContainer>
          <NavLinks>
            <a href="#gallery">갤러리</a>
            <a href="#services">서비스</a>
            <a href="#process">프로세스</a>
            <a href="#testimonials">후기</a>
            <a href="#faq">FAQ</a>
            <IconButton onClick={toggleDarkMode} sx={{ color: darkMode ? '#ffd700' : '#fff' }}>
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </NavLinks>
        </Nav>
      </Header>

      {/* Hero Section */}
      <HeroSection>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Chip
            label="🏆 대한민국 No.1 탐정 플랫폼"
            sx={{
              mb: 3,
              bgcolor: 'rgba(255, 215, 0, 0.2)',
              color: '#ffd700',
              fontWeight: 600,
              border: '1px solid #ffd700',
              animation: `${pulse} 2s ease-in-out infinite`,
            }}
          />
          <HeroTitle variant="h1">세계 최고의 탐정 플랫폼</HeroTitle>
          <HeroSubtitle variant="h5">
            AI 기술과 전문 탐정의 완벽한 조화, 신속하고 안전하게 사건을 해결합니다
          </HeroSubtitle>
          <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap', mb: 6 }}>
            <CTAButton
              onClick={() => navigate('/dashboard')}
              endIcon={<ArrowForwardIcon />}
              size="large"
            >
              무료 상담 시작하기
            </CTAButton>
            <CTAButtonSecondary
              onClick={() => navigate('/cases')}
              endIcon={<ArrowForwardIcon />}
              size="large"
            >
              탐정 찾아보기
            </CTAButtonSecondary>
            <CTAButtonSecondary
              onClick={() => navigate('/signup')}
              endIcon={<ArrowForwardIcon />}
              size="large"
            >
              회원가입
            </CTAButtonSecondary>
          </Box>

          {/* Trust Badges */}
          <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Chip
              icon={<VerifiedIcon />}
              label="정부 인증"
              sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: '#fff' }}
            />
            <Chip
              icon={<SecurityIcon />}
              label="ISO 27001"
              sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: '#fff' }}
            />
            <Chip
              icon={<CheckCircleIcon />}
              label="98% 성공률"
              sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: '#fff' }}
            />
          </Box>
        </Container>
      </HeroSection>

      {/* Stats Section */}
      <StatsSection>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={6} md={3}>
              <StatCard elevation={0}>
                <CardContent>
                  <PeopleIcon sx={{ fontSize: '3rem', color: '#ffd700', mb: 2 }} />
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#ffd700', mb: 1 }}>
                    {counters.clients.toLocaleString()}+
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    만족한 고객
                  </Typography>
                </CardContent>
              </StatCard>
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCard elevation={0}>
                <CardContent>
                  <BusinessCenterIcon sx={{ fontSize: '3rem', color: '#ffd700', mb: 2 }} />
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#ffd700', mb: 1 }}>
                    {counters.cases.toLocaleString()}+
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    해결한 사건
                  </Typography>
                </CardContent>
              </StatCard>
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCard elevation={0}>
                <CardContent>
                  <TrendingUpIcon sx={{ fontSize: '3rem', color: '#ffd700', mb: 2 }} />
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#ffd700', mb: 1 }}>
                    {counters.successRate}%
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    사건 해결률
                  </Typography>
                </CardContent>
              </StatCard>
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCard elevation={0}>
                <CardContent>
                  <StarIcon sx={{ fontSize: '3rem', color: '#ffd700', mb: 2 }} />
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#ffd700', mb: 1 }}>
                    {counters.experience}년+
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    업계 경력
                  </Typography>
                </CardContent>
              </StatCard>
            </Grid>
          </Grid>
        </Container>
      </StatsSection>

      {/* Gallery Section */}
      <Box id="gallery" sx={{ py: 8, bgcolor: darkMode ? '#0a0a0a' : '#f8f9fa' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                color: darkMode ? '#ffd700' : '#0a2540',
                mb: 2,
              }}
            >
              전문 탐정 갤러리
            </Typography>
            <Typography variant="h6" sx={{ color: darkMode ? '#ccc' : 'text.secondary', mb: 4 }}>
              최첨단 장비와 전문 인력으로 완벽한 조사를 제공합니다
            </Typography>
          </Box>
          <HeroGallery images={galleryImages} />
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<PlayCircleOutlineIcon />}
              onClick={() => setIntroModalOpen(true)}
              sx={{
                bgcolor: '#ffd700',
                color: '#0a2540',
                px: 5,
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: '50px',
                '&:hover': {
                  bgcolor: '#ffed4e',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(255, 215, 0, 0.4)',
                },
              }}
            >
              플랫폼 소개 영상 보기
            </Button>
          </Box>
        </Container>
      </Box>

      {/* 플랫폼 소개 보기 토글 + 통합 섹션 */}
      <Box sx={{ pt: 4, pb: 8, bgcolor: darkMode ? '#0a0a0a' : '#ffffff' }}>
        <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => setShowPlatformIntro((v) => !v)}
            sx={{
              bgcolor: '#ffd700',
              color: '#0a2540',
              px: 5,
              py: 1.5,
              borderRadius: '50px',
              fontWeight: 700,
              '&:hover': { bgcolor: '#ffed4e' },
            }}
          >
            {showPlatformIntro ? '플랫폼 소개 접기' : '플랫폼 소개 보기'}
          </Button>
        </Container>
        {showPlatformIntro && <PlatformIntroContent variant="home" />}
      </Box>

      {/* Intro Modal */}
      <Dialog
        open={introModalOpen}
        onClose={() => setIntroModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: darkMode ? '#1a1a1a' : '#fff',
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          },
        }}
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          <IconButton
            onClick={() => setIntroModalOpen(false)}
            sx={{
              position: 'absolute',
              right: 16,
              top: 16,
              zIndex: 1,
              bgcolor: 'rgba(0,0,0,0.5)',
              color: '#fff',
              '&:hover': {
                bgcolor: '#ffd700',
                color: '#0a2540',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
          {/* 영상 또는 이미지 슬라이드 영역: URL이 있으면 임베드, 없으면 대체 콘텐츠 */}
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography
              variant="h4"
              gutterBottom
              fontWeight={700}
              sx={{ color: darkMode ? '#fff' : '#0a2540' }}
            >
              PIIP 플랫폼 소개
            </Typography>
            <Box sx={{ mt: 2 }}>
              {introVideoUrl ? (
                introVideoUrl.match(/youtube\.com|youtu\.be/i) ? (
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      pt: '56.25%',
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
                      bgcolor: '#000',
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
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="body1" gutterBottom>
                      소개 링크
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <MuiLink href={introVideoUrl} target="_blank" rel="noreferrer">
                        {introVideoUrl}
                      </MuiLink>
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
              <Button
                variant="contained"
                onClick={() => {
                  setIntroModalOpen(false);
                  navigate('/dashboard');
                }}
                sx={{ bgcolor: '#0a2540', color: '#ffd700', '&:hover': { bgcolor: '#1e293b' } }}
              >
                지금 시작하기
              </Button>
              <Button variant="outlined" onClick={() => setIntroModalOpen(false)}>
                닫기
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Detective Services Section */}
      <Box sx={{ py: 8, bgcolor: darkMode ? '#0a0a0a' : '#f8fafc' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              color: darkMode ? '#ffd700' : '#0a2540',
              textAlign: 'center',
              mb: 4,
            }}
          >
            탐정 업무 영역
          </Typography>
          <Grid container spacing={3}>
            {detectiveServices.map((service, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'all 0.3s',
                    borderRadius: 3,
                    '&:hover': { transform: 'translateY(-6px)', boxShadow: 6 },
                    bgcolor: darkMode ? '#0f0f0f' : '#fff',
                    border: '1px solid',
                    borderColor: darkMode ? 'rgba(255,215,0,0.2)' : 'rgba(10,37,64,0.08)',
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      {service.icon}
                      <Typography
                        variant="h6"
                        component="h4"
                        fontWeight={700}
                        sx={{ color: darkMode ? '#ffd700' : '#0a2540' }}
                      >
                        {service.title}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{ color: darkMode ? '#ccc' : 'text.secondary' }}
                    >
                      {service.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <FeatureSection id="services" sx={{ bgcolor: darkMode ? '#1a1a1a' : '#fff' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                color: darkMode ? '#ffd700' : '#0a2540',
                mb: 2,
              }}
            >
              왜 PIIP를 선택해야 할까요?
            </Typography>
            <Typography variant="h6" sx={{ color: darkMode ? '#ccc' : 'text.secondary' }}>
              최첨단 기술과 전문성의 완벽한 조화
            </Typography>
          </Box>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <FeatureCard
                  sx={{
                    bgcolor: darkMode ? '#0a0a0a' : undefined,
                    animation: `${fadeIn} 0.6s ease-out ${index * 0.1}s both`,
                  }}
                >
                  <CardContent>
                    <IconWrapper sx={{ color: darkMode ? '#ffd700' : feature.color }}>
                      {feature.icon}
                    </IconWrapper>
                    <Typography
                      variant="h5"
                      component="h3"
                      gutterBottom
                      sx={{
                        color: darkMode ? '#ffd700' : '#0a2540',
                        fontWeight: 700,
                        mb: 2,
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: darkMode ? '#ccc' : 'text.secondary',
                        lineHeight: 1.7,
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </FeatureCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </FeatureSection>

      {/* Customer Case Studies Section */}
      <Box sx={{ py: 10, bgcolor: darkMode ? '#0a0a0a' : '#fff' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              color: darkMode ? '#ffd700' : '#0a2540',
              textAlign: 'center',
              mb: 1,
            }}
          >
            실제 사례
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: darkMode ? '#ccc' : 'text.secondary', textAlign: 'center', mb: 4 }}
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
                    transition: 'all 0.3s',
                    '&:hover': { transform: 'translateY(-6px)', boxShadow: 6 },
                    bgcolor: darkMode ? '#0f0f0f' : '#fff',
                    borderRadius: 3,
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      gutterBottom
                      fontWeight={700}
                      sx={{ color: darkMode ? '#fff' : '#0a2540' }}
                    >
                      {caseItem.title}
                    </Typography>
                    <Box sx={{ my: 2 }}>
                      <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                        <Typography variant="body2" color="error" fontWeight={700}>
                          Before:
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: darkMode ? '#ccc' : 'text.secondary' }}
                        >
                          {caseItem.before}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 700 }}>
                          After:
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: darkMode ? '#ccc' : 'text.secondary' }}
                        >
                          {caseItem.after}
                        </Typography>
                      </Box>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography
                        variant="body2"
                        sx={{ color: darkMode ? '#bbb' : 'text.secondary' }}
                      >
                        조사 기간:
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        sx={{ color: darkMode ? '#fff' : '#0a2540' }}
                      >
                        {caseItem.period}
                      </Typography>
                    </Box>
                    <Paper
                      sx={{
                        p: 1.5,
                        textAlign: 'center',
                        bgcolor: darkMode ? 'success.dark' : '#f0fdf4',
                      }}
                    >
                      <Typography variant="body2" fontWeight={700}>
                        ✓ {caseItem.result}
                      </Typography>
                    </Paper>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button variant="outlined" onClick={() => navigate('/about')}>
              더 많은 사례 보기
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Core Features Grid */}
      <Box sx={{ py: 10, bgcolor: darkMode ? '#0f0f0f' : '#f8fafc' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              color: darkMode ? '#ffd700' : '#0a2540',
              textAlign: 'center',
              mb: 3,
            }}
          >
            주요 기능
          </Typography>
          <Grid container spacing={3}>
            {coreFeatures.map((feature, index) => (
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
                    bgcolor: darkMode ? '#0a0a0a' : '#fff',
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: darkMode ? 'rgba(255,215,0,0.2)' : 'rgba(10,37,64,0.08)',
                  }}
                  onClick={() => navigate(feature.link)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {feature.icon}
                    <Typography
                      variant="h6"
                      component="h4"
                      fontWeight={700}
                      sx={{ color: darkMode ? '#ffd700' : '#0a2540' }}
                    >
                      {feature.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: darkMode ? '#ccc' : 'text.secondary' }}>
                    {feature.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Process Timeline */}
      <TimelineSection id="process" sx={{ bgcolor: darkMode ? '#0f0f0f' : undefined }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                color: darkMode ? '#ffd700' : '#0a2540',
                mb: 2,
              }}
            >
              간편한 조사 프로세스
            </Typography>
            <Typography variant="h6" sx={{ color: darkMode ? '#ccc' : 'text.secondary' }}>
              6단계로 완성되는 완벽한 조사
            </Typography>
          </Box>
          <Stepper orientation="vertical" sx={{ maxWidth: 800, mx: 'auto' }}>
            {processSteps.map((step, index) => (
              <Step key={index} active={true} completed={false}>
                <StepLabel
                  StepIconComponent={() => (
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#0a2540',
                        fontWeight: 700,
                        fontSize: '1.2rem',
                        boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)',
                      }}
                    >
                      {index + 1}
                    </Box>
                  )}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color: darkMode ? '#ffd700' : '#0a2540',
                      ml: 2,
                    }}
                  >
                    {step.title}
                  </Typography>
                </StepLabel>
                <StepContent>
                  <TimelineStep
                    sx={{
                      ml: 4,
                      bgcolor: darkMode ? '#1a1a1a' : '#fff',
                      borderColor: darkMode ? 'rgba(255,215,0,0.3)' : undefined,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        color: darkMode ? '#fff' : '#0a2540',
                        mb: 1,
                        fontWeight: 600,
                      }}
                    >
                      {step.description}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: darkMode ? '#ccc' : 'text.secondary' }}
                    >
                      {step.detail}
                    </Typography>
                  </TimelineStep>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Container>
      </TimelineSection>

      {/* Testimonials */}
      <TestimonialSection id="testimonials" sx={{ bgcolor: darkMode ? '#0a0a0a' : undefined }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              color: darkMode ? '#ffd700' : '#fff',
              mb: 2,
            }}
          >
            고객의 생생한 후기
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)', mb: 8 }}>
            실제 이용 고객들의 만족도 98%
          </Typography>
          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <TestimonialCard
                  elevation={0}
                  sx={{
                    animation: `${fadeIn} 0.6s ease-out ${index * 0.2}s both`,
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', mb: 2, justifyContent: 'center' }}>
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <StarIcon key={i} sx={{ color: '#ffd700', fontSize: '2rem' }} />
                      ))}
                    </Box>
                    <Typography
                      variant="body1"
                      sx={{
                        fontStyle: 'italic',
                        color: 'rgba(255,255,255,0.9)',
                        fontSize: '1.1rem',
                        mb: 3,
                        lineHeight: 1.7,
                      }}
                    >
                      &ldquo;{testimonial.text}&rdquo;
                    </Typography>
                    <Divider sx={{ bgcolor: 'rgba(255,215,0,0.3)', mb: 2 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: '#ffd700', color: '#0a2540', fontWeight: 700 }}>
                        {testimonial.author[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#ffd700' }}>
                          {testimonial.author}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          {testimonial.role}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </TestimonialCard>
              </Grid>
            ))}
          </Grid>

          {/* Trust Partners */}
          <Box sx={{ mt: 10 }}>
            <Typography variant="h5" sx={{ color: '#ffd700', fontWeight: 600, mb: 4 }}>
              신뢰받는 파트너
            </Typography>
            <Grid container spacing={3} justifyContent="center">
              {['🏛️ 법률협회', '🔐 ISO 27001', '✓ 정부 인증', '🏆 업계 1위'].map(
                (partner, index) => (
                  <Grid item key={index}>
                    <Card
                      sx={{
                        px: 4,
                        py: 2,
                        bgcolor: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,215,0,0.2)',
                        borderRadius: 3,
                        transition: 'all 0.3s',
                        '&:hover': {
                          bgcolor: 'rgba(255,215,0,0.15)',
                          transform: 'translateY(-5px)',
                        },
                      }}
                    >
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#fff' }}>
                        {partner}
                      </Typography>
                    </Card>
                  </Grid>
                )
              )}
            </Grid>
          </Box>
        </Container>
      </TestimonialSection>

      {/* FAQ Section */}
      <FAQSection id="faq" sx={{ bgcolor: darkMode ? '#1a1a1a' : '#fff' }}>
        <Typography
          variant="h2"
          sx={{
            fontWeight: 700,
            color: darkMode ? '#ffd700' : '#0a2540',
            mb: 2,
            textAlign: 'center',
          }}
        >
          자주 묻는 질문
        </Typography>
        <Typography
          variant="h6"
          sx={{ color: darkMode ? '#ccc' : 'text.secondary', mb: 6, textAlign: 'center' }}
        >
          궁금하신 사항을 빠르게 확인하세요
        </Typography>
        <FAQItem sx={{ bgcolor: darkMode ? '#0a0a0a' : '#fff' }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: darkMode ? '#ffd700' : '#0a2540' }} />}
          >
            <Typography
              variant="h6"
              sx={{ color: darkMode ? '#ffd700' : '#0a2540', fontWeight: 600 }}
            >
              📋 탐정 의뢰는 어떻게 하나요?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography
              variant="body1"
              sx={{ color: darkMode ? '#ccc' : 'text.secondary', lineHeight: 1.7 }}
            >
              의뢰 등록 버튼을 클릭 후, 사건 정보를 입력하시면 AI가 자동으로 분석하여 적합한 전문
              탐정을 배정합니다. 24시간 언제든 상담이 가능하며, 30분 이내에 첫 응답을 받으실 수
              있습니다.
            </Typography>
          </AccordionDetails>
        </FAQItem>
        <FAQItem sx={{ bgcolor: darkMode ? '#0a0a0a' : '#fff' }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: darkMode ? '#ffd700' : '#0a2540' }} />}
          >
            <Typography
              variant="h6"
              sx={{ color: darkMode ? '#ffd700' : '#0a2540', fontWeight: 600 }}
            >
              🔒 개인정보는 안전하게 보호되나요?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography
              variant="body1"
              sx={{ color: darkMode ? '#ccc' : 'text.secondary', lineHeight: 1.7 }}
            >
              모든 자료는 256비트 암호화되어 안전하게 관리되며, 블록체인 기술로 증거의 무결성을
              보장합니다. 법률에 따라 철저히 보호되며, ISO 27001 정보보안 인증을 획득했습니다.
            </Typography>
          </AccordionDetails>
        </FAQItem>
        <FAQItem sx={{ bgcolor: darkMode ? '#0a0a0a' : '#fff' }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: darkMode ? '#ffd700' : '#0a2540' }} />}
          >
            <Typography
              variant="h6"
              sx={{ color: darkMode ? '#ffd700' : '#0a2540', fontWeight: 600 }}
            >
              💰 비용은 어떻게 되나요?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography
              variant="body1"
              sx={{ color: darkMode ? '#ccc' : 'text.secondary', lineHeight: 1.7 }}
            >
              사건 유형과 난이도에 따라 AI가 자동으로 견적을 산출하여 제공합니다. 투명한 비용 구조로
              숨은 비용이 전혀 없으며, 계약 전 상세한 비용 안내를 받으실 수 있습니다.
            </Typography>
          </AccordionDetails>
        </FAQItem>
        <FAQItem sx={{ bgcolor: darkMode ? '#0a0a0a' : '#fff' }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: darkMode ? '#ffd700' : '#0a2540' }} />}
          >
            <Typography
              variant="h6"
              sx={{ color: darkMode ? '#ffd700' : '#0a2540', fontWeight: 600 }}
            >
              ⏱️ 조사는 얼마나 걸리나요?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography
              variant="body1"
              sx={{ color: darkMode ? '#ccc' : 'text.secondary', lineHeight: 1.7 }}
            >
              사건의 복잡도에 따라 다르지만, 평균적으로 2-4주 소요됩니다. 긴급 사건의 경우 우선
              처리가 가능하며, 실시간으로 진행 상황을 확인하실 수 있습니다.
            </Typography>
          </AccordionDetails>
        </FAQItem>
        <FAQItem sx={{ bgcolor: darkMode ? '#0a0a0a' : '#fff' }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: darkMode ? '#ffd700' : '#0a2540' }} />}
          >
            <Typography
              variant="h6"
              sx={{ color: darkMode ? '#ffd700' : '#0a2540', fontWeight: 600 }}
            >
              🎯 어떤 사건을 의뢰할 수 있나요?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography
              variant="body1"
              sx={{ color: darkMode ? '#ccc' : 'text.secondary', lineHeight: 1.7 }}
            >
              행적 조사, 신원 조사, 법적 증거 수집, 기업 조사, 실종자 찾기, 사이버 조사 등 모든
              합법적인 탐정 업무를 처리합니다. 불법적인 의뢰는 거절됩니다.
            </Typography>
          </AccordionDetails>
        </FAQItem>

        {/* 추가 통합 FAQ (About과 내용 통합) */}
        <FAQItem sx={{ bgcolor: darkMode ? '#0a0a0a' : '#fff' }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: darkMode ? '#ffd700' : '#0a2540' }} />}
          >
            <Typography
              variant="h6"
              sx={{ color: darkMode ? '#ffd700' : '#0a2540', fontWeight: 600 }}
            >
              ⚖️ 탐정 서비스는 합법인가요?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography
              variant="body1"
              sx={{ color: darkMode ? '#ccc' : 'text.secondary', lineHeight: 1.7 }}
            >
              한국에서는 2020년 탐정업법(공인탐정법) 제정 이후 합법적인 직업으로 인정받고 있습니다.
              PIIP 플랫폼의 탐정은 법적 자격을 충족하며, 정당한 권리 보호 범위 내에서 합법적으로
              조사합니다.
            </Typography>
          </AccordionDetails>
        </FAQItem>

        <FAQItem sx={{ bgcolor: darkMode ? '#0a0a0a' : '#fff' }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: darkMode ? '#ffd700' : '#0a2540' }} />}
          >
            <Typography
              variant="h6"
              sx={{ color: darkMode ? '#ffd700' : '#0a2540', fontWeight: 600 }}
            >
              🚫 행적 조사가 스토킹처벌법에 저촉되지 않나요?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography
              variant="body1"
              sx={{ color: darkMode ? '#ccc' : 'text.secondary', lineHeight: 1.7 }}
            >
              정당한 사유(배우자 부정 확인, 자녀 안전 등)와 의뢰인의 권리 보호 목적의 조사는 해당
              법률에 저촉되지 않습니다. 공개된 장소에서의 합법적 관찰과 증거 수집만 진행하며 불법
              미행·감시·도청은 하지 않습니다.
            </Typography>
          </AccordionDetails>
        </FAQItem>

        <FAQItem sx={{ bgcolor: darkMode ? '#0a0a0a' : '#fff' }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: darkMode ? '#ffd700' : '#0a2540' }} />}
          >
            <Typography
              variant="h6"
              sx={{ color: darkMode ? '#ffd700' : '#0a2540', fontWeight: 600 }}
            >
              📜 증거 자료는 법적 효력이 있나요?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography
              variant="body1"
              sx={{ color: darkMode ? '#ccc' : 'text.secondary', lineHeight: 1.7 }}
            >
              블록체인 기반 증거 보관으로 수집 시점부터 무결성을 보장합니다. 법원에서도 인정받을 수
              있는 형태로 수집·보관하여 법적 효력을 확보합니다.
            </Typography>
          </AccordionDetails>
        </FAQItem>

        <FAQItem sx={{ bgcolor: darkMode ? '#0a0a0a' : '#fff' }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: darkMode ? '#ffd700' : '#0a2540' }} />}
          >
            <Typography
              variant="h6"
              sx={{ color: darkMode ? '#ffd700' : '#0a2540', fontWeight: 600 }}
            >
              📊 조사 진행 상황을 확인할 수 있나요?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography
              variant="body1"
              sx={{ color: darkMode ? '#ccc' : 'text.secondary', lineHeight: 1.7 }}
            >
              가능합니다. 대시보드에서 진행률, 수집 증거, 중간 보고를 실시간으로 확인할 수 있으며,
              주요 변경사항은 알림으로 제공합니다.
            </Typography>
          </AccordionDetails>
        </FAQItem>

        <FAQItem sx={{ bgcolor: darkMode ? '#0a0a0a' : '#fff' }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: darkMode ? '#ffd700' : '#0a2540' }} />}
          >
            <Typography
              variant="h6"
              sx={{ color: darkMode ? '#ffd700' : '#0a2540', fontWeight: 600 }}
            >
              🤖 AI 분석은 어떻게 도움이 되나요?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography
              variant="body1"
              sx={{ color: darkMode ? '#ccc' : 'text.secondary', lineHeight: 1.7 }}
            >
              얼굴 인식, 차량 번호판 추적, 행동 패턴 분석 등 반복적이고 방대한 작업을 자동화하여
              시간을 단축하고, 핵심 장면과 상관관계를 빠르게 도출합니다.
            </Typography>
          </AccordionDetails>
        </FAQItem>
      </FAQSection>

      {/* CTA Section */}
      <CTASection>
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              color: '#0a2540',
              mb: 3,
            }}
          >
            지금 바로 시작하세요
          </Typography>
          <Typography variant="h5" sx={{ color: '#0a2540', mb: 5, fontWeight: 400 }}>
            전문가와의 무료 상담으로 문제 해결의 첫걸음을 내딛으세요
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap', mb: 4 }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/dashboard')}
              sx={{
                bgcolor: '#0a2540',
                color: '#ffd700',
                px: 6,
                py: 2.5,
                fontSize: '1.2rem',
                fontWeight: 700,
                borderRadius: '50px',
                boxShadow: '0 8px 25px rgba(10, 37, 64, 0.3)',
                '&:hover': {
                  bgcolor: '#1e293b',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 12px 35px rgba(10, 37, 64, 0.4)',
                },
              }}
            >
              무료 상담 신청
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/cases')}
              sx={{
                borderColor: '#0a2540',
                color: '#0a2540',
                px: 6,
                py: 2.5,
                fontSize: '1.2rem',
                fontWeight: 700,
                borderRadius: '50px',
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  bgcolor: 'rgba(10, 37, 64, 0.05)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              서비스 둘러보기
            </Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Chip
              icon={<PhoneIcon />}
              label="24시간 상담 가능"
              sx={{
                bgcolor: 'rgba(10,37,64,0.1)',
                color: '#0a2540',
                fontWeight: 600,
                py: 2.5,
                px: 1,
              }}
            />
            <Chip
              icon={<CheckCircleIcon />}
              label="첫 상담 무료"
              sx={{
                bgcolor: 'rgba(10,37,64,0.1)',
                color: '#0a2540',
                fontWeight: 600,
                py: 2.5,
                px: 1,
              }}
            />
            <Chip
              icon={<SecurityIcon />}
              label="100% 기밀 보장"
              sx={{
                bgcolor: 'rgba(10,37,64,0.1)',
                color: '#0a2540',
                fontWeight: 600,
                py: 2.5,
                px: 1,
              }}
            />
          </Box>
        </Container>
      </CTASection>

      {/* Footer */}
      <FooterSection sx={{ bgcolor: darkMode ? '#0a0a0a' : undefined }}>
        <Container maxWidth="lg">
          <Grid container spacing={6}>
            <Grid item xs={12} md={4}>
              <Logo sx={{ mb: 3, fontSize: '2rem' }}>🔍 PIIP Detective</Logo>
              <Typography
                variant="body1"
                sx={{ color: 'rgba(255,255,255,0.8)', mb: 2, lineHeight: 1.7 }}
              >
                세계 최고 수준의 AI 기반 탐정 플랫폼으로 신속하고 정확한 조사를 제공합니다.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                {['ISO 27001', '정부 인증', '업계 1위'].map((badge, index) => (
                  <Chip
                    key={index}
                    label={badge}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255,215,0,0.2)',
                      color: '#ffd700',
                      fontWeight: 600,
                      border: '1px solid rgba(255,215,0,0.3)',
                    }}
                  />
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ color: '#ffd700', fontWeight: 600, mb: 3 }}>
                빠른 링크
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {[
                  { label: '서비스 소개', href: '#services' },
                  { label: '조사 프로세스', href: '#process' },
                  { label: '고객 후기', href: '#testimonials' },
                  { label: '자주 묻는 질문', href: '#faq' },
                ].map((link, index) => (
                  <MuiLink
                    key={index}
                    href={link.href}
                    sx={{
                      color: 'rgba(255,255,255,0.8)',
                      textDecoration: 'none',
                      transition: 'all 0.3s',
                      '&:hover': { color: '#ffd700', transform: 'translateY(-2px)' },
                    }}
                  >
                    {link.label}
                  </MuiLink>
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ color: '#ffd700', fontWeight: 600, mb: 3 }}>
                연락처
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <PhoneIcon sx={{ color: '#ffd700' }} />
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    1588-0000 (24시간 상담)
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <EmailIcon sx={{ color: '#ffd700' }} />
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    info@piip.com
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <LocationOnIcon sx={{ color: '#ffd700' }} />
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    서울특별시 강남구
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
          <Divider sx={{ my: 6, bgcolor: 'rgba(255,215,0,0.2)' }} />
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body1" gutterBottom sx={{ color: 'rgba(255,255,255,0.9)' }}>
              © 2025 PIIP Detective Platform. All rights reserved.
            </Typography>
            <FooterLinks>
              <a href="#privacy">개인정보처리방침</a>
              <a href="#terms">이용약관</a>
              <a href="#contact">고객센터</a>
              <a href="#sitemap">사이트맵</a>
            </FooterLinks>
          </Box>
        </Container>
      </FooterSection>
    </Box>
  );
};

export default Home;
