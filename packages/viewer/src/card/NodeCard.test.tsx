import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { cardSize, type DiagramNode } from '@stackmap/core';
import { NodeCard } from './NodeCard';

const rich: DiagramNode = {
  id: 'orders',
  type: 'database',
  card: {
    title: 'Orders',
    subtitle: 'PostgreSQL cluster',
    brand: 'postgresql',
    rows: [{ label: '2 vCPU · 2 GB', value: ':3000', mono: true }],
    stats: [
      { value: '1', label: 'Primary' },
      { value: '2', label: 'Read replicas' },
    ],
    statsNote: '2 replication links',
    footer: { left: { text: 'EU West', icon: 'region' }, right: { text: '3 members', icon: 'members' } },
    cta: { label: 'Open cluster', href: 'https://example.com' },
  },
};

describe('NodeCard', () => {
  it('renders only the header for a bare node', () => {
    render(<NodeCard node={{ id: 'a', type: 'service', card: { title: 'api' } }} />);
    const card = screen.getByTestId('node-card');
    expect(card).toHaveTextContent('api');
    for (const id of ['card-rows', 'card-stats', 'card-footer', 'card-cta']) expect(screen.queryByTestId(id)).toBeNull();
    expect(card.style.height).toBe(`${cardSize({ title: 'api' }).height}px`);
  });

  it('renders every section of a rich node at the measured height', () => {
    render(<NodeCard node={rich} />);
    for (const id of ['card-rows', 'card-stats', 'card-footer', 'card-cta']) expect(screen.getByTestId(id)).toBeInTheDocument();
    expect(screen.getByText('2 replication links')).toBeInTheDocument();
    expect(screen.getByTestId('node-card').style.height).toBe(`${cardSize(rich.card).height}px`);
  });

  it('uses mono only for values flagged mono', () => {
    render(<NodeCard node={rich} />);
    expect(screen.getByText(':3000')).toHaveClass('font-mono');
    expect(screen.getByText('2 vCPU · 2 GB')).not.toHaveClass('font-mono');
  });

  it('prefers the brand glyph and falls back to type icon', () => {
    const { container, rerender } = render(<NodeCard node={rich} />);
    expect(container.querySelector('[data-icon="brand"]')).not.toBeNull();
    rerender(<NodeCard node={{ ...rich, card: { ...rich.card, brand: 'nope' } }} />);
    expect(container.querySelector('[data-icon="brand"]')).toBeNull();
    expect(container.querySelector('[data-icon="type"]')).not.toBeNull();
  });

  it('truncates long text and keeps the full string in title', () => {
    const long = 'a-very-long-service-name-that-will-never-fit-in-a-280px-card';
    render(<NodeCard node={{ id: 'x', type: 'service', card: { title: long, rows: [{ label: 'k', value: long }] } }} />);
    const title = screen.getAllByText(long)[0]!;
    expect(title).toHaveClass('truncate');
    expect(title).toHaveAttribute('title', long);
    expect(screen.getByTestId('node-card').style.height).toBe(
      `${cardSize({ title: long, rows: [{ label: 'k', value: long }] }).height}px`,
    );
  });

  it('carries title on the stat value, statsNote and CTA label', () => {
    const longStat = '1,234,567 requests';
    const longNote = 'a very long stats note that will overflow the fixed-width stats panel';
    const longCta = 'Open this extremely long external cluster dashboard link';
    render(
      <NodeCard
        node={{
          id: 'y',
          type: 'service',
          card: {
            title: 'svc',
            stats: [{ value: longStat, label: 'Requests' }],
            statsNote: longNote,
            cta: { label: longCta, href: 'https://example.com' },
          },
        }}
      />,
    );
    expect(screen.getByText(longStat)).toHaveAttribute('title', longStat);
    expect(screen.getByText(longNote)).toHaveAttribute('title', longNote);
    expect(screen.getByText(longCta)).toHaveAttribute('title', longCta);
  });

  it('opens the CTA in a new tab safely', () => {
    render(<NodeCard node={rich} />);
    const link = screen.getByRole('link', { name: /open cluster/i });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noreferrer');
  });
});
