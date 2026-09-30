import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import { Footer } from '@/components/site/Footer';
import { Nav } from '@/components/site/Nav';
import { themeCss } from '@/lib/theme';
import './globals.css';

export const metadata: Metadata = {
  title: 'stackmap',
  description: 'Interactive system diagrams your coding agent writes, as one offline HTML file.',
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
