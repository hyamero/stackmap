'use client';

import Link from 'next/link';
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { ArrowRight } from 'lucide-react';
import { DIAGRAM_KINDS, KIND_LABELS, type DiagramKind, type LaidOutDiagram } from '@stackmap/core';
import { LiveScene } from '@/components/diagram/LiveScene';

const ABOUT: Record<DiagramKind, { def: string; layout: string }> = {
  architecture: { def: 'Components and what they call.', layout: 'Laid out by ELK, left to right or top down.' },
  dataflow: { def: 'Data moving through stages.', layout: 'Laid out by ELK, in stages.' },
  workflow: { def: 'Steps across owner lanes.', layout: 'Lanes laid out by stackmap.' },
  lifecycle: { def: 'The states of one thing.', layout: 'States in lanes, laid out by stackmap.' },
  sequence: { def: 'Messages over time.', layout: 'Lifelines laid out by stackmap.' },
};

/**
 * #kinds: one checkout drawn as each kind. A tab swaps the layer (the old one fades in 120 ms) and the new one plays
 * the viewer's intro, then loops its flow while the stage is on screen. Arrow keys switch at once.
 */
export function Kinds({ checkout }: { checkout: Record<string, LaidOutDiagram> }) {
  const [at, setAt] = useState(0);
  // How many times each kind has been brought on: a new count replays its intro.
  const [plays, setPlays] = useState<number[]>(() => DIAGRAM_KINDS.map(() => 0));
  const [visible, setVisible] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const tabs = useRef<HTMLDivElement>(null);
  const marker = useRef<HTMLElement>(null);
  const seen = useRef(false);

  const show = (i: number, intro: boolean) => {
    setAt(i);
    if (intro) setPlays((p) => p.map((n, j) => (j === i ? n + 1 : n)));
  };

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e) return;
        setVisible(e.isIntersecting);
        // The first time it's on screen, the shown kind plays its intro.
        if (e.isIntersecting && !seen.current) {
          seen.current = true;
          setPlays((p) => p.map((n, j) => (j === 0 ? n + 1 : n)));
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useLayoutEffect(() => {
    const place = () => {
      const tab = tabs.current?.querySelectorAll<HTMLElement>('[role="tab"]')[at];
      const m = marker.current;
      if (!tab || !m) return;
      m.style.width = `${tab.offsetWidth}px`;
      m.style.translate = `${tab.offsetLeft}px 0`;
    };
    place();
    void document.fonts?.ready.then(place);
    addEventListener('resize', place);
    return () => removeEventListener('resize', place);
  }, [at]);

  const onKeyDown = (e: KeyboardEvent) => {
    const last = DIAGRAM_KINDS.length - 1;
    const to = { ArrowRight: at === last ? 0 : at + 1, ArrowLeft: at === 0 ? last : at - 1, Home: 0, End: last }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    show(to, false);
    tabs.current?.querySelectorAll<HTMLElement>('[role="tab"]')[to]?.focus();
  };

  const kind = DIAGRAM_KINDS[at]!;
  return (
    <div className="k-wrap" data-reveal="" style={{ ['--d' as string]: '60ms' }}>
      <div ref={tabs} className="k-tabs pnl" role="tablist" aria-label="Diagram kinds" onKeyDown={onKeyDown}>
        <i ref={marker} className="k-ind" aria-hidden="true" />
        {DIAGRAM_KINDS.map((k, i) => (
          <button
            key={k}
            type="button"
            role="tab"
            id={`kt-${k}`}
            className="k-tab"
            aria-controls="kp"
            aria-selected={i === at}
            tabIndex={i === at ? 0 : -1}
            onClick={() => i !== at && show(i, true)}
          >
            {KIND_LABELS[k]}
          </button>
        ))}
      </div>
      <div ref={stage} className="k-stage grid-bg" id="kp" role="tabpanel" aria-labelledby={`kt-${kind}`}>
        {DIAGRAM_KINDS.map((k, i) => (
          <div key={k} className={`k-layer ${i === at ? 'on' : ''}`} aria-hidden={i !== at}>
            <LiveScene diagram={checkout[k]!} box={{ width: 1248, height: 548 }} play={plays[i]} flow={i === at && visible} pad={48} max={1} />
          </div>
        ))}
      </div>
      <div className="k-foot">
        <div className="k-cap">
          <p className="k-def">{ABOUT[kind].def}</p>
          <p className="k-lay">{ABOUT[kind].layout}</p>
        </div>
        <Link className="lnk k-more" href={`/kinds/${kind}`}>
          <span>{KIND_LABELS[kind]} diagrams</span>
          <ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
