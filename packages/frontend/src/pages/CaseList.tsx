import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  List,
  ListItemText,
  Typography,
  Box,
  Paper,
  Chip,
  ListItemButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import api from '../services/api';
import { RootState } from '../store';
import { authService } from '../services/auth';

const CaseList: React.FC = () => {
  const cases = useSelector((state: RootState) => state.cases.items);
  const [filteredCases, setFilteredCases] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const message = location.state?.message;
  const user = authService.getCurrentUser();

  useEffect(() => {
    filterAndSortCases();
  }, [cases, searchTerm, sortBy, sortOrder, user]);

  const filterAndSortCases = () => {
    let filtered = [...cases];

    // 권한에 따른 필터링
    if (user?.role === 'client') {
      // 의뢰인은 자신이 의뢰한 사건만 볼 수 있음
      filtered = filtered.filter((c) => c.clientId && c.clientId === user.id);
    } else if (user?.role === 'detective') {
      // 탐정은 계약된 사건만 볼 수 있음 (계약이 없는 경우는 모두 볼 수 있음)
      filtered = filtered.filter((c) => {
        const hasContract = c.assignedDetectiveId && c.assignedDetectiveId === user.id;
        const isOpenForBidding = c.status === 'open' && !c.assignedDetectiveId;
        return hasContract || isOpenForBidding;
      });
    }

    // 검색 필터링
    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // 정렬
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'title':
          aValue = a.title || '';
          bValue = b.title || '';
          break;
        case 'status':
          aValue = a.status || '';
          bValue = b.status || '';
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          break;
        case 'createdAt':
        default:
          const aDate = a.createdAt || a.date || new Date().toISOString();
          const bDate = b.createdAt || b.date || new Date().toISOString();
          aValue = new Date(aDate);
          bValue = new Date(bDate);
          break;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredCases(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'error';
      case 'in_progress':
        return 'warning';
      case 'closed':
        return 'success';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const handleCaseClick = async (caseId: string) => {
    setLoading(true);
    try {
      await api.get(`/cases/${caseId}`);
      navigate(`/cases/${caseId}`);
    } catch (err) {
      console.error('Failed to open case', err);
      alert('사건 상세를 불러오는 중 오류가 발생했습니다. 잠시 후 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {message && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: '#e0f7fa' }} elevation={2}>
          <Typography color="primary" fontWeight={600}>
            {message}
          </Typography>
        </Paper>
      )}
      <Typography variant="h4" gutterBottom>
        사건 목록
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        총 {filteredCases.length}건의 사건이 있습니다
        {user?.role === 'client' && ' — 본인이 의뢰한 사건들만 표시됩니다.'}
        {user?.role === 'detective' && ' — 계약된 사건과 입찰 가능한 사건들만 표시됩니다.'}
      </Typography>

      {/* 검색 및 정렬 컨트롤 */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          label="검색"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 200 }}
        />

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>정렬 기준</InputLabel>
          <Select
            value={sortBy}
            label="정렬 기준"
            onChange={(e) => setSortBy(e.target.value)}
            startAdornment={<SortIcon sx={{ mr: 1 }} />}
          >
            <MenuItem value="createdAt">등록일자</MenuItem>
            <MenuItem value="title">제목</MenuItem>
            <MenuItem value="status">상태</MenuItem>
            <MenuItem value="priority">우선순위</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>정렬 순서</InputLabel>
          <Select
            value={sortOrder}
            label="정렬 순서"
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
          >
            <MenuItem value="desc">내림차순</MenuItem>
            <MenuItem value="asc">오름차순</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Paper>
        <List>
          {filteredCases.map((c) => (
            <ListItemButton key={c.id} onClick={() => handleCaseClick(c.id)} disabled={loading}>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body1">{c.title}</Typography>
                    <Chip label={c.status} color={getStatusColor(c.status)} size="small" />
                    <Chip
                      label={c.priority}
                      color={getPriorityColor(c.priority)}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                }
                secondary={`사건 ID: ${c.id} | 등록일: ${c.createdAt || c.date}`}
              />
            </ListItemButton>
          ))}
        </List>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default CaseList;
