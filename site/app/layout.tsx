import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import { tokens } from '@stackmap/core';
import { Footer } from '@/components/site/Footer';
import { Nav } from '@/components/site/Nav';
import { DESCRIPTION, OPEN_GRAPH, REPO, SITE_NAME, siteUrl } from '@/lib/seo';
import { themeCss } from '@/lib/theme';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: { default: `${SITE_NAME} · Interactive system diagrams your coding agent writes`, template: `%s · ${SITE_NAME}` },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: 'hyamero', url: REPO }],
  openGraph: OPEN_GRAPH,
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: tokens.light.page },
    { media: '(prefers-color-scheme: dark)', color: tokens.dark.page },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeCss() }} />
      </head>
      <body>
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
