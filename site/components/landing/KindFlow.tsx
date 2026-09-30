'use client';

import { useCallback, useRef } from 'react';
import { FlowLayer, type FlowClock } from '@stackmap/viewer/src/canvas/FlowLayer';
import { holdTime, type KindFlow as Data } from './kinds-geometry';
import { s } from './style';

/** Kind k's pulses over its layer, playing one loop through its hold as the scene scrubs; hidden at rest. */
export function KindFlow({ data, k }: { data: Data; k: number }) {
  const box = useRef<HTMLDivElement>(null);
  const { flow, origin, width, height } = data;
  const clock = useCallback<FlowClock>(
    (draw) => {
      const scene = box.current?.closest<HTMLElement>('[data-scene]');
      if (!scene) return () => {};
      const onScene = (e: Event) => draw(holdTime((e as CustomEvent<number>).detail, k, flow.period));
      scene.addEventListener('scene', onScene);
      return () => scene.removeEventListener('scene', onScene);
    },
    [k, flow.period],
  );
  return (
    <div ref={box} className="kflow" style={s({ transform: `translate(${-origin.x}px, ${-origin.y}px)` })}>
      <FlowLayer flow={flow} width={width} height={height} clock={clock} />
    </div>
  );
}
