import { createHash } from 'node:crypto';
import { watch, type FSWatcher } from 'node:fs';
import { createServer, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';
import { basename, dirname } from 'node:path';
import type { Diagnostic } from '@stackmap/schema';
import { buildHtml } from './commands';
import { CliError } from './io';

/** Present only in served pages: the viewer opens an EventSource when it finds this block. */
export const LIVE_BLOCK_ID = 'stackmap-live';
const LIVE_BLOCK = `<script type="application/json" id="${LIVE_BLOCK_ID}">{"events":"/events"}</script>`;
const DEBOUNCE_MS = 100;
const PORT_ATTEMPTS = 20;

export interface ServeHandle {
  url: string;
  close(): Promise<void>;
}

export interface ServeOptions {
  template: string;
  /** 0 = any free port */
  port?: number;
  log?: (line: string) => void;
}

const withLive = (html: string) => {
  const at = html.lastIndexOf('</body>');
  return at < 0 ? html + LIVE_BLOCK : html.slice(0, at) + LIVE_BLOCK + html.slice(at);
};

function listen(server: ReturnType<typeof createServer>, port: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const tryPort = (p: number, left: number) => {
      const onError = (e: NodeJS.ErrnoException) => {
        server.off('listening', onListening);
        if (e.code === 'EADDRINUSE' && port !== 0 && left > 1) tryPort(p + 1, left - 1);
        else reject(new CliError(`cannot listen on 127.0.0.1:${p}: ${e.code ?? e.message}`));
      };
      const onListening = () => {
        server.off('error', onError);
        resolve((server.address() as AddressInfo).port);
      };
      server.once('error', onError);
      server.once('listening', onListening);
      // Loopback only: a live preview of a codebase's architecture is nobody else's business.
      server.listen(p, '127.0.0.1');
    };
    tryPort(port, PORT_ATTEMPTS);
  });
}

export async function serve(path: string, { template, port = 4400, log = () => {} }: ServeOptions): Promise<ServeHandle> {
  let page = withLive(template);
  let state: { ok: boolean; diagnostics: Diagnostic[] } = { ok: false, diagnostics: [] };
  let lastInput = '';
  const clients = new Set<ServerResponse>();

  const send = (res: ServerResponse, event: string, data: string) => res.write(`event: ${event}\ndata: ${data}\n\n`);
  const broadcast = (event: string, data: string) => clients.forEach((res) => send(res, event, data));

  let built = false;
  const rebuild = async () => {
    let result: Awaited<ReturnType<typeof buildHtml>>;
    try {
      result = await buildHtml(path, template);
    } catch (e) {
      const diagnostic: Diagnostic = {
        code: 'io/unreadable',
        severity: 'error',
        subject: '',
        message: (e as Error).message,
        evidence: { path },
        allowedFixes: [`restore ${basename(path)}`],
      };
      result = { ok: false, diagnostics: [diagnostic] };
    }
    const next = { ok: result.ok, diagnostics: result.diagnostics };
    const key = createHash('sha256').update(JSON.stringify(next)).update(result.html ?? '').digest('hex');
    if (key === lastInput) return; // a save that changed nothing
    lastInput = key;
    state = next;
    broadcast('diagnostics', JSON.stringify(state));
    if (result.html !== undefined) {
      page = withLive(result.html);
      broadcast('reload', '');
      log(`✓ ${basename(path)} ${built ? 'reloaded' : 'ready'}`);
      built = true;
    } else {
      const errors = state.diagnostics.filter((d) => d.severity === 'error').length;
      log(`✗ ${basename(path)}: ${errors} error${errors === 1 ? '' : 's'}; keeping the last good version`);
    }
  };

  await rebuild();

  const server = createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    if (req.method === 'GET' && url.pathname === '/') {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
      res.end(page);
    } else if (req.method === 'GET' && url.pathname === '/events') {
      res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-store', connection: 'keep-alive' });
      res.write('retry: 1000\n\n');
      send(res, 'diagnostics', JSON.stringify(state));
      clients.add(res);
      req.on('close', () => clients.delete(res));
    } else {
      res.writeHead(404, { 'content-type': 'text/plain' });
      res.end('not found');
    }
  });

  // Editors save by writing a temp file and renaming it over the original, so watch the directory.
  let timer: NodeJS.Timeout | undefined;
  let running = Promise.resolve();
  const watcher: FSWatcher = watch(dirname(path), (_event, name) => {
    if (name !== null && name !== basename(path)) return;
    clearTimeout(timer);
    timer = setTimeout(() => {
      running = running.then(rebuild);
    }, DEBOUNCE_MS);
  });
  const keepAlive = setInterval(() => clients.forEach((res) => res.write(': ping\n\n')), 15_000);

  const bound = await listen(server, port).catch((e) => {
    watcher.close();
    clearInterval(keepAlive);
    throw e;
  });
  return {
    url: `http://127.0.0.1:${bound}`,
    close: async () => {
      clearTimeout(timer);
      clearInterval(keepAlive);
      watcher.close();
      clients.forEach((res) => res.end());
      await running;
      await new Promise<void>((resolve) => server.close(() => resolve()));
    },
  };
}
