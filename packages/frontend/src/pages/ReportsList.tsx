import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, List, ListItemButton, ListItemText, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const ReportsList: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const fetchReports = async () => {
      try {
        const res = await api.get('/reports');
        if (!mounted) return;
        setReports(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.warn('Failed to fetch reports', e);
      }
    };
    fetchReports();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        보고서 목록
      </Typography>
      <Paper>
        <List>
          {reports.map((r) => (
            <ListItemButton key={r.id} onClick={() => navigate(`/reports/${r.id}`)}>
              <ListItemText
                primary={r.title || `보고서 ${r.id}`}
                secondary={`사건: ${r.caseId || '-'} · 상태: ${r.status || '-'}`}
              />
            </ListItemButton>
          ))}
        </List>
      </Paper>
      <Box sx={{ mt: 2 }}>
        <Button variant="contained" onClick={() => navigate('/reports/new')}>
          새 보고서 작성
        </Button>
      </Box>
    </Box>
  );
};

export default ReportsList;
