import React, { useState } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const CaseRequest: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');

  const submit = () => {
    // Navigate to payment page with request data in state
    navigate('/payment', { state: { requestData: { title, description, budget } } });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        사건 의뢰하기
      </Typography>
      <TextField
        fullWidth
        label="사건 제목"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        multiline
        minRows={4}
        label="사건 설명"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="예산(원)"
        value={budget}
        onChange={(e) => setBudget(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Box>
        <Button variant="contained" onClick={submit} disabled={!title || !description}>
          결제 및 의뢰 진행
        </Button>
      </Box>
    </Box>
  );
};

export default CaseRequest;
