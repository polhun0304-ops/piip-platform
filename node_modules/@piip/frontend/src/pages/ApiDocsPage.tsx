import React from 'react';
import { Box, Typography, Paper, alpha } from '@mui/material';
import { Description as ApiDocsIcon } from '@mui/icons-material';

/**
 * API 문서 페이지
 * - Swagger UI를 iframe으로 임베드
 * - 포트 8000의 /docs/swagger.html 활용
 */
const ApiDocsPage: React.FC = () => {
  return (
    <Box>
      {/* Page Header */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          background: 'linear-gradient(135deg, rgba(0,245,255,0.1) 0%, rgba(255,0,255,0.1) 100%)',
          border: '1px solid rgba(0,245,255,0.3)',
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ApiDocsIcon
            sx={{
              fontSize: 40,
              color: '#00f5ff',
            }}
          />
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #00f5ff 0%, #ff00ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 0.5,
              }}
            >
              API 문서
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: alpha('#fff', 0.7),
              }}
            >
              PIIP Platform REST API 명세서 - OpenAPI 3.0 기반 Swagger UI
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Swagger UI Iframe */}
      <Paper
        elevation={3}
        sx={{
          height: 'calc(100vh - 250px)',
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid rgba(0,245,255,0.2)',
          boxShadow: '0 4px 20px rgba(0,245,255,0.3)',
        }}
      >
        <Box
          component="iframe"
          src="http://localhost:8000/docs/swagger.html"
          sx={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          title="PIIP Platform API Documentation"
        />
      </Paper>

      {/* Info Footer */}
      <Box
        sx={{
          mt: 2,
          p: 2,
          background: alpha('#000', 0.3),
          borderRadius: 2,
          border: `1px solid ${alpha('#00f5ff', 0.2)}`,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: alpha('#fff', 0.6),
            display: 'block',
          }}
        >
          💡 이 API 문서는 포트 8000의 Swagger UI를 통해 제공됩니다. OpenAPI 명세는{' '}
          <Box component="code" sx={{ color: '#00f5ff' }}>
            docs/openapi/openapi.yaml
          </Box>{' '}
          파일에 정의되어 있습니다.
        </Typography>
      </Box>
    </Box>
  );
};

export default ApiDocsPage;
