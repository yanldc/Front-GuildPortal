import { useState } from 'react';
import { Member } from '../types';
import { storageService, STORAGE_KEYS } from '../services/storage';

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<Member | null>(
    () => storageService.get<Member | null>(STORAGE_KEYS.CURRENT_USER, null)
  );

  const syncCurrentUser = (user: Member | null) => {
    setCurrentUser(user);
    if (user) {
      storageService.set(STORAGE_KEYS.CURRENT_USER, user);
    } else {
      storageService.remove(STORAGE_KEYS.CURRENT_USER);
    }
  };

  const logout = () => syncCurrentUser(null);

  return { currentUser, syncCurrentUser, logout };
}
