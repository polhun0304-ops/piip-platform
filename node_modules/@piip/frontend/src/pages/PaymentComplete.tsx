import React, { useEffect, useState } from 'react';
import { Button, Alert } from '@mui/material';
import axios from 'axios';
import { trackEvent, trackABTest } from '../utils/analytics';

interface ConsultationProposal {
  id: string;
  status: string;
  type: string;
  scheduledAt?: string;
}

const PaymentComplete = (props: { caseId: string; userId: string }) => {
  const { caseId, userId } = props;
  const [proposal, setProposal] = useState<ConsultationProposal | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // 킥오프 콜 상담 제안 조회
    axios
      .get(`/api/consultations/kickoff?caseId=${caseId}&userId=${userId}`)
      .then((res) => {
        if (res.data && res.data.status === 'proposed') {
          setProposal(res.data);
          setShow(true);
          trackEvent('Consultation', 'KickoffProposalShown', caseId);
          trackABTest('KickoffConsultationProposal', res.data.type);
        }
      })
      .catch(() => {
        // 제안 없으면 무시
      });
  }, [caseId, userId]);

  const handleReserve = async () => {
    setLoading(true);
    setError(null);
    try {
      await axios.post(`/api/consultations/${proposal?.id}/reserve`);
      setShow(false);
      trackEvent('Consultation', 'KickoffReservationCompleted', proposal?.id || '');
      alert('킥오프 콜 예약이 완료되었습니다.');
    } catch (e: any) {
      setError(e?.response?.data?.error || '예약 실패');
    } finally {
      setLoading(false);
    }
  };

  if (!proposal || !show) return <div>결제가 완료되었습니다.</div>;

  return (
    <Alert severity="success" sx={{ mb: 2 }}>
      <b>프로젝트 킥오프 콜을 예약해보세요!</b>
      <div style={{ margin: '12px 0' }}>
        <Button variant="contained" color="primary" onClick={handleReserve} disabled={loading}>
          15분 킥오프 콜 예약
        </Button>
      </div>
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Alert>
  );
};

export default PaymentComplete;
