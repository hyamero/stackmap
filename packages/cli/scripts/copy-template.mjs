// Copies the built viewer into dist/viewer.html, refusing a missing or dev-server build.
import { copyFileSync, existsSync, readFileSync } from 'node:fs';

const src = new URL('../../viewer/dist/index.html', import.meta.url);
const fail = (msg) => {
  console.error(`✗ ${msg}; run \`bun run build\` from the repo root (it builds the viewer first)`);
  process.exit(1);
};
if (!existsSync(src)) fail('viewer build missing');
const html = readFileSync(src, 'utf8');
if (!html.includes('<script type="application/json" id="stackmap-data"></script>')) fail('viewer build has no empty data block');
if (/<script[^>]+src=/.test(html)) fail('viewer build is not single-file');
copyFileSync(src, new URL('../dist/viewer.html', import.meta.url));
