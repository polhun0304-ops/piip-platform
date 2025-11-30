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
      try {
        localStorage.setItem('piip_token', response.data.token);
        const userObj = response.data.user || null;
        localStorage.setItem('piip_user', JSON.stringify(userObj));
        const roleVal = userObj && typeof userObj.role === 'string' ? userObj.role : 'client';
        localStorage.setItem('piip_role', roleVal);
      } catch (e) {
        // If localStorage is not available or write fails, don't crash the login flow
        console.warn('Failed to persist login info to localStorage', e);
      }
    }
    return response.data;
  },

  register: async (data: RegisterData): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/register', data);
    if (response.data.token) {
      try {
        localStorage.setItem('piip_token', response.data.token);
        const userObj = response.data.user || null;
        localStorage.setItem('piip_user', JSON.stringify(userObj));
        const roleVal = userObj && typeof userObj.role === 'string' ? userObj.role : 'client';
        localStorage.setItem('piip_role', roleVal);
      } catch (e) {
        console.warn('Failed to persist register info to localStorage', e);
      }
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
    if (!userStr) return null;
    // Guard against literal strings "undefined" or "null" which can appear
    if (userStr === 'undefined' || userStr === 'null') return null;
    try {
      return JSON.parse(userStr);
    } catch (e) {
      console.warn('Failed to parse piip_user from localStorage', e, userStr);
      return null;
    }
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('piip_token');
  },
};
