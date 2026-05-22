import { PointTransaction } from '../types';
import { api } from './api';

export const transactionsService = {
  list: () => api.get<PointTransaction[]>('/transactions'),
  adjust: (data: { memberId: string; amount: number; type: 'add' | 'remove'; reason: string }) =>
    api.post<PointTransaction>('/transactions/adjust', data),
  bulkAdjust: (data: { memberIds: string[]; amount: number; type: 'add' | 'remove'; reason: string }) =>
    api.post<PointTransaction[]>('/transactions/bulk', data),
};
