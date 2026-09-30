const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];

/** Counts in running copy are spelled out, so they follow the data without reading as figures. */
export function spell(n: number, capital = false): string {
  const w = WORDS[n] ?? String(n);
  return capital ? w[0]!.toUpperCase() + w.slice(1) : w;
}
