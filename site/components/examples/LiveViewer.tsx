'use client';

import { useState } from 'react';
import type { LaidOutDiagram } from '@stackmap/core';
import { ViewerShell } from '@stackmap/viewer/src/chrome/ViewerShell';
import type { ThemeChoice } from '@stackmap/viewer/src/theme/theme';

/** The real viewer. Its theme toggle themes only this frame, not the page around it. */
export default function LiveViewer({ diagram }: { diagram: LaidOutDiagram }) {
  const [theme, setTheme] = useState<ThemeChoice>('light');
  return (
    <div data-theme={theme} className="size-full bg-page text-fg">
      <ViewerShell diagram={diagram} theme={theme} onToggleTheme={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))} titleAs="h2" />
    </div>
  );
}
