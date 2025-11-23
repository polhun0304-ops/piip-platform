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
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Rating,
  Stack,
  LinearProgress,
  useTheme,
  IconButton,
  Divider,
  alpha,
} from '@mui/material';
import {
  Store,
  TrendingUp,
  AttachMoney,
  Assessment,
  LocationOn,
  CheckCircle,
  MoreVert,
  Download,
  BarChart,
} from '@mui/icons-material';

interface Branch {
  id: string;
  name: string;
  manager: string;
  location: string;
  licenseStatus: 'active' | 'expiring' | 'expired';
  rating: number;
  cases: number;
  revenue: number;
  renewalDate: string;
}

const FranchiseManagement: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  // 샘플 지점 데이터
  const branches: Branch[] = [
    {
      id: '1',
      name: '강남지점',
      manager: '김민수',
      location: '서울시 강남구',
      licenseStatus: 'active',
      rating: 4.8,
      cases: 156,
      revenue: 45000000,
      renewalDate: '2025-12-31',
    },
    {
      id: '2',
      name: '부산지점',
      manager: '박지연',
      location: '부산시 해운대구',
      licenseStatus: 'active',
      rating: 4.6,
      cases: 132,
      revenue: 38000000,
      renewalDate: '2025-08-15',
    },
    {
      id: '3',
      name: '대구지점',
      manager: '이준호',
      location: '대구시 중구',
      licenseStatus: 'expiring',
      rating: 4.5,
      cases: 98,
      revenue: 28000000,
      renewalDate: '2024-03-20',
    },
  ];

  // 통계 데이터
  const monthlyStats = [
    { month: '1월', revenue: 120, cases: 45 },
    { month: '2월', revenue: 135, cases: 52 },
    { month: '3월', revenue: 145, cases: 58 },
    { month: '4월', revenue: 160, cases: 62 },
    { month: '5월', revenue: 175, cases: 68 },
    { month: '6월', revenue: 190, cases: 75 },
  ];

  const revenueByRegion = [
    { name: '서울', value: 45 },
    { name: '부산', value: 25 },
    { name: '대구', value: 15 },
    { name: '기타', value: 15 },
  ];

  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.info.main,
    theme.palette.warning.main,
  ];

  const getLicenseStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'expiring':
        return 'warning';
      case 'expired':
        return 'error';
      default:
        return 'default';
    }
  };

  const getLicenseStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return '정상';
      case 'expiring':
        return '만료임박';
      case 'expired':
        return '만료됨';
      default:
        return '알 수 없음';
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              <Store sx={{ verticalAlign: 'middle', mr: 1, fontSize: 40 }} />
              프랜차이즈 관리 시스템
            </Typography>
            <Typography variant="body1" color="text.secondary">
              전국 지점의 성과, 인력, 정산을 통합 관리하세요
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" startIcon={<Download />}>
              정산내역 다운로드
            </Button>
            <Button variant="contained" startIcon={<Store />}>
              신규 지점 등록
            </Button>
          </Stack>
        </Stack>

        {/* Statistics Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 56, height: 56 }}>
                    <Store />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {branches.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      총 지점 수
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: theme.palette.secondary.main, width: 56, height: 56 }}>
                    <Assessment />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {branches.reduce((sum, b) => sum + b.cases, 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      진행 사건 수
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: theme.palette.success.main, width: 56, height: 56 }}>
                    <AttachMoney />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {(branches.reduce((sum, b) => sum + b.revenue, 0) / 100000000).toFixed(1)}억
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      총 매출
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: theme.palette.info.main, width: 56, height: 56 }}>
                    <TrendingUp />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {(branches.reduce((sum, b) => sum + b.rating, 0) / branches.length).toFixed(
                        1
                      )}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      평균 고객평점
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h6" fontWeight={700}>
                    <BarChart sx={{ verticalAlign: 'middle', mr: 1 }} />
                    월별 매출 및 사건 추이
                  </Typography>
                  <Chip label="최근 6개월" size="small" />
                </Stack>

                <Grid container spacing={2}>
                  {monthlyStats.map((stat, idx) => (
                    <Grid item xs={6} md={2} key={idx}>
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: alpha(theme.palette.primary.main, 0.08),
                          borderRadius: 1,
                          textAlign: 'center',
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          fontWeight={600}
                        >
                          {stat.month}
                        </Typography>
                        <Typography variant="h6" fontWeight={700} color="primary">
                          {stat.revenue}M
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight={500}>
                          {stat.cases}건
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={700} mb={3}>
                  <TrendingUp sx={{ verticalAlign: 'middle', mr: 1 }} />
                  지역별 매출 비중
                </Typography>

                <Stack spacing={2}>
                  {revenueByRegion.map((region, idx) => (
                    <Box key={idx}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={1}
                      >
                        <Typography variant="body2">{region.name}</Typography>
                        <Typography variant="body2" fontWeight={700}>
                          {region.value}%
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={region.value}
                        sx={{
                          height: 8,
                          borderRadius: 1,
                          bgcolor: theme.palette.grey[200],
                          '& .MuiLinearProgress-bar': {
                            bgcolor: COLORS[idx % COLORS.length],
                          },
                        }}
                      />
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
            <Tab label="지점 관리" />
            <Tab label="성과 분석" />
            <Tab label="정산/회계" />
          </Tabs>
        </Box>

        {/* Branch List Table */}
        {activeTab === 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={3}>
                지점 목록 ({branches.length})
              </Typography>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>지점명</TableCell>
                      <TableCell>담당자</TableCell>
                      <TableCell>위치</TableCell>
                      <TableCell>라이선스</TableCell>
                      <TableCell>평가점수</TableCell>
                      <TableCell align="right">사건 수</TableCell>
                      <TableCell align="right">매출</TableCell>
                      <TableCell>계약갱신일</TableCell>
                      <TableCell align="center">작업</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {branches.map((branch) => (
                      <TableRow key={branch.id} hover>
                        <TableCell>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                              {branch.name[0]}
                            </Avatar>
                            <Typography fontWeight={600}>{branch.name}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{branch.manager}</Typography>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <LocationOn fontSize="small" color="action" />
                            <Typography variant="body2">{branch.location}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getLicenseStatusLabel(branch.licenseStatus)}
                            size="small"
                            color={getLicenseStatusColor(branch.licenseStatus) as any}
                          />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <Rating value={branch.rating} precision={0.1} readOnly size="small" />
                            <Typography variant="body2" fontWeight={600}>
                              {branch.rating}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={600}>
                            {branch.cases}건
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={600}>
                            {(branch.revenue / 10000).toLocaleString()}만원
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{branch.renewalDate}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={0.5} justifyContent="center">
                            <Button size="small" variant="outlined">
                              상세
                            </Button>
                            <IconButton size="small">
                              <MoreVert />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}

        {/* Performance Analysis */}
        {activeTab === 1 && (
          <Grid container spacing={3}>
            {branches.map((branch) => (
              <Grid item xs={12} md={6} lg={4} key={branch.id}>
                <Card>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="start" mb={2}>
                      <Box>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                          {branch.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {branch.manager} 담당자
                        </Typography>
                      </Box>
                      <Chip
                        label={`${branch.rating}★`}
                        size="small"
                        color="primary"
                        sx={{ fontWeight: 700 }}
                      />
                    </Stack>

                    <Divider sx={{ my: 2 }} />

                    <Stack spacing={2}>
                      <Box>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          mb={1}
                        >
                          <Typography variant="body2" color="text.secondary">
                            사건 처리율
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {Math.round((branch.cases / 200) * 100)}%
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={(branch.cases / 200) * 100}
                          sx={{ height: 8, borderRadius: 1 }}
                        />
                      </Box>

                      <Box>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          mb={1}
                        >
                          <Typography variant="body2" color="text.secondary">
                            매출 목표
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {Math.round((branch.revenue / 50000000) * 100)}%
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={(branch.revenue / 50000000) * 100}
                          color="secondary"
                          sx={{ height: 8, borderRadius: 1 }}
                        />
                      </Box>

                      <Box>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          mb={1}
                        >
                          <Typography variant="body2" color="text.secondary">
                            고객 만족도
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {Math.round((branch.rating / 5) * 100)}%
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={(branch.rating / 5) * 100}
                          color="success"
                          sx={{ height: 8, borderRadius: 1 }}
                        />
                      </Box>
                    </Stack>

                    <Button variant="outlined" fullWidth sx={{ mt: 3 }}>
                      상세 리포트 보기
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Accounting */}
        {activeTab === 2 && (
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" fontWeight={700}>
                  정산 내역
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button variant="outlined" size="small">
                    엑셀 다운로드
                  </Button>
                  <Button variant="outlined" size="small">
                    세금계산서 발행
                  </Button>
                </Stack>
              </Stack>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>지점명</TableCell>
                      <TableCell align="right">총 매출</TableCell>
                      <TableCell align="right">수수료 (15%)</TableCell>
                      <TableCell align="right">정산금액</TableCell>
                      <TableCell>정산상태</TableCell>
                      <TableCell align="center">작업</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {branches.map((branch) => {
                      const fee = Math.round(branch.revenue * 0.15);
                      const settlement = branch.revenue - fee;
                      return (
                        <TableRow key={branch.id} hover>
                          <TableCell>
                            <Typography fontWeight={600}>{branch.name}</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography fontWeight={600}>
                              {branch.revenue.toLocaleString()}원
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography color="error">{fee.toLocaleString()}원</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography fontWeight={700} color="primary">
                              {settlement.toLocaleString()}원
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={<CheckCircle />}
                              label="정산완료"
                              size="small"
                              color="success"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Button size="small" variant="outlined">
                              계산서 발행
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}
      </Container>
    </Box>
  );
};

export default FranchiseManagement;
