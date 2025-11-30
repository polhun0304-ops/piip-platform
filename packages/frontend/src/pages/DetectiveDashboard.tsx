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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
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
import CaseItem from '../components/ui/CaseItem';
import CaseSkeleton from '../components/ui/CaseSkeleton';

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
  _id?: string;
}

const DetectiveDashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [cases, setCases] = useState<Case[]>([]);
  const [assignedCases, setAssignedCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const authUser = useSelector((state: RootState) => state.auth.user as { id?: string } | null);

  // 내 활동중인 사건 (탐정이 수임한 사건)
  const myActiveCases = cases.filter((c) => c.assignments?.some((a) => a.status === 'accepted'));

  // sort by priority: '긴급' first
  const sortedMyActiveCases = [...myActiveCases].sort((a, b) => {
    const aUrgent = a.status === '긴급' ? 1 : 0;
    const bUrgent = b.status === '긴급' ? 1 : 0;
    return bUrgent - aUrgent;
  });

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

  // Fetch direct assignments for this detective (if logged in as detective)
  useEffect(() => {
    let mounted = true;
    const loadAssigned = async () => {
      if (!authUser?.id) return;
      try {
        const res = await api.get(`/assignments?detectiveId=${authUser.id}&status=assigned`);
        const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
        // For each assignment, fetch case detail (best-effort)
        const casePromises = list.map(async (a: any) => {
          try {
            const cre = await api.get(`/cases/${a.caseId}`);
            return cre.data;
          } catch (e) {
            return null;
          }
        });
        const resolved = await Promise.all(casePromises);
        if (!mounted) return;
        setAssignedCases(resolved.filter(Boolean));
      } catch (e) {
        console.warn('Failed to load assignments for detective', e);
      }
    };
    loadAssigned();
    return () => {
      mounted = false;
    };
  }, [authUser?.id]);

  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [selectedCaseToAccept, setSelectedCaseToAccept] = React.useState<string | null>(null);
  const [acceptNote, setAcceptNote] = React.useState('');
  const [acceptingMap, setAcceptingMap] = React.useState<Record<string, boolean>>({});

  const openAcceptModal = (id: string) => {
    setSelectedCaseToAccept(id);
    setAcceptNote('');
    setConfirmOpen(true);
    setAcceptingMap((s) => ({ ...s, [id]: true }));
  };

  const closeAcceptModal = () => {
    setConfirmOpen(false);
    setSelectedCaseToAccept(null);
    setAcceptNote('');
    // if user cancelled, re-enable the button for that case
    // (selectedCaseToAccept may be null here if closed after confirm)
    // clear all accepting flags related to modal
    setAcceptingMap((s) => {
      if (!s) return {};
      const next = { ...s };
      if (selectedCaseToAccept && next[selectedCaseToAccept]) {
        delete next[selectedCaseToAccept];
      }
      return next;
    });
  };

  const confirmAccept = async () => {
    if (!selectedCaseToAccept) return;
    try {
      await handleAccept(selectedCaseToAccept, acceptNote);
      closeAcceptModal();
    } catch (err) {
      console.error(err);
      setMessage('수임 처리 중 오류가 발생했습니다.');
      // re-enable button on error
      setAcceptingMap((s) => ({ ...s, [selectedCaseToAccept]: false }));
    }
  };

  const handleAccept = async (id: string, note?: string) => {
    try {
      await api.post(`/cases/${id}/accept`, { note });
      setMessage('사건을 수임했습니다.');
      fetchCases();
      // keep the button disabled after successful accept (case will move out of list)
      setAcceptingMap((s) => ({ ...s, [id]: true }));
    } catch (error) {
      console.error('Failed to accept case:', error);
      setMessage('사건 수임 중 오류가 발생했습니다.');
      // re-enable button on failure
      setAcceptingMap((s) => ({ ...s, [id]: false }));
    }
  };

  const [rejectOpen, setRejectOpen] = React.useState(false);
  const [selectedCaseToReject, setSelectedCaseToReject] = React.useState<string | null>(null);
  const [rejectReason, setRejectReason] = React.useState('');

  const openRejectModal = (id: string) => {
    setSelectedCaseToReject(id);
    setRejectReason('');
    setRejectOpen(true);
  };

  const closeRejectModal = () => {
    setRejectOpen(false);
    setSelectedCaseToReject(null);
    setRejectReason('');
  };

  const confirmReject = async () => {
    if (!selectedCaseToReject) return;
    try {
      await handleReject(selectedCaseToReject, rejectReason);
      closeRejectModal();
    } catch (err) {
      console.error(err);
      setMessage('거절 처리 중 오류가 발생했습니다.');
    }
  };

  const handleReject = async (id: string, reason?: string) => {
    try {
      await api.post(`/cases/${id}/reject`, { reason });
      setMessage('사건 배정을 거절했습니다.');
      fetchCases();
    } catch (error) {
      console.error('Failed to reject case:', error);
      setMessage('거절 처리 중 오류가 발생했습니다.');
    }
  };

  const handleNavigate = async (id: string) => {
    try {
      await api.get(`/cases/${id}`);
      navigate(`/cases/${id}`);
    } catch (error) {
      console.error('Failed to prefetch case:', error);
      setMessage('사건 상세를 불러오는 중 오류가 발생했습니다. 잠시 후 시도해주세요.');
    }
  };

  // Filter cases
  // New assignment requests found both from `cases` payload and separate assignments endpoint
  const newRequests = (() => {
    const combined = [
      ...cases.filter((c) => c.assignments?.some((a) => a.status === 'assigned')),
      ...assignedCases,
    ];
    const map = new Map<string, Case>();
    combined.forEach((c) => {
      if (!c) return;
      map.set(String(c.id ?? c._id ?? JSON.stringify(c)), c);
    });
    return Array.from(map.values());
  })();

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
                  data-testid={`assignment-card-${c.id}`}
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
                      data-testid={`accept-button-${c.id}`}
                      variant="contained"
                      color="primary"
                      startIcon={
                        acceptingMap[c.id] ? (
                          <CircularProgress size={16} color="inherit" />
                        ) : (
                          <Check />
                        )
                      }
                      onClick={() => openAcceptModal(c.id)}
                      disabled={!!acceptingMap[c.id]}
                      fullWidth
                    >
                      수임 승낙
                    </Button>
                    <Button
                      data-testid={`reject-button-${c.id}`}
                      variant="outlined"
                      color="error"
                      startIcon={<Close />}
                      onClick={() => openRejectModal(c.id)}
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
              <Box sx={{ p: 4 }}>
                <CaseSkeleton />
                <CaseSkeleton />
              </Box>
            ) : sortedMyActiveCases.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">진행 중인 사건이 없습니다.</Typography>
              </Box>
            ) : (
              <List>
                {sortedMyActiveCases.map((c, index) => (
                  <React.Fragment key={c.id}>
                    <CaseItem
                      id={c.id}
                      title={c.title}
                      date={c.date}
                      description={c.description}
                      status={c.status}
                      onClick={() => handleNavigate(c.id)}
                    />
                    {index < sortedMyActiveCases.length - 1 && (
                      <Divider variant="inset" component="li" />
                    )}
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

      <Dialog
        open={confirmOpen}
        onClose={closeAcceptModal}
        fullWidth
        maxWidth="sm"
        aria-labelledby="accept-dialog-title"
        aria-describedby="accept-dialog-desc"
      >
        <DialogTitle id="accept-dialog-title">사건 수임 확인</DialogTitle>
        <DialogContent>
          <Typography id="accept-dialog-desc" variant="body2" paragraph>
            선택하신 사건을 수임하시겠습니까? 수임 후 추가 메모를 남기실 수 있습니다.
          </Typography>
          <TextField
            label="메모 (선택)"
            value={acceptNote}
            onChange={(e) => setAcceptNote(e.target.value)}
            fullWidth
            multiline
            minRows={3}
            autoFocus
            inputProps={{ 'aria-label': '수임 메모' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAcceptModal} aria-label="수임 취소">
            취소
          </Button>
          <Button
            variant="contained"
            onClick={confirmAccept}
            color="primary"
            aria-label="수임 확정"
          >
            수임 확정
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={rejectOpen}
        onClose={closeRejectModal}
        fullWidth
        maxWidth="sm"
        aria-labelledby="reject-dialog-title"
        aria-describedby="reject-dialog-desc"
      >
        <DialogTitle id="reject-dialog-title">사건 배정 거절</DialogTitle>
        <DialogContent>
          <Typography id="reject-dialog-desc" variant="body2" paragraph>
            이 사건 배정을 거절하시겠습니까? (사유를 입력하시면 관리자가 참고합니다.)
          </Typography>
          <TextField
            label="거절 사유 (선택)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            fullWidth
            multiline
            minRows={2}
            autoFocus
            inputProps={{ 'aria-label': '거절 사유' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeRejectModal} aria-label="거절 취소">
            취소
          </Button>
          <Button variant="outlined" color="error" onClick={confirmReject} aria-label="거절 확정">
            거절 확정
          </Button>
        </DialogActions>
      </Dialog>

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
