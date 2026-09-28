import { useTheme } from './theme/theme';

export function App() {
  const { theme, toggle } = useTheme();
  return (
    <main className="grid h-full place-items-center bg-page font-sans text-fg">
      <div className="space-y-3 text-center">
        <p className="text-[28px] font-semibold tracking-tight">stackmap</p>
        <p className="font-mono text-[13px] text-fg-muted">10.44.0.11 :3000</p>
        <button className="rounded-full bg-primary px-4 py-2 text-[14px] text-primary-fg" onClick={toggle}>
          {theme === 'dark' ? 'Light' : 'Dark'} mode
        </button>
      </div>
    </main>
  );
}
