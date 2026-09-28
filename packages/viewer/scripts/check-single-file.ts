import { readdirSync, readFileSync, statSync } from 'node:fs';

// M3 measured ~600 KB (fonts ~52 KB, 146 brand paths ~157 KB, React + d3); ~15% headroom.
const BUDGET_KB = 700;
const dist = new URL('../dist/', import.meta.url);
const fail = (msg: string): never => {
  console.error(`✗ ${msg}`);
  process.exit(1);
};

const files = readdirSync(dist);
if (files.length !== 1 || files[0] !== 'index.html') fail(`dist must contain only index.html, found: ${files.join(', ')}`);

const html = readFileSync(new URL('index.html', dist), 'utf8');
// Only real tags count: inlined JS/CSS bodies can contain attribute-looking strings.
const markup = html
  .replace(/(<script\b[^>]*>)[\s\S]*?<\/script>/g, '$1</script>')
  .replace(/(<style\b[^>]*>)[\s\S]*?<\/style>/g, '$1</style>');
const external = [
  ...(markup.match(/(?:src|href)=["'](?!data:|#)[^"']+["']/g) ?? []),
  ...(html.match(/url\(\s*["']?(?:https?:)?\/\//g) ?? []),
];
if (external.length) fail(`external references: ${external.slice(0, 5).join('  ')}`);
if (!html.includes('data:font/woff2')) fail('Geist fonts are not inlined');
if (/elkjs|org\.eclipse\.elk/.test(html)) fail('elkjs leaked into the viewer bundle');
if (/@xyflow|react-flow__/.test(html)) fail('React Flow leaked into the viewer bundle');
// The headless metrics table (~120 KB) is for the CLI's card-fit rule; the viewer measures with the browser.
if (/sans500tnum/.test(html)) fail('Geist metrics table leaked into the viewer bundle');
// Samples and gallery fixtures are dev-server pages; the template renders only embedded data.
if (/commerce-api-1|Boundary-text|Grouped tiers/.test(html)) fail('dev samples or gallery fixtures leaked into the template');
if (!html.includes('<script type="application/json" id="stackmap-data"></script>')) fail('template lacks the empty stackmap-data block');

const kb = statSync(new URL('index.html', dist)).size / 1024;
if (kb > BUDGET_KB) fail(`index.html is ${kb.toFixed(0)} KB, budget ${BUDGET_KB} KB`);
console.log(`✓ single self-contained file, ${kb.toFixed(0)} KB`);
