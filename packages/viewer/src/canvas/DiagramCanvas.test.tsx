import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { commerceApiLayout } from '../samples/commerce-api.layout';
import { ExploreProvider } from '../explore/ExploreContext';
import { DiagramCanvas } from './DiagramCanvas';

const { nodeCardRenders } = vi.hoisted(() => ({ nodeCardRenders: vi.fn() }));

// Stand-in for the real NodeCard so we can count renders without measuring layout.
vi.mock('../card/NodeCard', () => ({
  NodeCard: (props: { node: { id: string } }) => {
    nodeCardRenders(props.node.id);
    return <div data-testid="node-card-stub" />;
  },
}));

describe('DiagramCanvas', () => {
  it('changes the viewport transform on wheel without re-rendering the cards', () => {
    const { container } = render(
      <ExploreProvider draft={commerceApiLayout.draft}>
        <DiagramCanvas diagram={commerceApiLayout} />
      </ExploreProvider>,
    );
    const stage = container.querySelector('.sm-stage')!;
    const viewport = () => container.querySelector('.sm-viewport') as HTMLElement;

    const transformBefore = viewport().style.transform;
    const rendersBefore = nodeCardRenders.mock.calls.length;
    expect(rendersBefore).toBeGreaterThan(0);

    fireEvent.wheel(stage, { deltaY: -100, clientX: 0, clientY: 0 });

    expect(viewport().style.transform).not.toBe(transformBefore);
    expect(nodeCardRenders.mock.calls.length).toBe(rendersBefore);
  });
});
