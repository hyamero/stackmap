import { render } from '@testing-library/react';
import * as simpleIcons from 'simple-icons';
import { describe, expect, it } from 'vitest';
import { BRAND_SLUGS, NODE_TYPES } from '@stackmap/core';
import { BRANDED_SLUGS, BrandIcon, hasBrand } from './BrandIcon';
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

  it('renders exactly the allowlist the validator checks against', () => {
    expect(BRANDED_SLUGS).toEqual([...BRAND_SLUGS]);
  });

  it('ships only CC0 marks (Q21)', () => {
    const bySlug = new Map(Object.values(simpleIcons).map((i) => [i.slug, i]));
    const restricted = BRANDED_SLUGS.filter((s) => {
      const license = (bySlug.get(s) as { license?: { type: string } } | undefined)?.license;
      return license !== undefined && license.type !== 'CC0-1.0';
    });
    expect(restricted).toEqual([]);
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
