// [백업] 2025-11-07 PIIP 회원가입 페이지
// 원본: packages/frontend/src/pages/SignUpPage.tsx

import React, { useState } from "react";
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
} from "@mui/material";
import { AppButton } from "../components/AppButton";
import { useNavigate } from "react-router-dom";
import { Info as InfoIcon } from "@mui/icons-material";

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    agreeTerms: false,
    agreePrivacy: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 실제 회원가입 API 연동
    console.log("회원가입 데이터:", formData);
    navigate("/dashboard");
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 6 }}>
        {/* 상단 안내 버튼 */}
        <Box sx={{ mb: 3 }}>
          <Alert icon={<InfoIcon />} severity="info">
            회원가입은 선택 사항입니다. 빠른 상담을 원하시면 회원가입 없이 접수
            가능합니다.
          </Alert>
        </Box>
        <Paper sx={{ p: 4, borderRadius: 3 }} elevation={3}>
          <form onSubmit={handleSubmit}>
            <Typography variant="h5" gutterBottom>
              회원가입
            </Typography>
            <TextField
              label="이름"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
            />
            <TextField
              label="이메일"
              name="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
              type="email"
            />
            <TextField
              label="비밀번호"
              name="password"
              value={formData.password}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
              type="password"
            />
            <TextField
              label="비밀번호 확인"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
              type="password"
            />
            <TextField
              label="휴대폰 번호"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
              type="tel"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  name="agreeTerms"
                  required
                />
              }
              label="이용약관 동의"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.agreePrivacy}
                  onChange={handleChange}
                  name="agreePrivacy"
                  required
                />
              }
              label="개인정보 처리방침 동의"
            />
            <Box sx={{ mt: 3 }}>
              <AppButton
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
              >
                회원가입 완료
              </AppButton>
            </Box>
          </form>
        </Paper>
        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Link href="/" underline="hover">
            메인으로 돌아가기
          </Link>
        </Box>
      </Box>
    </Container>
  );
};

export default SignUpPage;
