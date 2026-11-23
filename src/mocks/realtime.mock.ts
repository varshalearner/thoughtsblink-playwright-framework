import type { Page, WebSocketRoute } from '@playwright/test';
import { z } from 'zod';

// Phoenix channel protocol vsn 2.0.0, as used by supabase-js: [join_ref, ref, topic, event, payload]
const frameSchema = z.tuple([
  z.string().nullable(),
  z.string().nullable(),
  z.string(),
  z.string(),
  z.record(z.string(), z.unknown()),
]);
const joinPayloadSchema = z.object({
  config: z.object({
    postgres_changes: z.array(
      z.object({ event: z.string(), schema: z.string(), table: z.string() }),
    ),
  }),
});

interface Binding {
  id: number;
  event: string;
  schema: string;
  table: string;
}

interface Channel {
  joinRef: string | null;
  topic: string;
  bindings: Binding[];
}

export interface FakeRealtime {
  /** Tells subscribed pages that a row in `table` changed, as Supabase would after a write. */
  announceChange(table: string): void;
}

/**
 * Replaces Supabase Realtime with an in-test server: the page connects as usual, but nothing
 * reaches Supabase, and change events arrive only when the test calls announceChange().
 */
export async function fakeRealtime(page: Page): Promise<FakeRealtime> {
  const sockets: WebSocketRoute[] = [];
  const channels: Channel[] = [];
  let nextBindingId = 1;

  await page.routeWebSocket(/\/realtime\/v1\/websocket/, (ws) => {
    sockets.push(ws);
    ws.onMessage((raw) => {
      const [joinRef, ref, topic, event, payload] = frameSchema.parse(JSON.parse(String(raw)));
      let response: Record<string, unknown> = {};
      if (event === 'phx_join') {
        const bindings = joinPayloadSchema
          .parse(payload)
          .config.postgres_changes.map((binding) => ({ ...binding, id: nextBindingId++ }));
        channels.push({ joinRef, topic, bindings });
        response = { postgres_changes: bindings };
      }
      // Every request (join, heartbeat, access_token, leave) gets an ok reply.
      if (ref !== null) {
        ws.send(JSON.stringify([joinRef, ref, topic, 'phx_reply', { status: 'ok', response }]));
      }
    });
  });

  return {
    announceChange(table) {
      for (const channel of channels) {
        for (const binding of channel.bindings.filter((b) => b.table === table)) {
          const change = {
            ids: [binding.id],
            data: {
              type: 'INSERT',
              schema: binding.schema,
              table,
              commit_timestamp: new Date().toISOString(),
              columns: [],
              record: {},
              errors: null,
            },
          };
          const frame = JSON.stringify([
            channel.joinRef,
            null,
            channel.topic,
            'postgres_changes',
            change,
          ]);
          for (const ws of sockets) ws.send(frame);
        }
      }
    },
  };
}
