import type { LaidOutDiagram } from '@stackmap/core';
import { ViewerShell } from './chrome/ViewerShell';
import { readEmbeddedDiagram } from './data';
import { GalleryPage } from './pages/GalleryPage';
import { commerceApiLayout } from './samples/commerce-api.layout';
import { groupedPlatformLayout } from './samples/grouped-platform.layout';
import { useTheme } from './theme/theme';

type Loaded = { diagram: LaidOutDiagram } | { error: string } | null;

function load(): Loaded {
  try {
    const diagram = readEmbeddedDiagram(document);
    return diagram && { diagram };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

const loaded = load();
if (loaded && 'diagram' in loaded) document.title = `${loaded.diagram.draft.title} · stackmap`;

function Notice({ children }: { children: string }) {
  return (
    <main className="grid h-full place-items-center bg-page p-8 font-sans text-[14px] text-fg-muted">
      <p role="status">{children}</p>
    </main>
  );
}

// Dev server only: samples and the card gallery. The built template renders only embedded data.
function DevPages({ theme, toggle }: ReturnType<typeof useTheme>) {
  const page = new URLSearchParams(location.search).get('page');
  if (page === 'gallery') return <GalleryPage theme={theme} onToggleTheme={toggle} />;
  const diagram = page === 'grouped' ? groupedPlatformLayout : commerceApiLayout;
  return <ViewerShell diagram={diagram} theme={theme} onToggleTheme={toggle} />;
}

export function App() {
  const { theme, toggle } = useTheme();
  if (loaded && 'error' in loaded) return <Notice>{loaded.error}</Notice>;
  if (loaded) return <ViewerShell diagram={loaded.diagram} theme={theme} onToggleTheme={toggle} />;
  if (import.meta.env.DEV) return <DevPages theme={theme} toggle={toggle} />;
  return <Notice>No diagram embedded. Create one with `stackmap deliver`.</Notice>;
}
