# Authoring contract

How to model a system as a stackmap diagram. The [schema reference](schema.md) says what is *allowed*; this says what is *good*. `stackmap validate` enforces the hard rules and tells you exactly what to fix.

> Adapted in part from [archify](https://github.com/tt-a1i/archify)'s authoring and repository references (MIT, © 2026 tt-a1i, © 2025 Cocoon AI).

## Composition

- **Show the path that answers the question.** Start from the entry point the user cares about (a client, an API, an event source) and follow it to where state lives or effects land. Add branches only when they change the answer.
- **One node per runtime unit the reader must distinguish.** Three replicas of the same service are one node unless the question is about the replicas. A library is not a node; the process that runs it is.
- **Edges are calls or data moving**, pointing from the initiator to the target (`from` calls `to`, or `from` sends data to `to`). Use `kind: "async"` for queues, events, fire-and-forget and callbacks — it renders dashed.
- **Edge labels** (≤ 24 chars) only where the relationship isn't obvious from the two ends: a protocol (`gRPC`), a verb (`enqueue`), a topic. Most edges need none.
- **Direction.** `RIGHT` (default) reads as a request path and suits 2–4 stages. Prefer `DOWN` for tiered or grouped systems (edge → app → data) and for anything with more than ~5 stages; it avoids long wrap-around edges.
- **Groups** are boundaries a reader should see: tiers, trust zones, VPCs, clusters, teams. Nest with `parent`. A group with one node is usually noise.
- **Views** are named focus sets for the tabs above the canvas ("Data tier", "Checkout path"): the view dims everything else and fits its members. Add one when the diagram answers more than one question; the first tab is always Overview.

## Node types and colour

`type` sets the card colour (never the brand). Pick by role:

| type | use for |
|---|---|
| `client` | browsers, mobile apps, CLIs, SDKs — anything a user drives |
| `gateway` | load balancers, API gateways, CDNs, edge routers, ingress |
| `service` | your own processes: APIs, workers, functions, jobs |
| `database` | relational/document/graph stores that are the system of record |
| `cache` | Redis/Memcached-style caches, session stores |
| `queue` | brokers, streams, topics, task queues |
| `storage` | object/blob/file stores, data lakes, warehouses' storage layers |
| `external` | third-party APIs and SaaS you don't run |
| `security` | auth providers, IAM, secrets managers, WAFs |

`brand` puts a logo in the icon tile — only a slug from the [brand list](schema.md#brand-slugs); anything else falls back to the type icon with a warning.

## Cards

A card is a fixed 280px-wide tile. Only `title` is required; add sections when they carry information the reader needs at a glance.

- `title` — the name people use (`orders-api`, `Orders`). `subtitle` — what it is (`PostgreSQL cluster`, `Payments API`).
- `rows` (≤ 6) — key/value facts: size, port, runtime, schedule. `mono: true` for ports, IPs, paths.
- `stats` (≤ 3) with `statsNote` — counts that matter (replicas, shards, partitions).
- `footer` — two short facts, left and right (region, protocol, ownership), with optional `icon`: `region`, `secure`, `members`.
- `cta` — a link out (`href`, http(s) only): a dashboard, a runbook.

Text never wraps; it truncates, and truncation is a validation **error** (`card-fit/overflow`) measured with the real font. Typical budgets for ordinary words: title ≈ 28 characters, subtitle ≈ 32, a row label + value together ≈ 36 (value alone ≤ 22), stat values ≈ 5 and labels ≈ 8 with three tiles (≈ 17 with two), stats note ≈ 36, footer items ≈ 15 with an icon and ≈ 19 without, CTA label ≈ 32. Wide letters (`W`, `M`) and non-Latin scripts fit fewer; the diagnostic gives the exact `maxChars` for your text. Put long detail in `evidence` notes instead.

## Repository diagrams

When the diagram must explain a real codebase, the source is the authority for responsibilities, calls, boundaries and persistence.

1. **Map the slice.** Use manifests, entry points, route registrations, deployment/infra config (Dockerfiles, compose, Terraform, k8s, serverless configs) to find the runtime units. Read the entry, config and modules relevant to the request; follow imports and call sites until each responsibility reaches its real input, output or side effect. Read a connected slice, not the whole repo.
2. **Trace ownership.** Draw an edge only where you saw the call, publish, read or write at a call site (or the config that wires it). A package that is installed but never called on the normal path is not an edge. Distinguish the service that requests work from the worker that executes it and the store that receives the bytes.
3. **Record evidence while reading.** Put `evidence: [{ "file": "src/orders/db.ts", "line": 42, "note": "writes orders" }]` on nodes, with repo-relative paths from the repo root. If the repo has an https remote, set `source.url` to its blob URL at the current commit (`https://github.com/<owner>/<repo>/blob/<sha>`) so evidence becomes links; strip any credentials from the remote first, and omit `source` for ssh-only or private-host remotes.
4. **Name uncertainty.** If you couldn't confirm something (durability, who reads a table), say so in the evidence note or your report rather than drawing it as fact.

Stop exploring when every requested responsibility and relationship is backed by source; there is no node or citation count to reach.

## Repairs that don't converge

A fix that brings back the same diagnostic twice means the fix is wrong, not the validator. Re-read the diagnostic's `subject` and `evidence`, and prefer a different `allowedFixes` entry. After two rounds with no fewer errors, stop and report (see the stop rule in SKILL.md).
