const repo = new URL('../../../', import.meta.url);

export const CLI_PACKAGE = new URL('packages/cli/package.json', repo);
export const VIEWER_TEMPLATE = new URL('packages/viewer/dist/index.html', repo);
export const EXAMPLES_DIR = new URL('site/content/examples/', repo);
export const DEMO = new URL('site/content/demo/commerce-api.json', repo);
export const GENERATED_DIR = new URL('site/generated/', repo);
