import { createTheme } from '@mui/material/styles';

/**
 * PIIP Platform Professional Detective Theme
 * - 신뢰성과 전문성을 표현하는 네이비/그레이 기반 색상
 * - 보안과 프라이버시를 고려한 차분한 톤
 * - 명확한 정보 계층 구조
 */

// 탐정 플랫폼 전용 색상 팔레트
export const detectiveColors = {
  // Primary - 전문적인 네이비
  navy: {
    50: '#e8eaf6',
    100: '#c5cae9',
    200: '#9fa8da',
    300: '#7986cb',
    400: '#5c6bc0',
    500: '#3f51b5', // Main
    600: '#3949ab',
    700: '#303f9f',
    800: '#283593',
    900: '#1a237e',
  },
  // Secondary - 신뢰감 있는 청록색
  teal: {
    50: '#e0f2f1',
    100: '#b2dfdb',
    200: '#80cbc4',
    300: '#4db6ac',
    400: '#26a69a',
    500: '#009688', // Main
    600: '#00897b',
    700: '#00796b',
    800: '#00695c',
    900: '#004d40',
  },
  // Accent - 강조용 앰버
  amber: {
    500: '#ffc107',
    600: '#ffb300',
  },
  // Status Colors
  status: {
    active: '#00c853',
    pending: '#ff9800',
    closed: '#757575',
    urgent: '#d32f2f',
    confidential: '#6a1b9a',
  },
  // Security Levels
  security: {
    public: '#4caf50',
    internal: '#2196f3',
    confidential: '#ff9800',
    restricted: '#f44336',
    topSecret: '#9c27b0',
  },
  // Neutral Grays
  gray: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
};

/**
 * Creates a theme based on the provided mode (light/dark)
 */
