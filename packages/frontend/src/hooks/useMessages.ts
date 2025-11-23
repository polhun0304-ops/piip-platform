import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import type { MessageDTO } from '../types/api';

export function useMessages(caseId: string | undefined) {
  const queryClient = useQueryClient();

  const queryKey = ['messages', caseId];

  const query = useQuery<MessageDTO[], Error>(
    queryKey,
    async () => {
      if (!caseId) return [];
      const res = await api.get(`/chat/${caseId}`);
      // Expect the API to return an array of messages
      return res.data as MessageDTO[];
    },
    {
      enabled: !!caseId,
      refetchOnWindowFocus: false,
    }
  );

  const appendMessage = (msg: MessageDTO) => {
    queryClient.setQueryData<MessageDTO[] | undefined>(queryKey, (old) => {
      if (!old) return [msg];
      return [...old, msg];
    });
  };

  return {
    messages: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    appendMessage,
  };
}

export default useMessages;
