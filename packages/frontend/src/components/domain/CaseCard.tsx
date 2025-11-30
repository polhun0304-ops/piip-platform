import React from 'react';
import { Card, CardContent, CardHeader, Stack } from '@mui/material';
import StatusBadge from './StatusBadge';
import SecurityLevel from './SecurityLevel';

export interface CaseCardProps {
  id: string;
  title: string;
  status: 'open' | 'in_progress' | 'closed';
  security: '일반' | '기밀' | '대외비' | '최고기밀';
}

export const CaseCard: React.FC<CaseCardProps> = ({ id, title, status, security }) => {
  return (
    <Card variant="outlined">
      <CardHeader title={title} subheader={id} />
      <CardContent>
        <Stack direction="row" spacing={1}>
          <StatusBadge status={status} />
          <SecurityLevel level={security} />
        </Stack>
      </CardContent>
    </Card>
  );
};

export default CaseCard;
