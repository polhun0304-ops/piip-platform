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
  Avatar,
  Chip,
  Button,
  Tabs,
  Tab,
  LinearProgress,
  Divider,
  Rating,
  Tooltip,
} from '@mui/material';
import { Bar, Doughnut, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import {
  TrendingUp,
  Star,
  Timer,
  CheckCircle,
  People,
  Assessment,
  Compare,
  EmojiEvents as Award,
} from '@mui/icons-material';
import api from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  RadialLinearScale,
  Title,
  ChartTooltip,
  Legend
);

interface DetectiveEvaluation {
  id: string;
  name: string;
  affiliation: string;
  rating: number;
  totalCases: number;
  completedCases: number;
  activeCases: number;
  averageResolutionTime: number;
  satisfactionRate: number;
  clientFeedback: number;
  peerReview: number;
  specialties: string[];
  strengths: string[];
  areasForImprovement: string[];
  monthlyPerformance: Array<{
    month: string;
    completed: number;
    satisfaction: number;
    rating: number;
  }>;
  caseTypes: {
    criminal: number;
    civil: number;
    corporate: number;
    personal: number;
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

const PerformanceAll: React.FC = () => {
  const [detectives, setDetectives] = useState<DetectiveEvaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  const fetchAllPerformanceData = async () => {
    setLoading(true);
    try {
      const detectivesRes = await api.get('/detectives');

      const detectiveEvaluations = await Promise.all(
        detectivesRes.data.map(async (detective: any) => {
          try {
            const statsRes = await api.get(`/detectives/${detective.id}/stats`);
            return {
              id: detective.id,
              name: detective.name,
              affiliation: detective.affiliation,
              rating: statsRes.data.rating || 4.0,
              totalCases: statsRes.data.totalCases || 0,
              completedCases: statsRes.data.completedCases || 0,
              activeCases: statsRes.data.activeCases || 0,
              averageResolutionTime: statsRes.data.averageResolutionTime || 0,
              satisfactionRate: statsRes.data.satisfactionRate || 0,
              clientFeedback: statsRes.data.clientFeedback || 4.2,
              peerReview: statsRes.data.peerReview || 4.5,
              specialties: statsRes.data.specialties || [],
              strengths: statsRes.data.strengths || ['철저한 조사', '정확한 보고서'],
              areasForImprovement: statsRes.data.areasForImprovement || ['커뮤니케이션 개선'],
              monthlyPerformance: statsRes.data.monthlyPerformance || [],
              caseTypes: statsRes.data.caseTypes || {
                criminal: 0,
                civil: 0,
                corporate: 0,
                personal: 0,
              },
            };
          } catch (err) {
            return {
              id: detective.id,
              name: detective.name,
              affiliation: detective.affiliation,
              rating: 4.0,
              totalCases: 0,
              completedCases: 0,
              activeCases: 0,
              averageResolutionTime: 0,
              satisfactionRate: 0,
              clientFeedback: 4.0,
              peerReview: 4.0,
              specialties: [],
              strengths: [],
              areasForImprovement: [],
              monthlyPerformance: [],
              caseTypes: { criminal: 0, civil: 0, corporate: 0, personal: 0 },
            };
          }
        })
      );

      setDetectives(detectiveEvaluations);
    } catch (err: any) {
      setError(err?.message || '평가 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllPerformanceData();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box textAlign="center" mt={4}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>평가 데이터를 불러오는 중...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" mt={4}>
        <Typography color="error">{error}</Typography>
        <Button onClick={fetchAllPerformanceData} sx={{ mt: 2 }}>
          다시 시도
        </Button>
      </Box>
    );
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'success';
    if (rating >= 4.0) return 'primary';
    if (rating >= 3.5) return 'warning';
    return 'error';
  };

  const formatTime = (hours: number) => {
    if (hours < 24) return `${Math.round(hours)}시간`;
    const days = Math.floor(hours / 24);
    return `${days}일`;
  };

  const renderOverviewTab = () => {
    const topPerformers = detectives.sort((a, b) => b.rating - a.rating).slice(0, 5);

    const completionRates = detectives.map((d) => ({
      name: d.name,
      rate: d.totalCases > 0 ? (d.completedCases / d.totalCases) * 100 : 0,
    }));

    const chartData = {
      labels: completionRates.map((d) => d.name),
      datasets: [
        {
          label: '완료율 (%)',
          data: completionRates.map((d) => d.rate),
          backgroundColor: 'rgba(25, 118, 210, 0.6)',
          borderColor: '#1976d2',
          borderWidth: 1,
        },
      ],
    };

    return (
      <Box>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Award sx={{ mr: 1, verticalAlign: 'middle' }} />
                  우수 탐정 순위
                </Typography>
                {topPerformers.map((detective, index) => (
                  <Box key={detective.id} display="flex" alignItems="center" mb={2}>
                    <Typography variant="h6" sx={{ minWidth: 30 }}>
                      #{index + 1}
                    </Typography>
                    <Avatar sx={{ mr: 2 }}>{detective.name.charAt(0)}</Avatar>
                    <Box flex={1}>
                      <Typography variant="body1" fontWeight="bold">
                        {detective.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {detective.affiliation}
                      </Typography>
                    </Box>
                    <Rating value={detective.rating} readOnly precision={0.1} size="small" />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {detective.rating.toFixed(1)}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Assessment sx={{ mr: 1, verticalAlign: 'middle' }} />
                  완료율 비교
                </Typography>
                <Box sx={{ height: 250 }}>
                  <Bar
                    data={chartData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { display: false },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 100,
                          title: {
                            display: true,
                            text: '완료율 (%)',
                          },
                        },
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            <People sx={{ mr: 1, verticalAlign: 'middle' }} />
            전체 탐정 평가 현황
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>탐정</TableCell>
                <TableCell align="center">평점</TableCell>
                <TableCell align="center">총 사건</TableCell>
                <TableCell align="center">완료율</TableCell>
                <TableCell align="center">평균 해결시간</TableCell>
                <TableCell align="center">고객 만족도</TableCell>
                <TableCell align="center">동료 평가</TableCell>
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
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" alignItems="center" justifyContent="center">
                      <Rating
                        value={detective.rating}
                        readOnly
                        precision={0.1}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Typography>{detective.rating.toFixed(1)}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">{detective.totalCases}</TableCell>
                  <TableCell align="center">
                    {detective.totalCases > 0
                      ? `${Math.round((detective.completedCases / detective.totalCases) * 100)}%`
                      : '0%'}
                  </TableCell>
                  <TableCell align="center">
                    {formatTime(detective.averageResolutionTime)}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title={`${detective.satisfactionRate.toFixed(1)}%`}>
                      <LinearProgress
                        variant="determinate"
                        value={detective.satisfactionRate}
                        sx={{ width: 60, height: 8 }}
                        color={getRatingColor(detective.satisfactionRate / 20)}
                      />
                    </Tooltip>
                  </TableCell>
                  <TableCell align="center">
                    <Rating value={detective.peerReview} readOnly precision={0.1} size="small" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Box>
    );
  };

  const renderDetailedAnalysisTab = () => {
    const averageRating = detectives.reduce((sum, d) => sum + d.rating, 0) / detectives.length;
    const averageCompletion =
      detectives.reduce(
        (sum, d) => sum + (d.totalCases > 0 ? (d.completedCases / d.totalCases) * 100 : 0),
        0
      ) / detectives.length;

    const specialtyDistribution = detectives.reduce(
      (acc, d) => {
        d.specialties.forEach((specialty) => {
          acc[specialty] = (acc[specialty] || 0) + 1;
        });
        return acc;
      },
      {} as Record<string, number>
    );

    const specialtyData = {
      labels: Object.keys(specialtyDistribution),
      datasets: [
        {
          data: Object.values(specialtyDistribution),
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
        },
      ],
    };

    return (
      <Box>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  평균 평점
                </Typography>
                <Typography variant="h3" color="primary">
                  {averageRating.toFixed(1)}
                </Typography>
                <Rating value={averageRating} readOnly precision={0.1} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  평균 완료율
                </Typography>
                <Typography variant="h3" color="secondary">
                  {Math.round(averageCompletion)}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={averageCompletion}
                  sx={{ mt: 1, height: 8 }}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  전문 분야 분포
                </Typography>
                <Box sx={{ height: 150 }}>
                  <Doughnut
                    data={specialtyData}
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
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            <Compare sx={{ mr: 1, verticalAlign: 'middle' }} />
            상세 성과 분석
          </Typography>
          {detectives.map((detective) => (
            <Card key={detective.id} sx={{ mb: 2 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar>{detective.name.charAt(0)}</Avatar>
                    <Box>
                      <Typography variant="h6">{detective.name}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {detective.affiliation}
                      </Typography>
                    </Box>
                  </Box>
                  <Box textAlign="right">
                    <Rating value={detective.rating} readOnly precision={0.1} />
                    <Typography variant="body2">{detective.rating.toFixed(1)}</Typography>
                  </Box>
                </Box>

                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="textSecondary">
                      총 사건
                    </Typography>
                    <Typography variant="h6">{detective.totalCases}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="textSecondary">
                      완료율
                    </Typography>
                    <Typography variant="h6">
                      {detective.totalCases > 0
                        ? `${Math.round((detective.completedCases / detective.totalCases) * 100)}%`
                        : '0%'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="textSecondary">
                      평균 시간
                    </Typography>
                    <Typography variant="h6">
                      {formatTime(detective.averageResolutionTime)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="textSecondary">
                      만족도
                    </Typography>
                    <Typography variant="h6">{detective.satisfactionRate.toFixed(1)}%</Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    전문 분야
                  </Typography>
                  <Box>
                    {detective.specialties.map((specialty, index) => (
                      <Chip key={index} label={specialty} size="small" sx={{ mr: 1, mb: 1 }} />
                    ))}
                  </Box>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      강점
                    </Typography>
                    <Box>
                      {detective.strengths.map((strength, index) => (
                        <Chip
                          key={index}
                          label={strength}
                          size="small"
                          color="success"
                          variant="outlined"
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))}
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      개선 필요 영역
                    </Typography>
                    <Box>
                      {detective.areasForImprovement.map((area, index) => (
                        <Chip
                          key={index}
                          label={area}
                          size="small"
                          color="warning"
                          variant="outlined"
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Paper>
      </Box>
    );
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">전체 실적 및 평가</Typography>
        <Button variant="outlined" onClick={fetchAllPerformanceData}>
          새로고침
        </Button>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="개요" />
          <Tab label="상세 분석" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {renderOverviewTab()}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {renderDetailedAnalysisTab()}
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default PerformanceAll;
