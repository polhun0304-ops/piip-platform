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
  TextField,
  Button,
  Snackbar,
} from '@mui/material';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import StatsCard from '../components/ui/StatsCard';
import api from '../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/dashboard');
      setData(res.data);
    } catch (err: any) {
      setError(err?.message || '데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleNavigate = async (caseId: string) => {
    try {
      await api.get(`/cases/${caseId}`);
      window.location.href = `/cases/${caseId}`;
    } catch (err) {
      console.error('Prefetch failed', err);
      setMessage('사건 정보를 불러오는 중 오류가 발생했습니다.');
    }
  };

  const handleReassign = async (assignmentId: string) => {
    try {
      await api.post(`/assignments/${assignmentId}/reassign`);
      setMessage('재배정 요청을 전송했습니다.');
      await fetchDashboard();
    } catch (err) {
      console.error('Reassign failed', err);
      setMessage('재배정 중 오류가 발생했습니다.');
    }
  };

  if (loading)
    return (
      <Box textAlign="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  if (error)
    return (
      <Box textAlign="center" mt={4}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  if (!data) return null;

  const chartData = {
    labels: data.monthlyPerformance.map((m: any) => m.month),
    datasets: [
      {
        label: '완료 건수',
        data: data.monthlyPerformance.map((m: any) => m.completed),
        backgroundColor: '#1976d2',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        관리자 대시보드
      </Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard label="완료 사건" value={data.detective.completedCases} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard label="진행 중 사건" value={data.detective.currentCaseCount} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard label="총 배정" value={data.assignments.total} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard label="수락 건수" value={data.assignments.accepted} />
        </Grid>
      </Grid>

      <Box sx={{ mb: 2 }}>
        <TextField
          placeholder="검색: 사건 제목"
          size="small"
          onChange={(e) => setFilter(e.target.value)}
        />
      </Box>

      {data?.monthlyPerformance && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            월별 성과 (시각화)
          </Typography>
          <Box role="img" aria-label="월별 성과 차트" sx={{ width: '100%', maxWidth: 600 }}>
            <Bar data={chartData} options={chartOptions} />
          </Box>
        </Paper>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6">탐정 정보</Typography>
            <Typography>이름: {data.detective.name}</Typography>
            <Typography>상태: {data.detective.status}</Typography>
            <Typography>경력: {data.detective.experienceYears}년</Typography>
            <Typography>평균 평점: {data.detective.averageRating}</Typography>
            <Typography>성공률: {data.detective.successRate}%</Typography>
            <Typography>완료 사건: {data.detective.completedCases}건</Typography>
            <Typography>진행 중 사건: {data.detective.currentCaseCount}건</Typography>
            <Typography>최대 동시 사건: {data.detective.maxConcurrentCases}건</Typography>
            <Typography>가동률: {data.detective.utilization}%</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6">배정 통계</Typography>
            <Typography>총 배정: {data.assignments.total}건</Typography>
            <Typography>수락: {data.assignments.accepted}건</Typography>
            <Typography>거절: {data.assignments.rejected}건</Typography>
            <Typography>완료: {data.assignments.completed}건</Typography>
            <Typography>수락률: {data.assignments.acceptanceRate}%</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6">진행 중 사건</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>배정ID</TableCell>
                  <TableCell>사건ID</TableCell>
                  <TableCell>제목</TableCell>
                  <TableCell>배정일</TableCell>
                  <TableCell>우선순위</TableCell>
                  <TableCell>액션</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.activeCases
                  .filter((a: any) =>
                    filter ? a.caseTitle.toLowerCase().includes(filter.toLowerCase()) : true
                  )
                  .map((a: any) => (
                    <TableRow key={a.assignmentId} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                      <TableCell>{a.assignmentId}</TableCell>
                      <TableCell>{a.caseId}</TableCell>
                      <TableCell
                        sx={{ cursor: 'pointer' }}
                        onClick={() => handleNavigate(a.caseId)}
                      >
                        {a.caseTitle}
                      </TableCell>
                      <TableCell>{a.assignedAt}</TableCell>
                      <TableCell>{a.priority}</TableCell>
                      <TableCell>
                        <Button size="small" onClick={() => handleReassign(a.assignmentId)}>
                          재배정
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6">최근 완료 사건</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>배정ID</TableCell>
                  <TableCell>사건ID</TableCell>
                  <TableCell>제목</TableCell>
                  <TableCell>완료일</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.recentCompleted.map((a: any) => (
                  <TableRow key={a.assignmentId}>
                    <TableCell>{a.assignmentId}</TableCell>
                    <TableCell>{a.caseId}</TableCell>
                    <TableCell>{a.caseTitle}</TableCell>
                    <TableCell>{a.completedAt}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6">월별 성과 (최근 6개월)</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>월</TableCell>
                  <TableCell>완료 건수</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.monthlyPerformance.map((m: any) => (
                  <TableRow key={m.month}>
                    <TableCell>{m.month}</TableCell>
                    <TableCell>{m.completed}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>
      <Snackbar
        open={!!message}
        autoHideDuration={6000}
        onClose={() => setMessage(null)}
        message={message}
      />
    </Box>
  );
};

export default AdminDashboard;
