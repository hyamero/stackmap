#!/bin/sh
# Regenerates the Linux visual baselines in Playwright's official image. The repo is copied into the
# container (so the host's node_modules are never touched) and only the PNGs are copied back.
set -eu
root="$(cd "$(dirname "$0")/../../.." && pwd)"
image="mcr.microsoft.com/playwright:v1.63.0-noble"
docker run --rm -v "$root:/src:ro" -v "$root/packages/viewer/e2e:/out" "$image" bash -euc '
  mkdir /work && cd /src && tar --exclude=node_modules --exclude=.git --exclude=docs --exclude=dist -cf - . | tar -xf - -C /work
  cd /work && npm i -g bun@1.3.14 >/dev/null && bun install --frozen-lockfile >/dev/null
  cd packages/viewer && VISUAL=1 bunx playwright test e2e/visual.spec.ts --update-snapshots=all "$@"
  rm -rf /out/visual.spec.ts-snapshots && cp -r e2e/visual.spec.ts-snapshots /out/
' -- "$@"
