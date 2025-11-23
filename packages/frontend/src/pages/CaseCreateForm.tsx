import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Box,
  Button,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Alert,
  Container,
} from '@mui/material';

const steps = ['기본 정보', '사건 상세', '약관 동의'];

const CaseCreateForm: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [caseType, setCaseType] = useState('일반');
  const [description, setDescription] = useState('');
  const [agreed, setAgreed] = useState(false);

  const handleNext = () => {
    if (activeStep === 0 && !title) {
      setError('사건 제목을 입력해주세요.');
      return;
    }
    if (activeStep === 1 && !description) {
      setError('사건 내용을 입력해주세요.');
      return;
    }
    if (activeStep === 2 && !agreed) {
      setError('약관에 동의해야 합니다.');
      return;
    }

    setError(null);
    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setError(null);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Combine type into description or handle as needed
      const fullDescription = `[유형: ${caseType}]\n\n${description}`;

      await api.post('/cases', {
        title,
        description: fullDescription,
        date,
        status: '대기', // Initial status
      });

      navigate('/client-dashboard', {
        state: { message: '사건 의뢰가 성공적으로 접수되었습니다.' },
      });
    } catch (err: any) {
      console.error(err);
      setError('사건 접수 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <TextField
              label="사건 제목"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              margin="normal"
              placeholder="예: 실종된 가족 찾기"
              autoFocus
            />
            <TextField
              label="발생 일자 (또는 의뢰일)"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              margin="normal"
            />
          </Box>
        );
      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>사건 유형</InputLabel>
              <Select
                value={caseType}
                label="사건 유형"
                onChange={(e) => setCaseType(e.target.value)}
              >
                <MenuItem value="실종">실종자 찾기</MenuItem>
                <MenuItem value="기업">기업 보안/횡령</MenuItem>
                <MenuItem value="법률">법적 증거 수집</MenuItem>
                <MenuItem value="사이버">사이버 범죄/스토킹</MenuItem>
                <MenuItem value="기타">기타</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="상세 내용"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={6}
              fullWidth
              margin="normal"
              placeholder="사건의 경위, 현재 상황, 특별히 요청하고 싶은 사항 등을 자세히 적어주세요."
            />
          </Box>
        );
      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" paragraph>
              본 의뢰인은 PIIP 플랫폼의 이용 약관 및 개인정보 처리방침에 동의하며, 제공하는 모든
              정보가 사실임을 확인합니다. 허위 사실 기재 시 법적 책임이 따를 수 있습니다.
            </Typography>
            <Paper
              variant="outlined"
              sx={{ p: 2, mb: 2, bgcolor: 'grey.50', maxHeight: 150, overflow: 'auto' }}
            >
              <Typography variant="caption" color="text.secondary">
                제1조 (목적) 이 약관은... (중략) ...
                <br />
                제2조 (비밀유지) 탐정은 의뢰인의 정보를... (중략) ...
              </Typography>
            </Paper>
            <FormControlLabel
              control={<Checkbox checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />}
              label="위 약관에 동의합니다 (필수)"
            />
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }} elevation={3}>
        <Typography variant="h5" gutterBottom align="center" fontWeight={700}>
          사건 의뢰 마법사
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 4 }}>
          전문 탐정이 귀하의 사건을 해결해 드립니다.
        </Typography>

        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mt: 4, minHeight: 300 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {getStepContent(activeStep)}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button disabled={activeStep === 0} onClick={handleBack}>
            이전
          </Button>
          <Button variant="contained" onClick={handleNext} disabled={loading}>
            {activeStep === steps.length - 1 ? (loading ? '처리 중...' : '의뢰 제출') : '다음'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default CaseCreateForm;
