import { useState, useCallback } from 'react';
import { Member } from '../types';
import { membersService } from '../services/members';

export function useMembers() {
  const [members, setMembers] = useState<Member[]>([]);

  const fetchMembers = useCallback(async () => {
    const data = await membersService.list();
    setMembers(data);
    return data;
  }, []);

  return { members, setMembers, fetchMembers };
}
