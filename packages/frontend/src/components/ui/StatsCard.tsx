import React from 'react';
import { Paper, Box, Typography, Avatar } from '@mui/material';

interface StatsCardProps {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, icon }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Box>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h4" fontWeight={700}>
          {value}
        </Typography>
      </Box>
      <Avatar sx={{ bgcolor: 'action.hover' }}>{icon}</Avatar>
    </Paper>
  );
};

export default StatsCard;
