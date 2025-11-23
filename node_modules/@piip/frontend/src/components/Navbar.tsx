import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Box,
  Divider,
  Avatar,
  Tooltip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import MinimizeIcon from '@mui/icons-material/Minimize';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import FolderIcon from '@mui/icons-material/Folder';
import PeopleIcon from '@mui/icons-material/People';
import ImageIcon from '@mui/icons-material/Image';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

const Navbar: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('theme');
    return stored === 'dark';
  });
  const navigate = useNavigate();
  const location = useLocation();

  const navigateToHome = () => {
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', newMode ? 'dark' : 'light');
    window.location.reload(); // 테마 변경을 위해 새로고침
  };

  const menuItems = [
    { text: '홈', path: '/', icon: <DashboardIcon /> },
    { text: '소개', path: '/about', icon: <AdminPanelSettingsIcon /> },
    { text: '대시보드', path: '/dashboard', icon: <DashboardIcon /> },
    { text: '관리자 대시보드', path: '/admin', icon: <AdminPanelSettingsIcon /> },
    { text: '사건 목록', path: '/cases', icon: <FolderIcon /> },
    { text: '인물 목록', path: '/persons', icon: <PeopleIcon /> },
    { text: '증거 목록', path: '/evidence', icon: <ImageIcon /> },
  ];

  const handleMenuClick = (path: string) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const handleMinimize = () => {
    // 전체화면 모드라면 해제
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
    // 브라우저 창은 사용자가 직접 최소화해야 합니다
  };

  const handleMaximize = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.log('Fullscreen error:', err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleClose = () => {
    if (confirm('PIIP 플랫폼을 종료하시겠습니까?')) {
      // 전체화면 모드 해제
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
      // 홈으로 이동
      navigate('/');
      // 브라우저 창은 사용자가 직접 닫아야 합니다
      alert('브라우저 탭을 닫으시려면 Ctrl+W 또는 탭의 X 버튼을 눌러주세요.');
    }
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="메뉴" arrow>
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                sx={{
                  mr: 2,
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.15)',
                    transform: 'rotate(90deg)',
                  },
                  transition: 'all 0.3s',
                }}
                onClick={() => setDrawerOpen(!drawerOpen)}
              >
                <MenuIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="홈으로" arrow>
              <IconButton
                onClick={navigateToHome}
                sx={{
                  mr: 1.5,
                  p: 0,
                  '&:hover': {
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.2s',
                }}
              >
                <Avatar
                  src="/images/탐정사진 기본.png"
                  alt="PIIP 탐정"
                  sx={{
                    width: 36,
                    height: 36,
                    cursor: 'pointer',
                    border: '2px solid white',
                  }}
                />
              </IconButton>
            </Tooltip>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                fontWeight: 600,
                letterSpacing: '0.5px',
                cursor: 'pointer',
                '&:hover': {
                  opacity: 0.9,
                },
              }}
              onClick={navigateToHome}
            >
              PIIP Platform
            </Typography>
          </Box>

          {/* 우측 버튼 그룹 */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Tooltip title={darkMode ? '라이트 모드' : '다크 모드'} arrow>
              <IconButton
                color="inherit"
                size="small"
                onClick={toggleDarkMode}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderRadius: 2,
                  px: 1.5,
                  py: 0.5,
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.3)',
                    border: '2px solid rgba(255,255,255,0.5)',
                  },
                }}
              >
                {darkMode ? (
                  <Brightness7Icon fontSize="small" />
                ) : (
                  <Brightness4Icon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
            <Tooltip title="최소화" arrow>
              <IconButton
                color="inherit"
                size="small"
                onClick={handleMinimize}
                sx={{
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' },
                  borderRadius: 0,
                  px: 2,
                  py: 1,
                }}
              >
                <MinimizeIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={isFullscreen ? '전체화면 해제' : '전체화면'} arrow>
              <IconButton
                color="inherit"
                size="small"
                onClick={handleMaximize}
                sx={{
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' },
                  borderRadius: 0,
                  px: 2,
                  py: 1,
                }}
              >
                {isFullscreen ? (
                  <FullscreenExitIcon fontSize="small" />
                ) : (
                  <FullscreenIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
            <Tooltip title="닫기" arrow>
              <IconButton
                color="inherit"
                size="small"
                onClick={handleClose}
                sx={{
                  '&:hover': { bgcolor: 'rgba(244,67,54,0.8)' },
                  borderRadius: 0,
                  px: 2,
                  py: 1,
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            background: 'linear-gradient(180deg, #1976d2 0%, #1565c0 100%)',
            color: 'white',
          },
        }}
      >
        <Box sx={{ width: 280 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 2.5,
              mt: 8,
              bgcolor: 'rgba(0,0,0,0.1)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: 'white', color: 'primary.main', fontWeight: 'bold' }}>
                P
              </Avatar>
              <Typography variant="h6" fontWeight={600}>
                메뉴
              </Typography>
            </Box>
            <IconButton
              onClick={() => setDrawerOpen(false)}
              sx={{
                color: 'white',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
          <List sx={{ pt: 2 }}>
            {menuItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  onClick={() => handleMenuClick(item.path)}
                  selected={location.pathname === item.path}
                  sx={{
                    py: 1.5,
                    px: 3,
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.15)',
                    },
                    '&.Mui-selected': {
                      bgcolor: 'rgba(255,255,255,0.2)',
                      borderLeft: '4px solid white',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.25)',
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>{item.icon}</ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: location.pathname === item.path ? 600 : 400,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
