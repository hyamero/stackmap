import { describe, expect, it } from 'vitest';
import { plain, styleFor } from '../src/style';

const tty = { isTTY: true };

describe('styleFor', () => {
  it('is plain off a TTY, whatever the environment', () => {
    expect(styleFor({ isTTY: false }, { COLORTERM: 'truecolor' })).toBe(plain);
    expect(plain.banner('deliver')).toBe('');
    expect(plain.path('out.html')).toBe('out.html');
  });

  it('keeps the banner but drops colour with NO_COLOR or a dumb terminal', () => {
    for (const env of [{ NO_COLOR: '1' }, { TERM: 'dumb' }]) {
      const s = styleFor(tty, env);
      expect(s.banner('deliver')).toBe('stackmap · deliver\n');
      expect(s.path('out.html')).toBe('out.html');
    }
  });

  it('prints the wordmark in bold and paths in the accent for the terminal', () => {
    expect(styleFor(tty, { COLORTERM: 'truecolor' }).banner('serve')).toBe('\x1b[1mstackmap\x1b[22m · serve\n');
    expect(styleFor(tty, { COLORTERM: 'truecolor' }).path('a')).toBe('\x1b[38;2;143;166;242ma\x1b[39m');
    expect(styleFor(tty, { COLORTERM: '24bit', COLORFGBG: '0;15' }).path('a')).toBe('\x1b[38;2;79;99;201ma\x1b[39m');
    expect(styleFor(tty, { TERM: 'xterm-256color' }).path('a')).toBe('\x1b[38;5;111ma\x1b[39m');
    expect(styleFor(tty, { TERM: 'xterm-256color', COLORFGBG: '0;7' }).path('a')).toBe('\x1b[38;5;62ma\x1b[39m');
    expect(styleFor(tty, { TERM: 'xterm' }).path('a')).toBe('\x1b[34ma\x1b[39m');
  });
});
