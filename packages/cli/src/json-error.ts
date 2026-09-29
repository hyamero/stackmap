/**
 * Where a JSON text first goes wrong. V8's JSON.parse message omits the position for some errors
 * ("Unexpected token '}'…"), so a small validating scanner finds it instead. Only called after
 * JSON.parse has already failed.
 */
export function locateJsonError(text: string): { line: number; column: number; expected: string } {
  let i = 0;
  const fail = (expected: string): never => {
    throw Object.assign(new Error(expected), { at: i });
  };
  const ws = () => {
    while (i < text.length && ' \t\n\r'.includes(text[i]!)) i++;
  };
  const lit = (word: string) => (text.startsWith(word, i) ? void (i += word.length) : fail(`"${word}"`));
  const string = () => {
    if (text[i] !== '"') fail('a double-quoted string');
    i++;
    while (i < text.length && text[i] !== '"') {
      if (text[i]! < ' ') fail('an escaped control character');
      if (text[i] === '\\') {
        i++;
        if (text[i] === 'u') {
          if (!/^[0-9a-fA-F]{4}$/.test(text.slice(i + 1, i + 5))) fail('4 hex digits after \\u');
          i += 4;
        } else if (!'"\\/bfnrt'.includes(text[i] ?? '')) fail('a valid escape');
      }
      i++;
    }
    if (text[i] !== '"') fail('a closing quote');
    i++;
  };
  const number = () => {
    const m = /^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/.exec(text.slice(i));
    if (!m) fail('a value');
    i += m![0].length;
  };
  const value = (): void => {
    ws();
    const c = text[i];
    if (c === '{') {
      i++;
      ws();
      if (text[i] === '}') return void i++;
      for (;;) {
        ws();
        string();
        ws();
        if (text[i] !== ':') fail('":"');
        i++;
        value();
        ws();
        if (text[i] === ',') {
          i++;
          ws();
          if (text[i] === '}') fail('another property (no trailing commas)');
          continue;
        }
        if (text[i] === '}') return void i++;
        fail('"," or "}"');
      }
    }
    if (c === '[') {
      i++;
      ws();
      if (text[i] === ']') return void i++;
      for (;;) {
        value();
        ws();
        if (text[i] === ',') {
          i++;
          ws();
          if (text[i] === ']') fail('another item (no trailing commas)');
          continue;
        }
        if (text[i] === ']') return void i++;
        fail('"," or "]"');
      }
    }
    if (c === '"') return string();
    if (c === 't') return lit('true');
    if (c === 'f') return lit('false');
    if (c === 'n') return lit('null');
    number();
  };
  let expected = 'end of input';
  try {
    value();
    ws();
    if (i < text.length) fail('end of input');
  } catch (e) {
    expected = (e as Error).message;
  }
  const before = text.slice(0, i).split('\n');
  return { line: before.length, column: before.at(-1)!.length + 1, expected };
}
