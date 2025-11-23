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
} from '@mui/material';
import axios from 'axios';

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get('/api/dashboard')
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

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

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        관리자 대시보드
      </Typography>
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
                </TableRow>
              </TableHead>
              <TableBody>
                {data.activeCases.map((a: any) => (
                  <TableRow key={a.assignmentId}>
                    <TableCell>{a.assignmentId}</TableCell>
                    <TableCell>{a.caseId}</TableCell>
                    <TableCell>{a.caseTitle}</TableCell>
                    <TableCell>{a.assignedAt}</TableCell>
                    <TableCell>{a.priority}</TableCell>
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
    </Box>
  );
};

export default AdminDashboard;
