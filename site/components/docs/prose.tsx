import type { ReactNode } from 'react';

// The docs' type ramp from the canvas, shared by the quick start and the schema reference.
export const docs = {
  crumb: 'text-sm text-fg-muted',
  h1: 'mt-3.5 scroll-mt-24 text-[44px] leading-[1.02] font-semibold tracking-[-0.04em] md:text-[64px]',
  lede: 'mt-[18px] text-lg leading-normal text-fg-muted md:text-xl',
  h2: 'mt-24 scroll-mt-24 text-[30px] leading-[1.15] font-semibold tracking-[-0.03em] md:text-4xl',
  h3: 'mt-10 scroll-mt-24 text-[19px] leading-[1.35] font-semibold tracking-[-0.015em]',
  p: 'mt-3.5 text-base leading-[1.7] text-fg',
  muted: 'mt-3.5 text-base leading-[1.7] text-fg-muted',
};

export function Code({ children }: { children: ReactNode }) {
  return (
    <code className="rounded-md bg-panel px-1.5 py-px font-mono text-[0.88em] [overflow-wrap:anywhere] box-decoration-clone shadow-[inset_0_0_0_1px_var(--sm-panel-border)]">{children}</code>
  );
}

/** A request the reader can give their agent, as the canvas sets one apart. */
export function Ask({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`mt-4 rounded-[14px] bg-panel px-5 py-4 text-base leading-[1.6] text-fg shadow-[inset_0_0_0_1px_var(--sm-panel-border)] ${className}`}>{children}</p>;
}
