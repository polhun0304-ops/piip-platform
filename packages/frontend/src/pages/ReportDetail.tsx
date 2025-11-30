import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const ReportDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/reports/${id}`);
        setReport(res.data);
      } catch (e) {
        console.warn('Failed to fetch report', e);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetch();
  }, [id]);

  if (loading) return <CircularProgress />;
  if (!report)
    return (
      <Box>
        <Typography>보고서를 찾을 수 없습니다.</Typography>
        <Button onClick={() => navigate(-1)}>뒤로</Button>
      </Box>
    );

  return (
    <Box>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h5">{report.title || `보고서 ${report.id}`}</Typography>
        <Typography color="text.secondary">사건: {report.caseId}</Typography>
        <Box sx={{ mt: 2 }}>
          <Typography>{report.content}</Typography>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            onClick={() => {
              const link = document.createElement('a');
              link.href = `${api.defaults.baseURL}/reports/${id}/download`;
              link.download = `report-${id}.html`;
              link.click();
            }}
          >
            다운로드
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ReportDetail;
