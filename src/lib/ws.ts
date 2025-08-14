// Lightweight in-memory WebSocket connection registry + message helpers.
// NOTE: Edge runtime state is ephemeral; this is only for dev / simple demo purposes.
// For production scale (multi-region / serverless) you need a durable hub (Redis, Postgres NOTIFY, Ably, etc.).

export type WSClientMeta = {
  id?: string; // user id (after auth)
  role?: string;
  providerId?: string; // future: attach provider context
  isAuthed: boolean;
  socket: WebSocket;
};

// Use a global registry so hot-reload / multiple imports reuse the same set
const g = globalThis as unknown as { __WS_CLIENTS__?: Set<WSClientMeta> };
if (!g.__WS_CLIENTS__) g.__WS_CLIENTS__ = new Set();
export const clients = g.__WS_CLIENTS__!;

export function broadcast(payload: any, filter?: (c: WSClientMeta) => boolean) {
  const data = JSON.stringify(payload);
  for (const c of clients) {
    if (c.socket.readyState === c.socket.OPEN && (!filter || filter(c))) {
      try {
        c.socket.send(data);
      } catch (_) {}
    }
  }
}

export function register(socket: WebSocket): WSClientMeta {
  const meta: WSClientMeta = { socket, isAuthed: false };
  clients.add(meta);
  socket.addEventListener('close', () => clients.delete(meta));
  socket.addEventListener('error', () => clients.delete(meta));
  return meta;
}

// Simple auth handshake: client sends {type:"auth", token?:string}
// This is a stub; integrate real verification (e.g. JWT) later.
export async function handleMessage(meta: WSClientMeta, raw: MessageEvent) {
  try {
    const msg = typeof raw.data === 'string' ? JSON.parse(raw.data) : null;
    if (!msg) return;
    switch (msg.type) {
      case 'auth': {
        // TODO: verify msg.token (JWT) and populate meta
        // For now, accept any token and echo back. Provide minimal structure.
        meta.isAuthed = true;
        meta.id = msg.userId || 'anonymous';
        meta.role = msg.role || 'USER';
        meta.providerId = msg.providerId;
        meta.socket.send(
          JSON.stringify({ type: 'auth:ok', id: meta.id, role: meta.role })
        );
        break;
      }
      case 'ping': {
        meta.socket.send(JSON.stringify({ type: 'pong', t: Date.now() }));
        break;
      }
      default: {
        // Re-broadcast chat-like messages only if authed
        if (meta.isAuthed && msg.type === 'chat:send') {
          broadcast({ type: 'chat:new', from: meta.id, body: msg.body });
        }
      }
    }
  } catch (err) {
    // Silent parse errors
  }
}
