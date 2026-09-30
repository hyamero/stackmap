// Runs before `next build`: every diagram, number and command the site shows comes from here.
import { mkdirSync, writeFileSync } from 'node:fs';
import { layoutSite, readSources } from '../lib/data/diagrams';
import { GENERATED_DIR } from '../lib/data/paths';
import { deliverReceipt, readTemplate, repairRound } from '../lib/data/receipt';
import { schemaReference } from '../lib/data/schema-ref';
import { installCommands, readCliVersion } from '../lib/data/version';

const version = readCliVersion();
const [diagrams, receipt, repair] = await Promise.all([layoutSite(), deliverReceipt(readTemplate()), repairRound()]);

mkdirSync(GENERATED_DIR, { recursive: true });
const write = (name: string, value: unknown) => writeFileSync(new URL(name, GENERATED_DIR), `${JSON.stringify(value)}\n`);
write('site.json', { version, install: installCommands(version), receipt, repair });
write('diagrams.json', diagrams);
write('schema.json', schemaReference());
write('sources.json', readSources());

console.log(`site data: stackmap ${version} · ${Object.keys(diagrams.gallery).length + Object.keys(diagrams.examples).length + Object.keys(diagrams.skill).length} diagrams · receipt ${receipt.sha256.slice(0, 12)}…`);
