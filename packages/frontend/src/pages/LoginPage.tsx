import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Button,
  Typography,
  Divider,
  TextField,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await authService.login(email, password);
      const role = response.user.role;
      window.localStorage.setItem('piip_role', role);

      if (role === 'admin') {
        navigate('/admin/db');
      } else if (role === 'detective') {
        navigate('/detective-dashboard');
      } else if (role === 'client') {
        navigate('/client-dashboard');
      } else {
        navigate('/home');
      }
    } catch (err: any) {
      console.error('Login failed', err);
      let errorMessage = '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.';

      if (err.response) {
        // 서버 응답이 있는 경우
        if (err.response.data && err.response.data.error) {
          errorMessage = err.response.data.error;
        } else {
          errorMessage = `서버 오류 (${err.response.status}): ${err.response.statusText}`;
        }
      } else if (err.request) {
        // 요청은 보냈으나 응답이 없는 경우 (네트워크 오류 등)
        errorMessage = '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.';
      } else {
        // 요청 설정 중 오류 발생
        errorMessage = `요청 오류: ${err.message}`;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Dev-only shortcut
  const handleRoleSelect = (role: string) => {
    window.localStorage.setItem('piip_role', role);
    if (role === 'admin') {
      navigate('/admin/db');
    } else if (role === 'detective') {
      navigate('/detective-dashboard');
    } else if (role === 'client') {
      navigate('/client-dashboard');
    } else {
      navigate('/home');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom align="center">
          PIIP 로그인
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleLogin} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="이메일"
            type="email"
            margin="normal"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            fullWidth
            label="비밀번호"
            type="password"
            margin="normal"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? '로그인 중...' : '로그인'}
          </Button>
        </Box>

        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" color="text.secondary">
            또는 개발용 바로가기
          </Typography>
        </Divider>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
          <Button variant="outlined" color="primary" onClick={() => handleRoleSelect('client')}>
            의뢰인(Dev)
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => handleRoleSelect('detective')}
          >
            탐정(Dev)
          </Button>
          <Button variant="outlined" color="success" onClick={() => handleRoleSelect('admin')}>
            관리자(Dev)
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;
