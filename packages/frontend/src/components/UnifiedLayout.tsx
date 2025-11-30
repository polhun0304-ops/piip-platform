import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  useTheme,
  useMediaQuery,
  Tooltip,
  alpha,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Folder as FolderIcon,
  PhotoLibrary as PhotoLibraryIcon,
  AdminPanelSettings as AdminIcon,
  People as PeopleIcon,
  ChevronLeft as ChevronLeftIcon,
  Login as LoginIcon,
  Info as InfoIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logoutThunk } from '../store/slices/authSlice';
import api from '../services/api';
import HeroSection from './EnhancedHomepage/HeroSection';
import FeaturesSection from './EnhancedHomepage/FeaturesSection';
import Footer from './EnhancedHomepage/Footer';

const MIN_DRAWER_WIDTH = 240; // Minimum width for the drawer
const MAX_DRAWER_WIDTH = 400; // Maximum width for the drawer
const DEFAULT_DRAWER_WIDTH = 300; // Default width for the drawer

interface UnifiedLayoutProps {
  children: React.ReactNode;
}

interface NavigationItem {
  title: string;
  icon: React.ReactNode;
  path: string;
  divider?: boolean;
  description?: string;
}

// QuickActions: 역할별 빠른 액션 버튼을 단일 위치에서 렌더합니다.
interface QuickActionsProps {
  role: string;
  onNavigate: (path: string) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ role, onNavigate }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'row', md: 'column' },
        gap: 1,
        alignItems: 'center',
      }}
    >
      {role === 'client' && (
        <Button
          variant="contained"
          color="primary"
          onClick={() => onNavigate('/cases/request')}
          data-testid="cta-client-request"
          sx={{ mb: { md: 1 }, minWidth: 120 }}
        >
          의뢰하기
        </Button>
      )}
      {role === 'detective' && (
        <Button
          variant="contained"
          color="primary"
          onClick={() => onNavigate('/evidence/new')}
          data-testid="cta-detective-evidence"
          sx={{ mb: { md: 1 }, minWidth: 120 }}
        >
          증거 업로드
        </Button>
      )}
      {role === 'admin' && (
        <Button
          variant="contained"
          color="primary"
          onClick={() => onNavigate('/admin/assignments')}
          data-testid="cta-admin-assignments"
          sx={{ mb: { md: 1 }, minWidth: 120 }}
        >
          배정 관리
        </Button>
      )}
    </Box>
  );
};

/**
 * 통합 메인 레이아웃 컴포넌트
 * - 모든 페이지를 연결하는 마스터 내비게이션
 * - Sidebar + AppBar + Main Content 구조
 * - 사이버펑크 네온 테마 적용
 */
