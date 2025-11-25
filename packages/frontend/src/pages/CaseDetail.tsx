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
} from '@mui/material';
import {
  ArrowBack,
  Person,
  Event,
  Description,
  Assignment,
  Timeline,
  Chat,
  AttachFile,
  Psychology,
} from '@mui/icons-material';
import api from '../services/api';
import SecureChat from '../components/SecureChat';
import AIAnalysis from '../components/AIAnalysis';
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
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
          <Tab label="타임라인" icon={<Timeline />} iconPosition="start" />
          <Tab label="증거 자료" icon={<AttachFile />} iconPosition="start" />
          <Tab label="보안 채팅" icon={<Chat />} iconPosition="start" />
          <Tab label="AI 분석" icon={<Psychology />} iconPosition="start" />
        </Tabs>
      </Box>

      <CustomTabPanel value={tabValue} index={0}>
        <Typography color="text.secondary">사건 진행 타임라인이 여기에 표시됩니다.</Typography>
      </CustomTabPanel>
      <CustomTabPanel value={tabValue} index={1}>
        <Typography color="text.secondary">수집된 증거 자료 목록이 여기에 표시됩니다.</Typography>
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
    </Box>
  );
};

export default CaseDetail;
