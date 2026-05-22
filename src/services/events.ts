import { GuildEvent } from '../types';
import { api } from './api';

export const eventsService = {
  list: () => api.get<GuildEvent[]>('/events'),
  create: (data: Partial<GuildEvent>) => api.post<GuildEvent>('/events', data),
  update: (id: string, data: Partial<GuildEvent>) => api.put<GuildEvent>(`/events/${id}`, data),
  delete: (id: string) => api.delete<void>(`/events/${id}`),
  toggleRsvp: (id: string) => api.post<GuildEvent>(`/events/${id}/rsvp`),
};
