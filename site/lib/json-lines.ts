export type Owner = `node:${string}` | `edge:${string}` | `group:${string}`;

const OWNERS: Record<string, 'node' | 'edge' | 'group'> = { nodes: 'node', edges: 'edge', groups: 'group' };

/**
 * For printed diagram JSON, which node, edge or group each line belongs to: the lines of an object in the
 * top-level `nodes`, `edges` or `groups` array, named by its `id`. A line shared by two objects has no owner.
 */
export function jsonOwners(code: string): (Owner | null)[] {
  const owners: (Owner | null)[] = code.split('\n').map(() => null);
  const claimed = new Set<number>();
  const stack: { char: '{' | '['; key?: string; at: number; line: number }[] = [];
  let line = 0;
  let inString = false;
  let token = '';
  let last: string | undefined;
  let key: string | undefined;
  for (let i = 0; i < code.length; i++) {
    const ch = code[i]!;
    if (inString) {
      if (ch === '\\') i++;
      else if (ch === '"') {
        inString = false;
        last = token;
      } else token += ch;
      continue;
    }
    if (ch === '\n') line++;
    else if (ch === '"') {
      inString = true;
      token = '';
    } else if (ch === ':') key = last;
    else if (ch === ',') key = undefined;
    else if (ch === '{' || ch === '[') {
      stack.push({ char: ch, key: ch === '[' ? key : undefined, at: i, line });
      key = undefined;
    } else if (ch === '}' || ch === ']') {
      const open = stack.pop()!;
      const parent = stack.at(-1);
      // Depth 2: inside the root object's array, so an item of nodes, edges or groups.
      const kind = ch === '}' && stack.length === 2 && parent?.char === '[' ? OWNERS[parent.key ?? ''] : undefined;
      const id = kind && /"id":\s*"([^"]+)"/.exec(code.slice(open.at, i + 1))?.[1];
      if (!kind || !id) continue;
      for (let l = open.line; l <= line; l++) {
        if (claimed.has(l)) owners[l] = null;
        else owners[l] = `${kind}:${id}`;
        claimed.add(l);
      }
    }
  }
  return owners;
}
