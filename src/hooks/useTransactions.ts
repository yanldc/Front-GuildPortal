import { useState, useCallback } from 'react';
import { PointTransaction } from '../types';
import { transactionsService } from '../services/transactions';

export function useTransactions() {
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);

  const fetchTransactions = useCallback(async () => {
    const data = await transactionsService.list();
    setTransactions(data);
    return data;
  }, []);

  return { transactions, setTransactions, fetchTransactions };
}
