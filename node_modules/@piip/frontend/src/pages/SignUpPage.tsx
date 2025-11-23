import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Paper,
  FormControlLabel,
  Checkbox,
  Link,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Info as InfoIcon } from '@mui/icons-material';
import { authService } from '../services/auth';
import { AppButton } from '../components/AppButton';

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    agreeTerms: false,
    agreePrivacy: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (!formData.agreeTerms || !formData.agreePrivacy) {
      setError('약관에 동의해야 합니다.');
      return;
    }

    setLoading(true);
    try {
      await authService.register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: formData.phone,
        role: 'client', // Default to client for now
      });
      navigate('/home');
    } catch (err: any) {
      console.error('Registration failed', err);
      setError(err.response?.data?.error || '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 6 }}>
        {/* 상단 안내 버튼 */}
        <Box
          sx={{
            mb: 3,
            p: 2,
            bgcolor: (theme) => (theme.palette.mode === 'light' ? '#dbeafe' : 'primary.dark'),
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <InfoIcon color="primary" />
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" fontWeight={600}>
              가입 전에 PIIP 플랫폼에 대해 더 알아보세요
            </Typography>
            <Typography variant="caption" color="text.secondary">
              서비스 소개, 요금 안내, 실제 사례를 확인할 수 있습니다
            </Typography>
          </Box>
          <AppButton variant="soft" onClick={() => navigate('/about')}>
            알아보기
          </AppButton>
        </Box>

        {/* 회원가입 폼 */}
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
            회원가입
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            PIIP 플랫폼에 가입하고 전문 탐정 서비스를 이용하세요
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label="이름"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="이메일"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="전화번호"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="010-0000-0000"
              required
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="비밀번호"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
              helperText="8자 이상, 영문/숫자/특수문자 조합"
            />

            <TextField
              fullWidth
              label="비밀번호 확인"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              sx={{ mb: 3 }}
              error={
                formData.confirmPassword !== '' && formData.password !== formData.confirmPassword
              }
              helperText={
                formData.confirmPassword !== '' && formData.password !== formData.confirmPassword
                  ? '비밀번호가 일치하지 않습니다'
                  : ''
              }
            />

            <FormControlLabel
              control={
                <Checkbox
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  required
                />
              }
              label={
                <Typography variant="body2">
                  <Link href="#" onClick={(e) => e.preventDefault()}>
                    이용약관
                  </Link>
                  에 동의합니다 (필수)
                </Typography>
              }
              sx={{ mb: 1 }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  name="agreePrivacy"
                  checked={formData.agreePrivacy}
                  onChange={handleChange}
                  required
                />
              }
              label={
                <Typography variant="body2">
                  <Link href="#" onClick={(e) => e.preventDefault()}>
                    개인정보 처리방침
                  </Link>
                  에 동의합니다 (필수)
                </Typography>
              }
              sx={{ mb: 3 }}
            />

            <Alert severity="info" sx={{ mb: 3 }}>
              첫 상담은 무료입니다. 가입 후 바로 전문가와 연결됩니다.
            </Alert>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <AppButton type="submit" variant="primary" disabled={loading}>
                  {loading ? '가입 중...' : '회원가입'}
                </AppButton>
              </Box>
              <AppButton variant="secondary" onClick={() => navigate('/')}>
                취소
              </AppButton>
            </Box>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                이미 계정이 있으신가요?{' '}
                <Link
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/login');
                  }}
                >
                  로그인
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default SignUpPage;
