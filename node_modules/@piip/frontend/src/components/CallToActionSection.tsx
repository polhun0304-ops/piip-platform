import React from 'react';
import { Box, Button, Container, Grid, Typography } from '@mui/material';

const CallToActionSection: React.FC = () => {
  return (
    <Box
      sx={{
        backgroundColor: '#FFF9C4', // Changed to a lighter yellow tone
        py: 1, // Reduced padding to match top and bottom spacing
        px: 2,
        textAlign: 'center',
      }}
    >
      <Container maxWidth="md">
        <Typography variant="h4" component="h2" gutterBottom>
          지금 바로 시작하세요
        </Typography>
        <Typography variant="body1" gutterBottom>
          전문가와의 무료 상담으로 문제 해결의 첫걸음을 내딛으세요
        </Typography>
        <Grid container spacing={2} justifyContent="center" sx={{ mt: 3 }}>
          <Grid item>
            <Button variant="contained" color="primary" size="large">
              무료 상담 신청
            </Button>
          </Grid>
          <Grid item>
            <Button variant="outlined" color="primary" size="large">
              서비스 둘러보기
            </Button>
          </Grid>
        </Grid>
        <Grid container spacing={2} justifyContent="center" sx={{ mt: 3 }}>
          <Grid item>
            <Typography variant="body2">24시간 상담 가능</Typography>
          </Grid>
          <Grid item>
            <Typography variant="body2">첫 상담 무료</Typography>
          </Grid>
          <Grid item>
            <Typography variant="body2">100% 기밀 보장</Typography>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default CallToActionSection;
