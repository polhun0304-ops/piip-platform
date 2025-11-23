import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Grid,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  useTheme,
  Card,
  CardContent,
} from '@mui/material';
import {
  Psychology as PsychologyIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  Analytics as AnalyticsIcon,
  Timeline as TimelineIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import api from '../services/api';

interface AIAnalysisProps {
  caseId: string;
  evidenceId?: string;
  evidenceType?: string;
  evidenceUrl?: string;
}

interface AnalysisResult {
  confidence: number;
  categories: Array<{ name: string; score: number; details: string }>;
  detectedPatterns: string[];
  riskAssessment: {
    level: string;
    score: number;
    factors: string[];
  };
  recommendations: string[];
}

const AIAnalysis: React.FC<AIAnalysisProps> = ({ evidenceId, evidenceType, evidenceUrl }) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/ai/analyze-evidence', {
        evidenceId,
        evidenceType,
        evidenceUrl,
        caseType: 'general',
      });
      setAnalysis(response.data.results);
    } catch (err) {
      console.error('AI analysis failed:', err);
      setError('AI 분석 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level.toUpperCase()) {
      case 'LOW':
        return 'success';
      case 'MEDIUM':
        return 'warning';
      case 'HIGH':
        return 'error';
      default:
        return 'default';
    }
  };

  const getRiskLabel = (level: string) => {
    switch (level.toUpperCase()) {
      case 'LOW':
        return '낮음';
      case 'MEDIUM':
        return '중간';
      case 'HIGH':
        return '높음';
      default:
        return level;
    }
  };

  return (
    <Box>
      <Paper elevation={0} sx={{ p: 3, mb: 3, border: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <PsychologyIcon color="primary" sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h5" fontWeight={700}>
              AI 증거 분석
            </Typography>
            <Typography variant="body2" color="text.secondary">
              인공지능 기반 증거 자료 분석 및 패턴 인식
            </Typography>
          </Box>
        </Box>

        {!analysis && !loading && (
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<AnalyticsIcon />}
            onClick={runAnalysis}
            fullWidth
          >
            AI 분석 시작
          </Button>
        )}

        {loading && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress size={60} />
            <Typography variant="body1" sx={{ mt: 2 }} color="text.secondary">
              AI가 증거를 분석하고 있습니다...
            </Typography>
            <LinearProgress sx={{ mt: 2 }} />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>

      {analysis && !loading && (
        <>
          {/* 신뢰도 및 종합 점수 */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <SecurityIcon color="primary" />
                    <Typography variant="h6" fontWeight={600}>
                      분석 신뢰도
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={analysis.confidence * 100}
                        sx={{ height: 10, borderRadius: 5 }}
                      />
                    </Box>
                    <Typography variant="h4" fontWeight={700} color="primary.main">
                      {(analysis.confidence * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <SpeedIcon color="error" />
                    <Typography variant="h6" fontWeight={600}>
                      리스크 수준
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip
                      label={getRiskLabel(analysis.riskAssessment.level)}
                      color={getRiskColor(analysis.riskAssessment.level) as any}
                      sx={{ fontSize: '1rem', fontWeight: 600, px: 2 }}
                    />
                    <Typography variant="h4" fontWeight={700}>
                      {analysis.riskAssessment.score}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* 카테고리별 분석 */}
          <Paper elevation={0} sx={{ p: 3, mb: 3, border: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              <TrendingUpIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              카테고리별 분석
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {analysis.categories.map((cat, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1" fontWeight={600}>
                        {cat.name}
                      </Typography>
                      <Typography variant="body1" color="primary.main" fontWeight={700}>
                        {(cat.score * 100).toFixed(0)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={cat.score * 100}
                      sx={{ mb: 1, height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {cat.details}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* 감지된 패턴 */}
          <Paper elevation={0} sx={{ p: 3, mb: 3, border: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              <TimelineIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              감지된 패턴
            </Typography>
            <List>
              {analysis.detectedPatterns.map((pattern, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText primary={pattern} />
                </ListItem>
              ))}
            </List>
          </Paper>

          {/* 리스크 요인 */}
          <Paper elevation={0} sx={{ p: 3, mb: 3, border: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              <WarningIcon sx={{ verticalAlign: 'middle', mr: 1 }} color="warning" />
              리스크 요인
            </Typography>
            <List>
              {analysis.riskAssessment.factors.map((factor, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <WarningIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText primary={factor} />
                </ListItem>
              ))}
            </List>
          </Paper>

          {/* 권장 사항 */}
          <Paper elevation={0} sx={{ p: 3, border: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              <CheckCircleIcon sx={{ verticalAlign: 'middle', mr: 1 }} color="primary" />
              AI 권장 사항
            </Typography>
            <List>
              {analysis.recommendations.map((rec, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={rec} primaryTypographyProps={{ fontWeight: 500 }} />
                  </ListItem>
                  {index < analysis.recommendations.length - 1 && (
                    <Divider variant="inset" component="li" />
                  )}
                </React.Fragment>
              ))}
            </List>
          </Paper>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button variant="outlined" onClick={runAnalysis} disabled={loading}>
              재분석
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default AIAnalysis;
