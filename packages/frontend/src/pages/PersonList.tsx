import React from 'react';
import {
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Avatar,
  ListItemAvatar,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

const PersonList: React.FC = () => {
  const mockPersons = [
    { id: 1, name: '김철수', role: '피의자', caseId: '1' },
    { id: 2, name: '박민지', role: '목격자', caseId: '1' },
    { id: 3, name: '이영호', role: '의뢰인', caseId: '2' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        인물 목록
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        사건 관련 인물 정보
      </Typography>
      <Paper>
        <List>
          {mockPersons.map((person) => (
            <ListItem key={person.id}>
              <ListItemAvatar>
                <Avatar>
                  <PersonIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={person.name}
                secondary={`${person.role} • 사건 #${person.caseId}`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default PersonList;
