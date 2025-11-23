import React, { useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { User } from '../services/auth';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('piip_user');
    if (!userStr) {
      navigate('/');
      return;
    }

    try {
      const user: User = JSON.parse(userStr);
      if (user.role === 'admin') {
        navigate('/admin-dashboard');
      } else if (user.role === 'detective') {
        navigate('/detective-dashboard');
      } else {
        // Client or others
        navigate('/client-dashboard');
      }
    } catch (e) {
      console.error('Failed to parse user info', e);
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  if (loading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return null;
};

export default Dashboard;
