import React from 'react';
import { Box, Skeleton, Paper } from '@mui/material';

const CaseSkeleton: React.FC = () => (
  <Paper sx={{ p: 2, mb: 1 }}>
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      <Skeleton variant="circular" width={40} height={40} />
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="40%" />
      </Box>
      <Skeleton variant="rectangular" width={80} height={32} />
    </Box>
  </Paper>
);

export default CaseSkeleton;
