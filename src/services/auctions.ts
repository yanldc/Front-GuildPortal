import { Auction } from '../types';
import { api } from './api';

export const auctionsService = {
  list: (filters?: { status?: string }) =>
    api.get<Auction[]>(`/auctions${filters?.status ? `?status=${filters.status}` : ''}`),
  get: (id: string) => api.get<Auction>(`/auctions/${id}`),
  create: (data: Omit<Auction, 'id' | 'createdBy' | 'status' | 'bids' | 'currentWinnerId' | 'currentWinnerName' | 'currentBid'>) =>
    api.post<Auction>('/auctions', data),
  placeBid: (id: string, amount: number) =>
    api.post<Auction>(`/auctions/${id}/bid`, { amount }),
};
