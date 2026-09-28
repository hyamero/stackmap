import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { commerceApi } from '@stackmap/core/samples';
import { EMPTY_DATA_BLOCK } from '../src/embed';
import { LIVE_BLOCK_ID, serve, type ServeHandle } from '../src/serve';

const TEMPLATE = `<!doctype html><html><head><title>stackmap</title></head><body><div id="root"></div>${EMPTY_DATA_BLOCK}</body></html>`;
let dir: string;
let file: string;
let server: ServeHandle | undefined;
const write = (content: unknown) => writeFileSync(file, typeof content === 'string' ? content : JSON.stringify(content));

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'stackmap-serve-'));
  file = join(dir, 'd.json');
});
afterEach(async () => {
  await server?.close();
  server = undefined;
});

type Sse = { event: string; data: string };
/** An open /events stream; `next` reads until an event satisfies `pred`. */
async function subscribe(url: string) {
  const res = await fetch(`${url}/events`);
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  const queue: Sse[] = [];
  const next = async (pred: (e: Sse) => boolean): Promise<Sse> => {
    const deadline = Date.now() + 8000;
    for (;;) {
      const i = queue.findIndex(pred);
      if (i >= 0) return queue.splice(0, i + 1).at(-1)!;
      if (Date.now() > deadline) throw new Error(`timed out; queue ${JSON.stringify(queue)}`);
      const { value, done } = await reader.read();
      if (done) throw new Error('stream closed');
      buf += decoder.decode(value, { stream: true });
      let at: number;
      while ((at = buf.indexOf('\n\n')) >= 0) {
        const chunk = buf.slice(0, at);
        buf = buf.slice(at + 2);
        const event = /^event: (.*)$/m.exec(chunk)?.[1];
        if (event) queue.push({ event, data: /^data: (.*)$/m.exec(chunk)?.[1] ?? '' });
      }
    }
  };
  // Every client is greeted with the current diagnostics, so waiting for it means we are connected.
  const hello = await next((e) => e.event === 'diagnostics');
  return { hello, next, close: () => reader.cancel() };
}
const isDiag = (ok: boolean) => (e: Sse) => e.event === 'diagnostics' && JSON.parse(e.data).ok === ok;
const isReload = (e: Sse) => e.event === 'reload';

const page = async (url: string) => (await fetch(url)).text();
const titleOf = (html: string) => /<title>(.*?)<\/title>/.exec(html)?.[1];
const withTitle = (title: string) => ({ ...commerceApi, title });

describe('serve', () => {
  it('serves the live viewer on 127.0.0.1 and sends the current diagnostics to a new client', async () => {
    write(commerceApi);
    server = await serve(file, { template: TEMPLATE, port: 0 });
    expect(server.url).toMatch(/^http:\/\/127\.0\.0\.1:\d+$/);
    const html = await page(server.url);
    expect(titleOf(html)).toBe('Commerce API · stackmap');
    expect(html).toContain(`<script type="application/json" id="${LIVE_BLOCK_ID}">{"events":"/events"}</script>`);
    const sse = await subscribe(server.url);
    expect(sse.hello).toEqual({ event: 'diagnostics', data: JSON.stringify({ ok: true, diagnostics: [] }) });
    await sse.close();
    expect((await fetch(`${server.url}/nope`)).status).toBe(404);
  });

  it('reloads on a good edit, keeps the last good page on a broken one, recovers when fixed', async () => {
    write(commerceApi);
    server = await serve(file, { template: TEMPLATE, port: 0 });
    const url = server.url;

    const sse = await subscribe(url);
    write('{ "kind": ');
    const broken = await sse.next(isDiag(false));
    expect(JSON.parse(broken.data).diagnostics[0].code).toBe('schema/invalid-json');
    expect(titleOf(await page(url))).toBe('Commerce API · stackmap');

    write(withTitle('Commerce v2'));
    await sse.next(isDiag(true));
    await sse.next(isReload);
    expect(titleOf(await page(url))).toBe('Commerce v2 · stackmap');
    await sse.close();
  });

  it('keeps the last good page when the file disappears, and recovers when it returns', async () => {
    write(commerceApi);
    server = await serve(file, { template: TEMPLATE, port: 0 });
    const sse = await subscribe(server.url);
    rmSync(file);
    const gone = await sse.next(isDiag(false));
    expect(JSON.parse(gone.data).diagnostics[0]).toMatchObject({ code: 'io/unreadable' });
    expect(titleOf(await page(server.url))).toBe('Commerce API · stackmap');
    write(withTitle('Back again'));
    await sse.next(isReload);
    expect(titleOf(await page(server.url))).toBe('Back again · stackmap');
    await sse.close();
  });

  it('starts on an invalid file with the bare live template', async () => {
    write({ kind: 'architecture' });
    server = await serve(file, { template: TEMPLATE, port: 0 });
    const html = await page(server.url);
    expect(html).toContain(EMPTY_DATA_BLOCK);
    expect(html).toContain(LIVE_BLOCK_ID);
    const sse = await subscribe(server.url);
    expect(JSON.parse(sse.hello.data).ok).toBe(false);
    await sse.close();
  });
});
