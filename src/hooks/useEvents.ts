import { useState } from 'react';
import { GuildEvent } from '../types';
import { storageService, STORAGE_KEYS } from '../services/storage';
import { INITIAL_EVENTS } from '../data/seeds';

export function useEvents() {
  const [events, setEvents] = useState<GuildEvent[]>(
    () => storageService.get(STORAGE_KEYS.EVENTS, INITIAL_EVENTS)
  );

  const syncEvents = (newEvents: GuildEvent[]) => {
    setEvents(newEvents);
    storageService.set(STORAGE_KEYS.EVENTS, newEvents);
  };

  return { events, syncEvents };
}
