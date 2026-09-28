import { Download, Filter, Moon, Route, Search, Sun } from 'lucide-react';
import type { ThemeChoice } from '../theme/theme';
import { IconButton, PANEL_CLASS, PANEL_STYLE, ToolbarDivider } from './ui';

// Search, lens, trace and export are wired in M3/M4; M0 fixes their look and placement.
export function Toolbar({ theme, onToggleTheme }: { theme: ThemeChoice; onToggleTheme: () => void }) {
  const next = theme === 'dark' ? 'light' : 'dark';
  return (
    <div className={`${PANEL_CLASS} flex items-center gap-0.5 p-1.5`} style={PANEL_STYLE}>
      <IconButton label="Search nodes">
        <Search size={17} strokeWidth={1.75} />
      </IconButton>
      <IconButton label="Filter by type">
        <Filter size={17} strokeWidth={1.75} />
      </IconButton>
      <IconButton label="Trace connections">
        <Route size={17} strokeWidth={1.75} />
      </IconButton>
      <ToolbarDivider />
      <IconButton label={`Switch to ${next} theme`} onClick={onToggleTheme}>
        {theme === 'dark' ? <Sun size={17} strokeWidth={1.75} /> : <Moon size={17} strokeWidth={1.75} />}
      </IconButton>
      <button
        type="button"
        className="ml-1 flex h-9 items-center gap-2 rounded-full bg-primary px-4 text-[14px] font-medium text-primary-fg"
      >
        <Download size={16} strokeWidth={2} aria-hidden="true" />
        Export
      </button>
    </div>
  );
}
