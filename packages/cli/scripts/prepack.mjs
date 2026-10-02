// The npm tarball carries the repo's README, license and third-party notices (they live at the repo root).
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs';

for (const f of ['README.md', 'LICENSE', 'THIRD_PARTY_NOTICES.md']) copyFileSync(new URL(`../../../${f}`, import.meta.url), new URL(`../${f}`, import.meta.url));

// npm resolves relative images against the package, not the repo root: point the README's images at GitHub.
const readme = new URL('../README.md', import.meta.url);
const raw = 'https://raw.githubusercontent.com/omsimos/stackmap/main/';
writeFileSync(readme, readFileSync(readme, 'utf8').replace(/(src|srcset)="(assets\/[^"]+)"/g, `$1="${raw}$2"`));
