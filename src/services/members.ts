import { Member, UserRole, UserRank, RPGProfile } from '../types';
import { api } from './api';

export const membersService = {
  list: () => api.get<Member[]>('/members'),
  get: (id: string) => api.get<Member>(`/members/${id}`),
  updateProfile: (id: string, data: Partial<{ name: string; avatar: string; class: string; guild: string; level: number; altNames: string[]; rpgProfile: RPGProfile }>) =>
    api.put<Member>(`/members/${id}/profile`, data),
  updateRole: (id: string, data: { role: UserRole; rank: UserRank }) =>
    api.put<Member>(`/members/${id}/role`, data),
  delete: (id: string) => api.delete<void>(`/members/${id}`),
};
