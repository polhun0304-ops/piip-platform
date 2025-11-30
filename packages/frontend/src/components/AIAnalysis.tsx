import React, { useState, useEffect } from 'react';
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  ExpandMore as ExpandMoreIcon,
  VideoFile as VideoIcon,
  AudioFile as AudioIcon,
  Image as ImageIcon,
  Description as DocumentIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  VolumeUp as VolumeUpIcon,
  Assessment as AssessmentIcon,
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
  mediaAnalysis?: {
    duration?: number;
    transcript?: string;
    objects?: string[];
    faces?: Array<{ confidence: number; emotions: string[] }>;
    text?: string[];
    audioFeatures?: {
      language: string;
      speakers: number;
      sentiment: string;
    };
  };
  automatedReport?: {
    title: string;
    summary: string;
    findings: string[];
    conclusion: string;
  };
}

interface AnalysisStep {
  label: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  result?: any;
}

import { useNavigate } from 'react-router-dom';

const AIAnalysis: React.FC<AIAnalysisProps> = ({
  caseId,
  evidenceId,
  evidenceType,
  evidenceUrl,
}) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [analysisSteps, setAnalysisSteps] = useState<AnalysisStep[]>([]);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (evidenceType) {
      initializeAnalysisSteps();
    }
  }, [evidenceType]);

  const initializeAnalysisSteps = () => {
    const steps: AnalysisStep[] = [
      { label: '증거 자료 검증', status: 'pending' },
      { label: '기본 분석', status: 'pending' },
    ];

    switch (evidenceType?.toLowerCase()) {
      case 'video':
        steps.push(
          { label: '영상 프레임 분석', status: 'pending' },
          { label: '음성 추출 및 분석', status: 'pending' },
          { label: '객체 및 얼굴 인식', status: 'pending' }
        );
        break;
      case 'audio':
        steps.push(
          { label: '음성-텍스트 변환', status: 'pending' },
          { label: '화자 분리', status: 'pending' },
          { label: '감정 분석', status: 'pending' }
        );
        break;
      case 'image':
        steps.push(
          { label: '이미지 객체 인식', status: 'pending' },
          { label: '텍스트 추출 (OCR)', status: 'pending' },
          { label: '얼굴 및 특징 분석', status: 'pending' }
        );
        break;
      case 'document':
        steps.push(
          { label: '텍스트 추출', status: 'pending' },
          { label: '내용 분석', status: 'pending' },
          { label: '패턴 인식', status: 'pending' }
        );
        break;
    }

    steps.push(
      { label: '리스크 평가', status: 'pending' },
      { label: '보고서 자동 생성', status: 'pending' }
    );

    setAnalysisSteps(steps);
  };

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    setActiveStep(0);

    try {
      // 단계별 분석 실행
      for (let i = 0; i < analysisSteps.length; i++) {
        setActiveStep(i);
        setAnalysisSteps((prev) =>
          prev.map((step, index) => (index === i ? { ...step, status: 'processing' } : step))
        );

        // 각 단계별 분석 API 호출
        const stepResult = await runAnalysisStep(i);
        setAnalysisSteps((prev) =>
          prev.map((step, index) =>
            index === i ? { ...step, status: 'completed', result: stepResult } : step
          )
        );

        // 약간의 지연으로 진행상황 표시
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // 최종 분석 결과 가져오기
      const response = await api.post('/ai/analyze-evidence', {
        evidenceId,
        evidenceType,
        evidenceUrl,
        caseId,
        detailed: true,
      });

      setAnalysis(response.data.results);

      // 분석 결과를 증거보관센터에 저장
      await saveAnalysisToEvidenceRepository(response.data.results);
    } catch (err: any) {
      console.error('AI analysis failed:', err);
      setError('AI 분석 중 오류가 발생했습니다.');
      setAnalysisSteps((prev) =>
        prev.map((step, index) => (index === activeStep ? { ...step, status: 'error' } : step))
      );
    } finally {
      setLoading(false);
    }
  };

  const runAnalysisStep = async (stepIndex: number) => {
    const step = analysisSteps[stepIndex];

    switch (step.label) {
      case '증거 자료 검증':
        return await api.post('/ai/validate-evidence', { evidenceId, evidenceType, evidenceUrl });

      case '기본 분석':
        return await api.post('/ai/basic-analysis', { evidenceId, evidenceType });

      case '영상 프레임 분석':
        return await api.post('/ai/video-frame-analysis', { evidenceUrl });

      case '음성 추출 및 분석':
        return await api.post('/ai/audio-extraction', { evidenceUrl });

      case '객체 및 얼굴 인식':
        return await api.post('/ai/object-face-recognition', { evidenceUrl });

      case '음성-텍스트 변환':
        return await api.post('/ai/speech-to-text', { evidenceUrl });

      case '화자 분리':
        return await api.post('/ai/speaker-separation', { evidenceUrl });

      case '감정 분석':
        return await api.post('/ai/sentiment-analysis', { evidenceUrl });

      case '이미지 객체 인식':
        return await api.post('/ai/image-object-detection', { evidenceUrl });

      case '텍스트 추출 (OCR)':
        return await api.post('/ai/ocr-extraction', { evidenceUrl });

      case '얼굴 및 특징 분석':
        return await api.post('/ai/face-feature-analysis', { evidenceUrl });

      case '텍스트 추출':
        return await api.post('/ai/text-extraction', { evidenceUrl });

      case '내용 분석':
        return await api.post('/ai/content-analysis', { evidenceUrl });

      case '패턴 인식':
        return await api.post('/ai/pattern-recognition', { evidenceUrl });

      case '리스크 평가':
        return await api.post('/ai/risk-assessment', { evidenceId, caseId });

      case '보고서 자동 생성':
        return await api.post('/ai/generate-report', { evidenceId, caseId, analysis: analysis });

      default:
        return { status: 'completed' };
    }
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon color="success" />;
      case 'processing':
        return <CircularProgress size={20} />;
      case 'error':
        return <WarningIcon color="error" />;
      default:
        return <AnalyticsIcon />;
    }
  };

  const getEvidenceTypeIcon = () => {
    switch (evidenceType?.toLowerCase()) {
      case 'video':
        return <VideoIcon />;
      case 'audio':
        return <AudioIcon />;
      case 'image':
        return <ImageIcon />;
      case 'document':
        return <DocumentIcon />;
      default:
        return <AssessmentIcon />;
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
        return '알 수 없음';
    }
  };

  const saveAnalysisToEvidenceRepository = async (analysisResult: AnalysisResult) => {
    try {
      const analysisEvidence = {
        caseId,
        evidenceId: `ai_analysis_${evidenceId}_${Date.now()}`,
        type: 'ai_analysis',
        title: `AI 분석 결과 - ${evidenceType}`,
        content: {
          originalEvidenceId: evidenceId,
          originalEvidenceType: evidenceType,
          analysisResult,
          timestamp: new Date().toISOString(),
        },
        metadata: {
          confidence: analysisResult.confidence,
          riskLevel: analysisResult.riskAssessment.level,
          riskScore: analysisResult.riskAssessment.score,
          categories: analysisResult.categories.map((cat) => cat.name),
          detectedPatterns: analysisResult.detectedPatterns,
          recommendations: analysisResult.recommendations,
        },
        uploadedBy: 'ai_system',
        uploadedByRole: 'system',
      };

      await api.post('/evidence', analysisEvidence);

      // 타임라인에 AI 분석 완료 기록
      await api.post(`/cases/${caseId}/timeline`, {
        action: 'AI 분석 완료',
        details: `${evidenceType} 증거에 대한 AI 분석이 완료되어 증거보관센터에 저장되었습니다.`,
        timestamp: new Date().toISOString(),
        performedBy: 'ai_system',
        performedByRole: 'system',
      });
    } catch (error) {
      console.error('Failed to save analysis to evidence repository:', error);
      // 분석 결과 저장 실패는 사용자에게 알리지 않고 로그만 기록
    }
  };

  const renderAnalysisSteps = () => {
    if (analysisSteps.length === 0) return null;

    return (
      <Paper elevation={0} sx={{ p: 3, mb: 3, border: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="h6" gutterBottom>
          AI 분석 진행상황
        </Typography>
        <Stepper activeStep={activeStep} orientation="vertical">
          {analysisSteps.map((step, index) => (
            <Step key={index}>
              <StepLabel
                icon={getStepIcon(step.status)}
                sx={{
                  '& .MuiStepLabel-label': {
                    color: step.status === 'error' ? 'error.main' : 'text.primary',
                  },
                }}
              >
                {step.label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>
    );
  };

  const renderMediaAnalysis = () => {
    if (!analysis?.mediaAnalysis) return null;

    return (
      <Accordion sx={{ mb: 3 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">
            {getEvidenceTypeIcon()}
            <Box component="span" sx={{ ml: 1 }}>
              미디어 상세 분석
            </Box>
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          {analysis.mediaAnalysis.duration && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="textSecondary">
                재생 시간
              </Typography>
              <Typography>{Math.round(analysis.mediaAnalysis.duration)}초</Typography>
            </Box>
          )}

          {analysis.mediaAnalysis.transcript && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="textSecondary">
                음성 텍스트 변환
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.50', maxHeight: 200, overflow: 'auto' }}>
                <Typography variant="body2">{analysis.mediaAnalysis.transcript}</Typography>
              </Paper>
            </Box>
          )}

          {analysis.mediaAnalysis.objects && analysis.mediaAnalysis.objects.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="textSecondary">
                감지된 객체
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {analysis.mediaAnalysis.objects.map((obj, index) => (
                  <Chip key={index} label={obj} size="small" />
                ))}
              </Box>
            </Box>
          )}

          {analysis.mediaAnalysis.faces && analysis.mediaAnalysis.faces.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="textSecondary">
                얼굴 분석
              </Typography>
              {analysis.mediaAnalysis.faces.map((face, index) => (
                <Box key={index} sx={{ mb: 1 }}>
                  <Typography variant="caption">
                    신뢰도: {(face.confidence * 100).toFixed(1)}% | 감정: {face.emotions.join(', ')}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}

          {analysis.mediaAnalysis.audioFeatures && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="textSecondary">
                음성 특징
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="caption">
                    언어: {analysis.mediaAnalysis.audioFeatures.language}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption">
                    화자 수: {analysis.mediaAnalysis.audioFeatures.speakers}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption">
                    감정: {analysis.mediaAnalysis.audioFeatures.sentiment}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </AccordionDetails>
      </Accordion>
    );
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
            {evidenceType && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                {getEvidenceTypeIcon()}
                <Typography variant="body2" color="primary">
                  분석 유형: {evidenceType.toUpperCase()}
                </Typography>
              </Box>
            )}
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

        {loading && renderAnalysisSteps()}

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
          {renderMediaAnalysis()}

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
                  <ListItem key={index}>
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
            <Button
              variant="contained"
              color="primary"
              sx={{ ml: 2 }}
              onClick={() => setShowReportDialog(true)}
            >
              자동 보고서 생성
            </Button>
          </Box>
        </>
      )}

      {/* 자동 보고서 생성 다이얼로그 */}
      <Dialog
        open={showReportDialog}
        onClose={() => setShowReportDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>AI 자동 보고서 생성</DialogTitle>
        <DialogContent>
          {analysis?.automatedReport ? (
            <Box>
              <Typography variant="h6" gutterBottom>
                {analysis.automatedReport.title}
              </Typography>
              <Typography variant="body1" paragraph>
                {analysis.automatedReport.summary}
              </Typography>

              <Typography variant="h6" gutterBottom>
                주요 발견사항
              </Typography>
              <List>
                {analysis.automatedReport.findings.map((finding, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircleIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={finding} />
                  </ListItem>
                ))}
              </List>

              <Typography variant="h6" gutterBottom>
                결론
              </Typography>
              <Typography variant="body1">{analysis.automatedReport.conclusion}</Typography>
            </Box>
          ) : (
            <Typography>보고서 생성 중...</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowReportDialog(false)}>취소</Button>
          <Button
            variant="contained"
            onClick={() =>
              navigate(`/reports/new?caseId=${encodeURIComponent(caseId)}`, {
                state: { aiAnalysis: analysis, autoGenerateReport: true },
              })
            }
          >
            보고서 작성으로 이동
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AIAnalysis;
