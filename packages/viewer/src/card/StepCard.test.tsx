import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { cardSize } from '@stackmap/core';
import { StepCard } from './StepCard';

describe('StepCard', () => {
  it('shows title and subtitle at the compact size', () => {
    render(<StepCard node={{ id: 'a', type: 'active', card: { title: 'Executing', subtitle: 'Tool calls' } }} />);
    const card = screen.getByTestId('step-card');
    expect(card).toHaveTextContent('ExecutingTool calls');
    expect(card.style.width).toBe('176px');
    expect(card.style.height).toBe(`${cardSize({ title: 'x' }, 'compact').height}px`);
    expect(screen.queryByTestId('card-tag')).toBeNull();
  });

  it('adds the tag row and grows by it', () => {
    const card = { title: 'Approve', tag: 'human gate' };
    render(<StepCard node={{ id: 'a', type: 'security', card }} />);
    expect(screen.getByTestId('card-tag')).toHaveTextContent('human gate');
    expect(screen.getByTestId('step-card').style.height).toBe(`${cardSize(card, 'compact').height}px`);
  });

  it('marks an end state with a double outline', () => {
    render(<StepCard node={{ id: 'done', type: 'success', card: { title: 'Completed' } }} final />);
    const card = screen.getByTestId('step-card');
    expect(card).toHaveAttribute('data-final', 'true');
    expect(card.style.boxShadow.match(/inset/g)).toHaveLength(3);
  });
});
