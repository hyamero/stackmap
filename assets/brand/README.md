<picture>
  <source media="(prefers-color-scheme: dark)" srcset="stackmap-lockup-dark.svg">
  <img alt="stackmap" src="stackmap-lockup.svg" height="48">
</picture>

# Brand assets

The stackmap mark is one connection routed across the dot grid, from a grey source card to an indigo target card. Everything else stays as quiet as the viewer: ink on neutral grounds, Geist, and one touch of colour.

Every file carries explicit colours, so pick the light file or its `-dark` twin to match the ground. Text is outlined from Geist 600, so no font is needed.

| File | Use |
|---|---|
| `stackmap-mark.svg`, `-dark` | The full mark with grid dots, at 48px and up |
| `stackmap-mark-compact.svg`, `-dark` | 16–32px: no dots, heavier route, taller cards |
| `stackmap-mark-mono-black.svg`, `-white` | One ink, for single-colour print and embossing |
| `stackmap-lockup.svg`, `-dark` | The default horizontal lockup |
| `stackmap-lockup-small.svg`, `-dark` | Lockups 32px tall or less: nav bars, badges, sidebars |
| `stackmap-lockup-stacked.svg`, `-dark` | Square slots: avatars, stickers, title cards |
| `stackmap-wordmark.svg`, `-dark` | The name alone, where the mark would be under 16px |
| `stackmap-app-icon.svg`, `-512.png`, `stackmap-apple-touch-icon-180.png` | The full mark on the near-black icon tile |
| `stackmap-favicon.svg`, `-32.png`, `-16.png` | The compact mark on the icon tile (inlined in the viewer) |
| `stackmap-readme-header.png`, `-dark` | The 1280×400 README header at 2×, in a `<picture>` at the full column width |
| `stackmap-social-card.png`, `-light.png` | The 1200×630 link preview (`og:image`, `twitter:image`); the site serves the dark one |
| `stackmap-github-preview.png` | The 1280×640 GitHub social preview (Settings › General › Social preview), with everything that matters inside GitHub's 80px crop border |

## Rules

- Keep a quarter of the mark's height clear on every side.
- The source card stays grey and the target card stays indigo (`#4f63c9` light, `#8fa6f2` dark). The route and dots are always ink. Never recolour, swap, rotate, mirror, outline or shadow the mark.
- Put the mark on the page grey or the stage (white or near-black). On anything else, use the mono mark or the app icon tile.
- The name is always "stackmap", lowercase, in Geist 600 at -0.035em. Use the outlined files; never retype it.
- The brand accent belongs to brand surfaces (README, social card, CLI output). Inside the viewer, colour means node type and nothing else.
- In the terminal: the wordmark in bold, a middle dot, the command; output paths in the accent. Plain text when piped or with `NO_COLOR`.

## Voice

- **Tagline:** Every layer of your stack, on one map.
- **Descriptor:** Interactive system diagrams your coding agent writes, as one offline HTML file.
- Plain, exact and calm. Say what it does, in the viewer's words: diagram, node, connection, view, your coding agent. No emoji, no exclamation marks, no "seamless", "supercharge" or "AI-powered".
