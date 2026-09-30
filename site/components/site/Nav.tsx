import Link from 'next/link';
import type { ThemeName } from '@stackmap/core';
import { LINKS } from './links';
import { Lockup } from './Lockup';

const ITEMS = [LINKS.viewer, { ...LINKS.kinds, label: 'Kinds' }, LINKS.examples, LINKS.docs];

const panel = 'pointer-events-auto rounded-2xl bg-panel shadow-panel transition-[background-color,box-shadow] duration-200';

/** Floating nav: the header itself lets clicks through, only its panels take them. */
export function Nav({ theme = 'light' }: { theme?: ThemeName }) {
  return (
    <header data-theme={theme} className="pointer-events-none fixed inset-x-0 top-0 z-60 flex items-center gap-2 bg-transparent px-4 pt-4 md:px-[72px]">
      <Link href="/" aria-label="stackmap home" className={`${panel} flex h-11 items-center px-3 md:h-12 md:px-3.5`}>
        <Lockup height={24} />
      </Link>
      <nav aria-label="Site" className={`${panel} hidden h-12 items-center gap-0.5 px-1.5 md:flex`}>
        {ITEMS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="inline-flex h-9 items-center rounded-xl px-3 text-sm text-fg-muted transition-colors duration-150 hover:bg-page hover:text-fg"
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
          <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
          </svg>
        </a>
      </nav>
      <Link
        href={LINKS.install.href}
        className="sm-press pointer-events-auto ml-auto inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-medium whitespace-nowrap text-primary-fg shadow-[0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.2)]"
      >
        {LINKS.install.label}
      </Link>
    </header>
  );
}
