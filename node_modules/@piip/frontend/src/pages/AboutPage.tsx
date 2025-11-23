import React from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  Divider,
  ListItemIcon,
  Stack,
  Chip,
  LinearProgress,
  Avatar,
} from '@mui/material';
import {
  ExpandMore as ExpandIcon,
  CheckCircle as CheckIcon,
  Timeline as TimelineIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Business as BusinessIcon,
  Api as ApiIcon,
  VerifiedUser as VerifiedUserIcon,
  SettingsEthernet as SettingsEthernetIcon,
  Store as StoreIcon,
  Assessment as AssessmentIcon,
  Bolt as BoltIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
// import { useNavigate } from 'react-router-dom';

const AboutPage: React.FC = () => {
  // const navigate = useNavigate();

  const faqs = [
    {
      question: '탐정 서비스는 합법인가요?',
      answer:
        '네, 한국에서는 2020년 탐정업법(공인탐정법) 제정 이후 합법적인 직업으로 인정받고 있습니다. PIIP 플랫폼에 등록된 모든 탐정은 법적 자격 요건을 충족하고 있으며, 정당한 권리 보호를 위한 합법적 조사만 수행합니다.',
    },
    {
      question: '탐정 의뢰는 어떻게 하나요?',
      answer:
        '의뢰 등록 버튼을 통해 사건 정보를 입력하시면 AI가 자동 분석하여 가장 적합한 전문 탐정을 배정합니다. 24시간 상담 가능하며, 보통 30분 이내에 첫 응답을 받으실 수 있습니다.',
    },
    {
      question: '행적 조사가 스토킹처벌법에 저촉되지 않나요?',
      answer:
        '정당한 사유(배우자 부정 확인, 자녀 안전 등)와 의뢰인의 법적 권리 보호 목적으로 진행되는 조사는 스토킹처벌법에 해당되지 않습니다. 공개된 장소에서 육안 관찰 및 합법적 증거 수집만 진행하며, 불법적인 미행·감시·도청은 일체 하지 않습니다.',
    },
    {
      question: '의뢰 비용은 얼마인가요?',
      answer:
        '사건 유형, 난이도, 기간에 따라 다릅니다. 기본 상담은 무료이며, AI 시스템이 자동으로 견적을 산출합니다. 평균적으로 행적 조사는 1일 30~50만원, 신원조사는 건당 50~100만원 수준입니다.',
    },
    {
      question: '조사는 얼마나 걸리나요?',
      answer:
        '사건의 복잡도에 따라 상이하지만 평균적으로 2~4주 소요됩니다. 긴급 사건은 우선 처리되며, 대시보드에서 실시간 진행 상황을 확인하실 수 있습니다.',
    },
    {
      question: '증거 자료는 법적 효력이 있나요?',
      answer:
        '네, PIIP 플랫폼은 블록체인 기반 증거 보관 시스템을 사용하여 수집 시점부터 무결성을 보장합니다. 모든 증거는 법원에서 인정받을 수 있는 형태로 수집·보관됩니다.',
    },
    {
      question: '조사 진행 상황을 확인할 수 있나요?',
      answer:
        '실시간으로 확인 가능합니다. 대시보드에서 현재 진행률, 수집된 증거, 담당 탐정의 중간 보고를 언제든지 열람할 수 있으며, 중요한 진행 사항은 알림으로 전달됩니다.',
    },
    {
      question: '비밀 유지가 보장되나요?',
      answer:
        '철저히 보장됩니다. 모든 데이터는 엔드투엔드 암호화되며, 탐정은 비밀유지 서약서에 서명합니다. 의뢰인 정보는 법적 요구가 있는 경우를 제외하고 절대 공개되지 않습니다.',
    },
    {
      question: '개인정보는 안전하게 보호되나요?',
      answer:
        '모든 자료는 256비트 암호화로 안전하게 관리되며, 블록체인으로 증거 무결성을 보장합니다. 또한 ISO 27001 등 보안 인증 기준을 준수합니다.',
    },
    {
      question: 'AI 분석은 어떻게 도움이 되나요?',
      answer:
        '얼굴 인식, 차량 번호판 추적, 행동 패턴 분석 등을 자동화하여 조사 시간을 크게 단축합니다. 수백 시간의 영상에서 핵심 순간만 추출하거나, 여러 출처의 정보를 연결하는 작업을 AI가 수행합니다.',
    },
  ];

  const caseStudies = [
    {
      title: '배우자 부정 조사',
      before: '의심만 있고 증거 없음',
      after: '법정 제출 가능한 영상·사진 20건 확보',
      duration: '7일',
      result: '이혼 소송에서 유리한 합의 도출',
      color: '#2563eb',
    },
    {
      title: '산업 스파이 적발',
      before: '내부 정보 유출 의심',
      after: '범인 특정 및 유출 경로 파악',
      duration: '14일',
      result: '형사 고발 및 손해배상 청구 성공',
      color: '#059669',
    },
    {
      title: '실종 가족 찾기',
      before: '3년간 연락 두절',
      after: '현재 거주지 및 근무처 파악',
      duration: '5일',
      result: '가족 재회 성사',
      color: '#7c3aed',
    },
  ];

  const platformFeatures = [
    '24시간 AI 챗봇 상담 가능',
    '30분 내 전문 탐정 배정',
    '실시간 조사 진행 상황 확인',
    '블록체인 증거 무결성 보장',
    '얼굴/차량 AI 자동 인식',
    '법정 효력 있는 보고서 자동 생성',
    '변호사 네트워크 연계',
    '투명한 가격 정책',
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 6 }}>
        {/* 헤더 */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
            PIIP 플랫폼 소개
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: '800px', mx: 'auto', fontSize: '1.125rem' }}
          >
            국내 최초 AI 기반 탐정 플랫폼으로, 조사 의뢰부터 증거 확보, 법적 대응까지 원스톱
            솔루션을 제공합니다.
          </Typography>
        </Box>

        {/* AI 기반 스마트 매칭 시스템 */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
            AI 기반 스마트 매칭 시스템
          </Typography>
          <Grid container spacing={3}>
            {[
              {
                title: '사건 이해 분석',
                desc: '사건 유형·위치·시간·위험도 등 메타데이터 자동 분석',
                icon: <BoltIcon color="primary" />,
              },
              {
                title: '전문가 풀 스코어링',
                desc: '경력·전문분야·평점·가용시간 기반 가중치 매칭',
                icon: <PeopleIcon color="secondary" />,
              },
              {
                title: '지리/시간 최적화',
                desc: '이동 동선과 장비 준비 시간을 고려한 배정',
                icon: <TimelineIcon color="warning" />,
              },
              {
                title: '실시간 보정',
                desc: '현장 상황 피드백으로 배정 및 전략을 실시간 보정',
                icon: <SpeedIcon color="success" />,
              },
            ].map((item, idx) => (
              <Grid item xs={12} md={6} key={idx}>
                <Paper sx={{ p: 3, display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <Box sx={{ mt: 0.5 }}>{item.icon}</Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.desc}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* 플랫폼 주요 기능 */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
            플랫폼 주요 기능
          </Typography>
          <Grid container spacing={2}>
            {platformFeatures.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper sx={{ p: 2, height: '100%', display: 'flex', alignItems: 'center' }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <CheckIcon color="primary" />
                  </ListItemIcon>
                  <Typography variant="body2">{feature}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ my: 6 }} />

        {/* 실시간 현황 */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
            실시간 현황
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  실시간 상담 대기
                </Typography>
                <Typography variant="h4" fontWeight={800} sx={{ my: 1 }}>
                  32명 상담 중
                </Typography>
                <LinearProgress variant="determinate" value={72} />
                <Typography variant="caption" color="text.secondary">
                  대기열 처리율 72%
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  AI 자동 분석
                </Typography>
                <Typography variant="h4" fontWeight={800} sx={{ my: 1 }}>
                  평균 3분 내 결과
                </Typography>
                <LinearProgress variant="determinate" value={87} color="secondary" />
                <Typography variant="caption" color="text.secondary">
                  분석 진행률 87%
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  전문가 매칭
                </Typography>
                <Typography variant="h4" fontWeight={800} sx={{ my: 1 }}>
                  평균 배정 30분
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  {[1, 2, 3].map((i) => (
                    <Avatar key={i} sx={{ width: 28, height: 28 }}>
                      ✓
                    </Avatar>
                  ))}
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  최근 24시간 98건 배정
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* 실제 사례 */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
            실제 사례
          </Typography>
          <Grid container spacing={3}>
            {caseStudies.map((study, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    borderTop: `4px solid ${study.color}`,
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight={600}>
                      {study.title}
                    </Typography>
                    <Box sx={{ my: 2 }}>
                      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <Typography variant="body2" color="error" fontWeight={600}>
                          Before:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {study.before}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Typography variant="body2" color="success.main" fontWeight={600}>
                          After:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {study.after}
                        </Typography>
                      </Box>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        조사 기간:
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {study.duration}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 2,
                        p: 1.5,
                        bgcolor: (theme) =>
                          theme.palette.mode === 'light' ? '#f0fdf4' : 'success.dark',
                        borderRadius: 1,
                        fontWeight: 600,
                      }}
                    >
                      ✓ {study.result}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* 3-Column Overview: 업무 흐름 / 핵심 가치 / Enterprise Solutions (원래 스타일, 모바일 최적화) */}
        <Box sx={{ mb: 6 }}>
          <Grid container spacing={3} alignItems="stretch">
            {/* Left: 업무 흐름 */}
            <Grid item xs={12} md={4}>
              <Paper
                role="region"
                aria-label="업무 흐름"
                elevation={1}
                sx={{
                  p: { xs: 2, md: 3 },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  업무 흐름
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  useFlexGap
                  sx={{
                    overflowX: { xs: 'auto', md: 'visible' },
                    flexWrap: { xs: 'nowrap', md: 'wrap' },
                    pb: 1,
                  }}
                >
                  {[
                    { step: '01', title: '사건 의뢰' },
                    { step: '02', title: '탐정 매칭' },
                    { step: '03', title: '계약 체결' },
                    { step: '04', title: '조사 진행' },
                    { step: '05', title: '증거 제출' },
                    { step: '06', title: '보고서 완료' },
                  ].map((s) => (
                    <Chip
                      key={s.step}
                      size="small"
                      label={`STEP ${s.step} · ${s.title}`}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  온라인 의뢰 → AI 매칭 → 전자계약/에스크로 → 실시간 진행 → 증거 보관 → 최종 보고서
                </Typography>
              </Paper>
            </Grid>

            {/* Middle: 핵심 가치 */}
            <Grid item xs={12} md={4}>
              <Paper
                role="region"
                aria-label="핵심 가치"
                elevation={1}
                sx={{
                  p: { xs: 2, md: 3 },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  핵심 가치
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ textAlign: 'center' }}>
                    <SpeedIcon
                      sx={{ fontSize: { xs: 40, md: 56 }, color: 'primary.main', mb: 1 }}
                    />
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      빠른 대응
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      AI 자동 배정으로 30분 내 전문가 연결, 긴급 사건 즉시 출동
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <SecurityIcon
                      sx={{ fontSize: { xs: 40, md: 56 }, color: 'success.main', mb: 1 }}
                    />
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      철저한 보안
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      블록체인 보관·E2E 암호화로 의뢰인 정보 및 증거 완벽 보호
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <TimelineIcon
                      sx={{ fontSize: { xs: 40, md: 56 }, color: 'warning.main', mb: 1 }}
                    />
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      투명한 프로세스
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      실시간 진행 현황, 명확한 견적, 단계별 보고로 신뢰 구축
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>

            {/* Right: Enterprise Solutions */}
            <Grid item xs={12} md={4}>
              <Paper
                role="region"
                aria-label="Enterprise Solutions"
                elevation={1}
                sx={{
                  p: { xs: 2, md: 3 },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  Enterprise Solutions
                </Typography>
                <Stack spacing={1.25}>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <BusinessIcon color="primary" />
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>
                        기업 계정/권한 관리
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        역할 기반 접근제어, 다중 조직/지점 관리
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <ApiIcon color="secondary" />
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>
                        API / Webhook
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        사내 시스템 연동, 자동화 파이프라인
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <VerifiedUserIcon color="success" />
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>
                        보안/컴플라이언스
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        SAML/SSO, 감사로그, 데이터 주권
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <SettingsEthernetIcon color="warning" />
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>
                        통합 연계
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        CRM/ERP, 결제/정산, 메신저/알림 연계
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <StoreIcon color="info" />
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>
                        지점 운영
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        프랜차이즈 지점 성과/정산/품질 관리
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <AssessmentIcon color="error" />
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>
                        커스텀 리포트
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        경영/법무용 리포트 및 BI 대시보드
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 6 }} />

        {/* 핵심가치 별도 섹션은 3열 레이아웃에 통합되어 제거되었습니다. */}

        {/* 서비스 안내 */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
            서비스 안내
          </Typography>
          <Grid container spacing={2}>
            {[
              '행적 조사',
              '신원 조사',
              '국제 의뢰',
              '법률 자문',
              'AI 증거 분석',
              '프랜차이즈/기업 서비스',
            ].map((s, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CheckIcon color="primary" />
                  <Typography variant="body2">{s}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* 활동 현장 */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
            활동 현장
          </Typography>
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <Grid item xs={12} sm={6} md={4} key={n}>
                <Paper sx={{ p: 0, overflow: 'hidden', borderRadius: 2 }}>
                  <Box
                    sx={{
                      height: 160,
                      bgcolor: (theme) => theme.palette.grey[900],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      opacity: 0.7,
                    }}
                  >
                    현장 스냅샷 {n}
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* 파트너십 */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
            파트너십
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {[
              '85개국 글로벌 파트너',
              '로펌 네트워크',
              '보안 감사 기관',
              '클라우드 파트너',
              '결제 파트너',
            ].map((p) => (
              <Chip key={p} label={p} variant="outlined" />
            ))}
          </Stack>
        </Box>

        {/* 요금 안내 */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
            요금 안내
          </Typography>
          <Grid container spacing={3}>
            {[
              {
                name: 'Basic',
                price: '월 9만원',
                features: ['상담/의뢰', '기본 리포트', '증거 보관(10GB)'],
              },
              {
                name: 'Pro',
                price: '월 29만원',
                features: ['AI 분석', '실시간 현황', '증거 보관(1TB)'],
              },
              {
                name: 'Enterprise',
                price: '견적 문의',
                features: ['SSO/SLA', 'API 연동', '전담 지원'],
              },
            ].map((t) => (
              <Grid item xs={12} md={4} key={t.name}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight={700}>
                      {t.name}
                    </Typography>
                    <Typography variant="h4" fontWeight={800} sx={{ my: 1 }}>
                      {t.price}
                    </Typography>
                    <Stack spacing={1}>
                      {t.features.map((f) => (
                        <Stack key={f} direction="row" spacing={1} alignItems="center">
                          <CheckIcon color="success" fontSize="small" />
                          <Typography variant="body2">{f}</Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ my: 6 }} />

        {/* FAQ */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
            자주 묻는 질문 (FAQ)
          </Typography>
          {faqs.map((faq, index) => (
            <Accordion key={index} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandIcon />}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        {/* 상담신청/모니터링/검색 섹션은 의도적으로 제외 (다른 위치로 이동 예정) */}
      </Box>
    </Container>
  );
};

export default AboutPage;
