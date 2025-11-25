import React from 'react';
import { Typography, Box, Grid, Card, CardContent, CardMedia, ButtonBase } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ImageIcon from '@mui/icons-material/Image';
import DescriptionIcon from '@mui/icons-material/Description';
import VideocamIcon from '@mui/icons-material/Videocam';

const EvidenceList: React.FC = () => {
  const mockEvidence = [
    { id: 1, type: 'image', title: '현장 사진 1', caseId: '1', date: '2024-11-01' },
    { id: 2, type: 'document', title: '진술서', caseId: '1', date: '2024-11-02' },
    { id: 3, type: 'video', title: 'CCTV 영상', caseId: '2', date: '2024-11-03' },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon fontSize="large" />;
      case 'document':
        return <DescriptionIcon fontSize="large" />;
      case 'video':
        return <VideocamIcon fontSize="large" />;
      default:
        return <DescriptionIcon fontSize="large" />;
    }
  };

  const navigate = useNavigate();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        증거 목록
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        총 {mockEvidence.length}개의 증거가 등록되었습니다
      </Typography>
      <Grid container spacing={2}>
        {mockEvidence.map((evidence) => (
          <Grid item xs={12} sm={6} md={4} key={evidence.id}>
            <ButtonBase
              onClick={() => navigate(`/cases/${evidence.caseId}`)}
              sx={{ display: 'block', width: '100%', textAlign: 'left', borderRadius: 1 }}
            >
              <Card sx={{ width: '100%' }}>
                <CardMedia
                  sx={{ display: 'flex', justifyContent: 'center', p: 2, bgcolor: '#f5f5f5' }}
                >
                  {getIcon(evidence.type)}
                </CardMedia>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {evidence.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    유형: {evidence.type}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    사건 ID: {evidence.caseId}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    등록일: {evidence.date}
                  </Typography>
                </CardContent>
              </Card>
            </ButtonBase>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default EvidenceList;
