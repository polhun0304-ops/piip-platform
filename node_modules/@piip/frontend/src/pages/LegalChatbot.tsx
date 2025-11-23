import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Paper,
  List,
  ListItem,
  Avatar,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  alpha,
  useTheme,
  IconButton,
  Grid,
} from '@mui/material';
import {
  Gavel,
  Send,
  SmartToy,
  Person,
  Description,
  Article,
  AttachFile,
  CheckCircle,
  Close,
} from '@mui/icons-material';

interface Message {
  id: string;
  type: 'user' | 'ai' | 'lawyer';
  content: string;
  timestamp: string;
  confidence?: number;
  references?: string[];
}

const LegalChatbot: React.FC = () => {
  const theme = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content:
        '안녕하세요. PIIP 법률 자문 AI입니다. 증거의 법적 효력, 조사 방법의 적법성 등에 대해 질문해주세요.',
      timestamp: '10:00',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showReview, setShowReview] = useState(false);

  // 샘플 제안 질문
  const suggestedQuestions = [
    '이 증거는 법정에서 유효합니까?',
    '촬영 허가 없이 녹음한 파일이 인정되나요?',
    'CCTV 영상의 법적 증거 요건은?',
    '사생활 침해 없이 조사하는 방법은?',
  ];

  // 샘플 법조문 데이터
  const legalReferences = [
    {
      title: '형사소송법 제308조의2',
      content: '증거의 증명력은 법관의 자유판단에 의한다.',
      relevance: 95,
    },
    {
      title: '통신비밀보호법 제3조',
      content: '공개되지 아니한 타인간의 대화를 녹음 또는 청취하지 못한다.',
      relevance: 88,
    },
    {
      title: '개인정보보호법 제15조',
      content: '정보주체의 동의를 받은 경우 개인정보를 수집할 수 있다.',
      relevance: 82,
    },
  ];

  // 샘플 판례 데이터
  const caseLaws = [
    {
      title: '대법원 2020도12345',
      summary: '녹음 파일의 증거능력 인정 요건',
      date: '2020.05.15',
      relevance: 92,
    },
    {
      title: '대법원 2019도23456',
      summary: 'CCTV 영상의 증거 적격성',
      date: '2019.11.20',
      relevance: 87,
    },
  ];

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setMessages([...messages, newMessage]);
    setInput('');
    setIsTyping(true);

    // AI 응답 시뮬레이션
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content:
          '녹음 파일의 증거 능력은 통신비밀보호법에 따라 판단됩니다. 본인이 대화 당사자인 경우 상대방 동의 없이 녹음한 내용도 증거로 사용 가능합니다. 다만, 제3자 간 대화를 무단 녹음한 경우는 불법이며 증거능력이 부정됩니다.\n\n더 정확한 법률 검토가 필요하시면 변호사 검토를 요청하세요.',
        timestamp: new Date().toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        confidence: 87,
        references: ['통신비밀보호법 제3조', '형사소송법 제308조의2'],
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 2000);
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };

  const handleLawyerReview = () => {
    setShowReview(true);
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              <Gavel sx={{ verticalAlign: 'middle', mr: 1, fontSize: 40 }} />
              법률자문 챗봇
            </Typography>
            <Typography variant="body1" color="text.secondary">
              AI 기반 법률 엔진으로 실시간 법률 자문을 받으세요
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Chip icon={<SmartToy />} label="AI 자문 활성화" color="primary" variant="outlined" />
            <Button variant="contained" startIcon={<Person />} onClick={handleLawyerReview}>
              변호사 검토 요청
            </Button>
          </Stack>
        </Stack>

        <Grid container spacing={3}>
          {/* Chat Area */}
          <Grid item xs={12} md={8}>
            <Card sx={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
              {/* Chat Messages */}
              <Box
                sx={{
                  flexGrow: 1,
                  overflow: 'auto',
                  p: 3,
                  bgcolor: alpha(theme.palette.grey[50], 0.5),
                }}
              >
                <List>
                  {messages.map((message) => (
                    <ListItem
                      key={message.id}
                      sx={{
                        flexDirection: 'column',
                        alignItems: message.type === 'user' ? 'flex-end' : 'flex-start',
                        mb: 2,
                      }}
                    >
                      <Stack
                        direction={message.type === 'user' ? 'row-reverse' : 'row'}
                        spacing={1.5}
                        alignItems="flex-start"
                        sx={{ maxWidth: '80%' }}
                      >
                        <Avatar
                          sx={{
                            bgcolor:
                              message.type === 'user'
                                ? theme.palette.primary.main
                                : message.type === 'ai'
                                  ? theme.palette.secondary.main
                                  : theme.palette.info.main,
                          }}
                        >
                          {message.type === 'user' ? (
                            <Person />
                          ) : message.type === 'ai' ? (
                            <SmartToy />
                          ) : (
                            <Gavel />
                          )}
                        </Avatar>

                        <Box sx={{ flexGrow: 1 }}>
                          <Paper
                            sx={{
                              p: 2,
                              bgcolor:
                                message.type === 'user'
                                  ? theme.palette.primary.main
                                  : message.type === 'ai'
                                    ? alpha(theme.palette.secondary.light, 0.1)
                                    : alpha(theme.palette.info.light, 0.1),
                              color: message.type === 'user' ? 'white' : theme.palette.text.primary,
                              border:
                                message.type !== 'user'
                                  ? `1px solid ${theme.palette.divider}`
                                  : 'none',
                            }}
                          >
                            <Typography
                              variant="body1"
                              sx={{
                                whiteSpace: 'pre-line',
                                color:
                                  message.type === 'user' ? 'white' : theme.palette.text.primary,
                              }}
                            >
                              {message.content}
                            </Typography>

                            {message.confidence && (
                              <Box mt={2}>
                                <Chip
                                  label={`AI 신뢰도 ${message.confidence}%`}
                                  size="small"
                                  color={message.confidence >= 90 ? 'success' : 'warning'}
                                  sx={{ mr: 1 }}
                                />
                              </Box>
                            )}

                            {message.references && message.references.length > 0 && (
                              <Box mt={2}>
                                <Typography
                                  variant="caption"
                                  fontWeight={600}
                                  display="block"
                                  mb={0.5}
                                >
                                  참고 법조문:
                                </Typography>
                                {message.references.map((ref, idx) => (
                                  <Chip
                                    key={idx}
                                    label={ref}
                                    size="small"
                                    variant="outlined"
                                    sx={{ mr: 0.5, mb: 0.5 }}
                                  />
                                ))}
                              </Box>
                            )}
                          </Paper>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ mt: 0.5, display: 'block' }}
                          >
                            {message.timestamp}
                          </Typography>
                        </Box>
                      </Stack>
                    </ListItem>
                  ))}

                  {isTyping && (
                    <ListItem sx={{ alignItems: 'flex-start' }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                          <SmartToy />
                        </Avatar>
                        <Paper sx={{ p: 2 }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <CircularProgress size={16} />
                            <Typography variant="body2" color="text.secondary">
                              AI가 답변을 작성중입니다...
                            </Typography>
                          </Stack>
                        </Paper>
                      </Stack>
                    </ListItem>
                  )}
                </List>
              </Box>

              {/* Suggested Questions */}
              {messages.length === 1 && (
                <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="caption" color="text.secondary" mb={1} display="block">
                    추천 질문:
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {suggestedQuestions.map((question, idx) => (
                      <Chip
                        key={idx}
                        label={question}
                        onClick={() => handleSuggestedQuestion(question)}
                        sx={{ mb: 1, cursor: 'pointer' }}
                      />
                    ))}
                  </Stack>
                </Box>
              )}

              {/* Input Area */}
              <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                <Stack direction="row" spacing={1}>
                  <IconButton>
                    <AttachFile />
                  </IconButton>
                  <TextField
                    fullWidth
                    placeholder="법률 질문을 입력하세요..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    multiline
                    maxRows={3}
                  />
                  <Button
                    variant="contained"
                    onClick={handleSend}
                    disabled={!input.trim()}
                    sx={{ minWidth: 100 }}
                  >
                    <Send />
                  </Button>
                </Stack>

                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 500, color: 'text.primary' }}>
                    ⚠️ AI 답변은 법적 참고용이며, 판결 근거로 사용할 수 없습니다. 정확한 법률 자문은
                    변호사 검토를 받으시길 권장합니다.
                  </Typography>
                </Alert>
              </Box>
            </Card>
          </Grid>

          {/* Side Panel */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              {/* Legal References */}
              <Card>
                <CardContent>
                  <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                    <Description color="primary" />
                    <Typography variant="h6" fontWeight={700}>
                      관련 법조문
                    </Typography>
                  </Stack>

                  <List dense>
                    {legalReferences.map((ref, idx) => (
                      <Paper
                        key={idx}
                        sx={{
                          p: 2,
                          mb: 1,
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                          },
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" mb={1}>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {ref.title}
                          </Typography>
                          <Chip label={`${ref.relevance}%`} size="small" color="primary" />
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          {ref.content}
                        </Typography>
                      </Paper>
                    ))}
                  </List>
                </CardContent>
              </Card>

              {/* Case Laws */}
              <Card>
                <CardContent>
                  <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                    <Article color="secondary" />
                    <Typography variant="h6" fontWeight={700}>
                      최근 판례
                    </Typography>
                  </Stack>

                  <List dense>
                    {caseLaws.map((caselaw, idx) => (
                      <Paper
                        key={idx}
                        sx={{
                          p: 2,
                          mb: 1,
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          '&:hover': {
                            bgcolor: alpha(theme.palette.secondary.main, 0.05),
                          },
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" mb={1}>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {caselaw.title}
                          </Typography>
                          <Chip label={`${caselaw.relevance}%`} size="small" color="secondary" />
                        </Stack>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          mb={0.5}
                        >
                          {caselaw.summary}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {caselaw.date}
                        </Typography>
                      </Paper>
                    ))}
                  </List>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} mb={2}>
                    빠른 실행
                  </Typography>
                  <Stack spacing={1}>
                    <Button variant="outlined" fullWidth startIcon={<Person />}>
                      변호사 상담 예약
                    </Button>
                    <Button variant="outlined" fullWidth startIcon={<Description />}>
                      법률 리포트 다운로드
                    </Button>
                    <Button variant="outlined" fullWidth startIcon={<CheckCircle />}>
                      이전 상담 기록
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>

        {/* Lawyer Review Dialog */}
        {showReview && (
          <Paper
            sx={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%',
              maxWidth: 500,
              p: 3,
              zIndex: 1300,
              boxShadow: theme.shadows[24],
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={700}>
                변호사 검토 요청
              </Typography>
              <IconButton onClick={() => setShowReview(false)}>
                <Close />
              </IconButton>
            </Stack>

            <Alert severity="info" sx={{ mb: 3 }}>
              대화 내용과 관련 자료가 변호사에게 전달됩니다
            </Alert>

            <Stack spacing={2}>
              <TextField fullWidth label="제목" placeholder="검토 요청 제목" />
              <TextField
                fullWidth
                label="추가 요청사항"
                multiline
                rows={4}
                placeholder="구체적으로 검토받고 싶은 내용을 입력하세요"
              />

              <Box>
                <Typography variant="caption" color="text.secondary" mb={1} display="block">
                  예상 비용: 100,000원 - 300,000원
                </Typography>
                <Typography variant="caption" color="text.secondary" mb={1} display="block">
                  예상 소요시간: 1-2 영업일
                </Typography>
              </Box>

              <Stack direction="row" spacing={1}>
                <Button variant="outlined" fullWidth onClick={() => setShowReview(false)}>
                  취소
                </Button>
                <Button variant="contained" fullWidth>
                  검토 요청 (전자서명)
                </Button>
              </Stack>
            </Stack>
          </Paper>
        )}

        {showReview && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(0,0,0,0.5)',
              zIndex: 1299,
            }}
            onClick={() => setShowReview(false)}
          />
        )}
      </Container>
    </Box>
  );
};

export default LegalChatbot;
