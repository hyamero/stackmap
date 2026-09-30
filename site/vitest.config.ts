import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { environment: 'node', include: ['lib/**/*.test.ts', 'content/**/*.test.ts', 'tests/**/*.test.ts'] },
});
