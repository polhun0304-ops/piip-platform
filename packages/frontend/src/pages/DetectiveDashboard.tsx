import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Chip,
  Button,
  Divider,
  Avatar,
  useTheme,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Snackbar,
} from '@mui/material';
import {
  Security,
  Warning,
  Assignment,
  Timeline,
  Person,
  Folder,
  Info,
  Check,
  Close,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface CaseAssignment {
  id: string;
  status: 'pending' | 'assigned' | 'accepted' | 'rejected' | 'completed';
  detectiveId: string;
}

interface Case {
  id: string;
  title: string;
  status: string;
  date: string;
  description?: string;
  assignments?: CaseAssignment[];
}

const DetectiveDashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const fetchCases = async () => {
    try {
      const response = await api.get('/cases');
      setCases(response.data);
    } catch (error) {
      console.error('Failed to fetch cases:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleAccept = async (id: string) => {
    try {
      await api.post(`/cases/${id}/accept`);
      setMessage('사건을 수임했습니다.');
      fetchCases();
    } catch (error) {
      console.error('Failed to accept case:', error);
      setMessage('사건 수임 중 오류가 발생했습니다.');
    }
  };

  const handleReject = async (id: string) => {
    if (!window.confirm('정말로 이 사건 배정을 거절하시겠습니까?')) return;
    try {
      await api.post(`/cases/${id}/reject`);
      setMessage('사건 배정을 거절했습니다.');
      fetchCases();
    } catch (error) {
      console.error('Failed to reject case:', error);
      setMessage('거절 처리 중 오류가 발생했습니다.');
    }
  };

  // Filter cases
  const newRequests = cases.filter((c) => c.assignments?.some((a) => a.status === 'assigned'));

  const myActiveCases = cases.filter((c) => c.assignments?.some((a) => a.status === 'accepted'));

  // Stats
  const activeCount = myActiveCases.length;
  const requestCount = newRequests.length;
  const completedCount = cases.filter((c) => c.status === '종료').length;

  const stats = [
    { label: '진행 중인 사건', value: activeCount, icon: <Folder color="primary" /> },
    { label: '신규 배정 요청', value: requestCount, icon: <Warning color="error" /> },
    { label: '완료된 사건', value: completedCount, icon: <Assignment color="secondary" /> },
    { label: '전체 이력', value: cases.length, icon: <Person color="info" /> },
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            탐정 워크스페이스
          </Typography>
          <Typography variant="body1" color="text.secondary">
            오늘도 진실을 향해 나아갑니다. 안전하게 조사를 진행하세요.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Security />} color="primary">
          보안 점검
        </Button>
      </Box>

      {/* 통계 카드 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {stat.label}
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {stat.value}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: theme.palette.action.hover }}>{stat.icon}</Avatar>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* 신규 배정 요청 섹션 */}
      {newRequests.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom color="error">
            신규 사건 배정 요청 ({newRequests.length})
          </Typography>
          <Grid container spacing={2}>
            {newRequests.map((c) => (
              <Grid item xs={12} md={6} key={c.id}>
                <Paper
                  sx={{ p: 2, border: `1px solid ${theme.palette.error.main}`, bgcolor: '#fff5f5' }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {c.title}
                    </Typography>
                    <Chip label="배정 대기" color="error" size="small" />
                  </Box>
                  <Typography variant="body2" paragraph>
                    {c.description}
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ mb: 2 }}>
                    접수일: {c.date}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<Check />}
                      onClick={() => handleAccept(c.id)}
                      fullWidth
                    >
                      수임 승낙
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Close />}
                      onClick={() => handleReject(c.id)}
                      fullWidth
                    >
                      거절
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      <Grid container spacing={3}>
        {/* 내 사건 목록 */}
        <Grid item xs={12} md={8}>
          <Paper
            elevation={0}
            sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}
          >
            <Box
              sx={{
                p: 2,
                borderBottom: `1px solid ${theme.palette.divider}`,
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <Typography variant="h6" fontWeight={600}>
                내 사건 목록 (진행 중)
              </Typography>
              <Button size="small" startIcon={<Timeline />}>
                전체 보기
              </Button>
            </Box>
            {loading ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <CircularProgress />
              </Box>
            ) : myActiveCases.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">진행 중인 사건이 없습니다.</Typography>
              </Box>
            ) : (
              <List>
                {myActiveCases.map((c, index) => (
                  <React.Fragment key={c.id}>
                    <ListItem
                      alignItems="flex-start"
                      button
                      onClick={() => navigate(`/cases/${c.id}`)}
                      sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{ bgcolor: c.status === '조사 중' ? 'primary.main' : 'grey.400' }}
                        >
                          <Folder />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <Typography variant="subtitle1" fontWeight={600}>
                              {c.title}
                            </Typography>
                            <Chip
                              label={c.status}
                              size="small"
                              color={
                                c.status === '조사 중'
                                  ? 'primary'
                                  : c.status === '긴급'
                                    ? 'error'
                                    : 'default'
                              }
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <React.Fragment>
                            <Typography component="span" variant="body2" color="text.primary">
                              {c.date}
                            </Typography>
                            {' — '}
                            {c.description || '설명 없음'}
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                    {index < myActiveCases.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* 사이드 패널 (공지사항 등) */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2, mb: 3 }}
          >
            <Typography variant="h6" fontWeight={600} gutterBottom>
              <Info sx={{ verticalAlign: 'middle', mr: 1 }} />
              탐정 가이드
            </Typography>
            <Typography variant="body2" paragraph>
              모든 증거 수집은 합법적인 절차를 준수해야 합니다. 불법적으로 수집된 증거는 법적 효력이
              없으며 처벌 대상이 될 수 있습니다.
            </Typography>
            <Button variant="outlined" fullWidth size="small">
              가이드라인 보기
            </Button>
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

export default DetectiveDashboard;
