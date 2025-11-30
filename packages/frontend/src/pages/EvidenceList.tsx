import React, { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  ButtonBase,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Fab,
  Tooltip,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ImageIcon from '@mui/icons-material/Image';
import DescriptionIcon from '@mui/icons-material/Description';
import VideocamIcon from '@mui/icons-material/Videocam';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import TimelineIcon from '@mui/icons-material/Timeline';
import api from '../services/api';
import { authService } from '../services/auth';

interface Evidence {
  id: string;
  _id?: string;
  title?: string;
  label?: string;
  type: string;
  caseId: string;
  createdAt: string;
  date?: string;
  url?: string;
  uploadedBy?: string;
  uploadedByRole?: string;
}

interface UploadDialogState {
  open: boolean;
  caseId: string;
  file: File | null;
  title: string;
  type: string;
}

const EvidenceList: React.FC = () => {
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [filteredEvidences, setFilteredEvidences] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [uploadDialog, setUploadDialog] = useState<UploadDialogState>({
    open: false,
    caseId: '',
    file: null,
    title: '',
    type: '',
  });
  const [uploading, setUploading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    let mounted = true;
    const fetchEvidences = async () => {
      try {
        // rely on backend role-based filtering; clients will receive only their case evidences
        const res = await api.get('/evidence');
        if (!mounted) return;
        setEvidences(Array.isArray(res.data) ? res.data : []);
        setFilteredEvidences(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.warn('Failed to load evidences', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchEvidences();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let filtered = [...evidences];

    // 검색 필터링
    if (searchTerm) {
      filtered = filtered.filter(
        (evidence) =>
          (evidence.title || evidence.label || '')
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (evidence.caseId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (evidence.type || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 정렬
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'type':
          aValue = a.type || '';
          bValue = b.type || '';
          break;
        case 'caseId':
          aValue = a.caseId || '';
          bValue = b.caseId || '';
          break;
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt || a.date || 0);
          bValue = new Date(b.createdAt || b.date || 0);
          break;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredEvidences(filtered);
  }, [evidences, searchTerm, sortBy, sortOrder]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon fontSize="large" />;
      case 'document':
        return <DescriptionIcon fontSize="large" />;
      case 'video':
        return <VideocamIcon fontSize="large" />;
      default:
        return <DescriptionIcon fontSize="large" />;
    }
  };

  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  // 증거 업로드 권한 확인
  const canUploadEvidence = () => {
    return user?.role === 'client' || user?.role === 'detective';
  };

  // AI 분석 권한 확인 (탐정과 관리자만)
  const canRunAIAnalysis = () => {
    return user?.role === 'detective' || user?.role === 'admin';
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileType = getFileType(file);
      setUploadDialog((prev) => ({
        ...prev,
        file,
        type: fileType,
      }));
    }
  };

  const getFileType = (file: File): string => {
    const mimeType = file.type;
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text'))
      return 'document';
    return 'document';
  };

  const handleUpload = async () => {
    if (!uploadDialog.file || !uploadDialog.caseId || !uploadDialog.title) {
      setSnackbar({
        open: true,
        message: '모든 필드를 입력해주세요.',
        severity: 'error',
      });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadDialog.file);
      formData.append('caseId', uploadDialog.caseId);
      formData.append('title', uploadDialog.title);
      formData.append('type', uploadDialog.type);

      // 타임라인 기록을 위한 현재 시간 추가
      const now = new Date().toISOString();
      formData.append('uploadedAt', now);

      const response = await api.post('/evidence/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // 타임라인 기록
      await api.post('/cases/timeline', {
        caseId: uploadDialog.caseId,
        action: 'evidence_uploaded',
        details: `증거 "${uploadDialog.title}"이(가) 업로드되었습니다.`,
        timestamp: now,
        performedBy: user?.id,
        performedByRole: user?.role,
      });

      setSnackbar({
        open: true,
        message: '증거가 성공적으로 업로드되었습니다.',
        severity: 'success',
      });

      // 목록 새로고침
      const res = await api.get('/evidence');
      setEvidences(Array.isArray(res.data) ? res.data : []);
      setFilteredEvidences(Array.isArray(res.data) ? res.data : []);

      setUploadDialog({
        open: false,
        caseId: '',
        file: null,
        title: '',
        type: '',
      });
    } catch (err: any) {
      console.error('Upload failed:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || '업로드 중 오류가 발생했습니다.',
        severity: 'error',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCloseUploadDialog = () => {
    setUploadDialog({
      open: false,
      caseId: '',
      file: null,
      title: '',
      type: '',
    });
  };

  const getUserCases = async () => {
    try {
      const response = await api.get('/cases/user-cases');
      return response.data;
    } catch (err) {
      console.error('Failed to fetch user cases:', err);
      return [];
    }
  };

  const openUploadDialog = async () => {
    const cases = await getUserCases();
    if (cases.length === 0) {
      setSnackbar({
        open: true,
        message: '업로드할 수 있는 사건이 없습니다.',
        severity: 'success' as const,
      });
      return;
    }
    setUploadDialog((prev) => ({ ...prev, open: true, caseId: cases[0].id }));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            증거 목록
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            총 {filteredEvidences.length}개의 증거가 등록되었습니다
            {user?.role === 'client' && ' — 의뢰인은 본인이 속한 사건의 자료만 확인 가능합니다.'}
          </Typography>
        </Box>

        {canUploadEvidence() && (
          <Tooltip title="증거 업로드">
            <Fab
              color="primary"
              size="medium"
              onClick={openUploadDialog}
              sx={{ position: 'fixed', bottom: 24, right: 24 }}
            >
              <AddIcon />
            </Fab>
          </Tooltip>
        )}
      </Box>

      {/* 검색 및 정렬 컨트롤 */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          label="검색"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 200 }}
        />

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>정렬 기준</InputLabel>
          <Select
            value={sortBy}
            label="정렬 기준"
            onChange={(e) => setSortBy(e.target.value)}
            startAdornment={<SortIcon sx={{ mr: 1 }} />}
          >
            <MenuItem value="createdAt">등록일자</MenuItem>
            <MenuItem value="type">유형별</MenuItem>
            <MenuItem value="caseId">사건 ID</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>정렬 순서</InputLabel>
          <Select
            value={sortOrder}
            label="정렬 순서"
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
          >
            <MenuItem value="desc">내림차순</MenuItem>
            <MenuItem value="asc">오름차순</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading && <CircularProgress />}
      <Grid container spacing={2}>
        {filteredEvidences.map((evidence) => (
          <Grid item xs={12} sm={6} md={4} key={evidence.id || evidence._id}>
            <Card sx={{ width: '100%', position: 'relative' }}>
              <CardMedia
                sx={{ display: 'flex', justifyContent: 'center', p: 2, bgcolor: '#f5f5f5' }}
              >
                {getIcon(evidence.type)}
              </CardMedia>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {evidence.title || evidence.label || `증거 ${evidence.id || evidence._id}`}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <Chip label={evidence.type} size="small" color="primary" variant="outlined" />
                  {evidence.uploadedByRole && (
                    <Chip
                      label={evidence.uploadedByRole === 'client' ? '의뢰인' : '탐정'}
                      size="small"
                      color={evidence.uploadedByRole === 'client' ? 'secondary' : 'info'}
                      variant="outlined"
                    />
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  사건 ID: {evidence.caseId}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  등록일:{' '}
                  {new Date(evidence.createdAt || evidence.date || Date.now()).toLocaleString(
                    'ko-KR'
                  )}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => navigate(`/cases/${evidence.caseId}`)}
                  >
                    사건 상세
                  </Button>
                  {canRunAIAnalysis() && (
                    <Button
                      size="small"
                      variant="contained"
                      color="secondary"
                      onClick={() =>
                        navigate(
                          `/ai-analysis?evidenceId=${evidence.id}&caseId=${evidence.caseId}&type=${evidence.type}&url=${encodeURIComponent(evidence.url || '')}`
                        )
                      }
                    >
                      AI 분석
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 업로드 다이얼로그 */}
      <Dialog open={uploadDialog.open} onClose={handleCloseUploadDialog} maxWidth="sm" fullWidth>
        <DialogTitle>증거 자료 업로드</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="사건 ID"
              value={uploadDialog.caseId}
              onChange={(e) => setUploadDialog((prev) => ({ ...prev, caseId: e.target.value }))}
              fullWidth
              required
            />

            <TextField
              label="증거 제목"
              value={uploadDialog.title}
              onChange={(e) => setUploadDialog((prev) => ({ ...prev, title: e.target.value }))}
              fullWidth
              required
            />

            <Box>
              <input
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                style={{ display: 'none' }}
                id="evidence-file-upload"
                type="file"
                onChange={handleFileSelect}
              />
              <label htmlFor="evidence-file-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  fullWidth
                >
                  파일 선택
                </Button>
              </label>
              {uploadDialog.file && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  선택된 파일: {uploadDialog.file.name} ({uploadDialog.type})
                </Typography>
              )}
            </Box>

            <Alert severity="info">
              <Typography variant="body2">
                • 의뢰인과 탐정 모두 증거를 업로드할 수 있습니다.
                <br />
                • AI 분석은 탐정과 관리자만 수행할 수 있습니다.
                <br />• 업로드 시 타임라인이 자동으로 기록됩니다.
              </Typography>
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUploadDialog}>취소</Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={
              uploading || !uploadDialog.file || !uploadDialog.caseId || !uploadDialog.title
            }
          >
            {uploading ? '업로드 중...' : '업로드'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 스낵바 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EvidenceList;
