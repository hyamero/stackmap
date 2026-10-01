import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { neighbours } from '@/lib/docs-nav';
import { SITE } from '@/lib/site-data';
import { DocsBar, DocsProvider, SideNav } from './DocsNav';
import './docs.css';

/** Every docs page: the sidebar (a bar and sheet on a phone), the article, and the way on to the pages either side. */
export function DocsShell({ href, children }: { href: string; children: ReactNode }) {
  const { prev, next } = neighbours(href);
  return (
    <DocsProvider href={href}>
      <main className="docs">
        <aside className="d-side">
          <SideNav version={SITE.version} />
        </aside>
        <div className="d-main">
          <DocsBar />
          <article className="d-art" id="top">
            {children}
          </article>
          <nav className="d-pn" aria-label="Previous and next">
            {prev ? (
              <Link className="d-pn-a" href={prev.href}>
                <small>
                  <ArrowLeft size={14} strokeWidth={1.75} aria-hidden="true" />
                  Previous
                </small>
                <b>{prev.title}</b>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link className="d-pn-a nx" href={next.href}>
                <small>
                  Next
                  <ArrowRight size={14} strokeWidth={1.75} aria-hidden="true" />
                </small>
                <b>{next.title}</b>
              </Link>
            )}
          </nav>
        </div>
      </main>
    </DocsProvider>
  );
}
