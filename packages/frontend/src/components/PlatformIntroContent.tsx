import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Divider,
  Stack,
  Chip,
  ListItemIcon,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Timeline as TimelineIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';

export interface PlatformIntroContentProps {
  variant?: 'home' | 'about';
}

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

export const PlatformIntroContent: React.FC<PlatformIntroContentProps> = ({ variant = 'home' }) => {
  const wrap = (children: React.ReactNode) =>
    variant === 'home' ? (
      <Box sx={{ py: 6, bgcolor: '#fff' }}>
        <Container maxWidth="lg">{children}</Container>
      </Box>
    ) : (
      <Box sx={{ py: 6 }}>
        <Container maxWidth="lg">{children}</Container>
      </Box>
    );

  return (
    <Box>
      {/* 헤더 (Home에서는 보조 제목) */}
      {wrap(
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" component="h2" fontWeight={800} gutterBottom>
            PIIP 플랫폼 소개
          </Typography>
          <Typography variant="body1" color="text.secondary">
            조사 의뢰부터 증거 확보, 법적 대응까지 원스톱으로 연결합니다.
          </Typography>
        </Box>
      )}

      {/* 업무처리 흐름 */}
      {wrap(
        <Box>
          <Typography variant="h4" component="h3" fontWeight={700} gutterBottom>
            업무처리 흐름
          </Typography>
          <Paper sx={{ p: { xs: 2, md: 3 } }}>
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
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
        </Box>
      )}

      {/* PIIP 플랫폼만의 특장점 */}
      {wrap(
        <Box>
          <Typography variant="h4" component="h3" fontWeight={700} gutterBottom>
            PIIP 플랫폼만의 특장점
          </Typography>
          <Grid container spacing={3}>
            {[
              {
                icon: <SpeedIcon sx={{ fontSize: { xs: 40, md: 56 }, color: 'primary.main' }} />,
                title: '빠른 대응',
                desc: 'AI 자동 배정으로 30분 내 전문가 연결, 긴급 사건즉시 출동',
              },
              {
                icon: <SecurityIcon sx={{ fontSize: { xs: 40, md: 56 }, color: 'success.main' }} />,
                title: '철저한 보안',
                desc: '블록체인 보관·E2E 암호화로 의뢰인 정보 및 증거 완벽 보호',
              },
              {
                icon: <TimelineIcon sx={{ fontSize: { xs: 40, md: 56 }, color: 'warning.main' }} />,
                title: '투명한 프로세스',
                desc: '실시간 진행 현황, 명확한 견적, 단계별 보고로 신뢰 구축',
              },
            ].map((item, idx) => (
              <Grid item xs={12} md={4} key={idx}>
                <Paper sx={{ p: { xs: 2, md: 3 }, textAlign: 'center', height: '100%' }}>
                  <Box sx={{ mb: 1 }}>{item.icon}</Box>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.desc}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* 주요 기능 */}
      {wrap(
        <Box>
          <Typography variant="h4" component="h3" fontWeight={700} gutterBottom>
            주요 기능
          </Typography>
          <Grid container spacing={2}>
            {platformFeatures.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <CheckIcon color="primary" />
                  </ListItemIcon>
                  <Typography variant="body2">{feature}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* 실제 사례 */}
      {wrap(
        <Box>
          <Typography variant="h4" component="h3" fontWeight={700} gutterBottom>
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
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
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
                      sx={{ mt: 2, p: 1.5, bgcolor: '#f0fdf4', borderRadius: 1, fontWeight: 600 }}
                    >
                      ✓ {study.result}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default PlatformIntroContent;
