import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { List, ListItemText, Typography, Box, Paper, Chip, ListItemButton } from '@mui/material';
import api from '../services/api';
import { RootState } from '../store';

const CaseList: React.FC = () => {
  const cases = useSelector((state: RootState) => state.cases.items);
  const navigate = useNavigate();
  const location = useLocation();
  const message = location.state?.message;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'error';
      case 'in_progress':
        return 'warning';
      case 'closed':
        return 'success';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      {message && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: '#e0f7fa' }} elevation={2}>
          <Typography color="primary" fontWeight={600}>
            {message}
          </Typography>
        </Paper>
      )}
      <Typography variant="h4" gutterBottom>
        사건 목록
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        총 {cases.length}건의 사건이 있습니다
      </Typography>
      <Paper>
        <List>
          {cases.map((c) => (
            <ListItemButton
              key={c.id}
              onClick={async () => {
                try {
                  await api.get(`/cases/${c.id}`);
                  navigate(`/cases/${c.id}`);
                } catch (err) {
                  console.error('Failed to open case', err);
                  alert('사건 상세를 불러오는 중 오류가 발생했습니다. 잠시 후 시도해주세요.');
                }
              }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body1">{c.title}</Typography>
                    <Chip label={c.status} color={getStatusColor(c.status)} size="small" />
                    <Chip
                      label={c.priority}
                      color={getPriorityColor(c.priority)}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                }
                secondary={`사건 ID: ${c.id}`}
              />
            </ListItemButton>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default CaseList;
