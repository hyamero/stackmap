import type { MetadataRoute } from 'next';
import { tokens } from '@stackmap/core';
import { DESCRIPTION, SITE_NAME } from '@/lib/seo';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: DESCRIPTION,
    start_url: '/',
    display: 'browser',
    background_color: tokens.light.page,
    theme_color: tokens.light.page,
    icons: [
      { src: '/icon.svg', type: 'image/svg+xml', sizes: 'any' },
      { src: '/brand/stackmap-app-icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
  };
}
