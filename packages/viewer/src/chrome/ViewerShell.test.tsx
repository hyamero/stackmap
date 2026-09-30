import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { commerceApiLayout } from '../samples/commerce-api.layout';
import { ViewerShell } from './ViewerShell';

describe('ViewerShell', () => {
  // Wide enough for the inspector to start open (it collapses below 1100px).
  beforeEach(() => {
    innerWidth = 1440;
    location.hash = '';
  });

  it('shows title, kind badge and counts', () => {
    render(<ViewerShell diagram={commerceApiLayout} theme="light" onToggleTheme={() => {}} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Commerce API' })).toBeInTheDocument();
    expect(screen.getByText('Architecture')).toBeInTheDocument();
    expect(screen.getByText('6 nodes · 9 connections')).toBeInTheDocument();
  });

  it('titles the diagram one level down when embedded in a page with its own h1', () => {
    const { container } = render(<ViewerShell diagram={commerceApiLayout} theme="light" onToggleTheme={() => {}} titleAs="h2" />);
    expect(within(container.querySelector('header')!).getByRole('heading', { level: 2, name: 'Commerce API' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
  });

  it('lists Overview first, then agent views, as tabs', () => {
    render(<ViewerShell diagram={commerceApiLayout} theme="light" onToggleTheme={() => {}} />);
    const tabs = within(screen.getByRole('tablist')).getAllByRole('tab');
    expect(tabs.map((t) => t.textContent)).toEqual(['Overview', 'Data tier']);
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
  });

  it('legend counts nodes by type', () => {
    render(<ViewerShell diagram={commerceApiLayout} theme="light" onToggleTheme={() => {}} />);
    const legend = screen.getByRole('list', { name: 'Legend' });
    expect(within(legend).getByText('Service').closest('li')).toHaveTextContent('3');
  });

  it('theme button calls back and names the next theme', () => {
    const onToggle = vi.fn();
    render(<ViewerShell diagram={commerceApiLayout} theme="light" onToggleTheme={onToggle} />);
    fireEvent.click(screen.getByRole('button', { name: 'Switch to dark theme' }));
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it('renders the scene: one named group per card and one path per edge', () => {
    const { container } = render(<ViewerShell diagram={commerceApiLayout} theme="light" onToggleTheme={() => {}} />);
    expect(screen.getByRole('button', { name: 'Orders, Database' })).toBeInTheDocument();
    expect(container.querySelectorAll('.sm-card')).toHaveLength(6);
    expect(container.querySelectorAll('path.sm-edge-path')).toHaveLength(9);
    expect(screen.getByText('100%')).toBeInTheDocument(); // zero-size stage in jsdom → identity transform
  });

  it('has no editor controls', () => {
    render(<ViewerShell diagram={commerceApiLayout} theme="light" onToggleTheme={() => {}} />);
    for (const name of [/add/i, /undo/i, /redo/i, /lock/i]) expect(screen.queryByRole('button', { name })).toBeNull();
  });
});
