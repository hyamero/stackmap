/**
 * Terminal styling from the brand: the wordmark in bold, then a middle dot and the command, and output paths in
 * the brand accent. Only on a TTY; agents read piped output, which stays byte-identical plain text.
 */
export interface Style {
  /** The signature line printed above a command's output, or '' when there is none. */
  banner(command: string): string;
  path(text: string): string;
}

export const plain: Style = { banner: () => '', path: (text) => text };

const sgr = (code: string, text: string, reset: string) => `\x1b[${code}m${text}\x1b[${reset}m`;

export function styleFor(stream: { isTTY?: boolean }, env: NodeJS.ProcessEnv = process.env): Style {
  if (!stream.isTTY) return plain;
  // no-color.org: any non-empty NO_COLOR disables colour; the banner stays, as plain text.
  if (env.NO_COLOR || env.TERM === 'dumb') return { banner: (command) => `stackmap · ${command}\n`, path: (text) => text };
  // COLORFGBG ("fg;bg") is the only widespread hint of a light background: bg 7 or 15.
  const light = /;(7|15)$/.test(env.COLORFGBG ?? '');
  const accent = /truecolor|24bit/i.test(env.COLORTERM ?? '')
    ? light ? '38;2;79;99;201' : '38;2;143;166;242'
    : /256/.test(env.TERM ?? '')
      ? light ? '38;5;62' : '38;5;111'
      : '34';
  return {
    banner: (command) => `${sgr('1', 'stackmap', '22')} · ${command}\n`,
    path: (text) => sgr(accent, text, '39'),
  };
}
