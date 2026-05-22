import { Member } from '../types';
import { api } from './api';

interface LoginResponse {
  user: Member;
}

export const authService = {
  async login(googleToken: string): Promise<Member> {
    const res = await api.post<LoginResponse>('/auth/google', { token: googleToken });
    return res.user;
  },

  async getMe(): Promise<Member> {
    return api.get<Member>('/auth/me');
  },

  async refresh(): Promise<Member> {
    const res = await api.post<{ user: Member }>('/auth/refresh');
    return res.user;
  },

  async logout(): Promise<void> {
    try { await api.post('/auth/logout'); } catch { /* ignore */ }
  },
};
