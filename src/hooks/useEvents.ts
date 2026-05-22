import { useState, useCallback } from 'react';
import { GuildEvent } from '../types';
import { eventsService } from '../services/events';

export function useEvents() {
  const [events, setEvents] = useState<GuildEvent[]>([]);

  const fetchEvents = useCallback(async () => {
    const data = await eventsService.list();
    setEvents(data);
    return data;
  }, []);

  return { events, setEvents, fetchEvents };
}
