import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('piip_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

// Typed helpers (small convenience wrappers)
import type { CaseDTO, MessageDTO } from '../types/api';

export async function getCase(caseId: string): Promise<CaseDTO> {
  const res = await api.get(`/cases/${caseId}`);
  return res.data as CaseDTO;
}

export async function getMessages(caseId: string): Promise<MessageDTO[]> {
  const res = await api.get(`/chat/${caseId}`);
  return res.data as MessageDTO[];
}
