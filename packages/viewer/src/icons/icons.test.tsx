import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { NODE_TYPES } from '@stackmap/core';
import { BrandIcon, hasBrand } from './BrandIcon';
import { TypeIcon } from './TypeIcon';

describe('TypeIcon', () => {
  it.each(NODE_TYPES)('renders an icon for %s', (type) => {
    const { container } = render(<TypeIcon type={type} size={18} />);
    const svg = container.querySelector('svg[data-icon="type"]');
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('BrandIcon', () => {
  it('renders a known brand as an accessible currentColor glyph', () => {
    const { getByRole } = render(<BrandIcon slug="postgresql" size={18} />);
    const svg = getByRole('img', { name: 'PostgreSQL' });
    expect(svg).toHaveAttribute('fill', 'currentColor');
    expect(svg).toHaveAttribute('data-icon', 'brand');
  });

  it('hasBrand rejects unknown and prototype slugs', () => {
    expect(hasBrand('redis')).toBe(true);
    expect(hasBrand('nope')).toBe(false);
    expect(hasBrand('constructor')).toBe(false);
    expect(hasBrand('__proto__')).toBe(false);
  });

  it('renders nothing for an unknown slug', () => {
    const { container } = render(<BrandIcon slug="nope" size={18} />);
    expect(container).toBeEmptyDOMElement();
  });
});
