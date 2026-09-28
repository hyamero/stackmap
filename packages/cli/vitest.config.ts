import { defineConfig } from 'vitest/config';

// ELK's first layout in a cold worker can take seconds under a parallel build.
export default defineConfig({ test: { include: ['test/**/*.test.ts'], testTimeout: 20_000 } });
