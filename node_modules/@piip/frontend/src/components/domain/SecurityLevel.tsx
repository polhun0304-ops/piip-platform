import React from 'react';
import { Chip } from '@mui/material';

export type SecurityLevelType = '일반' | '기밀' | '대외비' | '최고기밀';

const colorMap: Record<SecurityLevelType, 'default' | 'primary' | 'secondary' | 'info' | 'error'> =
  {
    일반: 'default',
    기밀: 'info',
    대외비: 'primary',
    최고기밀: 'secondary',
  };

export const SecurityLevel: React.FC<{ level: SecurityLevelType; size?: 'small' | 'medium' }> = ({
  level,
  size = 'small',
}) => {
  return <Chip size={size} color={colorMap[level]} label={level} />;
};

export default SecurityLevel;
