import { useEffect, useRef } from 'react';
import type { NodeType } from '@stackmap/core';
import { PULSE, pulseAt, type Flow } from '../motion/flow';

/**
 * Flow playback on the canvas: a pulse per playing edge, tinted by its source, moved by one rAF loop (attribute
 * writes only, no React renders per frame). Sits above the edges and under the cards, so a pulse slides out of
 * one card and into the next. Exports skip it (`data-flow`).
 */
export function FlowLayer({ flow, typeOf, width, height }: { flow: Flow; typeOf: ReadonlyMap<string, NodeType>; width: number; height: number }) {
  const root = useRef<SVGGElement>(null);
  useEffect(() => {
    const dots = [...(root.current?.children ?? [])] as SVGGElement[];
    if (!dots.length) return;
    let began: number | null = null;
    let frame = 0;
    const tick = (now: number) => {
      began ??= now;
      flow.pulses.forEach((p, i) => {
        const at = pulseAt(flow, p, now - began!);
        const dot = dots[i]!;
        if (at) dot.setAttribute('transform', `translate(${at.x} ${at.y})`);
        dot.style.visibility = at ? '' : 'hidden';
      });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [flow]);
  return (
    <svg aria-hidden="true" data-flow="" className="pointer-events-none absolute top-0 left-0 overflow-visible" width={width} height={height}>
      <g ref={root}>
        {flow.pulses.map((p) => {
          const fill = `var(--sm-${typeOf.get(p.from)}-accent)`;
          return (
            <g key={p.id} data-pulse={p.id} style={{ visibility: 'hidden' }}>
              <circle r={PULSE.halo} style={{ fill, fillOpacity: PULSE.haloOpacity }} />
              <circle r={PULSE.core} style={{ fill }} />
            </g>
          );
        })}
      </g>
    </svg>
  );
}
