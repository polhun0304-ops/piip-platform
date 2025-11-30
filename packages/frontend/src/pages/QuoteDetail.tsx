import React, { useEffect, useState } from 'react';
import { Alert, Button } from '@mui/material';
import axios from 'axios';
import { trackEvent, trackABTest } from '../utils/analytics';

interface ConsultationProposal {
  id: string;
  status: string;
  severity: 'low' | 'medium' | 'high';
  reasons: string[];
}

interface QuoteDetailProps {
  quoteId: string;
  finalPrice: number;
}

const QuoteDetail = (props: QuoteDetailProps) => {
  const { quoteId, finalPrice } = props;
  const [proposal, setProposal] = useState<ConsultationProposal | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (finalPrice >= 3000000) {
      axios
        .get(`/api/consultations/proposal?quoteId=${quoteId}`)
        .then((res) => {
          if (res.data && res.data.status === 'proposed') {
            setProposal(res.data);
            setShowBanner(true);
            trackEvent('Consultation', 'HighValueProposalShown', quoteId);
            trackABTest('HighValueConsultationProposal', res.data.severity);
          }
        })
        .catch(() => {
          // 제안 없으면 무시
        });
    }
  }, [quoteId, finalPrice]);

  const handleReserve = async () => {
    setLoading(true);
    setError(null);
    try {
      await axios.post(`/api/consultations/${proposal?.id}/reserve`);
      setShowBanner(false);
      trackEvent('Consultation', 'HighValueReservationCompleted', proposal?.id || '');
      alert('상담 예약이 완료되었습니다.');
    } catch (e: any) {
      setError(e?.response?.data?.error || '예약 실패');
    } finally {
      setLoading(false);
    }
  };

  if (!proposal || !showBanner) return null;

  return (
    <Alert severity="info" sx={{ mb: 2 }}>
      <b>고가 견적입니다. 결정 전 상담을 권장합니다.</b>
      <ul>
        {proposal.reasons.map((r, i) => (
          <li key={i}>{r}</li>
        ))}
      </ul>
      <Button
        variant="contained"
        color="primary"
        onClick={handleReserve}
        disabled={loading}
        sx={{ mt: 1 }}
      >
        30분 딥다이브 상담 예약
      </Button>
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Alert>
  );
};

export default QuoteDetail;
