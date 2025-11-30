import React from 'react';
import {
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Box,
  Typography,
} from '@mui/material';
import { Folder } from '@mui/icons-material';

interface CaseItemProps {
  id: string;
  title: string;
  date?: string;
  description?: string;
  status?: string;
  onClick?: (id: string) => void;
}

const CaseItem: React.FC<CaseItemProps> = ({ id, title, date, description, status, onClick }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(id);
    }
  };

  return (
    <ListItem
      button
      onClick={() => onClick?.(id)}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`사건 ${title} 보기`}
      sx={{ '&:hover': { bgcolor: 'action.hover' } }}
    >
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: status === '조사 중' ? 'primary.main' : 'grey.400' }}>
          <Folder />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" fontWeight={600}>
              {title}
            </Typography>
            {status && (
              <Chip
                label={status}
                size="small"
                color={status === '조사 중' ? 'primary' : 'default'}
                variant="outlined"
              />
            )}
          </Box>
        }
        secondary={
          <>
            {date ? (
              <Typography component="span" variant="body2" color="text.primary">
                {date}
              </Typography>
            ) : null}
            {' — '}
            {description}
          </>
        }
      />
    </ListItem>
  );
};

export default CaseItem;
