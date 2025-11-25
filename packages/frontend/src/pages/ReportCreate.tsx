import React, { useState } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

const ReportCreate: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const caseId = params.get('caseId') || '';
  const [title, setTitle] = useState(`보고서 - 사건 ${caseId}`);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      await api.post('/reports', { caseId, title, content });
      navigate('/reports');
    } catch (e) {
      console.error('Failed to create report', e);
      alert('보고서 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        보고서 작성
      </Typography>
      <TextField fullWidth label="제목" value={title} onChange={(e) => setTitle(e.target.value)} sx={{ mb: 2 }} />
      <TextField
        fullWidth
        multiline
        minRows={8}
        label="내용"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Box>
        <Button variant="contained" onClick={submit} disabled={loading}>
          {loading ? '작성 중...' : '작성/제출'}
        </Button>
        <Button sx={{ ml: 2 }} onClick={() => navigate(-1)}>
          취소
        </Button>
      </Box>
    </Box>
  );
};

export default ReportCreate;
