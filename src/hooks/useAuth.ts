import { useState, useEffect, useRef } from 'react';
import { Member } from '../types';
import { authService } from '../services/auth';
import { onAuthExpired } from '../services/api';

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Try to restore session on mount
  useEffect(() => {
    authService.getMe()
      .then(setCurrentUser)
      .catch(() => { /* no valid session */ })
      .finally(() => setLoading(false));
  }, []);

  // Listen for 401 responses (session expired)
  useEffect(() => {
    const unsubscribe = onAuthExpired(() => {
      setCurrentUser(null);
      if (refreshTimer.current) clearInterval(refreshTimer.current);
    });
    return unsubscribe;
  }, []);

  // Auto-refresh token every 50 minutes (token expires in 1h)
  useEffect(() => {
    if (currentUser) {
      refreshTimer.current = setInterval(() => {
        authService.refresh().catch(() => setCurrentUser(null));
      }, 50 * 60 * 1000);
    } else {
      if (refreshTimer.current) clearInterval(refreshTimer.current);
    }
    return () => { if (refreshTimer.current) clearInterval(refreshTimer.current); };
  }, [currentUser]);

  const login = async (googleToken: string, inviteCode?: string) => {
    const user = await authService.login(googleToken, inviteCode);
    setCurrentUser(user);
    return user;
  };

  const logout = async () => {
    await authService.logout();
    setCurrentUser(null);
  };

  const refreshUser = async () => {
    const user = await authService.getMe();
    setCurrentUser(user);
    return user;
  };

  return { currentUser, setCurrentUser, login, logout, refreshUser, loading };
}
