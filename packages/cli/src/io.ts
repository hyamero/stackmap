import { randomBytes } from 'node:crypto';
import { readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

export class CliError extends Error {}

const reason = (e: unknown) => (e as NodeJS.ErrnoException).code ?? (e as Error).message;

export function readText(path: string): string {
  try {
    return readFileSync(path, 'utf8');
  } catch (e) {
    throw new CliError(`cannot read ${path}: ${reason(e)}`);
  }
}

/** Write to a temp file beside `path`, then rename over it: readers never see a partial file. */
export function writeAtomic(path: string, data: string): void {
  const tmp = join(dirname(path), `.${basename(path)}.${randomBytes(4).toString('hex')}.tmp`);
  try {
    writeFileSync(tmp, data);
    renameSync(tmp, path);
  } catch (e) {
    rmSync(tmp, { force: true });
    throw new CliError(`cannot write ${path}: ${reason(e)}`);
  }
}
