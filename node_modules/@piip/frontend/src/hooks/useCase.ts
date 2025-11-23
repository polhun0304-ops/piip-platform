import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import type { CaseDTO } from '../types/api';

export function useCase(caseId: string | undefined) {
  return useQuery<CaseDTO, Error>(
    ['case', caseId],
    async () => {
      if (!caseId) throw new Error('caseId required');
      const res = await api.get(`/cases/${caseId}`);
      return res.data as CaseDTO;
    },
    { enabled: !!caseId, refetchOnWindowFocus: false }
  );
}

export default useCase;
