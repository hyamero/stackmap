import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { DiagramDraft } from '@stackmap/core';
import { IdentityCard } from './IdentityCard';

const draft: DiagramDraft = {
  kind: 'architecture',
  title: 'A very long diagram title that will not fit in the identity card',
  subtitle: 'A very long diagram subtitle that will not fit in the identity card either',
  direction: 'RIGHT',
  nodes: [],
  edges: [],
};

describe('IdentityCard', () => {
  it('carries title on the diagram title and subtitle', () => {
    render(<IdentityCard draft={draft} />);
    expect(screen.getByText(draft.title)).toHaveAttribute('title', draft.title);
    expect(screen.getByText(draft.subtitle!)).toHaveAttribute('title', draft.subtitle);
  });
});
