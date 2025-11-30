export interface MessageDTO {
  id: string;
  caseId: string;
  senderId: string;
  senderRole: 'client' | 'detective' | 'admin';
  message?: string;
  encrypted?: boolean;
  timestamp: string;
  read?: boolean;
  recipients?: Array<{ userId: string; ciphertext: string; iv?: string }>;
}

export interface CaseDTO {
  id: string;
  title: string;
  description?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}
