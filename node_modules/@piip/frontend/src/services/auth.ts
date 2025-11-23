import api from './api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'detective' | 'client';
  phone?: string;
  detectiveId?: string;
}

export interface LoginResponse {
  message: string;
  user: User;
  token: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone: string;
  role: 'client' | 'detective'; // Admin registration usually restricted
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('piip_token', response.data.token);
      localStorage.setItem('piip_user', JSON.stringify(response.data.user));
      localStorage.setItem('piip_role', response.data.user.role);
    }
    return response.data;
  },

  register: async (data: RegisterData): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/register', data);
    if (response.data.token) {
      localStorage.setItem('piip_token', response.data.token);
      localStorage.setItem('piip_user', JSON.stringify(response.data.user));
      localStorage.setItem('piip_role', response.data.user.role);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('piip_token');
    localStorage.removeItem('piip_user');
    localStorage.removeItem('piip_role');
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('piip_user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('piip_token');
  },
};
