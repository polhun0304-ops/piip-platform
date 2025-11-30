import React, { useEffect, useState } from 'react';
import { Button, Modal, Alert } from '@mui/material';
import axios from 'axios';
import { trackEvent, trackABTest } from '../utils/analytics';

interface ConsultationProposal {
  id: string;
  status: string;
  severity: 'low' | 'medium' | 'high';
  reasons: string[];
  scheduledAt?: string;
}

const IntakeComplete = (props: { caseId: string }) => {
  const { caseId } = props;
  const [proposal, setProposal] = useState<ConsultationProposal | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 상담 제안 조회
    axios
      .get(`/api/consultations/proposal?caseId=${caseId}`)
      .then((res) => {
        if (res.data && res.data.status === 'proposed') {
          setProposal(res.data);
          setOpen(true);
          trackEvent('Consultation', 'ProposalShown', caseId);
          trackABTest('ConsultationProposal', res.data.severity);
        }
      })
      .catch(() => {
        // 제안 없으면 무시
      });
  }, [caseId]);

  const handleReserve = async () => {
    setLoading(true);
    setError(null);
    try {
      await axios.post(`/api/consultations/${proposal?.id}/reserve`);
      setOpen(false);
      trackEvent('Consultation', 'ReservationCompleted', proposal?.id || '');
      alert('상담 예약이 완료되었습니다.');
    } catch (e: any) {
      setError(e?.response?.data?.error || '예약 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    setOpen(false);
    trackEvent('Consultation', 'ProposalSkipped', caseId);
    // TODO: 서버에 건너뛰기 기록 (optional)
  };

  if (!proposal) return <div>의뢰 접수가 완료되었습니다.</div>;

  return (
    <Modal open={open} onClose={handleSkip}>
      <div
        style={{
          background: '#fff',
          padding: 32,
          maxWidth: 400,
          margin: '80px auto',
          borderRadius: 8,
        }}
      >
        <h2>15분 무료 상담을 받아보세요!</h2>
        {proposal.severity === 'high' ? (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <b>상담이 강력히 권장됩니다.</b>
            <ul>
              {proposal.reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </Alert>
        ) : proposal.severity === 'medium' ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            <b>상담을 추천합니다.</b>
            <ul>
              {proposal.reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </Alert>
        ) : null}
        <Button
          variant="contained"
          color="primary"
          onClick={handleReserve}
          disabled={loading}
          fullWidth
        >
          상담 예약하기
        </Button>
        <Button variant="text" color="secondary" onClick={handleSkip} fullWidth sx={{ mt: 1 }}>
          건너뛰고 계속
        </Button>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </div>
    </Modal>
  );
};

export default IntakeComplete;
