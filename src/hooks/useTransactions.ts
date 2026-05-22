import { useState } from 'react';
import { PointTransaction } from '../types';
import { storageService, STORAGE_KEYS } from '../services/storage';
import { INITIAL_TRANSACTIONS } from '../data/seeds';

export function useTransactions() {
  const [transactions, setTransactions] = useState<PointTransaction[]>(
    () => storageService.get(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS)
  );

  const syncTransactions = (newTransactions: PointTransaction[]) => {
    setTransactions(newTransactions);
    storageService.set(STORAGE_KEYS.TRANSACTIONS, newTransactions);
  };

  return { transactions, syncTransactions };
}
