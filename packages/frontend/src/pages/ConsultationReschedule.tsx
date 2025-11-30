import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import DetectiveCalendar from '../components/DetectiveCalendar';

interface Props {
  consultationId: string;
  detectiveId: string;
}

const ConsultationReschedule: React.FC<Props> = ({ consultationId, detectiveId }) => {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSlotSelect = (date: string, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setOpen(true);
  };

  const handleReschedule = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/consultations/${consultationId}/reschedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate, time: selectedTime }),
      });
      if (res.ok) {
        setSuccess(true);
        setOpen(false);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5">상담 재스케줄링</Typography>
      <DetectiveCalendar detectiveId={detectiveId} onSlotSelect={handleSlotSelect} />
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>상담 재예약 확인</DialogTitle>
        <DialogContent>
          <Typography>
            {selectedDate} {selectedTime}로 상담을 재예약하시겠습니까?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={loading}>
            취소
          </Button>
          <Button onClick={handleReschedule} disabled={loading} variant="contained" color="primary">
            {loading ? '처리 중...' : '재예약'}
          </Button>
        </DialogActions>
      </Dialog>
      {success && (
        <Box mt={2}>
          <Typography color="primary">상담 재예약이 완료되었습니다.</Typography>
        </Box>
      )}
    </Box>
  );
};

export default ConsultationReschedule;
