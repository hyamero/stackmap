import type { DiagramKind } from '@stackmap/core';

export interface KindPage {
  lede: string;
  use: string;
  /** a request for the reader to give their agent, one like the skill's example */
  ask: string;
  parts: { title: string; text: string }[];
}

// Copy from the canvas's five kind boards. The parts' illustrations live with the page, in Parts.tsx.
export const KIND_PAGES: Record<DiagramKind, KindPage> = {
  architecture: {
    lede: 'Components and what they call: services, stores and the infrastructure between them.',
    use: 'Use it when the edges are calls and dependencies. Draw each edge from the initiator to what it calls, even when it only reads; queues are the exception, from producer to queue to consumer. Groups mark the boundaries a reader should see: tiers, trust zones, clusters.',
    ask: 'Make an architecture diagram of this repository, backed by evidence from the code.',
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
    parts: [
      { title: 'Participants', text: 'Three to eight, caller first.' },
      { title: 'Messages', text: 'Every one labelled, in time order.' },
      { title: 'Replies', text: 'kind return, dotted with an open head.' },
      { title: 'Activation bars', text: 'Derived from calls and replies.' },
    ],
  },
};
