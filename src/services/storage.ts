export const storageService = {
  get<T>(key: string, fallback: T): T {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : fallback;
    } catch {
      return fallback;
    }
  },

  set<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  },

  remove(key: string): void {
    localStorage.removeItem(key);
  }
};

export const STORAGE_KEYS = {
  CURRENT_USER: 'raven2_currentUser',
  MEMBERS: 'raven2_members',
  AUCTIONS: 'raven2_auctions',
  EVENTS: 'raven2_events',
  TRANSACTIONS: 'raven2_transactions',
  PENDING_INVITES: 'raven2_pending_invites',
  LEVELUP_REQUESTS: 'raven2_levelup_requests',
  LEVELUP_HELPERS: 'raven2_levelup_helpers',
} as const;
