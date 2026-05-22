import { LevelUpRequest, LevelUpHelper } from '../types';
import { api } from './api';

export const levelupService = {
  listRequests: () => api.get<LevelUpRequest[]>('/levelup/requests'),
  createRequest: (data: Omit<LevelUpRequest, 'id' | 'createdAt'>) =>
    api.post<LevelUpRequest>('/levelup/requests', data),
  deleteRequest: (id: string) => api.delete<void>(`/levelup/requests/${id}`),
  joinSlot: (id: string, data: { characterName: string; isAlt: boolean }) =>
    api.post<LevelUpRequest>(`/levelup/requests/${id}/join`, data),
  leaveSlot: (id: string) => api.delete<LevelUpRequest>(`/levelup/requests/${id}/leave`),

  listHelpers: () => api.get<LevelUpHelper[]>('/levelup/helpers'),
  createHelper: (data: Omit<LevelUpHelper, 'id' | 'createdAt'>) =>
    api.post<LevelUpHelper>('/levelup/helpers', data),
  deleteHelper: (id: string) => api.delete<void>(`/levelup/helpers/${id}`),
};
