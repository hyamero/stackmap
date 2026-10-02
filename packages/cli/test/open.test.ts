import { describe, expect, it } from 'vitest';
import { browserCommand } from '../src/open';

describe('browserCommand', () => {
  it("uses each platform's own opener", () => {
    expect(browserCommand('/tmp/a b.html', 'darwin')).toEqual({ cmd: 'open', args: ['/tmp/a b.html'] });
    expect(browserCommand('C:\\d\\a.html', 'win32')).toEqual({ cmd: 'cmd', args: ['/c', 'start', '""', 'C:\\d\\a.html'] });
    expect(browserCommand('/tmp/a.html', 'linux')).toEqual({ cmd: 'xdg-open', args: ['/tmp/a.html'] });
  });
});