const UnifiedLayout: React.FC<UnifiedLayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [drawerWidth, setDrawerWidth] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('piip_drawer_width');
      if (stored) {
        const num = parseInt(stored, 10);
        if (!isNaN(num)) return Math.min(Math.max(num, MIN_DRAWER_WIDTH), MAX_DRAWER_WIDTH);
      }
    }
    return DEFAULT_DRAWER_WIDTH;
  });
  const resizingRef = useRef(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const authToken = useSelector((state: RootState) => state.auth.token);

  // 역할별 메뉴 구조
  const commonMenu: NavigationItem[] = [
    {
      title: '사건 관리',
      icon: <FolderIcon />,
      path: '/cases',
      description: '사건 생성, 조회, 진행, 완료',
    },
    {
      title: '증거 관리',
      icon: <PhotoLibraryIcon />,
      path: '/evidence',
      description: '업로드, 태그, 블록체인, 무결성',
    },
    {
      title: '보고서 작성/제출',
      icon: <AdminIcon />,
      path: '/reports',
      description: '보고서 작성 및 제출',
    },
    {
      title: '결제/계약 관리',
      icon: <DashboardIcon />,
      path: '/payment',
      description: '결제 및 계약 관리',
    },
    {
      title: '실적/평가/리뷰',
      icon: <DashboardIcon />,
      path: '/performance',
      description: '실적, 평가, 리뷰 관리',
    },
    {
      title: '통계/분석/리포트',
      icon: <AdminIcon />,
      path: '/admin/stats',
      description: '실적/평가 포함 통계/분석/리포트',
    },
    {
      title: 'AI 자동화',
      icon: <AutoAwesomeIcon />,
      path: '/ai-evidence',
      description: '얼굴/패턴/이미지/문서/차량번호 인식',
    },
  ];

  const clientMenu: NavigationItem[] = [
    {
      title: '의뢰인 대시보드',
      icon: <DashboardIcon />,
      path: '/client-dashboard',
      description: '내 사건 의뢰 및 진행 현황',
    },
    {
      title: '탐정 검색/매칭',
      icon: <PeopleIcon />,
      path: '/detectives/search',
      description: '실시간 탐정 검색 및 매칭',
    },
  ];

  const detectiveMenu: NavigationItem[] = [
    {
      title: '탐정 대시보드',
      icon: <DashboardIcon />,
      path: '/detective-dashboard',
      description: '배정된 사건 관리',
    },
    {
      title: '증거 수집/업로드/분석',
      icon: <PhotoLibraryIcon />,
      path: '/evidence',
      description: '증거 수집, 업로드, 분석',
    },
    {
      title: 'AI 분석 도구',
      icon: <AutoAwesomeIcon />,
      path: '/ai-tools',
      description: 'AI 분석 도구(차량번호 포함)',
    },
  ];

  const adminMenu: NavigationItem[] = [
    {
      title: '관리자 DB 관리',
      icon: <AdminIcon />,
      path: '/admin/db',
      description: '모든 DB(사건, 증거, 회원 등) CRUD',
    },
    {
      title: '시스템 설정/권한 관리',
      icon: <AdminIcon />,
      path: '/admin/settings',
      description: '시스템 설정/권한 관리',
    },
  ];

  const extraMenu: NavigationItem[] = [
    {
      title: '플랫폼 소개/브랜드 정보',
      icon: <InfoIcon />,
      path: '/about',
      description: '플랫폼 소개/브랜드 정보',
    },
    {
      title: '홈 버전 비교',
      icon: <AutoAwesomeIcon />,
      path: '/homes',
      description: '다양한 홈페이지 버전 선택/비교',
    },
    {
      title: '모바일/웹 전환',
      icon: <AutoAwesomeIcon />,
      path: '/mobile-web',
      description: '모바일/웹 버전 전환',
    },
    {
      title: '실시간 알림/푸시',
      icon: <InfoIcon />,
      path: '/push',
      description: '실시간 알림/푸시',
    },
    {
      title: '개인정보/보안 설정',
      icon: <AdminIcon />,
      path: '/settings',
      description: '개인정보/보안 설정',
    },
    {
      title: '올인원 관리',
      icon: <DashboardIcon />,
      path: '/all-in-one',
      description: '사건, 증거, 보고서 등 통합 관리',
    },
    {
      title: '블록체인 보안',
      icon: <DashboardIcon />,
      path: '/blockchain',
      description: '증거 무결성, 법정 효력',
    },
    {
      title: '실적/평가',
      icon: <DashboardIcon />,
      path: '/performance/all',
      description: '탐정/사건별 실적, 평가, 리뷰',
    },
  ];

  // 역할 정보는 Redux 스토어의 auth.user에서 가져옵니다. (기본값 'client')
  // 이전에는 localStorage를 직접 읽었지만, 이제 스토어와 일관되게 유지하도록 변경했습니다.
  const authUser = useSelector(
    (state: RootState) => state.auth.user as { id?: string; email?: string; role?: string } | null
  );
  const role: string = authUser?.role ?? 'client';
  let navigationItems: NavigationItem[] = [];
  switch (role) {
    case 'client':
      navigationItems = [...commonMenu, ...clientMenu];
      break;
    case 'detective':
      navigationItems = [...commonMenu, ...detectiveMenu];
      break;
    case 'admin':
      navigationItems = [...commonMenu, ...adminMenu];
      break;
    default:
      navigationItems = [...commonMenu];
      break;
  }

  // Do not append generic extraMenu to all roles — show only role-appropriate items.
  // If you want to expose global links (about/settings), add them explicitly per-role.

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setDesktopOpen(!desktopOpen);
    }
  };

  // Track case counts and next actionable case for quick navigation
  const [pendingCount, setPendingCount] = useState(0);
  const [pausedCount, setPausedCount] = useState(0);
  const [inProgressCount, setInProgressCount] = useState(0);
  const [nextCaseId, setNextCaseId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadCases = async () => {
      try {
        const res = await api.get('/cases');
        const cases = Array.isArray(res.data) ? res.data : [];

        if (!mounted) return;

        const pending = cases.filter((c: any) => c.status === '대기').length;
        const paused = cases.filter((c: any) => c.status === '보류').length;
        const inprog = cases.filter(
          (c: any) => c.status === '조사중' || c.status === '조사 중'
        ).length;

        setPendingCount(pending);
        setPausedCount(paused);
        setInProgressCount(inprog);

        // Determine next actionable case depending on role
        let next: string | null = null;
        if (role === 'client') {
          const nextCase = cases.find((c: any) => c.status === '대기' || c.status === '보류');
          next = nextCase?.id || nextCase?._id || null;
        } else if (role === 'detective') {
          // detective API returns assignments joined; try to find assigned -> accepted flow
          const assigned = cases.find((c: any) => {
            const assignments = c.assignments || [];
            return assignments.some((a: any) => a.status === 'assigned' || a.status === 'accepted');
          });
          next = assigned?.id || assigned?._id || null;
        } else if (role === 'admin') {
          const adminNext = cases.find((c: any) => c.status === '보류' || c.status === '대기');
          next = adminNext?.id || adminNext?._id || null;
        }

        setNextCaseId(next);
      } catch (e) {
        // ignore quietly; counts remain at 0
        console.warn('Failed to load case counts', e);
      }
    };

    if (authUser) loadCases();
    return () => {
      mounted = false;
    };
  }, [authUser, role]);

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const isActivePath = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        background: 'linear-gradient(180deg, #0a0415 0%, #1a0f2e 100%)',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Sidebar Header */}
      <Box
        sx={{
          p: 3,
          background: 'linear-gradient(135deg, rgba(0,245,255,0.1) 0%, rgba(255,0,255,0.1) 100%)',
          borderBottom: '1px solid rgba(0,245,255,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #00f5ff 0%, #ff00ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: 1,
            }}
          >
            PIIP Platform
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: alpha('#fff', 0.6),
              display: 'block',
              mt: 0.5,
            }}
          >
            탐정 통합 AI 플랫폼
          </Typography>
        </Box>
        {!isMobile && (
          <IconButton onClick={handleDrawerToggle} sx={{ color: '#00f5ff' }}>
            <ChevronLeftIcon />
          </IconButton>
        )}

        {/* Role-specific quick actions removed from drawerContent to avoid duplicate DOM nodes.
            QuickActions component is rendered once inside the AppBar to ensure a single data-testid instance. */}
      </Box>

      {/* Navigation List */}
      <List sx={{ flex: 1, pt: 2, px: 1.5 }}>
        {navigationItems.map((item) => (
          <React.Fragment key={item.path}>
            {item.divider && <Divider sx={{ my: 2, borderColor: 'rgba(0,245,255,0.2)' }} />}
            <Tooltip title={item.description} placement="right" arrow>
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  selected={isActivePath(item.path)}
                  data-testid={`nav-${item.path.replace(/\//g, '_')}`}
                  sx={{
                    borderRadius: 2,
                    px: 2,
                    py: 1.5,
                    transition: 'all 0.3s ease',
                    '&.Mui-selected': {
                      background:
                        'linear-gradient(135deg, rgba(0,245,255,0.2) 0%, rgba(255,0,255,0.2) 100%)',
                      borderLeft: '3px solid #00f5ff',
                      '&:hover': {
                        background:
                          'linear-gradient(135deg, rgba(0,245,255,0.3) 0%, rgba(255,0,255,0.3) 100%)',
                      },
                    },
                    '&:hover': {
                      background: alpha('#00f5ff', 0.1),
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActivePath(item.path) ? '#00f5ff' : alpha('#fff', 0.7),
                      minWidth: 40,
                    }}
                  >
                    {/* Show badge on '사건 관리' to surface pending/paused counts */}
                    {item.path === '/cases' ? (
                      <Badge
                        badgeContent={pendingCount + pausedCount}
                        color="error"
                        invisible={pendingCount + pausedCount === 0}
                      >
                        {item.icon}
                      </Badge>
                    ) : (
                      item.icon
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.title}
                    primaryTypographyProps={{
                      fontSize: '1.05rem',
                      fontWeight: isActivePath(item.path) ? 700 : 500,
                      color: isActivePath(item.path) ? '#fff' : 'rgba(230,245,255,0.95)',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            </Tooltip>
          </React.Fragment>
        ))}
      </List>

      {/* Sidebar Footer */}
      <Box
        sx={{
          p: 2,
          borderTop: '1px solid rgba(0,245,255,0.2)',
          background: alpha('#000', 0.3),
        }}
      >
        <Typography variant="caption" sx={{ color: alpha('#fff', 0.5) }}>
          © 2024 PIIP Platform
        </Typography>
        <Typography variant="caption" sx={{ display: 'block', color: alpha('#fff', 0.5), mt: 0.5 }}>
          Version 1.0.0
        </Typography>
      </Box>
    </Box>
  );

  // Persist width
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('piip_drawer_width', String(drawerWidth));
    }
  }, [drawerWidth]);

  // Resize handlers
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!resizingRef.current) return;
      const newWidth = Math.min(Math.max(e.clientX, MIN_DRAWER_WIDTH), MAX_DRAWER_WIDTH);
      setDrawerWidth(newWidth);
    };
    const handleUp = () => {
      if (resizingRef.current) {
        resizingRef.current = false;
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      }
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, []);

  const startResize = (e: React.MouseEvent) => {
    if (isMobile) return; // 모바일에서는 비활성화
    resizingRef.current = true;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
    e.preventDefault();
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#0a0415' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: {
            md: desktopOpen ? `calc(100% - ${drawerWidth}px)` : '100%',
          },
          ml: {
            md: desktopOpen ? `${drawerWidth}px` : 0,
          },
          background: 'linear-gradient(135deg, rgba(0,245,255,0.15) 0%, rgba(255,0,255,0.15) 100%)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(0,245,255,0.3)',
          boxShadow: '0 4px 20px rgba(0,245,255,0.2)',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              mr: 2,
              color: '#00f5ff',
              '&:hover': {
                background: alpha('#00f5ff', 0.1),
              },
            }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                background: 'linear-gradient(135deg, #00f5ff 0%, #ff00ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 600,
                mr: 2,
              }}
            >
              {navigationItems.find((item) => isActivePath(item.path))?.title || 'PIIP Platform'}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                px: 1.5,
                py: 0.5,
                borderRadius: 2,
                bgcolor: 'rgba(0,245,255,0.12)',
                color: '#00f5ff',
                fontWeight: 500,
                fontSize: '1rem',
                letterSpacing: 1,
                boxShadow: '0 1px 6px rgba(0,245,255,0.08)',
              }}
            >
              {role === 'admin'
                ? '관리자'
                : role === 'detective'
                  ? '탐정'
                  : role === 'client'
                    ? '의뢰인'
                    : '알수없음'}
            </Typography>
          </Box>

          {/* Quick actions: render single instance to avoid duplicate data-testid elements in DOM */}
          <QuickActions role={role} onNavigate={handleNavigation} />

          {/* 로그인/로그아웃 버튼 (상단 우측) */}
          {/* Next action button */}
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => {
              if (nextCaseId) navigate(`/cases/${nextCaseId}`);
            }}
            disabled={!nextCaseId}
            sx={{ mr: 1, borderColor: 'rgba(255,255,255,0.12)', color: '#fff' }}
          >
            다음 할 일
          </Button>

          <Button
            variant="contained"
            color="secondary"
            startIcon={<LoginIcon />}
            onClick={async () => {
              if (authToken) {
                await (dispatch as any)(logoutThunk());
              }
              navigate('/');
            }}
            sx={{
              bgcolor: 'rgba(255,0,80,0.15)',
              color: '#ff0050',
              border: '1px solid rgba(255,0,80,0.4)',
              backdropFilter: 'blur(10px)',
              ml: 2,
              '&:hover': {
                bgcolor: 'rgba(255,0,80,0.25)',
                border: '1px solid rgba(255,0,80,0.7)',
              },
            }}
          >
            로그아웃
          </Button>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{
          width: { md: desktopOpen ? drawerWidth : 0 },
          flexShrink: { md: 0 },
        }}
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better mobile performance
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Desktop Drawer */}
        <Drawer
          variant="persistent"
          open={desktopOpen}
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawerContent}
        </Drawer>
        {/* Resize Handle (Desktop only) */}
        {!isMobile && desktopOpen && (
          <Box
            onMouseDown={startResize}
            role="separator"
            aria-orientation="vertical"
            sx={{
              position: 'absolute',
              top: 0,
              right: -3,
              width: 6,
              height: '100%',
              cursor: 'col-resize',
              zIndex: 1300,
              '&:hover': {
                background: 'linear-gradient(180deg, rgba(0,245,255,0.4), rgba(255,0,255,0.4))',
              },
              '&:active': {
                background: 'linear-gradient(180deg, rgba(0,245,255,0.6), rgba(255,0,255,0.6))',
              },
            }}
          />
        )}
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: {
            md: desktopOpen ? `calc(100% - ${drawerWidth}px)` : '100%',
          },
          minHeight: '100vh',
          background: 'linear-gradient(180deg, #0a0415 0%, #1a0f2e 50%, #0a0415 100%)',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        {/* Toolbar spacer */}
        <Toolbar />
        {/* Page content */}
        <Box sx={{ p: { xs: 2, md: 3 } }}>{children}</Box>
      </Box>
    </Box>
  );
};

