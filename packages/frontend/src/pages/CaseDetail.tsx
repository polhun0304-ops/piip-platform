import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tab,
  Tabs,
  useTheme,
  Card,
  CardContent,
  Avatar,
  Divider,
  Alert,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import {
  ArrowBack,
  Person,
  Event,
  Description,
  Assignment,
  Timeline as TimelineIcon,
  Chat,
  AttachFile,
  Psychology,
  Add as AddIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  Gavel,
} from '@mui/icons-material';
import api from '../services/api';
import SecureChat from '../components/SecureChat';
import AIAnalysis from '../components/AIAnalysis';
import LegalReview from '../components/LegalReview';
import { authService } from '../services/auth';
import ErrorBoundary from '../components/ErrorBoundary';

interface Case {
  id: string;
  title: string;
  status: string;
  date: string;
  description?: string;
  clientName?: string;
  priority?: string;
  budget?: string;
  location?: string;
}

interface TimelineEntry {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  performedBy?: string;
  performedByRole?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

interface Evidence {
  id: string;
  title?: string;
  type: string;
  createdAt: string;
  uploadedBy?: string;
  uploadedByRole?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const CaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const response = await api.get(`/cases/${id}`);
        setCaseData(response.data);
      } catch (error) {
        console.error('Failed to fetch case details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCase();
    }
  }, [id]);

  useEffect(() => {
    if (tabValue === 0 && id) {
      fetchTimeline();
    } else if (tabValue === 1 && id) {
      fetchEvidences();
    }
  }, [tabValue, id]);

  const fetchTimeline = async () => {
    setTimelineLoading(true);
    try {
      const response = await api.get(`/cases/${id}/timeline`);
      setTimeline(response.data || []);
    } catch (error) {
      console.error('Failed to fetch timeline:', error);
      setTimeline([]);
    } finally {
      setTimelineLoading(false);
    }
  };

  const fetchEvidences = async () => {
    try {
      const response = await api.get(`/evidence?caseId=${id}`);
      setEvidences(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch evidences:', error);
      setEvidences([]);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getTimelineIcon = (action: string) => {
    if (action.includes('생성') || action.includes('시작')) return <InfoIcon />;
    if (action.includes('완료') || action.includes('제출'))
      return <CheckCircleIcon color="success" />;
    if (action.includes('업로드') || action.includes('추가')) return <AddIcon color="primary" />;
    if (action.includes('분석')) return <Psychology color="secondary" />;
    if (action.includes('오류') || action.includes('실패')) return <ErrorIcon color="error" />;
    if (action.includes('경고') || action.includes('주의')) return <WarningIcon color="warning" />;
    return <ScheduleIcon />;
  };

  const getTimelineColor = (action: string) => {
    if (action.includes('완료') || action.includes('제출')) return 'success';
    if (action.includes('분석')) return 'secondary';
    if (action.includes('오류') || action.includes('실패')) return 'error';
    if (action.includes('경고') || action.includes('주의')) return 'warning';
    return 'primary';
  };

  const formatTimelineDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      time: date.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    };
  };

  const addTimelineEntry = async (action: string, details: string) => {
    try {
      const user = authService.getCurrentUser();
      await api.post(`/cases/${id}/timeline`, {
        action,
        details,
        timestamp: new Date().toISOString(),
        performedBy: user?.id,
        performedByRole: user?.role,
      });
      // 타임라인 새로고침
      fetchTimeline();
    } catch (error) {
      console.error('Failed to add timeline entry:', error);
    }
  };

  const getEvidenceIcon = (type: string) => {
    switch (type) {
      case 'image':
        return '🖼️';
      case 'video':
        return '🎥';
      case 'audio':
        return '🎵';
      case 'document':
        return '📄';
      default:
        return '📎';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!caseData) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5">Case not found</Typography>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Back
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        목록으로 돌아가기
      </Button>

      <Paper
        elevation={0}
        sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2, mb: 3 }}
      >
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Chip
                label={caseData.status}
                color={caseData.status === '조사 중' ? 'primary' : 'default'}
                size="small"
              />
              <Typography variant="caption" color="text.secondary">
                ID: {caseData.id}
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              {caseData.title}
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(`/reports/new?caseId=${caseData.id}`)}
            data-testid={`report-create-button-${caseData.id}`}
          >
            보고서 작성
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="body1" paragraph>
              {caseData.description}
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Event fontSize="small" color="action" />
                <Typography variant="body2">{caseData.date}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person fontSize="small" color="action" />
                <Typography variant="body2">{caseData.clientName || '의뢰인 정보 없음'}</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <Assignment />
                  </ListItemIcon>
                  <ListItemText primary="우선순위" secondary={caseData.priority || '보통'} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Description />
                  </ListItemIcon>
                  <ListItemText primary="예산" secondary={caseData.budget || '미정'} />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="case tabs">
          <Tab label="타임라인" icon={<TimelineIcon />} iconPosition="start" />
          <Tab label="증거 자료" icon={<AttachFile />} iconPosition="start" />
          <Tab label="보안 채팅" icon={<Chat />} iconPosition="start" />
          <Tab label="AI 분석" icon={<Psychology />} iconPosition="start" />
          <Tab label="법률검토" icon={<Gavel />} iconPosition="start" />
        </Tabs>
      </Box>

      <CustomTabPanel value={tabValue} index={0}>
        {timelineLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : timeline.length === 0 ? (
          <Alert severity="info">
            아직 타임라인 기록이 없습니다. 사건 진행 상황이 여기에 표시됩니다.
          </Alert>
        ) : (
          <Timeline position="alternate">
            {timeline.map((entry, index) => {
              const formatted = formatTimelineDate(entry.timestamp);
              return (
                <TimelineItem key={entry.id || index}>
                  <TimelineOppositeContent sx={{ m: 'auto 0' }}>
                    <Typography variant="caption" display="block">
                      {formatted.date}
                    </Typography>
                    <Typography variant="caption" display="block">
                      {formatted.time}
                    </Typography>
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineConnector />
                    <TimelineDot color={getTimelineColor(entry.action)}>
                      {getTimelineIcon(entry.action)}
                    </TimelineDot>
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent sx={{ py: '12px', px: 2 }}>
                    <Card elevation={1}>
                      <CardContent sx={{ pb: '16px !important' }}>
                        <Typography variant="h6" component="div" gutterBottom>
                          {entry.action}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {entry.details}
                        </Typography>
                        {entry.performedByRole && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 24, height: 24 }}>
                              {entry.performedByRole === 'detective' ? '탐' : '의'}
                            </Avatar>
                            <Typography variant="caption" color="text.secondary">
                              {entry.performedByRole === 'detective' ? '탐정' : '의뢰인'} 수행
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </TimelineContent>
                </TimelineItem>
              );
            })}
          </Timeline>
        )}
      </CustomTabPanel>

      <CustomTabPanel value={tabValue} index={1}>
        {evidences.length === 0 ? (
          <Alert severity="info">아직 등록된 증거 자료가 없습니다.</Alert>
        ) : (
          <Grid container spacing={2}>
            {evidences.map((evidence) => (
              <Grid item xs={12} sm={6} md={4} key={evidence.id}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="h2">{getEvidenceIcon(evidence.type)}</Typography>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          {evidence.title || `증거 ${evidence.id}`}
                        </Typography>
                        <Chip
                          label={evidence.type}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      등록일: {new Date(evidence.createdAt).toLocaleString('ko-KR')}
                    </Typography>
                    {evidence.uploadedByRole && (
                      <Typography variant="body2" color="text.secondary">
                        업로더: {evidence.uploadedByRole === 'client' ? '의뢰인' : '탐정'}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() =>
                          navigate(
                            `/ai-analysis?evidenceId=${evidence.id}&caseId=${id}&type=${evidence.type}`
                          )
                        }
                      >
                        AI 분석
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </CustomTabPanel>

      <CustomTabPanel value={tabValue} index={2}>
        {id && (
          <ErrorBoundary>
            <SecureChat
              caseId={id}
              currentUserId={authService.getCurrentUser()?.id || ''}
              currentUserRole={(authService.getCurrentUser()?.role as any) || 'client'}
            />
          </ErrorBoundary>
        )}
      </CustomTabPanel>

      <CustomTabPanel value={tabValue} index={3}>
        {id && (
          <ErrorBoundary>
            <AIAnalysis
              caseId={id}
              evidenceId="evidence_001"
              evidenceType="image"
              evidenceUrl="https://example.com/evidence.jpg"
            />
          </ErrorBoundary>
        )}
      </CustomTabPanel>

      <CustomTabPanel value={tabValue} index={4}>
        {id && (
          <ErrorBoundary>
            <LegalReview caseId={id} />
          </ErrorBoundary>
        )}
      </CustomTabPanel>
    </Box>
  );
};

export default CaseDetail;
