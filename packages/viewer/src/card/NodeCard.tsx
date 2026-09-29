import { ArrowUpRight, GitBranch, Layers, MapPin, ShieldCheck } from 'lucide-react';
import type { CSSProperties } from 'react';
import { CARD, cardSize, type DiagramNode, type FooterIcon, type FooterItem } from '@stackmap/core';
import { BrandIcon, hasBrand } from '../icons/BrandIcon';
import { TypeIcon } from '../icons/TypeIcon';

const FOOTER_ICONS = { region: MapPin, secure: ShieldCheck, members: Layers } satisfies Record<FooterIcon, unknown>;

// Inset shadows instead of borders: outlines must not change the fixed section heights.
const ring = (color: string): CSSProperties => ({ boxShadow: `inset 0 0 0 1px ${color}` });

function Footer({ item, align }: { item?: FooterItem; align: 'left' | 'right' }) {
  if (!item) return <span />;
  const Icon = item.icon ? FOOTER_ICONS[item.icon] : null;
  return (
    <span className={`flex min-w-0 items-center gap-1.5 ${align === 'right' ? 'justify-end' : ''}`}>
      {Icon && <Icon size={13} strokeWidth={1.75} aria-hidden="true" className="shrink-0" />}
      <span className="truncate" title={item.text}>
        {item.text}
      </span>
    </span>
  );
}

export function NodeCard({ node }: { node: DiagramNode }) {
  const { type, card } = node;
  const tint = (key: 'fill' | 'border' | 'tile' | 'accent') => `var(--sm-${type}-${key})`;
  const { height } = cardSize(card);
  const hasStats = !!card.stats?.length;

  return (
    <div
      data-testid="node-card"
      data-node-id={node.id}
      data-type={type}
      className="flex flex-col overflow-hidden font-sans"
      style={{ width: CARD.width, height, borderRadius: CARD.radius, background: tint('fill'), ...ring(tint('border')) }}
    >
      <header className="flex shrink-0 items-center gap-3 px-4" style={{ height: CARD.header }}>
        <div
          className="grid size-9 shrink-0 place-items-center rounded-[10px]"
          style={{ background: tint('tile'), color: tint('accent') }}
        >
          {card.brand && hasBrand(card.brand) ? <BrandIcon slug={card.brand} size={17} /> : <TypeIcon type={type} size={17} />}
        </div>
        <div className="min-w-0">
          <div className="truncate text-[13.5px] leading-5 font-medium text-fg" title={card.title}>
            {card.title}
          </div>
          {card.subtitle && (
            <div className="truncate text-[12px] leading-4 text-fg-muted" title={card.subtitle}>
              {card.subtitle}
            </div>
          )}
        </div>
      </header>

      {!!card.rows?.length && (
        <div data-testid="card-rows" className="shrink-0" style={{ paddingBlock: CARD.rowsPad }}>
          {card.rows.map((row, i) => (
            <div key={i} className="flex items-center justify-between gap-3 px-4 text-[12px]" style={{ height: CARD.row }}>
              <span className="truncate text-fg-muted" title={row.label}>
                {row.label}
              </span>
              <span className={`max-w-[55%] shrink-0 truncate text-fg ${row.mono ? 'font-mono' : ''}`} title={row.value}>
                {row.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {hasStats && (
        <div className="shrink-0 px-3" style={{ marginBottom: CARD.statsGap }}>
          <div
            data-testid="card-stats"
            className="flex flex-col overflow-hidden rounded-[10px]"
            style={{
              height: CARD.statsTiles + (card.statsNote ? CARD.statsNote : 0),
              background: tint('tile'),
              ...ring(tint('border')),
            }}
          >
            <div
              className="grid gap-1.5 p-1.5"
              style={{ height: CARD.statsTiles, gridTemplateColumns: `repeat(${card.stats!.length}, minmax(0, 1fr))` }}
            >
              {card.stats!.map((stat, i) => (
                <div key={i} className="flex min-w-0 flex-col justify-center rounded-lg bg-stage px-2.5">
                  <span className="truncate text-[15px] leading-5 font-medium text-fg tabular-nums" title={stat.value}>
                    {stat.value}
                  </span>
                  <span className="truncate text-[11px] leading-4 text-fg-muted" title={stat.label}>
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
            {card.statsNote && (
              <div className="flex items-center gap-1.5 px-3 text-[11.5px] text-fg-muted" style={{ height: CARD.statsNote }}>
                <GitBranch size={12} strokeWidth={1.75} aria-hidden="true" />
                <span className="truncate" title={card.statsNote}>
                  {card.statsNote}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {card.footer && (
        <footer
          data-testid="card-footer"
          className="grid shrink-0 grid-cols-2 items-center gap-3 px-4 text-[12px] text-fg-muted"
          style={{ height: CARD.footer, boxShadow: `inset 0 1px 0 ${tint('border')}` }}
        >
          <Footer item={card.footer.left} align="left" />
          <Footer item={card.footer.right} align="right" />
        </footer>
      )}

      {card.cta && (
        <div data-testid="card-cta" className="shrink-0 px-3" style={{ height: CARD.cta }}>
          {card.cta.href ? (
            <a
              href={card.cta.href}
              // Not a tab stop inside the card (nested interactive); the inspector repeats the link.
              tabIndex={-1}
              target="_blank"
              rel="noreferrer"
              className="flex h-9 items-center justify-between rounded-lg px-3 text-[13px] font-medium text-fg"
              style={{ background: tint('tile') }}
            >
              <span className="truncate" title={card.cta.label}>
                {card.cta.label}
              </span>
              <ArrowUpRight size={15} strokeWidth={1.75} aria-hidden="true" style={{ color: tint('accent') }} />
            </a>
          ) : (
            // No link: same tile, but no arrow promising navigation that isn't there.
            <div className="flex h-9 items-center rounded-lg px-3 text-[13px] font-medium text-fg" style={{ background: tint('tile') }}>
              <span className="truncate" title={card.cta.label}>
                {card.cta.label}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
