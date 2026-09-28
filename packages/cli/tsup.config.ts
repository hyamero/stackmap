import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/cli.ts'],
  format: 'esm',
  platform: 'node',
  target: 'node22',
  clean: true,
  // Workspace packages and zod are bundled; elkjs (EPL-2.0) stays a runtime dependency, never vendored.
  noExternal: [/^@stackmap\//, 'zod'],
  external: ['elkjs'],
  banner: { js: '#!/usr/bin/env node' },
});
