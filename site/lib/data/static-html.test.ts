import { describe, expect, it } from 'vitest';
import { commerceApiLayout } from '../../../packages/viewer/src/samples/commerce-api.layout';
import { toScene } from '../../../packages/viewer/src/canvas/scene';
import { staticDiagram } from './static-html';

describe('staticDiagram', () => {
  it('is the viewer’s own static scene, rendered once at build time', () => {
    const { html } = staticDiagram(commerceApiLayout);
    expect(html.match(/class="sm-card/g)).toHaveLength(commerceApiLayout.draft.nodes.length);
    expect(html).toContain('inert');
  });

  it('carries the content box the page fits it by', () => {
    const { box } = staticDiagram(commerceApiLayout);
    expect(box).toEqual(toScene(commerceApiLayout).content);
  });
});
