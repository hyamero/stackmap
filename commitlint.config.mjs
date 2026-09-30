// Commit messages drive releases (see release.config.mjs), so CI holds every commit in a PR to Conventional Commits.
// semantic-release keeps the highest release among matching rules, so a scope can't be excluded there:
// site commits are held to non-releasing types here instead.
const RELEASING = new Set(['feat', 'fix', 'perf', 'revert']);

export default {
  extends: ['@commitlint/config-conventional'],
  plugins: [
    {
      rules: {
        'site-no-release': ({ type, scope }) => [
          !(scope?.toLowerCase() === 'site' && RELEASING.has(type?.toLowerCase() ?? '')),
          'site changes must not release the CLI: use docs(site): …',
        ],
      },
    },
  ],
  rules: { 'site-no-release': [2, 'always'] },
};
