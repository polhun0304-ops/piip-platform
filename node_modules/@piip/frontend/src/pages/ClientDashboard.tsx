import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  CircularProgress,
  Container,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Add as AddIcon, Assignment as AssignmentIcon } from '@mui/icons-material';

interface Case {
  id: string;
  title: string;
  description: string;
  status: string;
  date: string;
}

const ClientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const response = await api.get<Case[]>('/cases');
        setCases(response.data);
      } catch (err) {
        console.error('Failed to fetch cases', err);
        setError('사건 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case '대기':
        return 'warning';
      case '조사 중':
        return 'info';
      case '종료':
        return 'success';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: '#ffebee' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}
      <Grid container spacing={3}>
        {/* Welcome Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h4" gutterBottom component="div">
              의뢰인 대시보드
            </Typography>
            <Typography variant="body1" color="text.secondary">
              진행 중인 사건과 상담 내역을 확인하세요.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/case-create')}
                sx={{ mr: 1 }}
              >
                새 의뢰 요청
              </Button>
              <Button
                variant="outlined"
                startIcon={<AssignmentIcon />}
                onClick={() => navigate('/consultation')}
              >
                상담 예약
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Cases List */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom component="div" sx={{ p: 1 }}>
              나의 사건 목록
            </Typography>
            <Divider />
            {cases.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">등록된 사건이 없습니다.</Typography>
              </Box>
            ) : (
              <List>
                {cases.map((c) => (
                  <React.Fragment key={c.id}>
                    <ListItem
                      button
                      onClick={() => navigate(`/cases/${c.id}`)}
                      secondaryAction={
                        <Chip
                          label={c.status}
                          color={getStatusColor(c.status) as any}
                          size="small"
                        />
                      }
                    >
                      <ListItemText
                        primary={c.title}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              {c.date}
                            </Typography>
                            {' — ' +
                              (c.description?.substring(0, 50) || '') +
                              (c.description?.length > 50 ? '...' : '')}
                          </>
                        }
                      />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ClientDashboard;
