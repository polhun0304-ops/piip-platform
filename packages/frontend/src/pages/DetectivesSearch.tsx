import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Grid,
  Chip,
  Rating,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface Detective {
  id: string;
  name: string;
  email: string;
  phone: string;
  region: string;
  city: string;
  specialties: string[];
  experienceYears: number;
  status: string;
  averageRating: number;
  completedCases: number;
  successRate: number;
}

const DetectivesSearch: React.FC = () => {
  const navigate = useNavigate();
  const [detectives, setDetectives] = useState<Detective[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    specialty: '',
    region: '',
    minRating: '',
  });

  const searchDetectives = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.specialty) params.append('specialty', filters.specialty);
      if (filters.region) params.append('region', filters.region);
      if (filters.minRating) params.append('minRating', filters.minRating);

      const res = await api.get(`/detectives?${params.toString()}`);
      setDetectives(res.data || []);
    } catch (e) {
      console.error('Failed to search detectives', e);
      alert('탐정 검색 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchDetectives();
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        탐정 검색/매칭
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>전문 분야</InputLabel>
          <Select
            value={filters.specialty}
            label="전문 분야"
            onChange={(e) => setFilters({ ...filters, specialty: e.target.value })}
          >
            <MenuItem value="">전체</MenuItem>
            <MenuItem value="불륜조사">불륜조사</MenuItem>
            <MenuItem value="소재파악">소재파악</MenuItem>
            <MenuItem value="신원조사">신원조사</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>지역</InputLabel>
          <Select
            value={filters.region}
            label="지역"
            onChange={(e) => setFilters({ ...filters, region: e.target.value })}
          >
            <MenuItem value="">전체</MenuItem>
            <MenuItem value="서울">서울</MenuItem>
            <MenuItem value="경기">경기</MenuItem>
            <MenuItem value="부산">부산</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="최소 평점"
          type="number"
          value={filters.minRating}
          onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
          inputProps={{ min: 0, max: 5, step: 0.1 }}
        />

        <Button variant="contained" onClick={searchDetectives} disabled={loading}>
          검색
        </Button>
      </Box>

      <Grid container spacing={2}>
        {detectives.map((detective) => (
          <Grid item xs={12} md={6} lg={4} key={detective.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{detective.name}</Typography>
                <Typography color="text.secondary" gutterBottom>
                  {detective.region} {detective.city}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Rating value={detective.averageRating} readOnly precision={0.1} />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    ({detective.averageRating.toFixed(1)})
                  </Typography>
                </Box>

                <Typography variant="body2" gutterBottom>
                  경력: {detective.experienceYears}년 · 완료 사건: {detective.completedCases}건
                </Typography>
                <Typography variant="body2" gutterBottom>
                  성공률: {(detective.successRate * 100).toFixed(1)}%
                </Typography>

                <Box sx={{ mt: 1 }}>
                  {detective.specialties.map((spec) => (
                    <Chip key={spec} label={spec} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                  ))}
                </Box>

                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Button size="small" variant="outlined">
                    프로필 보기
                  </Button>
                  <Button size="small" variant="contained">
                    의뢰하기
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {detectives.length === 0 && !loading && (
        <Typography color="text.secondary" sx={{ mt: 3 }}>
          검색 결과가 없습니다.
        </Typography>
      )}

      <Button sx={{ mt: 2 }} variant="outlined" onClick={() => navigate('/detective-dashboard')}>
        내 탐정 대시보드 보기
      </Button>
    </Box>
  );
};

export default DetectivesSearch;
