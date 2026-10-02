import { spawn } from 'node:child_process';

/** The command that opens a file in the default browser on `platform`. */
export function browserCommand(file: string, platform: NodeJS.Platform = process.platform): { cmd: string; args: string[] } {
  if (platform === 'darwin') return { cmd: 'open', args: [file] };
  // `start` is a cmd builtin, and its first quoted argument is the window title.
  if (platform === 'win32') return { cmd: 'cmd', args: ['/c', 'start', '""', file] };
  return { cmd: 'xdg-open', args: [file] };
}

/**
 * Opens `file` in the default browser; resolves null once the opener has handed it off, or why it couldn't (no
 * opener installed, a headless machine). An opener that is still running after a moment is taken as success.
 */
export function openInBrowser(file: string): Promise<string | null> {
  const { cmd, args } = browserCommand(file);
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { stdio: 'ignore', detached: true, windowsVerbatimArguments: cmd === 'cmd' });
    const timer = setTimeout(() => resolve(null), 3000);
    const done = (why: string | null) => {
      clearTimeout(timer);
      resolve(why);
    };
    child.once('error', (e) => done((e as NodeJS.ErrnoException).code === 'ENOENT' ? `${cmd} not found` : e.message));
    child.once('exit', (code) => done(code ? `${cmd} exited with ${code}` : null));
    child.unref();
  });
}
