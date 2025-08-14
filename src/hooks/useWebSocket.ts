import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseWebSocketOptions {
  path?: string; // e.g. /api/ws
  autoConnect?: boolean;
  heartbeatIntervalMs?: number;
  reconnect?: boolean;
  maxReconnectAttempts?: number;
  backoffBaseMs?: number;
  token?: string; // future auth token (JWT)
  userId?: string;
  role?: string;
  providerId?: string;
}

export interface WSMessage<T = any> {
  type: string;
  [k: string]: any;
  data?: T;
}

export function useWebSocket(opts: UseWebSocketOptions = {}) {
  const {
    path = '/api/ws',
    autoConnect = true,
    heartbeatIntervalMs = 25000,
    reconnect = true,
    maxReconnectAttempts = 10,
    backoffBaseMs = 500,
    token,
    userId,
    role,
    providerId,
  } = opts;

  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WSMessage | null>(null);
  const reconnectAttempts = useRef(0);
  const heartbeatTimer = useRef<any>(null);
  const pendingMessages = useRef<string[]>([]);

  const sendRaw = useCallback((raw: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(raw);
    } else {
      pendingMessages.current.push(raw);
    }
  }, []);

  const send = useCallback(
    (msg: WSMessage) => {
      sendRaw(JSON.stringify(msg));
    },
    [sendRaw]
  );

  const cleanup = () => {
    if (heartbeatTimer.current) clearInterval(heartbeatTimer.current);
  };
  const connect = useCallback(() => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
      const url = `${protocol}://${window.location.host}${path}`;
      const ws = new WebSocket(url);
      wsRef.current = ws;
      // Local helpers capture current dependency values; no separate hooks needed.
      const startHeartbeat = () => {
        cleanup();
        heartbeatTimer.current = setInterval(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'ping', t: Date.now() }));
          }
        }, heartbeatIntervalMs);
      };
      const scheduleReconnect = () => {
        if (!reconnect) return;
        if (reconnectAttempts.current >= maxReconnectAttempts) return;
        const attempt = reconnectAttempts.current++;
        const delay = Math.min(15000, backoffBaseMs * Math.pow(2, attempt));
        setTimeout(() => {
          connect();
        }, delay);
      };
      ws.onopen = () => {
        setConnected(true);
        reconnectAttempts.current = 0;
        startHeartbeat();
        // auth handshake
        ws.send(
          JSON.stringify({
            type: 'auth',
            token,
            userId,
            role,
            providerId,
          })
        );
        // flush pending
        pendingMessages.current.splice(0).forEach((m) => ws.send(m));
      };
      ws.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data);
          setLastMessage(data);
        } catch (_) {}
      };
      ws.onclose = () => {
        setConnected(false);
        cleanup();
        scheduleReconnect();
      };
      ws.onerror = () => {
        ws.close();
      };
    } catch (_) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps -- scheduleReconnect/startHeartbeat are local.
  }, [
    path,
    token,
    userId,
    role,
    providerId,
    reconnect,
    maxReconnectAttempts,
    backoffBaseMs,
    heartbeatIntervalMs,
  ]);

  useEffect(() => {
    if (autoConnect) connect();
    return () => {
      cleanup();
      wsRef.current?.close();
    };
  }, [autoConnect, connect]);

  return {
    connected,
    lastMessage,
    send,
    sendRaw,
    reconnect: () => connect(),
    get socket() {
      return wsRef.current;
    },
  };
}

export default useWebSocket;
