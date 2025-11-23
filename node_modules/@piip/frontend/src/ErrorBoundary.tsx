import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 4 }}>
          <Paper sx={{ p: 3, bgcolor: '#ffebee' }}>
            <Typography variant="h4" color="error" gutterBottom>
              ⚠️ 오류가 발생했습니다
            </Typography>
            <Typography variant="body1" paragraph>
              {this.state.error?.message || '알 수 없는 오류'}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {this.state.error?.stack}
            </Typography>
            <Button variant="contained" onClick={() => window.location.reload()}>
              새로고침
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
