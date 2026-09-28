import { afterEach, describe, expect, it } from 'vitest';
import { commerceApiLayout } from './samples/commerce-api.layout';
import { DATA_ELEMENT_ID, readEmbeddedDiagram } from './data';

const embed = (text: string) => {
  const el = document.createElement('script');
  el.type = 'application/json';
  el.id = DATA_ELEMENT_ID;
  el.textContent = text;
  document.body.append(el);
};

afterEach(() => document.getElementById(DATA_ELEMENT_ID)?.remove());

describe('readEmbeddedDiagram', () => {
  it('is null when the page carries no data block, or an empty one (the bare template)', () => {
    expect(readEmbeddedDiagram(document)).toBeNull();
    embed('  \n');
    expect(readEmbeddedDiagram(document)).toBeNull();
  });

  it('parses the embedded laid-out diagram', () => {
    embed(JSON.stringify(commerceApiLayout));
    expect(readEmbeddedDiagram(document)).toEqual(commerceApiLayout);
  });

  it('throws a readable error on a corrupt block', () => {
    embed('{"draft":');
    expect(() => readEmbeddedDiagram(document)).toThrow(/embedded diagram data is not valid JSON/);
  });
});
