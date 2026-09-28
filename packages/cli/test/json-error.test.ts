import { describe, expect, it } from 'vitest';
import { locateJsonError } from '../src/json-error';

describe('locateJsonError', () => {
  it.each([
    ['{\n  "kind": "architecture",\n  "title": }', 3, 12, 'a value'],
    ['{"a": 1,}', 1, 9, 'another property (no trailing commas)'],
    ['{"a": 1', 1, 8, '"," or "}"'],
    ["{'a': 1}", 1, 2, 'a double-quoted string'],
    ['[1, 2] x', 1, 8, 'end of input'],
    ['', 1, 1, 'a value'],
    ['{"a": tru}', 1, 7, '"true"'],
  ])('%j → line %i column %i', (text, line, column, expected) => {
    expect(locateJsonError(text)).toEqual({ line, column, expected });
  });
});
