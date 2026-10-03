import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { useRef, type ReactNode } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { commerceApiLayout } from './samples/commerce-api.layout';
import { DiagramCanvas } from './canvas/DiagramCanvas';
import { Inspector } from './chrome/Inspector';
import { Toolbar } from './chrome/Toolbar';
import { ExploreProvider, useExplore } from './explore/ExploreContext';
import { ViewerScope } from './explore/scope';

// Options for mounting the viewer inside someone else's page (the website): it must not own the URL, the keyboard
// or the scroll wheel there.

const draft = commerceApiLayout.draft;

function State() {
  const { state } = useExplore();
  return <output data-testid="state">{JSON.stringify({ selected: state.selected, query: state.query, playing: state.playing })}</output>;
}
const stateOf = () => JSON.parse(screen.getByTestId('state').textContent!) as { selected: string | null; query: string | null; playing: boolean };

function Scoped({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  return (
    <ViewerScope value={root}>
      <div ref={root} data-testid="scope" tabIndex={-1}>
        {children}
      </div>
    </ViewerScope>
  );
}

afterEach(() => {
  history.replaceState(null, '', location.pathname);
});

describe('embedding the viewer', () => {
  it('leaves the page’s hash alone when it does not sync with the URL', () => {
    history.replaceState(null, '', '#node=sessions');
    render(
      <ExploreProvider draft={draft} syncHash={false}>
        <DiagramCanvas diagram={commerceApiLayout} />
        <State />
      </ExploreProvider>,
    );
    expect(stateOf().selected).toBeNull();
    fireEvent.click(document.querySelector('.sm-card[data-card-id="orders"]')!);
    expect(stateOf().selected).toBe('orders');
    expect(location.hash).toBe('#node=sessions');
    act(() => {
      history.replaceState(null, '', '#node=edge');
      dispatchEvent(new HashChangeEvent('hashchange'));
    });
    expect(stateOf().selected).toBe('orders');
  });

  it('still mirrors the hash by default', () => {
    render(
      <ExploreProvider draft={draft}>
        <DiagramCanvas diagram={commerceApiLayout} />
      </ExploreProvider>,
    );
    fireEvent.click(document.querySelector('.sm-card[data-card-id="orders"]')!);
    expect(location.hash).toBe('#node=orders');
  });

  it('inside a scope, shortcuts pressed elsewhere on the page do nothing', () => {
    render(
      <ExploreProvider draft={draft} syncHash={false}>
        <Scoped>
          <DiagramCanvas diagram={commerceApiLayout}>
            <Toolbar theme="light" onToggleTheme={() => {}} />
          </DiagramCanvas>
        </Scoped>
        <State />
      </ExploreProvider>,
    );
    fireEvent.keyDown(document.body, { key: '/' });
    fireEvent.keyDown(document.body, { key: 'p' });
    expect(stateOf()).toMatchObject({ query: null, playing: false });
    fireEvent.keyDown(screen.getByTestId('scope'), { key: '/' });
    expect(stateOf().query).toBe('');
  });

  it('outside any scope, shortcuts work from the page body as before', () => {
    render(
      <ExploreProvider draft={draft} syncHash={false}>
        <DiagramCanvas diagram={commerceApiLayout}>
          <Toolbar theme="light" onToggleTheme={() => {}} />
        </DiagramCanvas>
        <State />
      </ExploreProvider>,
    );
    fireEvent.keyDown(document.body, { key: '/' });
    expect(stateOf().query).toBe('');
  });

  it('leaves a plain wheel to the page and zooms on ctrl or ⌘ + wheel', () => {
    const { container } = render(
      <ExploreProvider draft={draft} syncHash={false}>
        <DiagramCanvas diagram={commerceApiLayout} wheel="modifier" />
      </ExploreProvider>,
    );
    const stage = container.querySelector('.sm-stage')!;
    const transform = () => (container.querySelector('.sm-viewport') as HTMLElement).style.transform;
    const before = transform();
    const plain = fireEvent.wheel(stage, { deltaY: -100, clientX: 0, clientY: 0, cancelable: true });
    expect(transform()).toBe(before);
    expect(plain).toBe(true); // not prevented: the page scrolls
    fireEvent.wheel(stage, { deltaY: -100, clientX: 0, clientY: 0, ctrlKey: true });
    const zoomed = transform();
    expect(zoomed).not.toBe(before);
    fireEvent.wheel(stage, { deltaY: 100, clientX: 0, clientY: 0, metaKey: true });
    expect(transform()).not.toBe(zoomed);
  });

  it('can leave out the minimap', () => {
    render(
      <ExploreProvider draft={draft} syncHash={false}>
        <DiagramCanvas diagram={commerceApiLayout} minimap={false} />
      </ExploreProvider>,
    );
    expect(screen.getByRole('button', { name: 'Fit to screen' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /minimap/i })).toBeNull();
  });

  it('can leave export and trace out of the toolbar', () => {
    render(
      <ExploreProvider draft={draft} syncHash={false}>
        <DiagramCanvas diagram={commerceApiLayout}>
          <Toolbar theme="light" onToggleTheme={() => {}} exports={false} trace={false} />
        </DiagramCanvas>
      </ExploreProvider>,
    );
    expect(screen.queryByRole('button', { name: /export/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /^Trace/ })).toBeNull();
    expect(screen.getByRole('button', { name: 'Search nodes (/)' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Route between two nodes (R)' })).toBeInTheDocument();
  });

  it('gives the inspector no toggle when it cannot collapse, and lets the page add to it', () => {
    render(
      <ExploreProvider draft={draft} syncHash={false}>
        <Inspector headingLevel={3} placement="static" extra={<p>What the agent was asked</p>} />
      </ExploreProvider>,
    );
    const inspector = screen.getByRole('complementary', { name: 'Inspector' });
    expect(within(inspector).queryByRole('button', { name: /inspector/i })).toBeNull();
    expect(within(inspector).getByRole('heading', { level: 3, name: draft.title })).toBeInTheDocument();
    expect(within(inspector).getByRole('heading', { level: 4, name: 'Legend' })).toBeInTheDocument();
    expect(within(inspector).getByText('What the agent was asked')).toBeInTheDocument();
    expect(inspector.className).not.toMatch(/@max-2xl:absolute/);
  });
});
