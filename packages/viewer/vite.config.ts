import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { defineConfig, type Plugin } from 'vitest/config';
import { BRANDS } from './src/icons/brands.gen';
import { BRANDS_ELEMENT_ID } from './src/icons/brands.runtime';

// The built template carries the brand marks as JSON rather than code, so deliver can drop the ~170 KB a
// diagram doesn't draw. The dev server, tests and the website keep importing brands.gen directly.
const brandsAsData = (): Plugin => ({
  name: 'stackmap-brands-as-data',
  apply: 'build',
  enforce: 'pre',
  resolveId(source, importer) {
    if (source === './brands.gen' && importer?.endsWith('/icons/BrandIcon.tsx')) return fileURLToPath(new URL('./src/icons/brands.runtime.ts', import.meta.url));
  },
  transformIndexHtml: (html) =>
    html.replace('</body>', `<script type="application/json" id="${BRANDS_ELEMENT_ID}">${JSON.stringify(BRANDS).replace(/</g, '\\u003c')}</script>\n  </body>`),
});

export default defineConfig({
  plugins: [brandsAsData(), react(), tailwindcss(), viteSingleFile()],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./src/test-setup.ts'],
  },
});
