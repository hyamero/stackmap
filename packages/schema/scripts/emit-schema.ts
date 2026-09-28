import { writeFileSync } from 'node:fs';
import { buildJsonSchema } from '../src/schema';

writeFileSync(new URL('../stackmap.schema.json', import.meta.url), `${JSON.stringify(buildJsonSchema(), null, 2)}\n`);
console.log('wrote stackmap.schema.json');
