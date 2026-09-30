import { describe, expect, it } from 'vitest';
import { formatJson } from './json-format';

describe('formatJson', () => {
  it('keeps short objects and arrays on one line, as the docs print JSON', () => {
    const text = formatJson({ kind: 'architecture', groups: [{ id: 'data', label: 'Data tier' }], edges: [{ id: 'a-b', from: 'a', to: 'b' }] });
    expect(text).toBe(['{', '  "kind": "architecture",', '  "groups": [{ "id": "data", "label": "Data tier" }],', '  "edges": [{ "id": "a-b", "from": "a", "to": "b" }]', '}'].join('\n'));
  });

  it('breaks what would run past the line width', () => {
    const card = { title: 'Orders DB', subtitle: 'PostgreSQL', brand: 'postgresql', rows: [{ label: 'Port', value: '5432' }] };
    const text = formatJson({ nodes: [{ id: 'db', card }] });
    for (const line of text.split('\n')) expect(line.length).toBeLessThanOrEqual(72);
    expect(JSON.parse(text)).toEqual({ nodes: [{ id: 'db', card }] });
  });
});
