import { api } from './api';

interface Invite {
  id: string;
  email: string;
  name: string;
  class: string;
  rank: string;
  code: string;
  createdAt: string;
}

interface InvitePublic {
  name: string;
  class: string;
  rank: string;
  code: string;
}

export const invitesService = {
  list: () => api.get<Invite[]>('/invites'),
  create: (data: { email: string; name: string; class: string; rank?: string }) =>
    api.post<Invite>('/invites', data),
  delete: (code: string) => api.delete<void>(`/invites/${code}`),
  // Public endpoint - no auth required
  verifyCode: (code: string) => api.get<InvitePublic>(`/invites/verify/${code}`),
};
