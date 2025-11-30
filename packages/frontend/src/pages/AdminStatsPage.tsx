import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Avatar,
  LinearProgress,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Bar, Line, Doughnut, Pie, Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import {
  Assessment,
  TrendingUp,
  People,
  Business,
  Schedule,
  Star,
  Download,
  Print,
  Share,
} from '@mui/icons-material';
import api from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend
);

interface StatisticsData {
  overview: {
    totalCases: number;
    totalClients: number;
    totalDetectives: number;
    totalRevenue: number;
    averageResolutionTime: number;
    overallSatisfaction: number;
  };
  caseStatistics: {
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    monthlyTrends: Array<{
      month: string;
      new: number;
      completed: number;
      satisfaction: number;
    }>;
  };
  detectiveStatistics: {
    performance: Array<{
      id: string;
      name: string;
      completedCases: number;
      averageRating: number;
      satisfactionRate: number;
      specialties: string[];
    }>;
    workload: Array<{
      name: string;
      activeCases: number;
      completedThisMonth: number;
    }>;
  };
  clientStatistics: {
    satisfaction: Array<{
      rating: number;
      count: number;
    }>;
    demographics: {
      byRegion: Record<string, number>;
      byIndustry: Record<string, number>;
    };
  };
  financialStatistics: {
    monthlyRevenue: Array<{
      month: string;
      revenue: number;
      expenses: number;
    }>;
    paymentMethods: Record<string, number>;
  };
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const AdminStatsPage: React.FC = () => {
  const [data, setData] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [timeRange, setTimeRange] = useState('6months');

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/statistics', {
        params: { timeRange },
      });
      setData(res.data);
    } catch (err: any) {
      setError(err?.message || '통계 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, [timeRange]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  const formatTime = (hours: number) => {
    if (hours < 24) return `${Math.round(hours)}시간`;
    const days = Math.floor(hours / 24);
    return `${days}일`;
  };

  if (loading) {
    return (
      <Box textAlign="center" mt={4}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>통계 데이터를 불러오는 중...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" mt={4}>
        <Typography color="error">{error}</Typography>
        <Button onClick={fetchStatistics} sx={{ mt: 2 }}>
          다시 시도
        </Button>
      </Box>
    );
  }

  if (!data) return null;

  const renderOverviewTab = () => {
    const overviewCards = [
      {
        title: '총 사건 수',
        value: data.overview.totalCases,
        icon: <Assessment color="primary" sx={{ fontSize: 40 }} />,
        color: 'primary',
      },
      {
        title: '총 고객 수',
        value: data.overview.totalClients,
        icon: <People color="secondary" sx={{ fontSize: 40 }} />,
        color: 'secondary',
      },
      {
        title: '활동 탐정 수',
        value: data.overview.totalDetectives,
        icon: <Business color="info" sx={{ fontSize: 40 }} />,
        color: 'info',
      },
      {
        title: '총 매출',
        value: formatCurrency(data.overview.totalRevenue),
        icon: <TrendingUp color="success" sx={{ fontSize: 40 }} />,
        color: 'success',
      },
      {
        title: '평균 해결 시간',
        value: formatTime(data.overview.averageResolutionTime),
        icon: <Schedule color="warning" sx={{ fontSize: 40 }} />,
        color: 'warning',
      },
      {
        title: '전체 만족도',
        value: `${Math.round(data.overview.overallSatisfaction)}%`,
        icon: <Star color="error" sx={{ fontSize: 40 }} />,
        color: 'error',
      },
    ];

    const caseTypeData = {
      labels: Object.keys(data.caseStatistics.byType),
      datasets: [
        {
          data: Object.values(data.caseStatistics.byType),
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
        },
      ],
    };

    const monthlyTrendData = {
      labels: data.caseStatistics.monthlyTrends.map((m) => m.month),
      datasets: [
        {
          label: '신규 사건',
          data: data.caseStatistics.monthlyTrends.map((m) => m.new),
          borderColor: '#1976d2',
          backgroundColor: 'rgba(25, 118, 210, 0.1)',
        },
        {
          label: '완료 사건',
          data: data.caseStatistics.monthlyTrends.map((m) => m.completed),
          borderColor: '#4caf50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
        },
      ],
    };

    return (
      <Box>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {overviewCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        {card.title}
                      </Typography>
                      <Typography variant="h4" color={`${card.color}.main`}>
                        {card.value}
                      </Typography>
                    </Box>
                    {card.icon}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                사건 유형 분포
              </Typography>
              <Box sx={{ height: 300 }}>
                <Doughnut
                  data={caseTypeData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'bottom' as const,
                      },
                    },
                  }}
                />
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                월별 추이
              </Typography>
              <Box sx={{ height: 300 }}>
                <Line
                  data={monthlyTrendData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                    },
                  }}
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderCaseAnalysisTab = () => {
    const statusData = {
      labels: Object.keys(data.caseStatistics.byStatus),
      datasets: [
        {
          label: '건수',
          data: Object.values(data.caseStatistics.byStatus),
          backgroundColor: ['#2196f3', '#ff9800', '#4caf50', '#f44336'],
        },
      ],
    };

    const priorityData = {
      labels: Object.keys(data.caseStatistics.byPriority),
      datasets: [
        {
          label: '건수',
          data: Object.values(data.caseStatistics.byPriority),
          backgroundColor: ['#f44336', '#ff9800', '#2196f3', '#4caf50'],
        },
      ],
    };

    return (
      <Box>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                사건 상태 분포
              </Typography>
              <Box sx={{ height: 300 }}>
                <Bar
                  data={statusData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { display: false },
                    },
                  }}
                />
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                우선순위 분포
              </Typography>
              <Box sx={{ height: 300 }}>
                <Pie
                  data={priorityData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'bottom' as const,
                      },
                    },
                  }}
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            월별 만족도 추이
          </Typography>
          <Box sx={{ height: 300 }}>
            <Line
              data={{
                labels: data.caseStatistics.monthlyTrends.map((m) => m.month),
                datasets: [
                  {
                    label: '만족도 (%)',
                    data: data.caseStatistics.monthlyTrends.map((m) => m.satisfaction),
                    borderColor: '#ff9800',
                    backgroundColor: 'rgba(255, 152, 0, 0.1)',
                    tension: 0.4,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                  },
                },
              }}
            />
          </Box>
        </Paper>
      </Box>
    );
  };

  const renderDetectiveAnalysisTab = () => {
    const performanceData = {
      datasets: [
        {
          label: '성능 분포',
          data: data.detectiveStatistics.performance.map((d) => ({
            x: d.completedCases,
            y: d.averageRating,
            name: d.name,
          })),
          backgroundColor: 'rgba(25, 118, 210, 0.6)',
        },
      ],
    };

    return (
      <Box>
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            탐정 성능 분포 (완료 건수 vs 평균 평점)
          </Typography>
          <Box sx={{ height: 400 }}>
            <Scatter
              data={performanceData}
              options={{
                responsive: true,
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        const point = context.raw as any;
                        return `${point.name}: ${point.x}건, 평점 ${point.y}`;
                      },
                    },
                  },
                },
                scales: {
                  x: {
                    title: {
                      display: true,
                      text: '완료 건수',
                    },
                  },
                  y: {
                    title: {
                      display: true,
                      text: '평균 평점',
                    },
                    min: 0,
                    max: 5,
                  },
                },
              }}
            />
          </Box>
        </Paper>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                탐정 워크로드
              </Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>탐정</TableCell>
                    <TableCell align="center">진행중</TableCell>
                    <TableCell align="center">이번달 완료</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.detectiveStatistics.workload.map((detective, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ width: 32, height: 32 }}>{detective.name.charAt(0)}</Avatar>
                          <Typography variant="body2">{detective.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={detective.activeCases}
                          color={detective.activeCases > 5 ? 'warning' : 'success'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">{detective.completedThisMonth}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                전문 분야 분포
              </Typography>
              <Box>
                {data.detectiveStatistics.performance.map((detective) => (
                  <Box key={detective.id} sx={{ mb: 2 }}>
                    <Typography variant="body2" fontWeight="bold">
                      {detective.name}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      {detective.specialties.map((specialty, index) => (
                        <Chip
                          key={index}
                          label={specialty}
                          size="small"
                          variant="outlined"
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderFinancialAnalysisTab = () => {
    const revenueData = {
      labels: data.financialStatistics.monthlyRevenue.map((m) => m.month),
      datasets: [
        {
          label: '매출',
          data: data.financialStatistics.monthlyRevenue.map((m) => m.revenue),
          backgroundColor: 'rgba(76, 175, 80, 0.6)',
        },
        {
          label: '비용',
          data: data.financialStatistics.monthlyRevenue.map((m) => m.expenses),
          backgroundColor: 'rgba(244, 67, 54, 0.6)',
        },
      ],
    };

    const paymentMethodData = {
      labels: Object.keys(data.financialStatistics.paymentMethods),
      datasets: [
        {
          data: Object.values(data.financialStatistics.paymentMethods),
          backgroundColor: ['#2196f3', '#4caf50', '#ff9800', '#9c27b0'],
        },
      ],
    };

    return (
      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                월별 재무 현황
              </Typography>
              <Box sx={{ height: 300 }}>
                <Bar
                  data={revenueData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                    },
                  }}
                />
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                결제 방법 분포
              </Typography>
              <Box sx={{ height: 300 }}>
                <Doughnut
                  data={paymentMethodData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'bottom' as const,
                      },
                    },
                  }}
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">통계분석 리포트</Typography>
        <Box display="flex" gap={2}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>기간</InputLabel>
            <Select value={timeRange} label="기간" onChange={(e) => setTimeRange(e.target.value)}>
              <MenuItem value="1month">1개월</MenuItem>
              <MenuItem value="3months">3개월</MenuItem>
              <MenuItem value="6months">6개월</MenuItem>
              <MenuItem value="1year">1년</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" startIcon={<Download />}>
            내보내기
          </Button>
          <Button variant="outlined" startIcon={<Print />}>
            인쇄
          </Button>
          <Button variant="outlined" startIcon={<Share />}>
            공유
          </Button>
        </Box>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="개요" />
          <Tab label="사건 분석" />
          <Tab label="탐정 분석" />
          <Tab label="재무 분석" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {renderOverviewTab()}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {renderCaseAnalysisTab()}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {renderDetectiveAnalysisTab()}
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          {renderFinancialAnalysisTab()}
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default AdminStatsPage;
