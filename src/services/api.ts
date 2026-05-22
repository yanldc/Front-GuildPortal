const API_BASE = '/api';

// Event emitter for auth state changes
type AuthListener = () => void;
const authListeners: AuthListener[] = [];

export function onAuthExpired(listener: AuthListener) {
  authListeners.push(listener);
  return () => { const idx = authListeners.indexOf(listener); if (idx >= 0) authListeners.splice(idx, 1); };
}

function notifyAuthExpired() {
  authListeners.forEach(fn => fn());
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Only set Content-Type for requests with a body
  if (options.body) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (res.status === 204) return undefined as T;

  if (res.status === 401) {
    notifyAuthExpired();
    throw new Error('Session expired');
  }

  const body = await res.json();
  if (!res.ok) throw new Error(body.message || 'Request failed');
  return body as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data?: unknown) => request<T>(path, {
    method: 'POST',
    ...(data !== undefined ? { body: JSON.stringify(data) } : {}),
  }),
  put: <T>(path: string, data?: unknown) => request<T>(path, {
    method: 'PUT',
    ...(data !== undefined ? { body: JSON.stringify(data) } : {}),
  }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
