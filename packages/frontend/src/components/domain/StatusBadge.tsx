import React from 'react';
import { Chip } from '@mui/material';

export type StatusKind =
  | 'open'
  | 'in_progress'
  | 'closed'
  | 'pending'
  | 'success'
  | 'warning'
  | 'error';

const colorMap: Record<
  StatusKind,
  'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
> = {
  open: 'primary',
  in_progress: 'info',
  closed: 'success',
  pending: 'warning',
  success: 'success',
  warning: 'warning',
  error: 'error',
};

export const StatusBadge: React.FC<{
  status: StatusKind;
  label?: string;
  size?: 'small' | 'medium';
}> = ({ status, label, size = 'small' }) => {
  return <Chip size={size} color={colorMap[status]} label={label ?? status} />;
};

export default StatusBadge;
