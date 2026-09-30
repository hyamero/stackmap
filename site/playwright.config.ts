import { defineConfig } from '@playwright/test';

// Smoke checks against the production build (`next build` first). Reduced motion by default: every scene
// is then its resting frame; the motion test opts back in.
export default defineConfig({
  testDir: './e2e',
  use: { baseURL: 'http://localhost:4310', viewport: { width: 1440, height: 900 }, contextOptions: { reducedMotion: 'reduce' } },
  webServer: { command: 'bunx next start --port 4310', url: 'http://localhost:4310', reuseExistingServer: !process.env.CI },
});
