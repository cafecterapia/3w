import { NextRequest } from 'next/server';
import { broadcast, handleMessage, register } from '@/lib/ws';

// NOTE: We attempt to run on the edge for native WebSocketPair support. If the
// environment does not support edge locally, switch to 'nodejs'.
export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const upgradeHeader = req.headers.get('upgrade');
  if (!upgradeHeader || upgradeHeader.toLowerCase() !== 'websocket') {
    return new Response('Expected WebSocket', { status: 400 });
  }

  // Edge runtime provides WebSocketPair similar to Cloudflare Workers.
  // If not present (e.g., local dev mismatch), return error placeholder.
  const WS: any = (globalThis as any).WebSocketPair;
  if (!WS) {
    return new Response('WebSocket not supported in this runtime', {
      status: 500,
    });
  }

  const pair = new WS();
  const [client, serverRaw] = Object.values(pair) as [WebSocket, WebSocket];
  const server = serverRaw as WebSocket;
  const meta = register(server);

  (server as any).accept?.();

  server.addEventListener('message', (event: MessageEvent) => {
    handleMessage(meta, event);
  });
  server.addEventListener('close', () => {
    broadcast({ type: 'presence:leave', id: meta.id });
  });

  server.send(JSON.stringify({ type: 'hello', message: 'connected' }));
  broadcast({ type: 'presence:join', id: meta.id });

  return new Response(null, {
    status: 101,
    webSocket: client,
  } as any);
}
