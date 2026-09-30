// Commit messages drive releases (see release.config.mjs), so CI holds every commit in a PR to Conventional Commits.
// semantic-release keeps the highest release among matching rules, so a scope can't be excluded there:
// site commits are held to non-releasing types here instead.
const RELEASING = new Set(['feat', 'fix', 'perf', 'revert']);
// `Revert "docs(site): …"` (GitHub's revert button) and `revert: docs(site): …` both release a patch.
const REVERTS_SITE = /^(revert:\s*|revert\s+")\w+\(site\)/i;

// commitlint's default ignores (@commitlint/is-ignored) skip every `Revert …`, so a site revert would never reach
// the rule below. These are the same ignores, with reverts of site commits taken out.
const IGNORES = [
  /^((Merge pull request)|(Merge (.*?) into (.*?)|(Merge branch (.*?)))(?:\r?\n)*$)/m,
  /^(Merge tag (.*?))(?:\r?\n)*$/m,
  /^(R|r)eapply (.*)/,
  /^(amend|fixup|squash)!/,
  /^(Merged (.*?)(in|into) (.*)|Merged PR (.*): (.*))/,
  /^Merge remote-tracking branch(\s*)(.*)/,
  /^Automatic merge(.*)/,
  /^Auto-merged (.*?) into (.*)/,
];

export default {
  extends: ['@commitlint/config-conventional'],
  defaultIgnores: false,
  ignores: [(message) => IGNORES.some((r) => r.test(message)) || (/^(R|r)evert (.*)/.test(message) && !REVERTS_SITE.test(message))],
  plugins: [
    {
      rules: {
        'site-no-release': ({ type, scope, header, notes }) => {
          const site = scope?.toLowerCase() === 'site';
          const breaking = /^[^:]*!:/.test(header ?? '') || (notes ?? []).some((n) => /^BREAKING[ -]CHANGE$/i.test(n.title));
          const releases = REVERTS_SITE.test(header ?? '') || (site && (breaking || RELEASING.has(type?.toLowerCase() ?? '')));
          return [!releases, 'site changes must not release the CLI: use docs(site): …, with no `!` or BREAKING CHANGE'];
        },
      },
    },
  ],
  rules: { 'site-no-release': [2, 'always'] },
};
