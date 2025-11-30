import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Divider,
  Alert,
  Stepper,
  Step,
  StepLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../services/api';
import { authService } from '../services/auth';

const PaymentPage: React.FC = () => {
  const location: any = useLocation();
  const navigate = useNavigate();
  const user = useSelector((state: any) => state.auth.user);
  const requestData = location?.state?.requestData || null;
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [contractAccepted, setContractAccepted] = useState(false);

  // 결제 정보
  const [cardInfo, setCardInfo] = useState({
    number: '',
    expiry: '',
    cvv: '',
    holderName: '',
  });

  // 계약 정보
  const [contractInfo, setContractInfo] = useState({
    termsAccepted: false,
    privacyAccepted: false,
    paymentTermsAccepted: false,
  });

  const steps = ['계약 동의', '결제 정보 입력', '결제 완료'];

  const handleNext = () => {
    if (activeStep === 0 && !contractAccepted) {
      alert('계약 조건에 동의해주세요.');
      return;
    }
    if (activeStep === 1) {
      if (
        paymentMethod === 'card' &&
        (!cardInfo.number || !cardInfo.expiry || !cardInfo.cvv || !cardInfo.holderName)
      ) {
        alert('카드 정보를 모두 입력해주세요.');
        return;
      }
    }
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const doPayment = async () => {
    if (!requestData) return;
    setLoading(true);
    try {
      // 실제 결제 처리 (모의)
      const paymentData = {
        amount: requestData.budget || 0,
        method: paymentMethod,
        cardInfo: paymentMethod === 'card' ? cardInfo : null,
        caseTitle: requestData.title,
        clientId: user?.id,
        clientName: user?.name,
      };

      // 결제 API 호출 (실제로는 PG사 API 사용)
      const paymentRes = await api.post('/payments', paymentData);

      // 사건 생성
      const caseRes = await api.post('/cases', {
        title: requestData.title,
        description: requestData.description,
        budget: requestData.budget,
        clientId: user?.id,
        status: '결제완료',
        paymentId: paymentRes.data.paymentId,
      });

      // 계약서 생성
      await api.post('/contracts', {
        caseId: caseRes.data.id || caseRes.data._id,
        clientId: user?.id,
        detectiveId: null, // 아직 매칭되지 않음
        terms: contractInfo,
        paymentInfo: paymentData,
        status: '체결대기',
      });

      // 자동 매칭 시도
      try {
        await api.post('/assignments', {
          caseId: caseRes.data.id || caseRes.data._id || caseRes.data.caseId,
        });
      } catch (e) {
        console.warn('자동 매칭 실패', e);
      }

      navigate(`/cases/${caseRes.data.id || caseRes.data._id || caseRes.data.caseId}`);
    } catch (e) {
      console.error('결제 처리 실패', e);
      alert('결제 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!requestData) {
    return (
      <Box>
        <Typography variant="h5">결제할 의뢰 정보가 없습니다.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Typography variant="h4" gutterBottom align="center">
        결제 및 계약 진행
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {activeStep === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              계약 조건 동의
            </Typography>
            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                서비스 이용 약관
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                1. 의뢰인은 제공된 서비스에 대해 정확한 정보를 제공해야 합니다. 2. 탐정은 전문적인
                조사 서비스를 제공하며, 결과에 대한 책임을 집니다. 3. 결제 후 취소는 불가능하며,
                환불 정책에 따라 처리됩니다. 4. 모든 조사 결과는 법적 효력을 가질 수 있습니다.
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={contractInfo.termsAccepted}
                    onChange={(e) =>
                      setContractInfo((prev) => ({ ...prev, termsAccepted: e.target.checked }))
                    }
                  />
                }
                label="서비스 이용 약관에 동의합니다"
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                개인정보 처리 방침
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                수집된 개인정보는 조사 목적으로만 사용되며, 관련 법규에 따라 보호됩니다.
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={contractInfo.privacyAccepted}
                    onChange={(e) =>
                      setContractInfo((prev) => ({ ...prev, privacyAccepted: e.target.checked }))
                    }
                  />
                }
                label="개인정보 처리 방침에 동의합니다"
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                결제 및 환불 정책
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                결제 완료 후 서비스 시작되며, 중도 취소 시 환불이 제한될 수 있습니다.
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={contractInfo.paymentTermsAccepted}
                    onChange={(e) =>
                      setContractInfo((prev) => ({
                        ...prev,
                        paymentTermsAccepted: e.target.checked,
                      }))
                    }
                  />
                }
                label="결제 및 환불 정책에 동의합니다"
              />
            </Box>

            <FormControlLabel
              control={
                <Checkbox
                  checked={contractAccepted}
                  onChange={(e) => setContractAccepted(e.target.checked)}
                />
              }
              label="위 모든 약관에 동의하며 계약을 진행합니다"
            />
          </CardContent>
        </Card>
      )}

      {activeStep === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              결제 정보 입력
            </Typography>
            <Divider sx={{ my: 2 }} />

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <Typography variant="h6" gutterBottom>
                    결제 수단 선택
                  </Typography>
                  <RadioGroup
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    row
                  >
                    <FormControlLabel value="card" control={<Radio />} label="신용카드" />
                    <FormControlLabel value="bank" control={<Radio />} label="계좌이체" />
                    <FormControlLabel value="virtual" control={<Radio />} label="가상계좌" />
                  </RadioGroup>
                </FormControl>
              </Grid>

              {paymentMethod === 'card' && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="카드 번호"
                      value={cardInfo.number}
                      onChange={(e) => setCardInfo((prev) => ({ ...prev, number: e.target.value }))}
                      placeholder="1234-5678-9012-3456"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="유효기간"
                      value={cardInfo.expiry}
                      onChange={(e) => setCardInfo((prev) => ({ ...prev, expiry: e.target.value }))}
                      placeholder="MM/YY"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="CVV"
                      value={cardInfo.cvv}
                      onChange={(e) => setCardInfo((prev) => ({ ...prev, cvv: e.target.value }))}
                      type="password"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="카드 소유자명"
                      value={cardInfo.holderName}
                      onChange={(e) =>
                        setCardInfo((prev) => ({ ...prev, holderName: e.target.value }))
                      }
                    />
                  </Grid>
                </>
              )}

              {paymentMethod === 'bank' && (
                <Grid item xs={12}>
                  <Alert severity="info">
                    계좌이체를 선택하셨습니다. 결제 완료 버튼을 클릭하면 인터넷뱅킹 페이지로
                    이동합니다.
                  </Alert>
                </Grid>
              )}

              {paymentMethod === 'virtual' && (
                <Grid item xs={12}>
                  <Alert severity="info">
                    가상계좌를 선택하셨습니다. 결제 완료 후 계좌 정보가 발급됩니다.
                  </Alert>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}

      {activeStep === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              결제 요약 및 완료
            </Typography>
            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6">의뢰 정보</Typography>
              <Typography>제목: {requestData.title}</Typography>
              <Typography>설명: {requestData.description}</Typography>
              <Typography>금액: {requestData.budget?.toLocaleString() || '협의'}원</Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6">결제 정보</Typography>
              <Typography>
                결제 수단:{' '}
                {paymentMethod === 'card'
                  ? '신용카드'
                  : paymentMethod === 'bank'
                    ? '계좌이체'
                    : '가상계좌'}
              </Typography>
              {paymentMethod === 'card' && (
                <Typography>카드: ****-****-****-{cardInfo.number.slice(-4)}</Typography>
              )}
            </Box>

            <Alert severity="success" sx={{ mb: 3 }}>
              모든 정보가 확인되었습니다. 결제 완료 버튼을 클릭하면 의뢰가 확정됩니다.
            </Alert>
          </CardContent>
        </Card>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button disabled={activeStep === 0} onClick={handleBack}>
          이전
        </Button>
        <Button
          variant="contained"
          onClick={activeStep === steps.length - 1 ? doPayment : handleNext}
          disabled={loading}
        >
          {activeStep === steps.length - 1
            ? loading
              ? '결제 처리 중...'
              : '결제 완료 및 의뢰 확정'
            : '다음'}
        </Button>
      </Box>
    </Box>
  );
};

export default PaymentPage;
