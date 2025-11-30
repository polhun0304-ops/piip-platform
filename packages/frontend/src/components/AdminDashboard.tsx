import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  useTheme,
  Switch,
  FormControlLabel,
  Divider,
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  Security as SecurityIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Dataset as DatabaseIcon,
  Backup as BackupIcon,
  Restore as RestoreIcon,
  Lock as LockIcon,
  Notifications as NotificationsIcon,
  Storage as StorageIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import api from '../services/api';
import { authService } from '../services/auth';

interface SystemSettings {
  id: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  maxFileSize: number;
  sessionTimeout: number;
  backupFrequency: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  twoFactorAuth: boolean;
  auditLogging: boolean;
  updatedAt: string;
  updatedBy: string;
}

interface DatabaseStats {
  totalUsers: number;
  totalCases: number;
  totalReports: number;
  totalEvidence: number;
  databaseSize: string;
  lastBackup: string;
  uptime: string;
}

interface AdminUser {
  id: string;
  email: string;
  name?: string;
  role: string;
  lastLoginAt?: string;
  isActive: boolean;
}

const AdminDashboard: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showBackupDialog, setShowBackupDialog] = useState(false);
  const [backupInProgress, setBackupInProgress] = useState(false);
  const theme = useTheme();

  // 설정 폼 상태
  const [settingsForm, setSettingsForm] = useState({
    maintenanceMode: false,
    allowRegistration: true,
    maxFileSize: 10,
    sessionTimeout: 30,
    backupFrequency: 'daily',
    emailNotifications: true,
    smsNotifications: false,
    twoFactorAuth: false,
    auditLogging: true,
  });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [settingsRes, statsRes, usersRes] = await Promise.all([
        api.get('/admin/settings'),
        api.get('/admin/database-stats'),
        api.get('/admin/users'),
      ]);

      setSettings(settingsRes.data);
      setDbStats(statsRes.data);
      setAdminUsers(Array.isArray(usersRes.data) ? usersRes.data : []);

      // 설정 폼 초기화
      if (settingsRes.data) {
        setSettingsForm({
          maintenanceMode: settingsRes.data.maintenanceMode || false,
          allowRegistration: settingsRes.data.allowRegistration !== false,
          maxFileSize: settingsRes.data.maxFileSize || 10,
          sessionTimeout: settingsRes.data.sessionTimeout || 30,
          backupFrequency: settingsRes.data.backupFrequency || 'daily',
          emailNotifications: settingsRes.data.emailNotifications !== false,
          smsNotifications: settingsRes.data.smsNotifications || false,
          twoFactorAuth: settingsRes.data.twoFactorAuth || false,
          auditLogging: settingsRes.data.auditLogging !== false,
        });
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await api.put('/admin/settings', settingsForm);
      await fetchAdminData();
      setShowSettingsDialog(false);
      alert('시스템 설정이 성공적으로 저장되었습니다.');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('설정 저장에 실패했습니다.');
    }
  };

  const handleBackupDatabase = async () => {
    setBackupInProgress(true);
    try {
      await api.post('/admin/backup');
      await fetchAdminData();
      setShowBackupDialog(false);
      alert('데이터베이스 백업이 성공적으로 완료되었습니다.');
    } catch (error) {
      console.error('Failed to backup database:', error);
      alert('백업에 실패했습니다.');
    } finally {
      setBackupInProgress(false);
    }
  };

  const handleRestoreDatabase = async (backupFile: File) => {
    try {
      const formData = new FormData();
      formData.append('backup', backupFile);
      await api.post('/admin/restore', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await fetchAdminData();
      alert('데이터베이스 복원이 성공적으로 완료되었습니다.');
    } catch (error) {
      console.error('Failed to restore database:', error);
      alert('복원에 실패했습니다.');
    }
  };

  const handleUserStatusChange = async (userId: string, status: string) => {
    try {
      await api.put(`/admin/users/${userId}/status`, { status });
      await fetchAdminData();
      alert('사용자 상태가 성공적으로 변경되었습니다.');
    } catch (error) {
      console.error('Failed to change user status:', error);
      alert('상태 변경에 실패했습니다.');
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'error';
  };

  const getStatusLabel = (isActive: boolean) => {
    return isActive ? '활성' : '비활성';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <AdminIcon color="primary" sx={{ fontSize: 40 }} />
        <Box>
          <Typography variant="h4" fontWeight={700}>
            관리자 대시보드
          </Typography>
          <Typography variant="body2" color="text.secondary">
            시스템 관리 및 데이터베이스 운영
          </Typography>
        </Box>
      </Box>

      {/* 데이터베이스 통계 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <DatabaseIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  데이터베이스 통계
                </Typography>
              </Box>
              {dbStats ? (
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      총 사용자
                    </Typography>
                    <Typography variant="h4" color="primary.main">
                      {dbStats.totalUsers.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      총 사건
                    </Typography>
                    <Typography variant="h4" color="primary.main">
                      {dbStats.totalCases.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      총 보고서
                    </Typography>
                    <Typography variant="h4" color="primary.main">
                      {dbStats.totalReports.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      총 증거
                    </Typography>
                    <Typography variant="h4" color="primary.main">
                      {dbStats.totalEvidence.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        DB 크기: {dbStats.databaseSize}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        마지막 백업: {new Date(dbStats.lastBackup).toLocaleString('ko-KR')}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              ) : (
                <Typography color="text.secondary">통계 데이터를 불러올 수 없습니다.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <SecurityIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  시스템 상태
                </Typography>
              </Box>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    {settings?.maintenanceMode ? (
                      <WarningIcon color="warning" />
                    ) : (
                      <CheckCircleIcon color="success" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary="유지보수 모드"
                    secondary={settings?.maintenanceMode ? '활성화됨' : '비활성화됨'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PeopleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="사용자 등록"
                    secondary={settings?.allowRegistration ? '허용됨' : '비허용됨'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <StorageIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="최대 파일 크기"
                    secondary={`${settings?.maxFileSize || 10}MB`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <LockIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="세션 타임아웃"
                    secondary={`${settings?.sessionTimeout || 30}분`}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 관리 기능들 */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, border: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              <SettingsIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              시스템 설정
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              시스템 동작 방식, 보안 설정, 알림 설정 등을 관리합니다.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SettingsIcon />}
              onClick={() => setShowSettingsDialog(true)}
              fullWidth
            >
              설정 관리
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, border: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              <BackupIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              데이터베이스 관리
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              데이터베이스 백업, 복원 및 유지보수 작업을 수행합니다.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<BackupIcon />}
                onClick={() => setShowBackupDialog(true)}
                fullWidth
              >
                백업
              </Button>
              <Button variant="outlined" startIcon={<RestoreIcon />} component="label" fullWidth>
                복원
                <input
                  type="file"
                  hidden
                  accept=".sql,.bak,.zip"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleRestoreDatabase(file);
                    }
                  }}
                />
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 3, border: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              <PeopleIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              관리자 사용자 관리
            </Typography>
            <List>
              {adminUsers.map((user) => (
                <ListItem
                  key={user.id}
                  sx={{
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 1,
                    mb: 1,
                  }}
                >
                  <ListItemIcon>
                    <AdminIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1" fontWeight={600}>
                          {user.name || user.email}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ({user.email})
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                        <Typography variant="body2">역할: {user.role}</Typography>
                        <Typography variant="body2">
                          마지막 로그인:{' '}
                          {user.lastLoginAt
                            ? new Date(user.lastLoginAt).toLocaleString('ko-KR')
                            : '없음'}
                        </Typography>
                      </Box>
                    }
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      상태:
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      color={getStatusColor(user.isActive) as any}
                      onClick={() => {
                        const newStatus = user.isActive ? 'inactive' : 'active';
                        handleUserStatusChange(user.id, newStatus);
                      }}
                    >
                      {getStatusLabel(user.isActive)}
                    </Button>
                  </Box>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* 시스템 설정 다이얼로그 */}
      <Dialog
        open={showSettingsDialog}
        onClose={() => setShowSettingsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>시스템 설정</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                일반 설정
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settingsForm.maintenanceMode}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({ ...prev, maintenanceMode: e.target.checked }))
                      }
                    />
                  }
                  label="유지보수 모드"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settingsForm.allowRegistration}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({
                          ...prev,
                          allowRegistration: e.target.checked,
                        }))
                      }
                    />
                  }
                  label="사용자 등록 허용"
                />
                <TextField
                  label="최대 파일 크기 (MB)"
                  type="number"
                  value={settingsForm.maxFileSize}
                  onChange={(e) =>
                    setSettingsForm((prev) => ({ ...prev, maxFileSize: parseInt(e.target.value) }))
                  }
                  fullWidth
                />
                <TextField
                  label="세션 타임아웃 (분)"
                  type="number"
                  value={settingsForm.sessionTimeout}
                  onChange={(e) =>
                    setSettingsForm((prev) => ({
                      ...prev,
                      sessionTimeout: parseInt(e.target.value),
                    }))
                  }
                  fullWidth
                />
                <FormControl fullWidth>
                  <InputLabel>백업 빈도</InputLabel>
                  <Select
                    value={settingsForm.backupFrequency}
                    label="백업 빈도"
                    onChange={(e) =>
                      setSettingsForm((prev) => ({ ...prev, backupFrequency: e.target.value }))
                    }
                  >
                    <MenuItem value="hourly">매시간</MenuItem>
                    <MenuItem value="daily">매일</MenuItem>
                    <MenuItem value="weekly">매주</MenuItem>
                    <MenuItem value="monthly">매월</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                보안 및 알림 설정
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settingsForm.twoFactorAuth}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({ ...prev, twoFactorAuth: e.target.checked }))
                      }
                    />
                  }
                  label="2단계 인증"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settingsForm.auditLogging}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({ ...prev, auditLogging: e.target.checked }))
                      }
                    />
                  }
                  label="감사 로그 기록"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settingsForm.emailNotifications}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({
                          ...prev,
                          emailNotifications: e.target.checked,
                        }))
                      }
                    />
                  }
                  label="이메일 알림"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settingsForm.smsNotifications}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({ ...prev, smsNotifications: e.target.checked }))
                      }
                    />
                  }
                  label="SMS 알림"
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSettingsDialog(false)}>취소</Button>
          <Button variant="contained" onClick={handleSaveSettings}>
            설정 저장
          </Button>
        </DialogActions>
      </Dialog>

      {/* 백업 다이얼로그 */}
      <Dialog open={showBackupDialog} onClose={() => setShowBackupDialog(false)}>
        <DialogTitle>데이터베이스 백업</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            데이터베이스의 전체 백업을 생성합니다. 이 작업은 시스템 성능에 영향을 줄 수 있습니다.
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            백업 중에는 다른 작업을 수행하지 마세요.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowBackupDialog(false)}>취소</Button>
          <Button
            variant="contained"
            onClick={handleBackupDatabase}
            disabled={backupInProgress}
            startIcon={backupInProgress ? <CircularProgress size={20} /> : <BackupIcon />}
          >
            {backupInProgress ? '백업 중...' : '백업 시작'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
