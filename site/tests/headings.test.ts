import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Footer } from '../components/site/Footer';

describe('footer headings', () => {
  // The footer follows each page's content, so its column titles sit one level under the page's h1.
  it('titles its columns with h2, never skipping a level', () => {
    const html = renderToStaticMarkup(Footer());
    expect(html.match(/<h2/g)?.length).toBe(3);
    expect(html).not.toMatch(/<h[3-6]/);
  });
});
