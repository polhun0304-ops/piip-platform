import React from 'react';
import { Avatar, Typography, Box } from '@mui/material';

export type Role = 'client' | 'detective' | 'admin' | string;

export function roleLabel(role: Role) {
  switch (role) {
    case 'client':
      return '의뢰인';
    case 'detective':
      return '탐정';
    case 'admin':
      return '관리자';
    default:
      return '사용자';
  }
}

export function roleColor(role: Role) {
  switch (role) {
    case 'client':
      return '#2196f3';
    case 'detective':
      return '#4caf50';
    case 'admin':
      return '#ff9800';
    default:
      return '#9e9e9e';
  }
}

interface Props {
  role: Role;
  small?: boolean;
}

const RolePill: React.FC<Props> = ({ role, small = false }) => {
  const label = roleLabel(role);
  const color = roleColor(role);
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Avatar
        sx={{
          bgcolor: color,
          width: small ? 28 : 32,
          height: small ? 28 : 32,
          fontSize: small ? '0.75rem' : '0.875rem',
        }}
      >
        {label[0]}
      </Avatar>
      <Typography variant={small ? 'caption' : 'body2'} color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
};

export default RolePill;
