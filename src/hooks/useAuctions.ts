import { useState, useCallback } from 'react';
import { Auction } from '../types';
import { auctionsService } from '../services/auctions';

export function useAuctions() {
  const [auctions, setAuctions] = useState<Auction[]>([]);

  const fetchAuctions = useCallback(async (filters?: { status?: string }) => {
    const data = await auctionsService.list(filters);
    setAuctions(data);
    return data;
  }, []);

  return { auctions, setAuctions, fetchAuctions };
}
