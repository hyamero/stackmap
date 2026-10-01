import { describe, expect, it } from 'vitest';
import { formatJson } from './data/json-format';
import { jsonOwners } from './json-lines';

const draft = {
  kind: 'architecture',
  title: 'Bookshop',
  groups: [{ id: 'data', label: 'Data tier' }],
  nodes: [
    { id: 'api', type: 'service', card: { title: 'shop-api', subtitle: 'REST API' }, evidence: [{ file: 'services/api/src/server.ts', line: 12 }] },
    { id: 'db', type: 'database', group: 'data', card: { title: 'Orders DB', subtitle: 'PostgreSQL', brand: 'postgresql' } },
  ],
  edges: [{ id: 'api-db', from: 'api', to: 'db' }],
  views: [{ id: 'state', label: 'State', nodes: ['db'] }],
};

describe('jsonOwners', () => {
  const code = formatJson(draft);
  const lines = code.split('\n');
  const owners = jsonOwners(code);
  const ownerOf = (needle: string) => owners[lines.findIndex((l) => l.includes(needle))];

  it('gives every line of a node to that node, nested objects included', () => {
    expect(ownerOf('"type": "service"')).toBe('node:api');
    expect(ownerOf('"brand": "postgresql"')).toBe('node:db');
    expect(ownerOf('"line": 12')).toBe('node:api');
  });

  it('names edges and groups, even printed on their array’s line', () => {
    expect(ownerOf('"edges"')).toBe('edge:api-db');
    expect(ownerOf('"groups"')).toBe('group:data');
  });

  it('leaves the diagram’s own keys and other arrays alone', () => {
    expect(ownerOf('"title": "Bookshop"')).toBeNull();
    expect(ownerOf('"views"')).toBeNull();
    expect(ownerOf('"nodes": [')).toBeNull();
  });

  it('gives a line two objects share to neither', () => {
    expect(jsonOwners('{\n  "edges": [{ "id": "a", "from": "x", "to": "y" }, { "id": "b", "from": "y", "to": "x" }]\n}')[1]).toBeNull();
  });
});