export default UnifiedLayout;

export const WorkflowSection = () => {
  return (
    <Box
      sx={{
        backgroundColor: '#1E1E2F',
        color: '#FFFFFF',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        textAlign: 'center',
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: '1rem' }}>
        업무 흐름
      </Typography>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        {[
          'STEP 01 · 사건 의뢰',
          'STEP 02 · 탐정 매칭',
          'STEP 03 · 계약 체결',
          'STEP 04 · 조사 진행',
          'STEP 05 · 증거 제출',
          'STEP 06 · 보고서 완료',
        ].map((step, index) => (
          <Button
            key={index}
            variant="contained"
            sx={{
              backgroundColor: '#3A3A5A',
              color: '#FFFFFF',
              fontWeight: 'bold',
              borderRadius: '20px',
              padding: '0.5rem 1rem',
              '&:hover': {
                backgroundColor: '#4A4A6A',
              },
            }}
          >
            {step}
          </Button>
        ))}
      </Box>
      <Typography variant="body1" sx={{ lineHeight: '1.8' }}>
        온라인 의뢰 → AI 매칭 → 전자계약/에스크로 → 실시간 진행 → 증거 보관 → 최종 보고서
      </Typography>
    </Box>
  );
};

const LegacyHomePage = () => {
  return (
    <Box
      sx={{
        backgroundColor: '#2E2E3F',
        color: '#FFFFFF',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: '1rem' }}>
        Legacy PIIP DETECTIVE
      </Typography>
      <Typography variant="h2" sx={{ fontWeight: 'bold', color: '#FFD700', marginBottom: '1rem' }}>
        탐정 플랫폼의 시작
      </Typography>
      <Typography variant="body1" sx={{ marginBottom: '2rem' }}>
        초기 버전의 탐정 플랫폼, 여전히 신뢰할 수 있는 서비스
      </Typography>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <Button
          variant="contained"
          sx={{
            backgroundColor: '#FFD700',
            color: '#2E2E3F',
            fontWeight: 'bold',
            borderRadius: '20px',
            padding: '0.5rem 1rem',
            '&:hover': {
              backgroundColor: '#FFC700',
            },
          }}
        >
          상담 예약하기
        </Button>
        <Button
          variant="outlined"
          sx={{
            borderColor: '#FFD700',
            color: '#FFD700',
            fontWeight: 'bold',
            borderRadius: '20px',
            padding: '0.5rem 1rem',
            '&:hover': {
              borderColor: '#FFC700',
              color: '#FFC700',
            },
          }}
        >
          탐정 보기
        </Button>
      </Box>
      <Typography variant="body2" sx={{ color: '#B0B0B0' }}>
        초기 성공률 90% · 신뢰받는 서비스
      </Typography>
    </Box>
  );
};

