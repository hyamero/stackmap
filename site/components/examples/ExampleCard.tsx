import Link from 'next/link';
import { Bot } from 'lucide-react';
import { KIND_LABELS } from '@stackmap/core';
import { Thumbnail } from '@/components/diagram/Thumbnail';
import { exampleHref, type Entry } from '@/lib/catalog';
import { diagramOf } from '@/lib/diagrams';
import './examples.css';

export function AgentMark({ className = '' }: { className?: string }) {
  return (
    <span className={`ag ${className}`}>
      <Bot size={14} strokeWidth={1.75} className="ic" aria-hidden="true" />
      <span>Written by an agent</span>
    </span>
  );
}

/** One example in a grid: its thumbnail, title, kind and size, and what the agent was asked if one wrote it. */
export function ExampleCard({ entry }: { entry: Entry }) {
  const { draft } = diagramOf(entry);
  return (
    <Link className="ex-card" href={exampleHref(entry)}>
      <span className="ex-th">
        <Thumbnail diagram={diagramOf(entry)} />
      </span>
      <span className="ex-b">
        <span className="ex-t">{draft.title}</span>
        <span className="ex-m">
          <span>{KIND_LABELS[entry.kind]}</span>
          <i aria-hidden="true" />
          <span className="tnum">{draft.nodes.length} nodes</span>
        </span>
        {entry.prompt && (
          <span className="ex-p">
            <AgentMark />
            <span className="ex-q">“{entry.prompt}”</span>
          </span>
        )}
      </span>
    </Link>
  );
}
