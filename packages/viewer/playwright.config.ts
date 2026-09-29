import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  // Reduced motion by default: screenshots and timing-sensitive checks see the resting state. motion.spec opts back in.
  use: { baseURL: 'http://localhost:4173', viewport: { width: 1440, height: 960 }, deviceScaleFactor: 2, contextOptions: { reducedMotion: 'reduce' } },
  webServer: { command: 'bunx vite --port 4173 --strictPort', url: 'http://localhost:4173', reuseExistingServer: true },
});
