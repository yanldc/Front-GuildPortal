import { useState } from 'react';
import { Member } from '../types';
import { storageService, STORAGE_KEYS } from '../services/storage';
import { INITIAL_MEMBERS } from '../data/seeds';

export function useMembers() {
  const [members, setMembers] = useState<Member[]>(
    () => storageService.get(STORAGE_KEYS.MEMBERS, INITIAL_MEMBERS)
  );

  const syncMembers = (newMembers: Member[]) => {
    setMembers(newMembers);
    storageService.set(STORAGE_KEYS.MEMBERS, newMembers);
  };

  return { members, syncMembers };
}
