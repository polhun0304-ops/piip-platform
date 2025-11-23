import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

interface DetectiveAvailability {
  date: string; // YYYY-MM-DD
  slots: string[]; // HH:mm[]
}

interface Props {
  detectiveId: string;
  onSlotSelect?: (date: string, time: string) => void;
}

const DetectiveCalendar: React.FC<Props> = ({ detectiveId, onSlotSelect }) => {
  const [availability, setAvailability] = useState<DetectiveAvailability[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/detectives/${detectiveId}/availability`)
      .then((res) => res.json())
      .then((data) => setAvailability(data))
      .finally(() => setLoading(false));
  }, [detectiveId]);

  const getSlotsForDate = (date: Date) => {
    const d = date.toISOString().slice(0, 10);
    const found = availability.find((a) => a.date === d);
    return found ? found.slots : [];
  };

  return (
    <Box>
      <Typography variant="h6">탐정 가용 시간 캘린더</Typography>
      <Calendar
        onChange={(value) => {
          if (value instanceof Date) {
            setSelectedDate(value);
          } else if (Array.isArray(value) && value[0] instanceof Date) {
            setSelectedDate(value[0]);
          } else {
            setSelectedDate(null);
          }
        }}
        value={selectedDate}
        tileDisabled={({ date }: { date: Date }) => getSlotsForDate(date).length === 0}
      />
      {selectedDate && (
        <Box mt={2}>
          <Typography variant="subtitle1">
            {selectedDate.toLocaleDateString()} 예약 가능 시간
          </Typography>
          {loading ? (
            <CircularProgress size={24} />
          ) : (
            <Box display="flex" gap={1} flexWrap="wrap">
              {getSlotsForDate(selectedDate).map((slot) => (
                <Box
                  key={slot}
                  sx={{
                    border: '1px solid #1976d2',
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    cursor: 'pointer',
                  }}
                  onClick={() => onSlotSelect?.(selectedDate.toISOString().slice(0, 10), slot)}
                >
                  {slot}
                </Box>
              ))}
              {getSlotsForDate(selectedDate).length === 0 && (
                <Typography color="textSecondary">예약 가능 시간이 없습니다.</Typography>
              )}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default DetectiveCalendar;
