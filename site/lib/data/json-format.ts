const WIDTH = 72;

type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

function inline(v: Json): string {
  if (Array.isArray(v)) return `[${v.map(inline).join(', ')}]`;
  if (v && typeof v === 'object') {
    const entries = Object.entries(v);
    return entries.length ? `{ ${entries.map(([k, x]) => `${JSON.stringify(k)}: ${inline(x)}`).join(', ')} }` : '{}';
  }
  return JSON.stringify(v);
}

// `lead` is what precedes the value on its line (indent and key), so the width check counts the whole line.
function format(v: Json, indent: string, lead: number, trail: number): string {
  const one = inline(v);
  if (!v || typeof v !== 'object' || lead + one.length + trail <= WIDTH) return one;
  const inner = `${indent}  `;
  if (Array.isArray(v)) {
    return `[\n${v.map((x, i) => inner + format(x, inner, inner.length, i < v.length - 1 ? 1 : 0)).join(',\n')}\n${indent}]`;
  }
  const entries = Object.entries(v);
  const lines = entries.map(([k, x], i) => {
    const key = `${JSON.stringify(k)}: `;
    return inner + key + format(x, inner, inner.length + key.length, i < entries.length - 1 ? 1 : 0);
  });
  return `{\n${lines.join(',\n')}\n${indent}}`;
}

/** JSON the way the docs print it: short objects and arrays stay on one line, nothing runs past 72 columns. */
export function formatJson(value: unknown): string {
  return format(value as Json, '', 0, 0);
}
