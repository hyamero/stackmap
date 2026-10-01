const repo = 'https://github.com/hyamero/stackmap';

export const LINKS = {
  how: { label: 'How it works', href: '/#how' },
  kinds: { label: 'Five kinds', href: '/#kinds' },
  install: { label: 'Install', href: '/#install' },
  examples: { label: 'Examples', href: '/examples' },
  docs: { label: 'Docs', href: '/docs' },
  quickStart: { label: 'Quick start', href: '/docs#quick-start' },
  schema: { label: 'Schema', href: '/docs/schema' },
  cli: { label: 'CLI', href: '/docs#cli' },
  authoring: { label: 'Authoring contract', href: `${repo}/blob/main/skill/references/authoring-contract.md` },
  // The film is the video in the README, hosted by GitHub.
  film: { label: 'Launch film', href: `${repo}#readme` },
  github: { label: 'GitHub', href: repo },
  npm: { label: 'npm', href: 'https://www.npmjs.com/package/@hyamero/stackmap' },
  contributing: { label: 'Contributing', href: `${repo}/blob/main/CONTRIBUTING.md` },
  security: { label: 'Security', href: `${repo}/blob/main/SECURITY.md` },
  archify: { label: 'archify', href: 'https://github.com/tt-a1i/archify' },
} as const;

export type SiteLink = (typeof LINKS)[keyof typeof LINKS];
