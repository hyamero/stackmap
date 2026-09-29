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

  it('a revealing selection bumps the camera counter; a plain one does not', () => {
    const a = explore(INITIAL, { type: 'select', id: 'api', reveal: true });
    expect(a.reveal).toBe(1);
    expect(explore(a, { type: 'select', id: 'db' }).reveal).toBe(1);
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
    expect(parseHash(hash, known)).toMatchObject({ view: 'data', selected: 'api', hiddenTypes: new Set(['database']), reveal: 1 });
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

describe('route picking', () => {
  it('the next two card clicks pick the ends; empty canvas keeps picking; clear ends it', () => {
    let s = explore({ ...INITIAL, selected: 'api', trace: true }, { type: 'toggleRoute' });
    expect(s).toMatchObject({ routing: { next: 'from' }, selected: null, trace: false });
    s = explore(s, { type: 'select', id: 'api' });
    s = explore(s, { type: 'select', id: null });
    expect(s.routing).toEqual({ next: 'to', start: 'api' });
    s = explore(s, { type: 'select', id: 'db' });
    expect(s).toMatchObject({ routing: null, route: { from: 'api', to: 'db' }, selected: null });
    expect(formatHash(s)).toBe('#route=api~db');
    expect(explore(s, { type: 'clear' }).route).toBeNull();
    expect(explore(s, { type: 'toggleRoute' }).route).toBeNull();
  });

  it('reads a route from the hash, dropping unknown ends', () => {
    expect(parseHash('#route=api~db', known).route).toEqual({ from: 'api', to: 'db' });
    expect(parseHash('#route=api~ghost', known).route).toBeNull();
    expect(parseHash('#route=api', known).route).toBeNull();
  });
});
