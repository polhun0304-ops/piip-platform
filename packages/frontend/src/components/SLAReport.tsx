import React, { useEffect, useState } from 'react';
import { Typography, Table, TableBody, TableCell, TableRow, Paper } from '@mui/material';

interface SLAReport {
  consultationId: string;
  proposedAt: string;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  responseTime?: number;
  kickoffTime?: number;
  processTime?: number;
  status: string;
}

interface Props {
  consultationId: string;
}

const SLAReportComponent: React.FC<Props> = ({ consultationId }) => {
  const [report, setReport] = useState<SLAReport | null>(null);
  useEffect(() => {
    fetch(`/api/consultations/${consultationId}/sla`)
      .then((res) => res.json())
      .then(setReport);
  }, [consultationId]);

  if (!report) return <Typography>로딩 중...</Typography>;

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6">SLA 리포트</Typography>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>상담 ID</TableCell>
            <TableCell>{report.consultationId}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>제안 시각</TableCell>
            <TableCell>{report.proposedAt}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>예약 시각</TableCell>
            <TableCell>{report.scheduledAt || '-'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>상담 시작</TableCell>
            <TableCell>{report.startedAt || '-'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>상담 종료</TableCell>
            <TableCell>{report.completedAt || '-'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>제안~예약 응답 시간(분)</TableCell>
            <TableCell>{report.responseTime ?? '-'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>예약~시작 대기 시간(분)</TableCell>
            <TableCell>{report.kickoffTime ?? '-'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>상담 처리 시간(분)</TableCell>
            <TableCell>{report.processTime ?? '-'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>상태</TableCell>
            <TableCell>{report.status}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Paper>
  );
};

export default SLAReportComponent;
