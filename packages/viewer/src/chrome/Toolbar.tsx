import { Filter, Moon, Route, Search, Sun } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useExplore } from '../explore/ExploreContext';
import type { ThemeChoice } from '../theme/theme';
import { ExportMenu } from './ExportMenu';
import { LensPanel } from './LensPanel';
import { SearchPanel } from './SearchPanel';
import { IconButton, PANEL_CLASS, PANEL_STYLE, ToolbarDivider } from './ui';

const typing = (t: EventTarget | null) => t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));

export function Toolbar({ theme, onToggleTheme }: { theme: ThemeChoice; onToggleTheme: () => void }) {
  const { state, dispatch } = useExplore();
  const [lensOpen, setLensOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const searchButton = useRef<HTMLButtonElement>(null);
  const lensButton = useRef<HTMLButtonElement>(null);
  const closeSearch = () => {
    dispatch({ type: 'search', query: null });
    searchButton.current?.focus();
  };
  const closeLens = () => {
    setLensOpen(false);
    lensButton.current?.focus();
  };
  const next = theme === 'dark' ? 'light' : 'dark';
  const searchOpen = state.query !== null;

  // "/" opens search from anywhere except a text field; Escape from the page body clears the selection
  // (cards, the stage and the popovers handle their own Escape and stop it).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !e.defaultPrevented && (e.target === document.body || e.target === document.documentElement)) {
        dispatch({ type: 'clear' });
        return;
      }
      if (e.key !== '/' || typing(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
      e.preventDefault();
      setLensOpen(false);
      dispatch({ type: 'search', query: '' });
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [dispatch]);

  // Clicking outside closes the popovers.
  useEffect(() => {
    if (!searchOpen && !lensOpen) return;
    const onDown = (e: PointerEvent) => {
      if (root.current?.contains(e.target as Node)) return;
      setLensOpen(false);
      if (searchOpen) dispatch({ type: 'search', query: null });
    };
    addEventListener('pointerdown', onDown);
    return () => removeEventListener('pointerdown', onDown);
  }, [searchOpen, lensOpen, dispatch]);

  return (
    <div
      ref={root}
      className={`${PANEL_CLASS} relative flex items-center gap-0.5 p-1.5`}
      style={PANEL_STYLE}
      onKeyDown={(e) => {
        if (e.key !== 'Escape' || !lensOpen) return;
        e.preventDefault();
        e.stopPropagation();
        closeLens();
      }}
    >
      <IconButton
        ref={searchButton}
        label="Search nodes (/)"
        pressed={searchOpen}
        expanded={searchOpen}
        onClick={() => {
          setLensOpen(false);
          dispatch({ type: 'search', query: searchOpen ? null : '' });
        }}
      >
        <Search size={17} strokeWidth={1.75} />
      </IconButton>
      <IconButton
        ref={lensButton}
        label="Filter by type"
        pressed={lensOpen || state.hiddenTypes.size > 0}
        expanded={lensOpen}
        onClick={() => {
          dispatch({ type: 'search', query: null });
          setLensOpen((v) => !v);
        }}
      >
        <Filter size={17} strokeWidth={1.75} />
      </IconButton>
      <IconButton label="Trace upstream and downstream of the selection" pressed={state.trace} onClick={() => dispatch({ type: 'toggleTrace' })}>
        <Route size={17} strokeWidth={1.75} />
      </IconButton>
      <ToolbarDivider />
      <IconButton label={`Switch to ${next} theme`} onClick={onToggleTheme}>
        {theme === 'dark' ? <Sun size={17} strokeWidth={1.75} /> : <Moon size={17} strokeWidth={1.75} />}
      </IconButton>
      <ExportMenu />
      {searchOpen && <SearchPanel onClose={closeSearch} />}
      {lensOpen && <LensPanel />}
    </div>
  );
}
