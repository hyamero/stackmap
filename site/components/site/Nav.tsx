'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { GitHubIcon } from '@/components/ui/icons';
import { LINKS } from './links';
import { Lockup } from './Lockup';
import { ThemeButton } from './theme';

// The landing's sections the nav follows; `kinds` and `install` have no link, so over them the marker hides.
const SPY = ['how', 'kinds', 'install'] as const;
type Spy = (typeof SPY)[number];

const ITEMS = [
  { ...LINKS.how, spy: 'how' as Spy },
  { ...LINKS.examples, page: (p: string) => p.startsWith('/examples') },
  { ...LINKS.docs, page: (p: string) => p.startsWith('/docs') },
];

/** The section under the middle of the window, on the landing only. */
function useSpy(on: boolean): Spy | null {
  const [at, setAt] = useState<Spy | null>(null);
  useEffect(() => {
    if (!on) return setAt(null);
    const inView = new Map<Spy, boolean>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) inView.set(e.target.id as Spy, e.isIntersecting);
        setAt(SPY.findLast((id) => inView.get(id)) ?? null);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    for (const id of SPY) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, [on]);
  return at;
}

/** Floating nav: the header lets clicks through, only its panels take them. */
export function Nav() {
  const path = usePathname();
  const landing = path === '/';
  const spy = useSpy(landing);
  const [open, setOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const links = useRef<HTMLElement>(null);
  const marker = useRef<HTMLElement>(null);

  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      toggle.current?.focus();
    };
    const onDown = (e: PointerEvent) => header.current?.contains(e.target as Node) || setOpen(false);
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  // The marker slides under the section's link; it is placed by measuring, so web fonts and resizes re-place it.
  useLayoutEffect(() => {
    const place = () => {
      const m = marker.current;
      const a = spy && links.current?.querySelector<HTMLElement>(`[data-spy-link="${spy}"]`);
      if (!m) return;
      if (!a) return void (m.style.opacity = '0');
      m.style.opacity = '1';
      m.style.width = `${a.offsetWidth}px`;
      m.style.translate = `${a.offsetLeft}px 0`;
    };
    place();
    void document.fonts?.ready.then(place);
    addEventListener('resize', place);
    return () => removeEventListener('resize', place);
  }, [spy]);

  const current = (i: (typeof ITEMS)[number]) => {
    if ('page' in i) return i.page(path) ? ('page' as const) : undefined;
    return landing && spy === i.spy ? ('true' as const) : undefined;
  };

  return (
    <header ref={header} className="nav">
      <div className="nav-in">
        <Link href="/" aria-label="stackmap home" className="nav-id pnl">
          <Lockup height={24} />
        </Link>
        <nav ref={links} aria-label="Site" className="nav-links pnl">
          <i ref={marker} className="nav-ind" aria-hidden="true" style={{ opacity: 0 }} />
          {ITEMS.map((i) => (
            <Link key={i.href} href={i.href} className="lnk" aria-current={current(i)} data-spy-link={'spy' in i ? i.spy : undefined}>
              {i.label}
            </Link>
          ))}
          <span className="nav-div" aria-hidden="true" />
          <a className="ib" href={LINKS.github.href} target="_blank" rel="noreferrer" aria-label="stackmap on GitHub">
            <GitHubIcon />
          </a>
          <ThemeButton />
        </nav>
        <div className="nav-m pnl">
          <ThemeButton />
          <button ref={toggle} type="button" className="ib" aria-label="Menu" aria-expanded={open} aria-controls="site-menu" onClick={() => setOpen((o) => !o)}>
            {open ? <X size={18} strokeWidth={1.75} aria-hidden="true" /> : <Menu size={18} strokeWidth={1.75} aria-hidden="true" />}
          </button>
        </div>
        <Link href={LINKS.install.href} className="pbtn nav-cta">
          {LINKS.install.label}
        </Link>
      </div>
      {/* A link to a section of the page it's on doesn't change the path, so a click closes the menu too. */}
      <nav
        id="site-menu"
        aria-label="Site menu"
        className="nav-sheet pnl"
        data-open={open || undefined}
        onClick={(e) => (e.target as HTMLElement).closest('a') && setOpen(false)}
      >
        {ITEMS.map((i) => (
          <Link key={i.href} href={i.href} className="lnk" aria-current={'page' in i && i.page(path) ? 'page' : undefined}>
            {i.label}
          </Link>
        ))}
        <a className="lnk" href={LINKS.github.href} target="_blank" rel="noreferrer">
          {LINKS.github.label}
        </a>
      </nav>
    </header>
  );
}