export const createAppTheme = (mode: 'light' | 'dark') =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'light' ? detectiveColors.navy[600] : detectiveColors.navy[400],
        light: mode === 'light' ? detectiveColors.navy[400] : detectiveColors.navy[300],
        dark: mode === 'light' ? detectiveColors.navy[800] : detectiveColors.navy[600],
        contrastText: '#ffffff',
      },
      secondary: {
        main: mode === 'light' ? detectiveColors.teal[600] : detectiveColors.teal[400],
        light: mode === 'light' ? detectiveColors.teal[400] : detectiveColors.teal[300],
        dark: mode === 'light' ? detectiveColors.teal[800] : detectiveColors.teal[600],
        contrastText: '#ffffff',
      },
      success: {
        main: detectiveColors.status.active,
        light: '#4caf50',
        dark: '#2e7d32',
      },
      warning: {
        main: detectiveColors.status.pending,
        light: '#ffb74d',
        dark: '#f57c00',
      },
      error: {
        main: detectiveColors.status.urgent,
        light: '#e57373',
        dark: '#c62828',
      },
      info: {
        main: mode === 'light' ? '#1976d2' : '#42a5f5',
        light: '#4fc3f7',
        dark: '#0d47a1',
      },
      background: {
        default: mode === 'light' ? '#f8f9fa' : '#0a0e1a',
        paper: mode === 'light' ? '#ffffff' : '#151b2d',
      },
      text: {
        primary: mode === 'light' ? detectiveColors.gray[900] : '#e8eaf0',
        secondary: mode === 'light' ? detectiveColors.gray[700] : detectiveColors.gray[400],
        disabled: mode === 'light' ? detectiveColors.gray[500] : detectiveColors.gray[600],
      },
      divider: mode === 'light' ? detectiveColors.gray[200] : 'rgba(255, 255, 255, 0.08)',
      action: {
        active: mode === 'light' ? detectiveColors.navy[600] : detectiveColors.navy[400],
        hover: mode === 'light' ? 'rgba(63, 81, 181, 0.04)' : 'rgba(121, 134, 203, 0.08)',
        selected: mode === 'light' ? 'rgba(63, 81, 181, 0.08)' : 'rgba(121, 134, 203, 0.12)',
        disabled: mode === 'light' ? 'rgba(0, 0, 0, 0.26)' : 'rgba(255, 255, 255, 0.3)',
        disabledBackground: mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
      },
    },
    shape: {
      borderRadius: 8,
    },
    typography: {
      fontFamily: [
        'Pretendard',
        'Noto Sans KR',
        'Inter',
        '-apple-system',
        'BlinkMacSystemFont',
        'Segoe UI',
        'Roboto',
        'Apple SD Gothic Neo',
        'sans-serif',
      ].join(','),
      h1: {
        fontSize: '2.5rem',
        fontWeight: 700,
        lineHeight: 1.2,
        letterSpacing: '-0.01562em',
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 700,
        lineHeight: 1.3,
        letterSpacing: '-0.00833em',
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 600,
        lineHeight: 1.5,
      },
      h6: {
        fontSize: '1.125rem',
        fontWeight: 600,
        lineHeight: 1.5,
      },
      subtitle1: {
        fontSize: '1rem',
        fontWeight: 500,
        lineHeight: 1.75,
      },
      subtitle2: {
        fontSize: '0.875rem',
        fontWeight: 500,
        lineHeight: 1.57,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.6,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.6,
      },
      button: {
        textTransform: 'none',
        fontWeight: 600,
        letterSpacing: '0.02857em',
      },
      caption: {
        fontSize: '0.75rem',
        lineHeight: 1.5,
      },
      overline: {
        fontSize: '0.75rem',
        fontWeight: 600,
        lineHeight: 2.5,
        textTransform: 'uppercase',
        letterSpacing: '0.08333em',
      },
    },
    shadows: [
      'none',
      mode === 'light' ? '0px 2px 4px rgba(0, 0, 0, 0.05)' : '0px 2px 4px rgba(0, 0, 0, 0.3)',
      mode === 'light' ? '0px 4px 8px rgba(0, 0, 0, 0.07)' : '0px 4px 8px rgba(0, 0, 0, 0.4)',
      mode === 'light' ? '0px 6px 12px rgba(0, 0, 0, 0.08)' : '0px 6px 12px rgba(0, 0, 0, 0.45)',
      mode === 'light' ? '0px 8px 16px rgba(0, 0, 0, 0.1)' : '0px 8px 16px rgba(0, 0, 0, 0.5)',
      mode === 'light' ? '0px 12px 24px rgba(0, 0, 0, 0.12)' : '0px 12px 24px rgba(0, 0, 0, 0.55)',
      mode === 'light' ? '0px 16px 32px rgba(0, 0, 0, 0.14)' : '0px 16px 32px rgba(0, 0, 0, 0.6)',
      mode === 'light' ? '0px 20px 40px rgba(0, 0, 0, 0.16)' : '0px 20px 40px rgba(0, 0, 0, 0.65)',
      mode === 'light' ? '0px 24px 48px rgba(0, 0, 0, 0.18)' : '0px 24px 48px rgba(0, 0, 0, 0.7)',
      mode === 'light' ? '0px 24px 48px rgba(0, 0, 0, 0.18)' : '0px 24px 48px rgba(0, 0, 0, 0.7)',
      mode === 'light' ? '0px 24px 48px rgba(0, 0, 0, 0.18)' : '0px 24px 48px rgba(0, 0, 0, 0.7)',
      mode === 'light' ? '0px 24px 48px rgba(0, 0, 0, 0.18)' : '0px 24px 48px rgba(0, 0, 0, 0.7)',
      mode === 'light' ? '0px 24px 48px rgba(0, 0, 0, 0.18)' : '0px 24px 48px rgba(0, 0, 0, 0.7)',
      mode === 'light' ? '0px 24px 48px rgba(0, 0, 0, 0.18)' : '0px 24px 48px rgba(0, 0, 0, 0.7)',
      mode === 'light' ? '0px 24px 48px rgba(0, 0, 0, 0.18)' : '0px 24px 48px rgba(0, 0, 0, 0.7)',
      mode === 'light' ? '0px 24px 48px rgba(0, 0, 0, 0.18)' : '0px 24px 48px rgba(0, 0, 0, 0.7)',
      mode === 'light' ? '0px 24px 48px rgba(0, 0, 0, 0.18)' : '0px 24px 48px rgba(0, 0, 0, 0.7)',
      mode === 'light' ? '0px 24px 48px rgba(0, 0, 0, 0.18)' : '0px 24px 48px rgba(0, 0, 0, 0.7)',
      mode === 'light' ? '0px 24px 48px rgba(0, 0, 0, 0.18)' : '0px 24px 48px rgba(0, 0, 0, 0.7)',
      mode === 'light' ? '0px 24px 48px rgba(0, 0, 0, 0.18)' : '0px 24px 48px rgba(0, 0, 0, 0.7)',
      mode === 'light' ? '0px 24px 48px rgba(0, 0, 0, 0.18)' : '0px 24px 48px rgba(0, 0, 0, 0.7)',
      mode === 'light' ? '0px 24px 48px rgba(0, 0, 0, 0.18)' : '0px 24px 48px rgba(0, 0, 0, 0.7)',
      mode === 'light' ? '0px 24px 48px rgba(0, 0, 0, 0.18)' : '0px 24px 48px rgba(0, 0, 0, 0.7)',
      mode === 'light' ? '0px 24px 48px rgba(0, 0, 0, 0.18)' : '0px 24px 48px rgba(0, 0, 0, 0.7)',
      mode === 'light' ? '0px 24px 48px rgba(0, 0, 0, 0.18)' : '0px 24px 48px rgba(0, 0, 0, 0.7)',
    ],
    components: {
      MuiButton: {
        defaultProps: {
          disableElevation: true,
          size: 'medium',
        },
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: 8,
            paddingInline: theme.spacing(2.5),
            paddingBlock: theme.spacing(1.25),
            fontWeight: 600,
            letterSpacing: '0.02857em',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:active': {
              transform: 'scale(0.98)',
            },
          }),
          containedPrimary: ({ theme }) => ({
            background:
              mode === 'light'
                ? theme.palette.primary.main
                : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            '&:hover': {
              background:
                mode === 'light'
                  ? theme.palette.primary.dark
                  : `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
              boxShadow: '0 4px 12px rgba(63, 81, 181, 0.3)',
            },
          }),
          outlined: ({ theme }) => ({
            borderWidth: 2,
            borderColor: theme.palette.primary.main,
            '&:hover': {
              borderWidth: 2,
              backgroundColor: theme.palette.action.hover,
            },
          }),
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: 8,
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
              transform: 'scale(1.05)',
            },
          }),
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            borderRadius: 6,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: 12,
            border: `1px solid ${theme.palette.divider}`,
            transition: 'all 0.2s ease',
            '&:hover': {
              boxShadow:
                mode === 'light'
                  ? '0 8px 24px rgba(0, 0, 0, 0.12)'
                  : '0 8px 24px rgba(0, 0, 0, 0.6)',
              transform: 'translateY(-2px)',
            },
          }),
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: ({ theme }) => ({
            boxShadow:
              mode === 'light' ? '0 2px 8px rgba(0, 0, 0, 0.08)' : '0 2px 8px rgba(0, 0, 0, 0.4)',
            backgroundColor: theme.palette.background.paper,
            backgroundImage: 'none',
          }),
        },
      },
      MuiPaper: {
        styleOverrides: {
          rounded: {
            borderRadius: 12,
          },
          elevation1: {
            boxShadow:
              mode === 'light' ? '0 2px 8px rgba(0, 0, 0, 0.08)' : '0 2px 8px rgba(0, 0, 0, 0.4)',
          },
          elevation2: {
            boxShadow:
              mode === 'light' ? '0 4px 12px rgba(0, 0, 0, 0.1)' : '0 4px 12px rgba(0, 0, 0, 0.5)',
          },
          elevation3: {
            boxShadow:
              mode === 'light' ? '0 8px 24px rgba(0, 0, 0, 0.12)' : '0 8px 24px rgba(0, 0, 0, 0.6)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
            },
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: 6,
            fontSize: '0.875rem',
          },
        },
      },
    },
  });

export default createAppTheme('light');
