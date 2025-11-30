import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { authService } from '../services/auth';

const EvidenceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [evidence, setEvidence] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/evidence/${id}`);
        setEvidence(res.data);
      } catch (e) {
        console.warn('Failed to fetch evidence', e);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetch();
  }, [id]);

  if (loading) return <CircularProgress />;
  const user = authService.getCurrentUser();

  // If client user, ensure the evidence belongs to the client's case
  if (!evidence)
    return (
      <Box>
        <Typography>증거를 찾을 수 없습니다.</Typography>
        <Button onClick={() => navigate(-1)}>뒤로</Button>
      </Box>
    );

  if (user?.role === 'client') {
    const caseOwnerId = evidence?.case?.clientUserId || evidence?.case?.clientId;
    if (caseOwnerId && caseOwnerId !== user.id) {
      return (
        <Box>
          <Typography>조회 권한이 없습니다.</Typography>
          <Button onClick={() => navigate(-1)}>뒤로</Button>
        </Box>
      );
    }
  }

  return (
    <Box>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h5">{evidence.title || `증거 ${evidence.id}`}</Typography>
        <Typography color="text.secondary">사건: {evidence.caseId}</Typography>
        <Box sx={{ mt: 2 }}>
          <Typography>
            파일:{' '}
            <a href={evidence.url} target="_blank" rel="noreferrer">
              열기
            </a>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default EvidenceDetail;
