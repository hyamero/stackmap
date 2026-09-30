'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type { ThemeName } from '@stackmap/core';
import { GitHubIcon, MenuIcon } from '@/components/ui/icons';
import { LINKS } from './links';
import { Lockup } from './Lockup';

const ITEMS = [LINKS.viewer, { ...LINKS.kinds, label: 'Kinds' }, LINKS.examples, LINKS.docs];

const panel = 'pointer-events-auto rounded-2xl bg-panel shadow-panel transition-[background-color,box-shadow] duration-200';

/** Floating nav: the header itself lets clicks through, only its panels take them. */
export function Nav() {
  const path = usePathname();
  // The landing opens on a dark scene; its scroll driver retunes the nav per scene from there.
  const theme: ThemeName = path === '/' ? 'dark' : 'light';
  const [open, setOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
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
  return (
    <header ref={header} data-nav="" data-theme={theme} className="pointer-events-none fixed inset-x-0 top-0 z-60 flex items-center gap-2 bg-transparent px-4 pt-4 md:px-[72px]">
      <Link href="/" aria-label="stackmap home" className={`${panel} flex h-11 items-center px-3 md:h-12 md:px-3.5`}>
        <Lockup height={24} />
      </Link>
      <nav aria-label="Site" className={`${panel} hidden h-12 items-center gap-0.5 px-1.5 md:flex`}>
        {ITEMS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            aria-current={path.startsWith(l.href) && !l.href.includes('#') ? 'page' : undefined}
            className="inline-flex h-9 items-center rounded-xl px-3 text-sm text-fg-muted transition-colors duration-150 hover:bg-page hover:text-fg aria-[current=page]:text-fg"
          >
            {l.label}
          </Link>
        ))}
        <span aria-hidden="true" className="mx-1.5 h-5 w-px bg-divider" />
        <a
          href={LINKS.github.href}
          target="_blank"
          rel="noreferrer"
          aria-label="stackmap on GitHub"
          className="sm-press grid size-9 place-items-center rounded-xl text-fg-muted hover:bg-page hover:text-fg"
        >
          <GitHubIcon />
        </a>
      </nav>
      <Link
        href={LINKS.install.href}
        className="sm-press pointer-events-auto ml-auto inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-medium whitespace-nowrap text-primary-fg shadow-[0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.2)]"
      >
        {LINKS.install.label}
      </Link>
      <button
        ref={toggle}
        type="button"
        aria-label="Menu"
        aria-expanded={open}
        aria-controls="site-menu"
        onClick={() => setOpen((o) => !o)}
        className={`${panel} sm-press grid size-11 place-items-center text-fg-muted hover:text-fg md:hidden`}
      >
        <MenuIcon open={open} />
      </button>
      {/* Links to a section of the page it's on don't change the path, so a click closes the menu too. */}
      <nav
        id="site-menu"
        aria-label="Site menu"
        data-open={open || undefined}
        onClick={(e) => (e.target as HTMLElement).closest('a') && setOpen(false)}
        className={`${panel} invisible absolute top-full right-4 mt-2 flex w-56 origin-top-right scale-[0.97] flex-col p-1.5 opacity-0 transition-[opacity,scale,visibility] duration-180 ease-[cubic-bezier(0.23,1,0.32,1)] data-open:visible data-open:scale-100 data-open:opacity-100 motion-reduce:transition-none md:hidden`}
      >
        {[...ITEMS, LINKS.github].map((l) => {
          const external = l.href.startsWith('http');
          return (
            <Link
              key={l.href}
              href={l.href}
              {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
              aria-current={path.startsWith(l.href) && !l.href.includes('#') ? 'page' : undefined}
              className="flex h-11 items-center gap-2 rounded-xl px-3 text-[15px] text-fg-muted transition-colors duration-150 hover:bg-page hover:text-fg aria-[current=page]:text-fg"
            >
              {external && <GitHubIcon size={16} />}
              {l.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
