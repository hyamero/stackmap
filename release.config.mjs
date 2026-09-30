// semantic-release: `staging` publishes release candidates (`x.y.z-rc.N`, npm dist-tag `rc`), and merging
// staging into `main` publishes the release (`latest`). See CONTRIBUTING.md#releases.
const stable = process.env.GITHUB_REF_NAME === 'main';
const preset = 'conventionalcommits';

export default {
  branches: ['main', { name: 'staging', prerelease: 'rc', channel: 'rc' }],
  tagFormat: 'v${version}',
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        preset,
        // Still 0.x: a breaking change is a minor release. Drop the first rule when stackmap reaches 1.0.
        releaseRules: [
          { breaking: true, release: 'minor' },
          { revert: true, release: 'patch' },
          { type: 'feat', release: 'minor' },
          { type: 'fix', release: 'patch' },
          { type: 'perf', release: 'patch' },
        ],
      },
    ],
    ['@semantic-release/release-notes-generator', { preset }],
    [
      '@semantic-release/exec',
      {
        // Pins the version, then packs with bun: its prepack builds, and it rewrites the `workspace:*` deps.
        prepareCmd: 'node scripts/set-version.mjs ${nextRelease.version} && rm -rf .release && cd packages/cli && bun pm pack --destination ../../.release --quiet',
        publishCmd: 'npm publish .release/*.tgz --provenance --access public --tag ${nextRelease.channel || "latest"}',
      },
    ],
    // Only a release commits its version back; release candidates live on npm alone, so staging and main never
    // fight over the pinned version lines.
    ...(stable
      ? [
          [
            '@semantic-release/git',
            {
              // Exactly what set-version touches: the plugin force-adds, so a broad glob would sweep in ignored files.
              assets: [
                'bun.lock',
                'README.md',
                'packages/cli/package.json',
                'packages/schema/src/schema.ts',
                'packages/schema/stackmap.schema.json',
                'skill/SKILL.md',
                'skill/references/*.{md,json}',
                'skill/examples/*.json',
              ],
              message: 'chore(release): ${nextRelease.version} [skip ci]',
            },
          ],
        ]
      : []),
    '@semantic-release/github',
  ],
};
