import { writeFileSync } from 'node:fs';
import { buildJsonSchema } from '../src/schema';
import { renderSchemaDoc } from '../src/schema-doc';

const json = `${JSON.stringify(buildJsonSchema(), null, 2)}\n`;
const out = (p: string, text: string) => {
  writeFileSync(new URL(p, import.meta.url), text);
  console.log(`wrote ${p.replace(/^(\.\.\/)+/, '')}`);
};
out('../stackmap.schema.json', json);
// The skill ships its own copy so an agent can read the contract offline.
out('../../../skill/references/stackmap.schema.json', json);
out('../../../skill/references/schema.md', renderSchemaDoc());
