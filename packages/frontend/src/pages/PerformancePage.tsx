import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Avatar,
  Divider,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  TrendingUp,
  TrendingDown,
  Star,
  Timer,
  CheckCircle,
  Warning as AlertCircle,
} from '@mui/icons-material';
import api from '../services/api';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface DetectiveStats {
  id: string;
  name: string;
  affiliation: string;
  totalCases: number;
  completedCases: number;
  activeCases: number;
  averageResolutionTime: number;
  satisfactionRate: number;
  specialties: string[];
  monthlyPerformance: Array<{
    month: string;
    completed: number;
    satisfaction: number;
  }>;
}

interface PerformanceMetrics {
  totalCases: number;
  completedCases: number;
  averageResolutionTime: number;
  overallSatisfaction: number;
  monthlyTrends: Array<{
    month: string;
    cases: number;
    satisfaction: number;
  }>;
}

const PerformancePage: React.FC = () => {
  const [detectives, setDetectives] = useState<DetectiveStats[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('3months');
  const user = useSelector((state: RootState) => state.auth.user);

  const fetchPerformanceData = async () => {
    setLoading(true);
    try {
      // 관리자용 전체 성능 데이터
      if (user?.role === 'admin') {
        const [detectivesRes, metricsRes] = await Promise.all([
          api.get('/detectives'),
          api.get('/admin/dashboard'),
        ]);

        // 각 탐정의 상세 통계 가져오기
        const detectiveStats = await Promise.all(
          detectivesRes.data.map(async (detective: any) => {
            try {
              const statsRes = await api.get(`/detectives/${detective.id}/stats`);
              return {
                id: detective.id,
                name: detective.name,
                affiliation: detective.affiliation,
                totalCases: statsRes.data.totalCases || 0,
                completedCases: statsRes.data.completedCases || 0,
                activeCases: statsRes.data.activeCases || 0,
                averageResolutionTime: statsRes.data.averageResolutionTime || 0,
                satisfactionRate: statsRes.data.satisfactionRate || 0,
                specialties: statsRes.data.specialties || [],
                monthlyPerformance: statsRes.data.monthlyPerformance || [],
              };
            } catch (err) {
              return {
                id: detective.id,
                name: detective.name,
                affiliation: detective.affiliation,
                totalCases: 0,
                completedCases: 0,
                activeCases: 0,
                averageResolutionTime: 0,
                satisfactionRate: 0,
                specialties: [],
                monthlyPerformance: [],
              };
            }
          })
        );

        setDetectives(detectiveStats);
        setMetrics(metricsRes.data);
      } else if (user?.role === 'detective') {
        // 탐정용 개인 성능 데이터
        const statsRes = await api.get(`/detectives/${user.id}/stats`);
        const detectiveStats: DetectiveStats = {
          id: user.id,
          name: user.name || '이름 없음',
          affiliation: user.affiliation || '',
          totalCases: statsRes.data.totalCases || 0,
          completedCases: statsRes.data.completedCases || 0,
          activeCases: statsRes.data.activeCases || 0,
          averageResolutionTime: statsRes.data.averageResolutionTime || 0,
          satisfactionRate: statsRes.data.satisfactionRate || 0,
          specialties: statsRes.data.specialties || [],
          monthlyPerformance: statsRes.data.monthlyPerformance || [],
        };
        setDetectives([detectiveStats]);
      }
    } catch (err: any) {
      setError(err?.message || '성능 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceData();
  }, [user]);

  if (loading) {
    return (
      <Box textAlign="center" mt={4}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>성능 데이터를 불러오는 중...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" mt={4}>
        <Typography color="error">{error}</Typography>
        <Button onClick={fetchPerformanceData} sx={{ mt: 2 }}>
          다시 시도
        </Button>
      </Box>
    );
  }

  const getPerformanceColor = (rate: number) => {
    if (rate >= 90) return 'success';
    if (rate >= 70) return 'warning';
    return 'error';
  };

  const getPerformanceIcon = (rate: number) => {
    if (rate >= 90) return <TrendingUp color="success" />;
    if (rate >= 70) return <Star color="warning" />;
    return <TrendingDown color="error" />;
  };

  const formatTime = (hours: number) => {
    if (hours < 24) return `${Math.round(hours)}시간`;
    const days = Math.floor(hours / 24);
    return `${days}일`;
  };

  const renderKPICards = () => {
    if (!metrics) return null;

    return (
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    총 사건 수
                  </Typography>
                  <Typography variant="h4">{metrics.totalCases}</Typography>
                </Box>
                <CheckCircle color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    완료율
                  </Typography>
                  <Typography variant="h4">
                    {Math.round((metrics.completedCases / metrics.totalCases) * 100)}%
                  </Typography>
                </Box>
                <AlertCircle color="secondary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    평균 해결 시간
                  </Typography>
                  <Typography variant="h4">{formatTime(metrics.averageResolutionTime)}</Typography>
                </Box>
                <Timer color="info" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    고객 만족도
                  </Typography>
                  <Typography variant="h4">{Math.round(metrics.overallSatisfaction)}%</Typography>
                </Box>
                <Star color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderMonthlyTrends = () => {
    if (!metrics?.monthlyTrends?.length) return null;

    const chartData = {
      labels: metrics.monthlyTrends.map((m) => m.month),
      datasets: [
        {
          label: '완료 사건 수',
          data: metrics.monthlyTrends.map((m) => m.cases),
          borderColor: '#1976d2',
          backgroundColor: 'rgba(25, 118, 210, 0.1)',
          tension: 0.4,
        },
        {
          label: '만족도 (%)',
          data: metrics.monthlyTrends.map((m) => m.satisfaction),
          borderColor: '#ff9800',
          backgroundColor: 'rgba(255, 152, 0, 0.1)',
          yAxisID: 'y1',
          tension: 0.4,
        },
      ],
    };

    const options = {
      responsive: true,
      interaction: {
        mode: 'index' as const,
        intersect: false,
      },
      scales: {
        y: {
          type: 'linear' as const,
          display: true,
          position: 'left' as const,
          title: {
            display: true,
            text: '완료 사건 수',
          },
        },
        y1: {
          type: 'linear' as const,
          display: true,
          position: 'right' as const,
          title: {
            display: true,
            text: '만족도 (%)',
          },
          grid: {
            drawOnChartArea: false,
          },
        },
      },
    };

    return (
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          월별 추이 분석
        </Typography>
        <Box sx={{ height: 300 }}>
          <Line data={chartData} options={options} />
        </Box>
      </Paper>
    );
  };

  const renderDetectivePerformance = () => {
    return (
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">
            {user?.role === 'admin' ? '탐정별 성능' : '내 성능 현황'}
          </Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>기간</InputLabel>
            <Select
              value={selectedPeriod}
              label="기간"
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <MenuItem value="1month">1개월</MenuItem>
              <MenuItem value="3months">3개월</MenuItem>
              <MenuItem value="6months">6개월</MenuItem>
              <MenuItem value="1year">1년</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>탐정</TableCell>
              <TableCell align="center">총 사건</TableCell>
              <TableCell align="center">완료</TableCell>
              <TableCell align="center">진행중</TableCell>
              <TableCell align="center">평균 해결시간</TableCell>
              <TableCell align="center">만족도</TableCell>
              <TableCell align="center">성과</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {detectives.map((detective) => (
              <TableRow key={detective.id} hover>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar>{detective.name.charAt(0)}</Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {detective.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {detective.affiliation}
                      </Typography>
                      <Box mt={0.5}>
                        {detective.specialties.slice(0, 2).map((specialty, index) => (
                          <Chip
                            key={index}
                            label={specialty}
                            size="small"
                            variant="outlined"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell align="center">{detective.totalCases}</TableCell>
                <TableCell align="center">{detective.completedCases}</TableCell>
                <TableCell align="center">{detective.activeCases}</TableCell>
                <TableCell align="center">{formatTime(detective.averageResolutionTime)}</TableCell>
                <TableCell align="center">
                  <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                    <Typography>{Math.round(detective.satisfactionRate)}%</Typography>
                    <LinearProgress
                      variant="determinate"
                      value={detective.satisfactionRate}
                      sx={{ width: 60, height: 6 }}
                      color={getPerformanceColor(detective.satisfactionRate)}
                    />
                  </Box>
                </TableCell>
                <TableCell align="center">
                  {getPerformanceIcon(detective.satisfactionRate)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    );
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">실적 및 성능 추적</Typography>
        <Button variant="outlined" onClick={fetchPerformanceData}>
          새로고침
        </Button>
      </Box>

      {user?.role === 'admin' && renderKPICards()}
      {user?.role === 'admin' && renderMonthlyTrends()}
      {renderDetectivePerformance()}
    </Box>
  );
};

export default PerformancePage;
