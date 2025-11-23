import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Avatar,
  Rating,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Stack,
  alpha,
  useTheme,
  Paper,
  Divider,
} from '@mui/material';
import {
  Public,
  Translate,
  Business,
  AttachFile,
  CheckCircle,
  Chat,
  LocationOn,
  VerifiedUser,
  Language,
  Send,
} from '@mui/icons-material';

interface Partner {
  id: string;
  name: string;
  country: string;
  region: string;
  rating: number;
  cases: number;
  languages: string[];
  specialties: string[];
  avgCost: string;
  avgDuration: string;
  verified: boolean;
}

const InternationalRequest: React.FC = () => {
  const theme = useTheme();
  const [selectedCountry, setSelectedCountry] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [activeTab, setActiveTab] = useState(0);

  // 샘플 파트너 데이터
  const partners: Partner[] = [
    {
      id: '1',
      name: 'Tokyo Investigation Bureau',
      country: '일본',
      region: '도쿄',
      rating: 4.9,
      cases: 342,
      languages: ['일본어', '영어', '한국어'],
      specialties: ['기업조사', '지식재산', '신용조사'],
      avgCost: '¥500,000 - ¥1,500,000',
      avgDuration: '2-4주',
      verified: true,
    },
    {
      id: '2',
      name: 'New York Private Investigators',
      country: '미국',
      region: '뉴욕',
      rating: 4.8,
      cases: 567,
      languages: ['영어', '스페인어'],
      specialties: ['실종자 추적', '배경조사', '기업감사'],
      avgCost: '$5,000 - $15,000',
      avgDuration: '3-6주',
      verified: true,
    },
    {
      id: '3',
      name: 'London Security & Investigation',
      country: '영국',
      region: '런던',
      rating: 4.7,
      cases: 289,
      languages: ['영어', '프랑스어'],
      specialties: ['금융범죄', '사기조사', '자산추적'],
      avgCost: '£3,000 - £10,000',
      avgDuration: '2-5주',
      verified: true,
    },
  ];

  const countries = [
    { code: 'JP', name: '일본', partners: 12, flag: '🇯🇵' },
    { code: 'US', name: '미국', partners: 23, flag: '🇺🇸' },
    { code: 'GB', name: '영국', partners: 8, flag: '🇬🇧' },
    { code: 'CN', name: '중국', partners: 15, flag: '🇨🇳' },
    { code: 'DE', name: '독일', partners: 6, flag: '🇩🇪' },
    { code: 'FR', name: '프랑스', partners: 7, flag: '🇫🇷' },
    { code: 'AU', name: '호주', partners: 5, flag: '🇦🇺' },
    { code: 'SG', name: '싱가포르', partners: 9, flag: '🇸🇬' },
  ];

  const caseTypes = [
    '기업 신용조사',
    '실종자 추적',
    '지식재산 침해',
    '자산 추적',
    '배경 조사',
    '사기 조사',
    '기업 감사',
  ];

  const steps = ['의뢰 정보 입력', '파트너 선택', '계약 및 결제'];

  const handleRequestSubmit = () => {
    setDialogOpen(true);
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              <Public sx={{ verticalAlign: 'middle', mr: 1, fontSize: 40 }} />
              국제 의뢰 시스템
            </Typography>
            <Typography variant="body1" color="text.secondary">
              전 세계 검증된 파트너 네트워크를 통한 글로벌 조사 서비스
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Chip
              icon={<Translate />}
              label="AI 자동 번역 지원"
              color="primary"
              variant="outlined"
            />
            <Button variant="contained" size="large" onClick={handleRequestSubmit}>
              국제 의뢰 신청
            </Button>
          </Stack>
        </Stack>

        {/* Statistics */}
        <Grid container spacing={2} mb={4}>
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Public color="primary" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h5" fontWeight={700}>
                      85
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      협력 국가
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Business color="secondary" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h5" fontWeight={700}>
                      342
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      파트너 기관
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <CheckCircle color="success" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h5" fontWeight={700}>
                      4,523
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      완료 사건
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Language color="info" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h5" fontWeight={700}>
                      42
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      지원 언어
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Country Selection */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              국가별 파트너 네트워크
            </Typography>
            <Grid container spacing={2} mt={1}>
              {countries.map((country) => (
                <Grid item xs={6} sm={4} md={3} key={country.code}>
                  <Paper
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      border: `2px solid ${
                        selectedCountry === country.code
                          ? theme.palette.primary.main
                          : 'transparent'
                      }`,
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: theme.shadows[4],
                      },
                    }}
                    onClick={() => setSelectedCountry(country.code)}
                  >
                    <Typography variant="h2" mb={1}>
                      {country.flag}
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {country.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      파트너 {country.partners}개
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* Partner List */}
        <Box sx={{ mb: 3 }}>
          <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
            <Tab label="전체 파트너" />
            <Tab label="추천 파트너" />
            <Tab label="최근 협력" />
          </Tabs>
        </Box>

        <Grid container spacing={3}>
          {partners.map((partner) => (
            <Grid item xs={12} md={6} lg={4} key={partner.id}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <CardContent>
                  <Stack direction="row" spacing={2} mb={2}>
                    <Avatar
                      sx={{
                        width: 60,
                        height: 60,
                        bgcolor: theme.palette.primary.main,
                      }}
                    >
                      {partner.name[0]}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Stack direction="row" spacing={0.5} alignItems="center" mb={0.5}>
                        <Typography variant="h6" fontWeight={700}>
                          {partner.name}
                        </Typography>
                        {partner.verified && <VerifiedUser color="primary" fontSize="small" />}
                      </Stack>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <LocationOn fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {partner.country}, {partner.region}
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={1} mb={2}>
                    <Rating value={partner.rating} precision={0.1} readOnly size="small" />
                    <Typography variant="body2" fontWeight={600}>
                      {partner.rating}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ({partner.cases}건)
                    </Typography>
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  <Box mb={2}>
                    <Typography variant="caption" fontWeight={600} color="text.secondary">
                      지원 언어:
                    </Typography>
                    <Stack direction="row" spacing={0.5} mt={0.5} flexWrap="wrap">
                      {partner.languages.map((lang, idx) => (
                        <Chip key={idx} label={lang} size="small" variant="outlined" />
                      ))}
                    </Stack>
                  </Box>

                  <Box mb={2}>
                    <Typography variant="caption" fontWeight={600} color="text.secondary">
                      전문분야:
                    </Typography>
                    <Stack direction="row" spacing={0.5} mt={0.5} flexWrap="wrap">
                      {partner.specialties.map((spec, idx) => (
                        <Chip
                          key={idx}
                          label={spec}
                          size="small"
                          sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>

                  <Grid container spacing={2} mb={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        평균 비용
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {partner.avgCost}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        평균 기간
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {partner.avgDuration}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Stack direction="row" spacing={1}>
                    <Button variant="contained" fullWidth startIcon={<Chat />}>
                      상담하기
                    </Button>
                    <Button variant="outlined" fullWidth>
                      상세보기
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Request Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            국제 의뢰 신청
            <Typography variant="body2" color="text.secondary">
              AI 자동 번역으로 현지 언어 지원
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Stepper activeStep={activeStep} sx={{ my: 3 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {activeStep === 0 && (
              <Stack spacing={3} mt={2}>
                <TextField
                  fullWidth
                  select
                  label="사건 유형"
                  defaultValue=""
                  helperText="의뢰하실 조사 유형을 선택하세요"
                >
                  {caseTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  fullWidth
                  select
                  label="대상 국가"
                  defaultValue=""
                  helperText="조사가 필요한 국가를 선택하세요"
                >
                  {countries.map((country) => (
                    <MenuItem key={country.code} value={country.code}>
                      {country.flag} {country.name}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField fullWidth label="상세 내용" multiline rows={4} />

                <TextField fullWidth label="예산 범위" placeholder="예: 500만원 - 1000만원" />

                <TextField
                  fullWidth
                  label="희망 완료 기한"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                />

                <Button variant="outlined" startIcon={<AttachFile />} fullWidth>
                  관련 자료 첨부
                </Button>
              </Stack>
            )}

            {activeStep === 1 && (
              <Box mt={2}>
                <Typography variant="subtitle1" fontWeight={600} mb={2}>
                  추천 파트너 (3)
                </Typography>
                <List>
                  {partners.slice(0, 3).map((partner) => (
                    <ListItem
                      key={partner.id}
                      sx={{
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 1,
                        mb: 1,
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.05),
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar>{partner.name[0]}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={partner.name}
                        secondary={`${partner.country} · 평점 ${partner.rating} · ${partner.cases}건 완료`}
                      />
                      <Button variant="outlined" size="small">
                        선택
                      </Button>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {activeStep === 2 && (
              <Box mt={2} textAlign="center">
                <CheckCircle color="success" sx={{ fontSize: 80, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  의뢰 준비 완료
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  계약서를 검토하고 전자서명 후 결제를 진행하세요
                </Typography>
                <Button variant="contained" size="large" startIcon={<Send />}>
                  계약 및 결제 진행
                </Button>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>취소</Button>
            {activeStep > 0 && <Button onClick={handleBack}>이전</Button>}
            {activeStep < 2 && (
              <Button variant="contained" onClick={handleNext}>
                다음
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default InternationalRequest;
