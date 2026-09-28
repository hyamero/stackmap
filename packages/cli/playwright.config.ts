import { defineConfig } from '@playwright/test';

// No web server: the delivered file is opened from disk, as a user would.
export default defineConfig({ testDir: 'e2e', use: { viewport: { width: 1440, height: 960 } } });
