import { ViewerShell } from './chrome/ViewerShell';
import { GalleryPage } from './pages/GalleryPage';
import { commerceApiLayout } from './samples/commerce-api.layout';
import { groupedPlatformLayout } from './samples/grouped-platform.layout';
import { useTheme } from './theme/theme';

export function App() {
  const { theme, toggle } = useTheme();
  const page = new URLSearchParams(location.search).get('page');
  if (page === 'gallery') return <GalleryPage theme={theme} onToggleTheme={toggle} />;
  const diagram = page === 'grouped' ? groupedPlatformLayout : commerceApiLayout;
  return <ViewerShell diagram={diagram} theme={theme} onToggleTheme={toggle} />;
}
