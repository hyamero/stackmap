---
name: stackmap
description: Turn a system into an explorable architecture or data-flow diagram, delivered as one offline HTML file with a topology-dashboard look (dark and light), search, trace, guided views and PNG/SVG export. Use when the user asks to diagram, map, visualize or explain the architecture, services, infrastructure, dependencies or data pipeline of a codebase or of a described system, or to update such a diagram.
license: MIT
metadata:
  version: "0.1.0"
  author: hyamero
  based_on: tt-a1i/archify (MIT)
---

# stackmap

You write a typed diagram JSON. `stackmap` validates it, lays it out (you never give coordinates) and delivers a single self-contained HTML viewer. The viewer is read-only: every change goes through you editing the JSON.

## The CLI

```bash
STACKMAP="${STACKMAP:-npx -y @hyamero/stackmap@0.1.0}"
$STACKMAP validate <diagram.json> --json   # diagnostics; exit 0 ok (warnings allowed), 1 errors, 2 usage/IO
$STACKMAP deliver  <diagram.json>          # writes <diagram>.html next to it, prints a sha256 receipt
$STACKMAP serve    <diagram.json>          # optional: live viewer that reloads on every save
```

Honour a `STACKMAP` already set in the environment; it overrides the npm package.

## Where files go

Unless the user names a location, each diagram lives in `.stackmap/<slug>/` under the working directory: `diagram.json` and the delivered `diagram.html`. An edit request for an existing diagram reuses its folder and edits `diagram.json` in place — never start over from scratch for an edit.

## Steps

1. **Pick the kind.** `architecture` for components, services, infrastructure and their calls; `dataflow` for pipelines, ETL/ELT, event streams and lineage. Nothing else is supported yet — say so if the user wants a sequence or state diagram.
2. **Gather facts.** For a real codebase, follow [Repository diagrams](references/authoring-contract.md#repository-diagrams): the source is the authority, and every node you draw should be backed by code or config you read. For a described system, use only what the user said plus unavoidable glue (e.g. a gateway they implied); don't invent components.
3. **Write the complete `diagram.json` once**, following [the authoring contract](references/authoring-contract.md). Start the file with `"$schema": "https://raw.githubusercontent.com/hyamero/stackmap/main/packages/schema/stackmap.schema.json"`. Field rules and limits: [schema reference](references/schema.md). Shapes: [examples](examples/). Examples teach shape, not facts.
4. **Validate:** `$STACKMAP validate .stackmap/<slug>/diagram.json --json`.
5. **Repair only what the diagnostics name.** Each diagnostic has a `code`, a `subject` (JSON pointer into your file), a `message`, `evidence` and `allowedFixes`. Apply one of the `allowedFixes` at `subject`; don't restructure unrelated parts. Card text that doesn't fit (`card-fit/overflow`) gets shortened to the `maxChars` in its evidence — keep the meaning, move detail into a card row or the inspector evidence. Re-run step 4.
   - **Stop rule:** if two consecutive rounds don't reduce the number of errors, stop repairing, keep the last file, and report the remaining diagnostics to the user verbatim instead of guessing.
   - Warnings don't block delivery. Fix the cheap ones (a misspelt brand slug, an orphan you forgot to connect); leave deliberate ones and mention them.
6. **Deliver:** `$STACKMAP deliver .stackmap/<slug>/diagram.json`. Exit 1 means validation failed — go back to step 5. Exit 2 is an environment problem (missing file, bad path, internal error): report it, don't edit the diagram to "fix" it.
7. **Report** the absolute path of the HTML, the receipt line, and any warnings you left in. Mention that `$STACKMAP serve` gives a live preview if the user will iterate. Don't claim you looked at the rendering unless you actually did.

## Editing an existing diagram

Read `.stackmap/<slug>/diagram.json`, change only what was asked (keep ids stable so links and views survive), then steps 4–7 on the same path. If the user has `stackmap serve` running, saving the file is enough — the page reloads itself.

## Don'ts

- No coordinates, sizes, colours or styling fields: the schema is strict and rejects them. Layout and colour come from `direction`, `groups` and node `type`.
- Don't colour by brand: `type` sets the colour; `brand` only puts a logo in the icon tile.
- Don't pad the diagram to look complete. No node, edge or group count is a target.
- Don't edit the delivered HTML. It is output; the JSON is the source of truth.
