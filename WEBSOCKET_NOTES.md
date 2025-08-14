# WebSocket Foundation

A minimal native WebSocket layer (no Socket.IO) has been added.

## Server

- Route: `GET /api/ws` (edge runtime) using `WebSocketPair`.
- Registry: `src/lib/ws.ts` keeps an in-memory Set of clients (non-durable).
- Handshake: client sends `{type:"auth", token, userId, role, providerId}`. Currently accepted blindly (TODO: verify JWT / session).
- Messages implemented:
  - `auth` -> server replies `auth:ok`.
  - `ping` -> server replies `pong`.
  - `chat:send` (requires auth) -> broadcast as `chat:new`.
  - Presence join/leave events: `presence:join`, `presence:leave`.

## Client Hook

`useWebSocket` in `src/hooks/useWebSocket.ts` features:

- Auto connect + exponential backoff reconnection (bounded attempts).
- Heartbeat (ping) every 25s.
- Pending message queue while connecting.
- Simple auth handshake on open.

Example usage:

```tsx
import useWebSocket from '@/hooks/useWebSocket';

function DemoChat() {
  const { connected, lastMessage, send } = useWebSocket({
    userId: 'u1',
    role: 'USER',
  });
  return (
    <div>
      <p>Status: {connected ? 'online' : 'offline'}</p>
      <button onClick={() => send({ type: 'chat:send', body: 'Hello world' })}>
        Send
      </button>
      <pre>{lastMessage && JSON.stringify(lastMessage, null, 2)}</pre>
    </div>
  );
}
```

## Next Steps / TODO

- Integrate NextAuth JWT: issue a JWT in session callback and verify inside `handleMessage`.
- Persist chat messages (Prisma model) + history fetch endpoint.
- Replace in-memory broadcast with Redis pub/sub for multi-region scaling.
- Add presence tracking with provider / subscriber segmentation.
- Implement typing indicators, delivery receipts.
