import React, { useState, useRef } from 'react';
import { Box, Typography, TextField, Button, FormControl, FormLabel, Input } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { authService } from '../services/auth';

const EvidenceCreate: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const caseId = params.get('caseId') || '';

  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!file) {
      alert('파일을 선택해주세요');
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('title', title);
      fd.append('caseId', caseId);
      await api.post('/evidence', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      // After successful upload, try to trigger AI analysis to generate a draft report
      // First, fetch the latest evidence for the case (best-effort) or rely on response from upload API
      try {
        // Attempt to find the uploaded evidence via backend API
        const listRes = await api.get(`/evidence?caseId=${encodeURIComponent(caseId)}`);
        const items = Array.isArray(listRes.data) ? listRes.data : [];
        const latest = items.length ? items[items.length - 1] : null;
        if (latest) {
          // Call AI analyze on the uploaded evidence
          try {
            const aiRes = await api.post('/ai/analyze-evidence', {
              evidenceId: latest.id || latest._id,
              evidenceType: latest.type || 'unknown',
              evidenceUrl: latest.url || latest.path,
              caseId,
            });
            const analysis = aiRes.data?.results || aiRes.data;
            // Navigate to report create with AI analysis prefilled
            navigate(`/reports/new?caseId=${caseId}`, { state: { aiAnalysis: analysis } });
            return;
          } catch (aiErr) {
            console.warn('AI 분석 호출 실패', aiErr);
            // fallthrough to navigate to case
          }
        }
      } catch (listErr) {
        console.warn('증거 목록 조회 실패', listErr);
      }

      // Fallback: navigate to case detail
      navigate(`/cases/${caseId}`);
    } catch (e) {
      console.error('Failed to upload evidence', e);
      alert('증거 업로드 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        증거 업로드
      </Typography>
      <TextField
        fullWidth
        label="제목"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        sx={{ mb: 2 }}
      />
      <FormControl fullWidth sx={{ mb: 2 }}>
        <FormLabel htmlFor="evidence-file-input">파일</FormLabel>
        <Input
          id="evidence-file-input"
          inputProps={{ 'data-testid': 'evidence-file-input' }}
          type="file"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFile(e.target.files ? e.target.files[0] : null)
          }
        />
      </FormControl>
      <Box>
        <Button
          variant="contained"
          onClick={submit}
          disabled={loading}
          data-testid="evidence-submit"
        >
          {loading ? '업로드 중...' : '업로드'}
        </Button>
        <Button sx={{ ml: 2 }} onClick={() => navigate(-1)}>
          취소
        </Button>
      </Box>
    </Box>
  );
};

export default EvidenceCreate;
