import React, { useState, useEffect } from 'react';
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
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  Paper,
  Stack,
  alpha,
  useTheme,
  CircularProgress,
} from '@mui/material';
import {
  CloudUpload,
  Videocam,
  MicNone,
  Image as ImageIcon,
  Folder,
  Download,
  Gavel,
  PlayCircle,
  Fingerprint,
  Psychology,
} from '@mui/icons-material';

interface AnalysisResult {
  id: string;
  type: 'video' | 'audio' | 'image';
  fileName: string;
  uploadDate: string;
  status: 'analyzing' | 'completed' | 'failed';
  confidence: number;
  highlights?: string[];
  findings?: string[];
}

import api from '../services/api';
import { authService } from '../services/auth';

const AIEvidenceAnalysis: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const user = authService.getCurrentUser();
  const [myEvidences, setMyEvidences] = useState<any[]>([]);
  const [loadingEvidences, setLoadingEvidences] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        // backend will filter by role/case; clients will only see their case's evidences
        const res = await api.get('/evidence');
        if (!mounted) return;
        setMyEvidences(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.warn('Failed to load evidences for AI page', err);
      } finally {
        if (mounted) setLoadingEvidences(false);
      }
    };
    // Only fetch list for clients or to populate the right pane
    fetch();
    return () => {
      mounted = false;
    };
  }, []);

  // 샘플 분석 결과
  const analysisResults: AnalysisResult[] = [
    {
      id: '1',
      type: 'video',
      fileName: 'CCTV_2024-01-15_18-30.mp4',
      uploadDate: '2024-01-15 18:45',
      status: 'completed',
      confidence: 94,
      highlights: [
        '18:32:15 - 인물 감지',
        '18:35:42 - 차량 번호판 인식',
        '18:37:20 - 행동 패턴 이상',
      ],
      findings: ['2명의 인물 식별', '차량번호: 12가3456', '비정상적인 이동 경로 감지'],
    },
    {
      id: '2',
      type: 'audio',
      fileName: '통화녹음_2024-01-14.mp3',
      uploadDate: '2024-01-14 22:10',
      status: 'completed',
      confidence: 87,
      highlights: ['화자 2명 분리', '감정 분석 완료', '키워드 추출 완료'],
      findings: ['위협적 언급 3회', '금전 관련 대화 5회', '스트레스 수치 높음 (85%)'],
    },
    {
      id: '3',
      type: 'image',
      fileName: '증거사진_001.jpg',
      uploadDate: '2024-01-13 14:20',
      status: 'completed',
      confidence: 92,
      highlights: ['얼굴 인식 완료', '위변조 검사 완료', '메타데이터 추출 완료'],
      findings: ['촬영일시: 2024-01-10 15:23', '위치: 서울시 강남구', '편집 흔적 없음'],
    },
  ];

  const handleFileUpload = () => {
    setUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Videocam color="primary" />;
      case 'audio':
        return <MicNone color="secondary" />;
      case 'image':
        return <ImageIcon color="info" />;
      default:
        return <Folder />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'video':
        return '영상 분석';
      case 'audio':
        return '음성 분석';
      case 'image':
        return '이미지 분석';
      default:
        return '파일';
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              <Psychology sx={{ verticalAlign: 'middle', mr: 1, fontSize: 40 }} />
              AI 증거 분석
            </Typography>
            <Typography variant="body1" color="text.secondary">
              자동 증거 분석으로 CCTV, 음성, 사진 등의 증거를 빠르게 검토하세요
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Gavel />}
            size="large"
            onClick={() => alert('법률검토 요청 기능 준비중')}
          >
            법률검토 요청
          </Button>
        </Stack>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
            <Tab
              icon={<Videocam />}
              label="영상분석"
              wrapped
              sx={{ minWidth: 120 }}
              title="얼굴 인식, 패턴 분석, 차량번호 인식 등 영상 기반 AI 분석 기능 포함"
            />
            <Tab
              icon={<MicNone />}
              label="음성분석"
              wrapped
              sx={{ minWidth: 120 }}
              title="음성 데이터의 AI 분석"
            />
            <Tab
              icon={<ImageIcon />}
              label="이미지분석"
              wrapped
              sx={{ minWidth: 120 }}
              title="이미지/문서 분석, 얼굴/패턴 인식 등"
            />
            <Tab
              icon={<Folder />}
              label="사건기록"
              wrapped
              sx={{ minWidth: 120 }}
              title="사건별 증거 기록 및 분석 결과 관리"
            />
          </Tabs>
        </Box>

        <Grid container spacing={3}>
          {/* Upload Zone */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  파일 업로드
                </Typography>

                {/* Drop Zone */}
                <Paper
                  sx={{
                    border: `2px dashed ${theme.palette.divider}`,
                    borderRadius: 2,
                    p: 4,
                    textAlign: 'center',
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                    },
                  }}
                  onClick={handleFileUpload}
                >
                  <CloudUpload sx={{ fontSize: 64, color: theme.palette.primary.main, mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    파일을 드래그하거나 클릭
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    MP4, MP3, JPG, PNG 지원
                    <br />
                    최대 500MB
                  </Typography>
                </Paper>

                {/* Upload Progress */}
                {uploading && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      AI가 분석 중입니다... (예상시간: 2분 30초)
                    </Typography>
                    <LinearProgress variant="determinate" value={uploadProgress} />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                      {uploadProgress}% 완료
                    </Typography>
                  </Box>
                )}

                {/* Alert */}
                <Alert severity="info" sx={{ mt: 3 }}>
                  <Typography variant="caption" sx={{ fontWeight: 500, color: 'text.primary' }}>
                    🔒 모든 파일은 암호화되어 전송됩니다
                    <br />
                    ⚠️ AI 판독은 법적 증거로 인정되지 않을 수 있습니다
                  </Typography>
                </Alert>
              </CardContent>
            </Card>
          </Grid>
          {/* Analysis Results */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                {/* If user is client, show a simplified view: upload + list of own evidences only */}
                {user?.role === 'client' ? (
                  <>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      업로드한 자료 ({myEvidences.length})
                    </Typography>
                    {loadingEvidences ? (
                      <CircularProgress />
                    ) : (
                      <List>
                        {myEvidences.map((ev) => (
                          <ListItem key={ev.id || ev._id}>
                            <ListItemIcon>{getTypeIcon(ev.type)}</ListItemIcon>
                            <ListItemText
                              primary={ev.label || ev.title || `증거 ${ev.id || ev._id}`}
                              secondary={ev.createdAt || ev.uploadDate || ev.date}
                            />
                            <Button
                              size="small"
                              onClick={() =>
                                window.open(ev.filePath || ev.url || ev.fileUrl, '_blank')
                              }
                            >
                              열기
                            </Button>
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </>
                ) : (
                  <>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      분석 결과 ({analysisResults.length})
                    </Typography>

                    <List>
                      {analysisResults.map((result) => (
                        <Card
                          key={result.id}
                          sx={{
                            mb: 2,
                            transition: 'all 0.3s',
                            '&:hover': {
                              boxShadow: theme.shadows[4],
                            },
                          }}
                        >
                          <CardContent>
                            <Stack direction="row" spacing={2} alignItems="flex-start">
                              {/* Icon */}
                              <Box sx={{ mt: 0.5 }}>{getTypeIcon(result.type)}</Box>

                              {/* Content */}
                              <Box sx={{ flexGrow: 1 }}>
                                <Stack
                                  direction="row"
                                  justifyContent="space-between"
                                  alignItems="center"
                                  mb={1}
                                >
                                  <Typography variant="subtitle1" fontWeight={600}>
                                    {result.fileName}
                                  </Typography>
                                  <Chip
                                    label={`신뢰도 ${result.confidence}%`}
                                    size="small"
                                    color={result.confidence >= 90 ? 'success' : 'warning'}
                                  />
                                </Stack>

                                <Stack direction="row" spacing={1} mb={2}>
                                  <Chip label={getTypeLabel(result.type)} size="small" />
                                  <Chip
                                    label={result.status === 'completed' ? '완료' : '분석중'}
                                    size="small"
                                    color={result.status === 'completed' ? 'success' : 'default'}
                                  />
                                  <Chip label={result.uploadDate} size="small" variant="outlined" />
                                </Stack>

                                {/* Highlights */}
                                {result.highlights && (
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="caption" fontWeight={600} color="primary">
                                      주요 구간:
                                    </Typography>
                                    <List dense>
                                      {result.highlights.map((highlight, idx) => (
                                        <ListItem key={idx} sx={{ py: 0.5, px: 0 }}>
                                          <ListItemIcon sx={{ minWidth: 32 }}>
                                            <PlayCircle fontSize="small" color="primary" />
                                          </ListItemIcon>
                                          <ListItemText
                                            primary={highlight}
                                            primaryTypographyProps={{ variant: 'body2' }}
                                          />
                                        </ListItem>
                                      ))}
                                    </List>
                                  </Box>
                                )}

                                {/* Findings */}
                                {result.findings && (
                                  <Box>
                                    <Typography
                                      variant="caption"
                                      fontWeight={600}
                                      color="secondary"
                                    >
                                      분석 결과:
                                    </Typography>
                                    <List dense>
                                      {result.findings.map((finding, idx) => (
                                        <ListItem key={idx} sx={{ py: 0.5, px: 0 }}>
                                          <ListItemIcon sx={{ minWidth: 32 }}>
                                            <Fingerprint fontSize="small" color="secondary" />
                                          </ListItemIcon>
                                          <ListItemText
                                            primary={finding}
                                            primaryTypographyProps={{ variant: 'body2' }}
                                          />
                                        </ListItem>
                                      ))}
                                    </List>
                                  </Box>
                                )}

                                {/* Actions */}
                                <Stack direction="row" spacing={1} mt={2}>
                                  <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<CloudUpload />}
                                  >
                                    증거보관센터에 저장
                                  </Button>
                                  <Button variant="outlined" size="small" startIcon={<Gavel />}>
                                    법률검토 요청
                                  </Button>
                                  <Button variant="outlined" size="small" startIcon={<Download />}>
                                    PDF 리포트
                                  </Button>
                                </Stack>
                              </Box>
                            </Stack>
                          </CardContent>
                        </Card>
                      ))}
                    </List>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Legal Notice */}
        <Alert severity="warning" sx={{ mt: 4 }}>
          <Typography variant="body2" fontWeight={600} gutterBottom>
            ⚖️ 법적 고지사항
          </Typography>
          <Typography variant="caption">
            AI 분석 결과는 조사 보조 목적으로만 사용되며, 법정 증거로서의 효력은 법원의 판단에
            따릅니다. 모든 증거는 법률 전문가의 검토를 받으시길 권장합니다.
          </Typography>
        </Alert>
      </Container>
    </Box>
  );
};

export default AIEvidenceAnalysis;
