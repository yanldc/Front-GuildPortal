import { useState } from 'react';
import { Auction } from '../types';
import { storageService, STORAGE_KEYS } from '../services/storage';
import { INITIAL_AUCTIONS } from '../data/seeds';

export function useAuctions() {
  const [auctions, setAuctions] = useState<Auction[]>(
    () => storageService.get(STORAGE_KEYS.AUCTIONS, INITIAL_AUCTIONS)
  );

  const syncAuctions = (newAuctions: Auction[]) => {
    setAuctions(newAuctions);
    storageService.set(STORAGE_KEYS.AUCTIONS, newAuctions);
  };

  return { auctions, syncAuctions };
}
