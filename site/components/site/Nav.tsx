import Link from 'next/link';
import type { ThemeName } from '@stackmap/core';
import { GitHubIcon } from '@/components/ui/icons';
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
          <GitHubIcon />
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
