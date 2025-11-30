import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import {
  Gavel as GavelIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import api from '../services/api';
import { authService } from '../services/auth';

interface LegalReviewRequest {
  id: string;
  caseId: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_review' | 'completed' | 'rejected';
  requestedBy: string;
  requestedByRole: string;
  assignedTo?: string;
  assignedToRole?: string;
  documents: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
  }>;
  reviewResult?: {
    conclusion: string;
    recommendations: string[];
    legalReferences: string[];
    riskAssessment: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface LegalReviewProps {
  caseId: string;
}

const LegalReview: React.FC<LegalReviewProps> = ({ caseId }) => {
  const [reviews, setReviews] = useState<LegalReviewRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [selectedReview, setSelectedReview] = useState<LegalReviewRequest | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const theme = useTheme();

  // 법률검토 요청 폼 상태
  const [requestForm, setRequestForm] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    documents: [] as File[],
  });

  useEffect(() => {
    fetchLegalReviews();
  }, [caseId]);

  const fetchLegalReviews = async () => {
    try {
      const response = await api.get(`/legal-reviews?caseId=${caseId}`);
      setReviews(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch legal reviews:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async () => {
    if (!requestForm.title.trim() || !requestForm.description.trim()) {
      alert('제목과 설명을 입력해주세요.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('caseId', caseId);
      formData.append('title', requestForm.title);
      formData.append('description', requestForm.description);
      formData.append('priority', requestForm.priority);

      // 문서 파일들 추가
      requestForm.documents.forEach((file, index) => {
        formData.append(`documents`, file);
      });

      const user = authService.getCurrentUser();
      formData.append('requestedBy', user?.id || '');
      formData.append('requestedByRole', user?.role || '');

      await api.post('/legal-reviews', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // 타임라인에 법률검토 요청 기록
      await api.post(`/cases/${caseId}/timeline`, {
        action: '법률검토 요청',
        details: `법률검토가 요청되었습니다: ${requestForm.title}`,
        timestamp: new Date().toISOString(),
        performedBy: user?.id,
        performedByRole: user?.role,
      });

      setShowRequestDialog(false);
      setRequestForm({
        title: '',
        description: '',
        priority: 'medium',
        documents: [],
      });
      fetchLegalReviews();
      alert('법률검토 요청이 성공적으로 제출되었습니다.');
    } catch (error) {
      console.error('Failed to create legal review request:', error);
      alert('법률검토 요청 제출에 실패했습니다.');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
        return 'error';
      case 'urgent':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'low':
        return '낮음';
      case 'medium':
        return '중간';
      case 'high':
        return '높음';
      case 'urgent':
        return '긴급';
      default:
        return priority;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <PendingIcon color="warning" />;
      case 'in_review':
        return <GavelIcon color="primary" />;
      case 'completed':
        return <CheckCircleIcon color="success" />;
      case 'rejected':
        return <CancelIcon color="error" />;
      default:
        return <PendingIcon />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return '대기 중';
      case 'in_review':
        return '검토 중';
      case 'completed':
        return '완료';
      case 'rejected':
        return '거부됨';
      default:
        return status;
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setRequestForm((prev) => ({
      ...prev,
      documents: [...prev.documents, ...files],
    }));
  };

  const removeDocument = (index: number) => {
    setRequestForm((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Paper elevation={0} sx={{ p: 3, mb: 3, border: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <GavelIcon color="primary" sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h5" fontWeight={700}>
                법률검토 요청
              </Typography>
              <Typography variant="body2" color="text.secondary">
                전문 법률 자문을 통해 사건의 법적 측면을 검토하세요
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SendIcon />}
            onClick={() => setShowRequestDialog(true)}
          >
            법률검토 요청
          </Button>
        </Box>

        {reviews.length === 0 ? (
          <Alert severity="info">
            아직 법률검토 요청이 없습니다. 필요한 경우 법률 자문을 요청할 수 있습니다.
          </Alert>
        ) : (
          <List>
            {reviews.map((review) => (
              <ListItem
                key={review.id}
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                  mb: 1,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
                onClick={() => {
                  setSelectedReview(review);
                  setShowDetailDialog(true);
                }}
              >
                <ListItemIcon>{getStatusIcon(review.status)}</ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="h6">{review.title}</Typography>
                      <Chip
                        label={getPriorityLabel(review.priority)}
                        color={getPriorityColor(review.priority) as any}
                        size="small"
                      />
                      <Chip
                        label={getStatusLabel(review.status)}
                        color={
                          review.status === 'completed'
                            ? 'success'
                            : review.status === 'in_review'
                              ? 'primary'
                              : review.status === 'rejected'
                                ? 'error'
                                : 'warning'
                        }
                        size="small"
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {review.description}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          요청일: {new Date(review.createdAt).toLocaleDateString('ko-KR')}
                        </Typography>
                        {review.assignedTo && (
                          <Typography variant="caption" color="text.secondary">
                            담당자: {review.assignedToRole === 'lawyer' ? '변호사' : '법무 담당자'}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {/* 법률검토 요청 다이얼로그 */}
      <Dialog
        open={showRequestDialog}
        onClose={() => setShowRequestDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>법률검토 요청</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="제목"
                value={requestForm.title}
                onChange={(e) => setRequestForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="법률검토 요청 제목을 입력하세요"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="설명"
                value={requestForm.description}
                onChange={(e) =>
                  setRequestForm((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="법률검토가 필요한 구체적인 내용과 상황을 설명해주세요"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>우선순위</InputLabel>
                <Select
                  value={requestForm.priority}
                  label="우선순위"
                  onChange={(e) =>
                    setRequestForm((prev) => ({ ...prev, priority: e.target.value as any }))
                  }
                >
                  <MenuItem value="low">낮음</MenuItem>
                  <MenuItem value="medium">중간</MenuItem>
                  <MenuItem value="high">높음</MenuItem>
                  <MenuItem value="urgent">긴급</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                관련 문서 첨부 (선택사항)
              </Typography>
              <Button variant="outlined" component="label" startIcon={<DescriptionIcon />}>
                파일 선택
                <input
                  type="file"
                  multiple
                  hidden
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                />
              </Button>
              {requestForm.documents.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    첨부된 파일들:
                  </Typography>
                  <List dense>
                    {requestForm.documents.map((file, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={file.name}
                          secondary={`${(file.size / 1024).toFixed(1)} KB`}
                        />
                        <Button size="small" color="error" onClick={() => removeDocument(index)}>
                          제거
                        </Button>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRequestDialog(false)}>취소</Button>
          <Button variant="contained" onClick={handleCreateRequest} startIcon={<SendIcon />}>
            요청 제출
          </Button>
        </DialogActions>
      </Dialog>

      {/* 법률검토 상세 다이얼로그 */}
      <Dialog
        open={showDetailDialog}
        onClose={() => setShowDetailDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>법률검토 상세 - {selectedReview?.title}</DialogTitle>
        <DialogContent>
          {selectedReview && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      요청 정보
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Chip
                        label={getPriorityLabel(selectedReview.priority)}
                        color={getPriorityColor(selectedReview.priority) as any}
                      />
                      <Chip
                        label={getStatusLabel(selectedReview.status)}
                        color={
                          selectedReview.status === 'completed'
                            ? 'success'
                            : selectedReview.status === 'in_review'
                              ? 'primary'
                              : selectedReview.status === 'rejected'
                                ? 'error'
                                : 'warning'
                        }
                      />
                    </Box>
                    <Typography variant="body1" paragraph>
                      {selectedReview.description}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon fontSize="small" />
                        <Typography variant="body2">
                          요청자: {selectedReview.requestedByRole === 'client' ? '의뢰인' : '탐정'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ScheduleIcon fontSize="small" />
                        <Typography variant="body2">
                          요청일: {new Date(selectedReview.createdAt).toLocaleString('ko-KR')}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                {selectedReview.documents.length > 0 && (
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        첨부 문서
                      </Typography>
                      <List>
                        {selectedReview.documents.map((doc) => (
                          <ListItem key={doc.id}>
                            <ListItemIcon>
                              <DescriptionIcon />
                            </ListItemIcon>
                            <ListItemText primary={doc.name} secondary={doc.type} />
                            <Button size="small" variant="outlined">
                              다운로드
                            </Button>
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                )}

                {selectedReview.reviewResult && (
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        검토 결과
                      </Typography>
                      <Typography variant="body1" paragraph>
                        <strong>결론:</strong> {selectedReview.reviewResult.conclusion}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>리스크 평가:</strong> {selectedReview.reviewResult.riskAssessment}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>권장사항:</strong>
                      </Typography>
                      <List dense>
                        {selectedReview.reviewResult.recommendations.map((rec, index) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              <CheckCircleIcon color="primary" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={rec} />
                          </ListItem>
                        ))}
                      </List>
                      {selectedReview.reviewResult.legalReferences.length > 0 && (
                        <>
                          <Typography variant="body2" gutterBottom sx={{ mt: 2 }}>
                            <strong>관련 법규:</strong>
                          </Typography>
                          <List dense>
                            {selectedReview.reviewResult.legalReferences.map((ref, index) => (
                              <ListItem key={index}>
                                <ListItemText primary={ref} />
                              </ListItem>
                            ))}
                          </List>
                        </>
                      )}
                    </CardContent>
                  </Card>
                )}
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      처리 현황
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      {getStatusIcon(selectedReview.status)}
                      <Typography variant="body1">
                        {getStatusLabel(selectedReview.status)}
                      </Typography>
                    </Box>
                    {selectedReview.assignedTo && (
                      <Typography variant="body2" color="text.secondary">
                        담당자:{' '}
                        {selectedReview.assignedToRole === 'lawyer' ? '변호사' : '법무 담당자'}
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary">
                      마지막 업데이트: {new Date(selectedReview.updatedAt).toLocaleString('ko-KR')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetailDialog(false)}>닫기</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LegalReview;
