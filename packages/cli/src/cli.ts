import { readFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { deliverCommand, validateCommand, type CommandResult } from './commands';

// Injected by tsup (define), so the bundle doesn't carry the whole package.json.
declare const __STACKMAP_VERSION__: string;
const VERSION = __STACKMAP_VERSION__;

const HELP = `stackmap ${VERSION}: validate agent-authored diagrams and deliver an offline HTML viewer

Usage:
  stackmap validate <diagram.json> [--json]      check the diagram; exit 1 on errors
  stackmap deliver  <diagram.json> [-o out.html] validate, lay out and write the viewer

Options:
  --json         machine-readable diagnostics (validate)
  -o, --out      output path (deliver; default: next to the input, .html)
  -h, --help     show this help
  -v, --version  show the version
`;

async function run(argv: string[]): Promise<CommandResult> {
  let parsed;
  try {
    parsed = parseArgs({
      args: argv,
      allowPositionals: true,
      options: {
        json: { type: 'boolean' },
        out: { type: 'string', short: 'o' },
        help: { type: 'boolean', short: 'h' },
        version: { type: 'boolean', short: 'v' },
      },
    });
  } catch (e) {
    return { code: 2, stdout: '', stderr: `stackmap: ${(e as Error).message}\n\n${HELP}` };
  }
  const { values, positionals } = parsed;
  if (values.version) return { code: 0, stdout: `${VERSION}\n`, stderr: '' };
  const [command, file, ...extra] = positionals;
  const usage = (msg: string): CommandResult => ({ code: 2, stdout: '', stderr: `stackmap: ${msg}\n\n${HELP}` });
  if (values.help || command === 'help') return { code: 0, stdout: HELP, stderr: '' };
  if (!command) return usage('missing command');
  if (command !== 'validate' && command !== 'deliver') return usage(`unknown command "${command}"`);
  if (!file || extra.length) return usage(`${command} takes exactly one diagram file`);
  if (command === 'validate') {
    if (values.out !== undefined) return usage('-o/--out applies to deliver, not validate');
    return validateCommand(file, { json: !!values.json });
  }
  if (values.json) return usage('--json applies to validate; deliver prints a receipt line');
  let template: string;
  try {
    template = readFileSync(new URL('./viewer.html', import.meta.url), 'utf8');
  } catch (e) {
    return { code: 2, stdout: '', stderr: `stackmap: internal error: viewer template missing (${(e as Error).message})\n` };
  }
  return deliverCommand(file, { template, out: values.out });
}

const result = await run(process.argv.slice(2)).catch(
  (e: unknown): CommandResult => ({ code: 2, stdout: '', stderr: `stackmap: internal error: ${(e as Error).message}\n` }),
);
process.stdout.write(result.stdout);
process.stderr.write(result.stderr);
process.exitCode = result.code;
