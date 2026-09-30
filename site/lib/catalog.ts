import { DIAGRAM_KINDS, type DiagramKind } from '@stackmap/core';

/** Where a diagram comes from: the viewer's gallery samples, the agent-written examples, or the skill's own examples. */
export type Source = 'gallery' | 'examples' | 'skill';

export interface Entry {
  source: Source;
  key: string;
  kind: DiagramKind;
  /** agent-written examples only: the request the agent was given in the skill's eval */
  prompt?: string;
}

export const id = (e: Pick<Entry, 'source' | 'key'>) => `${e.source}-${e.key}`;

const gallery = (key: string, kind: DiagramKind): Entry => ({ source: 'gallery', key, kind });
const agent = (key: string, kind: DiagramKind, prompt: string): Entry => ({ source: 'examples', key, kind, prompt });

/** The /examples page, in the canvas's order: the gallery by kind, with each agent-written example beside its kind. */
export const EXAMPLES: Entry[] = [
  gallery('release-delivery', 'workflow'),
  gallery('web-app', 'architecture'),
  gallery('production-deployment', 'architecture'),
  agent(
    'food-delivery',
    'architecture',
    'Draw our food-delivery platform. Customers use an iOS app and a React web app. Both go through an API gateway (Kong) to four services: accounts, restaurants, orders and a dispatch service that assigns couriers. Orders and accounts use a shared Postgres cluster (one primary, two read replicas); restaurants has its own MongoDB. Orders publishes events to Kafka; dispatch and a notifications worker consume them. Notifications sends push through Firebase and SMS through Twilio. Sessions and rate limits live in Redis. Payments go from orders to Stripe. Auth is Auth0. Add a view for the order path.',
  ),
  gallery('incident-response', 'workflow'),
  gallery('agent-tool-call', 'workflow'),
  gallery('agent-run', 'lifecycle'),
  gallery('deployment-release', 'lifecycle'),
  agent(
    'repo-architecture',
    'dataflow',
    'Make an architecture diagram of this repository: what the packages are, what each one does, and how data moves between them from an agent-written diagram JSON to the HTML file a user opens. Back it with evidence from the code.',
  ),
  gallery('event-stream', 'dataflow'),
  gallery('product-analytics', 'dataflow'),
  agent(
    'ml-feature-platform',
    'dataflow',
    'Show how data flows through our ML feature platform. Product databases (Postgres) are captured with Debezium CDC into Kafka. A Flink job computes streaming features and writes them to Redis (online store) and to a Delta Lake on S3 (offline store). Airflow runs nightly Spark jobs over the lake to build training sets, which a training pipeline on SageMaker consumes; models are registered in MLflow. The prediction service reads online features from Redis and loads models from MLflow. Also note that raw Kafka topics are archived to S3 for replay.',
  ),
  gallery('cache-miss', 'sequence'),
  gallery('async-job', 'sequence'),
  agent('production-vpc', 'architecture', 'Turn this Mermaid into a stackmap diagram.'),
  agent(
    'bookshop',
    'architecture',
    "Update the bookshop diagram: we added a search service (search-api) that the shop API queries over HTTP, backed by Elasticsearch. Put Stripe into a new 'Third parties' group, and add search to the checkout path view since the storefront uses it before buying.",
  ),
];

/** The skill's example for each kind, by file name without `.json`. */
export const SKILL_EXAMPLE: Record<DiagramKind, string> = {
  architecture: 'web-app.architecture',
  dataflow: 'clickstream.dataflow',
  workflow: 'release.workflow',
  lifecycle: 'job.lifecycle',
  sequence: 'checkout.sequence',
};

/** A kind's page: its gallery samples, then the skill's example, then what agents wrote. */
export function kindEntries(kind: DiagramKind): Entry[] {
  const of = EXAMPLES.filter((e) => e.kind === kind);
  return [...of.filter((e) => e.source === 'gallery'), { source: 'skill', key: SKILL_EXAMPLE[kind], kind }, ...of.filter((e) => e.source === 'examples')];
}

export const KINDS = DIAGRAM_KINDS;
