// The npm tarball carries the repo's README, license and third-party notices (they live at the repo root).
import { copyFileSync } from 'node:fs';

for (const f of ['README.md', 'LICENSE', 'THIRD_PARTY_NOTICES.md']) copyFileSync(new URL(`../../../${f}`, import.meta.url), new URL(`../${f}`, import.meta.url));
