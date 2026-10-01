import type { DiagramKind, NodeType } from '@stackmap/core';

export interface KindPage {
  lede: string;
  use: string;
  /** the authoring contract's rules for the kind, with `code` spans */
  rules: string[];
  /** a table of the node types the kind uses and what each is for */
  types?: { title: string; uses: Partial<Record<NodeType, string>> };
  /** the example's diagram and JSON side by side; wide layouts stack them */
  split: boolean;
  /** a request for the reader to give their agent, one like the skill's example */
  ask: string;
  parts: { title: string; text: string }[];
}

// Copy from the canvas's five kind docs boards, checked against the authoring contract. The parts' illustrations live with the page, in Parts.tsx.
export const KIND_PAGES: Record<DiagramKind, KindPage> = {
  architecture: {
    lede: 'Components and what they call: services, stores and the infrastructure between them.',
    use: 'Use it when the edges are calls and dependencies. Draw each edge from the initiator to what it calls, even when it only reads; queues are the exception, from producer to queue to consumer. Groups mark the boundaries a reader should see: tiers, trust zones, clusters.',
    ask: 'Make an architecture diagram of this repository, backed by evidence from the code.',
    rules: [
      'Draw each edge from the initiator to what it calls or uses: `api → db` even when the api only reads. Queues and streams are the exception, `producer → queue → consumer`.',
      '`"kind": "async"` for queues, events, fire-and-forget and callbacks (dashed); `"kind": "return"` for a reply or a roll back (dotted).',
      'A `tone` marks the few edges a reader must tell apart: `main` for the happy path, `security` for a trust crossing, `error` for a failure path. Leave the rest untoned.',
      'Groups are boundaries a reader should see: tiers, trust zones, VPCs, clusters. Nest them with `parent`; a group with one node is usually noise.',
      '`"direction": "DOWN"` for tiered or grouped systems and anything past about five stages; `RIGHT`, the default, reads as a request path.',
      'Keep one edge per direction between two nodes, and fold both relationships into one label.',
    ],
    types: {
      title: 'Node types',
      uses: {
        client: 'Browsers, mobile apps, CLIs, SDKs: anything a user drives',
        gateway: 'Load balancers, API gateways, CDNs, edge routers, ingress',
        service: 'Your own processes: APIs, workers, functions, jobs',
        database: 'Stores that are the system of record',
        cache: 'Redis and Memcached-style caches, session stores',
        queue: 'Brokers, streams, topics, task queues',
        storage: 'Object, blob and file stores, data lakes',
        external: 'Third-party APIs and SaaS you don’t run',
        security: 'Auth providers, IAM, secrets managers, WAFs',
      },
    },
    split: true,
    parts: [
      { title: 'Nine node types', text: 'The type sets the colour, never the brand.' },
      { title: 'Groups', text: 'Tiers, trust zones and clusters, nested with parent.' },
      { title: 'Connections', text: 'Plain calls, async events, and tones for the main path.' },
      { title: 'Views', text: 'Named focus sets, one tab each.' },
    ],
  },
  dataflow: {
    lede: 'Data moving through stages: pipelines, ETL and ELT, change data capture, event streams, lineage.',
    use: 'Use it only when the edges are data moving, in the direction it moves: from the database to the capture job to the stream to the store. Stages band an ordered pipeline, from sources to consumers, in flow order.',
    ask: 'Show how data flows through our feature platform, from the product databases to the models that read it.',
    rules: [
      'Edges follow the data: `db → cdc → kafka → job → store`; whoever reads a store is `store → reader`.',
      'Stages (`phases` with `nodes`) band an ordered pipeline: sources, ingest, process, store, consume. Stage members can’t also be in a group.',
      '`"kind": "async"` for streams and events: they render dashed.',
      '`"density": "compact"` for long chains (more than about five stages) and overviews; keep full cards when rows and stats carry the answer.',
      'Label an edge (24 characters at most) only where the relationship isn’t obvious from its ends: a topic, a protocol.',
    ],
    split: true,
    parts: [
      { title: 'Stages', text: 'Ordered bands: sources, ingest, process, store, consume.' },
      { title: 'Direction', text: 'Edges follow the data, not who calls whom.' },
      { title: 'Async', text: 'Streams and events render dashed.' },
      { title: 'Compact cards', text: 'density compact for long chains.' },
    ],
  },
  workflow: {
    lede: 'Steps done by different owners, in order: a release process, an incident runbook, an agent’s tool call.',
    use: 'Owners are lanes, top to bottom in the order you list them, and stackmap picks the columns from the edges. Put failure and recovery in a lane of their own with tone exception, and label the columns with phases.',
    ask: 'Draw our release process as a workflow, with a lane for rollbacks.',
    rules: [
      'Lanes are owners, top to bottom in the order you list them, and every node needs a `lane`. Four to six read well.',
      'stackmap picks the columns from the edges: a step’s successor in the same lane moves right; a hand-off to another lane may drop straight down.',
      'Put failure and recovery in a lane of their own, with `"tone": "exception"`.',
      'Phases (`phases` with `nodes`) label the columns: list them in order, and put each node in at most one.',
      'Groups frame a few neighbouring steps in one lane; `"tone": "security"` marks a policy stop. They can’t span lanes or nest.',
      'Cards are compact: `title`, `subtitle`, `brand` and a short `tag` pill. Workflow nodes use the component types: who or what does the step.',
    ],
    split: false,
    parts: [
      { title: 'Lanes', text: 'One owner each; four to six read well.' },
      { title: 'Phases', text: 'Headers over the columns they span.' },
      { title: 'Exception lane', text: 'Failure and recovery, dashed.' },
      { title: 'Tags', text: 'A short pill on a compact card: human gate.' },
    ],
  },
  lifecycle: {
    lede: 'The states of one thing and the moves between them: a job, an order, a deployment.',
    use: 'States are nodes with state types, not component types. A start state gets the initial marker, a success or failure with no way out is drawn as an end state, and a retry is a return edge back to the state it retries.',
    ask: 'Draw the lifecycle of an agent run: every state it can be in, and what moves it between them.',
    rules: [
      'States are nodes with the seven state types, not component types.',
      'A `start` state gets the initial marker; a `success` or `failure` with no way out is drawn as an end state.',
      'A retry is a `return` edge back to the state it retries.',
      'Lanes are phases of attention (lifecycle phases, interruptions, terminal exits), and every node needs a `lane`.',
      'Cards are compact: title, subtitle, brand and a short tag.',
    ],
    types: {
      title: 'State types',
      uses: {
        start: 'Where the thing begins (drawn with an initial marker)',
        active: 'Work in progress: building, executing, rolling back',
        waiting: 'Paused on something outside: approval, input, a timer',
        decision: 'A check that sends the thing one way or another',
        success: 'A good end, or a good stop along the way',
        failure: 'An error or a bad end',
        neutral: 'Anything else',
      },
    },
    split: false,
    parts: [
      { title: 'Seven state types', text: 'Start, active, waiting, decision, success, failure, neutral.' },
      { title: 'Start marker', text: 'Where the thing begins.' },
      { title: 'End states', text: 'A double outline when nothing leaves.' },
      { title: 'Retries', text: 'Return edges, dotted.' },
    ],
  },
  sequence: {
    lede: 'Messages over time between a few participants, for one scenario: a request with a cache miss, an async job round trip.',
    use: 'Participants are the nodes, left to right in the order a request travels; messages are the edges, top to bottom in array order, each one labelled. stackmap spaces the lifelines and draws the activation bars itself.',
    ask: 'Draw the request path for a dashboard load as a sequence, including the cache miss.',
    rules: [
      'Participants are the nodes: three to eight, left to right in the order a request travels, so the caller comes first and stores and third parties last.',
      'Messages are the edges, top to bottom in array order. Label every one, briefly.',
      'A call is plain; `"kind": "return"` is its reply, from the callee back to the caller, after it; `"kind": "async"` is fire-and-forget. A message to itself is a self-call.',
      'Activation bars follow from the calls and replies; a reply that answers nothing is a warning, `semantics/unmatched-return`.',
      'Phases (`phases` with `edges`) band stretches of time: Request, Fallback, Response.',
      'No groups or lanes, and cards are compact.',
    ],
    split: false,
    parts: [
      { title: 'Participants', text: 'Three to eight, caller first.' },
      { title: 'Messages', text: 'Every one labelled, in time order.' },
      { title: 'Replies', text: 'kind return, dotted with an open head.' },
      { title: 'Activation bars', text: 'Derived from calls and replies.' },
    ],
  },
};
