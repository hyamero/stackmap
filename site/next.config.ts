import { fileURLToPath } from 'node:url';
import type { NextConfig } from 'next';

// The workspace packages ship TypeScript source, and Turbopack only reads files under its root.
const repoRoot = fileURLToPath(new URL('..', import.meta.url));

const config: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@stackmap/core', '@stackmap/viewer'],
  turbopack: { root: repoRoot },
  outputFileTracingRoot: repoRoot,
};

export default config;
