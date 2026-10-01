'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

/** The docs carry their navigation in the sidebar, so they take the one-row footer. */
export function FooterFor({ full, docs }: { full: ReactNode; docs: ReactNode }) {
  return usePathname().startsWith('/docs') ? docs : full;
}
