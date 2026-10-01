/** Diagnostic families, in the order validate checks them. */
export const FAMILIES = ['schema', 'refs', 'semantics', 'card-fit'] as const;
export type Family = (typeof FAMILIES)[number];

// Facts the docs show in more than one place (a page and the search), each checked against the CLI and viewer source.

export const CLI_COMMANDS = [
  { name: 'validate', usage: '<diagram.json> [--json]', does: 'Check the diagram' },
  { name: 'deliver', usage: '<diagram.json> [-o out.html]', does: 'Write the offline HTML viewer' },
  { name: 'serve', usage: '<diagram.json> [--port 4400]', does: 'Live viewer that reloads on save' },
] as const;

export const CLI_OPTIONS = [
  { flag: '--json', for: 'validate', does: 'Machine-readable diagnostics' },
  { flag: '-o, --out', for: 'deliver', does: 'The output path; the default is next to the input, as .html' },
  { flag: '--port', for: 'serve', does: 'The port; 4400 by default, and the next free one if it is taken' },
  { flag: '-h, --help', for: 'any', does: 'Show the help' },
  { flag: '-v, --version', for: 'any', does: 'Show the version' },
] as const;

export const EXIT_CODES = [
  { code: 0, means: 'OK. Warnings are allowed.' },
  { code: 1, means: 'The diagram has errors. This is the one the agent’s repair loop acts on.' },
  { code: 2, means: 'A usage, file or internal error. Never a stack trace.' },
] as const;

/** The delivered viewer's keys (the embedded one on this site adds T for trace). */
export const VIEWER_KEYS: { keys: string[]; does: string }[] = [
  { keys: ['/'], does: 'Search nodes, from anywhere but a text field' },
  { keys: ['R'], does: 'Route: pick where it starts, then where it ends' },
  { keys: ['P'], does: 'Play or stop the flow' },
  { keys: ['F'], does: 'Present: the stage alone, stepping through the views' },
  { keys: ['M'], does: 'Show or hide the minimap' },
  { keys: ['Esc'], does: 'Clear the selection, the search or the route' },
  { keys: ['←', '↑', '→', '↓'], does: 'Pan, while the stage has focus' },
  { keys: ['+', '−'], does: 'Zoom in and out, while the stage has focus' },
  { keys: ['0'], does: 'Fit the diagram, while the stage has focus' },
  { keys: ['Enter', 'Space'], does: 'Select the card that has focus' },
  { keys: ['Tab'], does: 'Move through the cards and every control' },
];

export const SHARE_PARAMS = [
  { param: 'view', keeps: 'The open view', example: '#view=checkout' },
  { param: 'node', keeps: 'The selected card; the viewer brings it into view', example: '#node=api' },
  { param: 'lens', keeps: 'The node types the lens hides, comma-separated', example: '#lens=cache,queue' },
  { param: 'route', keeps: 'A route between two nodes', example: '#route=storefront~orders' },
  { param: 'play', keeps: 'The flow is playing', example: '#play=1' },
] as const;