const HomePage = () => {
  return (
    <Box
      sx={{
        backgroundColor: '#1E1E2F',
        color: '#FFFFFF',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: '1rem' }}>
        PIIP DETECTIVE
      </Typography>
      <Typography variant="h2" sx={{ fontWeight: 'bold', color: '#FFD700', marginBottom: '1rem' }}>
        세계 최고의 탐정 플랫폼
      </Typography>
      <Typography variant="body1" sx={{ marginBottom: '2rem' }}>
        AI 기술과 전문 탐정의 완벽한 조화, 신속하고 안전하게 사건을 해결합니다
      </Typography>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <Button
          variant="contained"
          sx={{
            backgroundColor: '#FFD700',
            color: '#1E1E2F',
            fontWeight: 'bold',
            borderRadius: '20px',
            padding: '0.5rem 1rem',
            '&:hover': {
              backgroundColor: '#FFC700',
            },
          }}
        >
          무료 상담 시작하기
        </Button>
        <Button
          variant="outlined"
          sx={{
            borderColor: '#FFD700',
            color: '#FFD700',
            fontWeight: 'bold',
            borderRadius: '20px',
            padding: '0.5rem 1rem',
            '&:hover': {
              borderColor: '#FFC700',
              color: '#FFC700',
            },
          }}
        >
          탐정 찾아보기
        </Button>
        <Button
          variant="outlined"
          sx={{
            borderColor: '#FFD700',
            color: '#FFD700',
            fontWeight: 'bold',
            borderRadius: '20px',
            padding: '0.5rem 1rem',
            '&:hover': {
              borderColor: '#FFC700',
              color: '#FFC700',
            },
          }}
        >
          회원가입
        </Button>
      </Box>
      <Typography variant="body2" sx={{ color: '#B0B0B0' }}>
        정부 인증 · ISO 27001 · 98% 성공률
      </Typography>
    </Box>
  );
};

export { HomePage, LegacyHomePage };
