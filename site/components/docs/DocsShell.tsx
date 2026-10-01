import Link from 'next/link';
import type { ReactNode } from 'react';
import { LINKS } from '@/components/site/links';
import { GitHubIcon, ExternalIcon } from '@/components/ui/icons';
import { Toc, type TocItem } from './Toc';

type Item = { label: string; href: string; external?: boolean };

const GROUPS: { title: string; items: Item[] }[] = [
  {
    title: 'Get started',
    items: [
      { label: 'Quick start', href: '/docs#quick-start' },
      { label: 'What the agent writes', href: '/docs#json' },
      { label: 'The CLI', href: '/docs#cli' },
    ],
  },
  {
    title: 'Reference',
    items: [
      { label: 'Schema', href: '/docs/schema#schema' },
      { label: 'Nodes and cards', href: '/docs/schema#nodes' },
      { label: 'Connections', href: '/docs/schema#edges' },
      { label: 'Groups, lanes, phases', href: '/docs/schema#groups' },
      { label: 'Views and notes', href: '/docs/schema#views' },
      { label: 'Brand slugs', href: '/docs/schema#brands' },
    ],
  },
  {
    title: 'More',
    items: [
      { label: 'Examples', href: '/examples' },
      { label: 'Authoring contract', href: LINKS.authoring.href, external: true },
      { label: 'GitHub', href: LINKS.github.href, external: true },
    ],
  },
];

const itemClass = 'relative flex h-8 items-center gap-1.5 text-sm text-fg-muted no-underline transition-colors duration-150 hover:text-fg';

function SideNav({ current }: { current: string }) {
  return (
    <div className="flex flex-col gap-7 pl-[18px] shadow-[inset_1.5px_0_0_var(--sm-panel-border)]">
      {GROUPS.map((g) => (
        <div key={g.title}>
          <p className="mb-2.5 text-[12.5px] font-medium text-fg-muted">{g.title}</p>
          <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
            {g.items.map((i) => (
              <li key={i.href}>
                {i.external ? (
                  <a href={i.href} target="_blank" rel="noreferrer" className={itemClass}>
                    {i.label}
                    <ExternalIcon />
                  </a>
                ) : (
                  <Link href={i.href} aria-current={i.href === current ? 'page' : undefined} className={`${itemClass} aria-[current=page]:font-medium aria-[current=page]:text-fg`}>
                    {i.href === current && (
                      <i aria-hidden="true" className="absolute top-3 -left-[23px] size-[9px] rounded-full bg-stage shadow-[inset_0_0_0_1.5px_var(--sm-text)]" />
                    )}
                    {i.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/** The docs' three columns: the section nav, the article, and "on this page". */
export function DocsShell({ current, toc, source, children }: { current: string; toc: TocItem[]; source: string; children: ReactNode }) {
  return (
    <main className="bg-page text-fg">
      <div className="mx-auto grid max-w-[1440px] items-start justify-between gap-12 px-5 pt-28 pb-24 md:px-10 lg:grid-cols-[200px_minmax(0,680px)] lg:pt-32 xl:grid-cols-[232px_minmax(0,680px)_208px] xl:px-24">
        <aside aria-label="Documentation" className="sticky top-24 hidden lg:block">
          <SideNav current={current} />
        </aside>
        <article className="min-w-0">{children}</article>
        <nav aria-label="On this page" className="sticky top-24 hidden xl:block">
          <p className="mb-2.5 text-[12.5px] font-medium text-fg-muted">On this page</p>
          <Toc items={toc} />
          <a href={`${LINKS.github.href}/blob/main/${source}`} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-[13px] text-fg-muted no-underline hover:text-fg">
            <GitHubIcon size={15} />
            <span>Edit on GitHub</span>
          </a>
        </nav>
      </div>
    </main>
  );
}

/** The card at the foot of a page that leads to the next one. */
export function NextLink({ href, label, eyebrow = 'Next' }: { href: string; label: string; eyebrow?: string }) {
  return (
    <Link
      href={href}
      className="mt-24 flex items-center justify-between rounded-2xl bg-panel px-6 py-[22px] text-fg no-underline shadow-[inset_0_0_0_1px_var(--sm-panel-border)] transition-shadow duration-150 hover:shadow-[inset_0_0_0_1.5px_var(--sm-text)]"
    >
      <span>
        <small className="block text-[13px] text-fg-muted">{eyebrow}</small>
        <b className="mt-0.5 block text-[19px] font-semibold tracking-[-0.015em]">{label}</b>
      </span>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </Link>
  );
}
