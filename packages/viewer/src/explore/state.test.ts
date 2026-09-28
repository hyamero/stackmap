import { describe, expect, it } from 'vitest';
import { explore, formatHash, INITIAL, parseHash } from './state';

const known = { nodes: new Set(['api', 'db']), views: new Set(['data']), types: new Set(['service', 'database'] as const) };

describe('explorer reducer', () => {
  it('selects, toggles trace, and clears with Escape semantics', () => {
    let s = explore(INITIAL, { type: 'select', id: 'api' });
    s = explore(s, { type: 'toggleTrace' });
    expect(s).toMatchObject({ selected: 'api', trace: true });
    s = explore(s, { type: 'clear' });
    expect(s).toMatchObject({ selected: null, query: null });
    expect(s.trace).toBe(true); // a mode, not a selection: survives clear
  });

  it('toggles lens types and switches views', () => {
    let s = explore(INITIAL, { type: 'toggleType', nodeType: 'database' });
    expect([...s.hiddenTypes]).toEqual(['database']);
    s = explore(s, { type: 'toggleType', nodeType: 'database' });
    expect(s.hiddenTypes.size).toBe(0);
    expect(explore(INITIAL, { type: 'view', id: 'data' }).view).toBe('data');
  });
});

describe('hash', () => {
  it('round-trips view, node and lens', () => {
    const s = { ...INITIAL, view: 'data', selected: 'api', hiddenTypes: new Set(['database'] as const) };
    const hash = formatHash(s);
    expect(hash).toBe('#view=data&node=api&lens=database');
    expect(parseHash(hash, known)).toMatchObject({ view: 'data', selected: 'api', hiddenTypes: new Set(['database']) });
  });

  it('is empty for the initial state', () => {
    expect(formatHash(INITIAL)).toBe('');
  });

  it('ignores unknown ids, types and junk', () => {
    expect(parseHash('#view=nope&node=ghost&lens=lambda,database&x=%E0%A4%A', known)).toEqual({
      ...INITIAL,
      hiddenTypes: new Set(['database']),
    });
    expect(parseHash('', known)).toEqual(INITIAL);
    expect(parseHash('#%%%', known)).toEqual(INITIAL);
  });
});
