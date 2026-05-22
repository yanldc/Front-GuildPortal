import { useEffect, useRef } from 'react';

type WsEvent =
  | 'auctions:updated'
  | 'events:updated'
  | 'members:updated'
  | 'transactions:updated'
  | 'levelup:updated';

type Handlers = Partial<Record<WsEvent, () => void>>;

export function useWebSocket(handlers: Handlers, enabled: boolean) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (!enabled) return;

    let ws: WebSocket | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout>;

    function connect() {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      ws = new WebSocket(`${protocol}//${window.location.host}/api/ws`);

      ws.onmessage = (event) => {
        try {
          const { event: wsEvent } = JSON.parse(event.data);
          const handler = handlersRef.current[wsEvent as WsEvent];
          if (handler) handler();
        } catch { /* ignore malformed messages */ }
      };

      ws.onclose = () => {
        reconnectTimeout = setTimeout(connect, 3000);
      };

      ws.onerror = () => {
        ws?.close();
      };
    }

    connect();

    return () => {
      ws?.close();
      clearTimeout(reconnectTimeout);
    };
  }, [enabled]);
}
