import { readFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import pkg from '../package.json' with { type: 'json' };
import { deliverCommand, validateCommand, type CommandResult } from './commands';

const HELP = `stackmap ${pkg.version}: validate agent-authored diagrams and deliver an offline HTML viewer

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
  if (values.version) return { code: 0, stdout: `${pkg.version}\n`, stderr: '' };
  const [command, file, ...extra] = positionals;
  if (values.help || !command) return { code: values.help ? 0 : 2, stdout: values.help ? HELP : '', stderr: values.help ? '' : HELP };
  if (!file || extra.length) return { code: 2, stdout: '', stderr: `stackmap: ${command} takes exactly one diagram file\n\n${HELP}` };
  if (command === 'validate') return validateCommand(file, { json: !!values.json });
  if (command === 'deliver') {
    const template = readFileSync(new URL('./viewer.html', import.meta.url), 'utf8');
    return deliverCommand(file, { template, out: values.out });
  }
  return { code: 2, stdout: '', stderr: `stackmap: unknown command "${command}"\n\n${HELP}` };
}

const result = await run(process.argv.slice(2));
process.stdout.write(result.stdout);
process.stderr.write(result.stderr);
process.exitCode = result.code;
