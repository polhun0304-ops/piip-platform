import React from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';

interface State {
  hasError: boolean;
  error?: Error | null;
}

class ErrorBoundary extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    // You might log to an external service here
    // console.error('ErrorBoundary caught', error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    // optionally reload the page: window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 2 }}>
          <Paper sx={{ p: 3, border: '1px solid rgba(0,0,0,0.08)' }}>
            <Typography variant="h6" gutterBottom>
              오류가 발생했습니다
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              해당 기능을 불러오는 중 오류가 발생했습니다. 콘솔을 확인하거나 페이지를
              새로고침해주세요.
            </Typography>
            <Button variant="contained" onClick={this.handleReload}>
              다시 시도
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children as any;
  }
}

export default ErrorBoundary;
