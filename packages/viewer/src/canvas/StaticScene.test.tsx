import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { commerceApiLayout } from '../samples/commerce-api.layout';
import { toScene } from './scene';
import { StaticScene } from './StaticScene';

describe('StaticScene', () => {
  it('renders every card and connection without the explorer or a camera', () => {
    const html = renderToString(<StaticScene diagram={commerceApiLayout} />);
    const doc = new DOMParser().parseFromString(html, 'text/html');
    expect(doc.querySelectorAll('.sm-card')).toHaveLength(commerceApiLayout.draft.nodes.length);
    expect(doc.querySelectorAll('[data-edge-id]').length).toBeGreaterThanOrEqual(commerceApiLayout.draft.edges.length);
  });

  it('sizes itself to the diagram content, offset to its origin', () => {
    const { content } = toScene(commerceApiLayout);
    const html = renderToString(<StaticScene diagram={commerceApiLayout} />);
    const root = new DOMParser().parseFromString(html, 'text/html').body.firstElementChild as HTMLElement;
    expect(root.style.width).toBe(`${content.width}px`);
    expect(root.style.height).toBe(`${content.height}px`);
    expect((root.firstElementChild as HTMLElement).style.transform).toBe(`translate(${-content.x}px, ${-content.y}px)`);
  });

  it('keeps its cards out of the tab order', () => {
    const html = renderToString(<StaticScene diagram={commerceApiLayout} />);
    const root = new DOMParser().parseFromString(html, 'text/html').body.firstElementChild!;
    expect(root.hasAttribute('inert')).toBe(true);
  });
});
