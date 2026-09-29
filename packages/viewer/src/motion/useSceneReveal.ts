import { useLayoutEffect, useRef, type RefObject } from 'react';
import type { Scene } from '../canvas/scene';
import { readLiveConfig, readShown, storeShown } from '../live';
import { flowPosition, revealScene, type RevealTargets } from './motion';

const keysOf = (scene: Scene) =>
  new Set([...scene.frames.map((f) => `f:${f.id}`), ...scene.cards.map((c) => `n:${c.node.id}`), ...scene.edges.map((e) => `e:${e.id}`)]);

/**
 * Plays the intro wave the first time a diagram is on screen; afterwards only what is new animates in. That holds
 * for a new `scene` on the same canvas and across `stackmap serve`'s live reload, which restores the camera
 * (`restored`) and compares against the ids the previous page showed.
 */
export function useSceneReveal(root: RefObject<HTMLElement | null>, scene: Scene, restored: boolean) {
  // `prev` is kept with the scene it was computed for: StrictMode re-runs the effect for the same scene and must
  // diff against the same baseline, not against itself.
  const shown = useRef<{ scene: Scene; ids: Set<string>; prev: Set<string> | null } | null>(null);
  // Layout effect: targets are hidden before the first paint, so nothing flashes in and then out.
  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const ids = keysOf(scene);
    const last = shown.current;
    const prev = last?.scene === scene ? last.prev : (last?.ids ?? (restored ? (readShown() ?? ids) : null));
    shown.current = { scene, ids, prev };
    if (readLiveConfig(document)) storeShown(ids);

    const fresh = (key: string) => !prev?.has(key);
    const q = <T extends Element>(sel: string) => el.querySelector<T & HTMLElement>(sel);
    const pos = (r: Parameters<typeof flowPosition>[1]) => flowPosition(scene.direction, r);
    const start = (r: Parameters<typeof flowPosition>[1]) => flowPosition(scene.direction, { ...r, width: 0, height: 0 });
    const centre = new Map(scene.cards.map((c) => [c.node.id, pos(c.rect)]));

    const targets: RevealTargets = { items: [], edges: [] };
    for (const f of scene.frames) {
      const node = fresh(`f:${f.id}`) && q(`[data-frame-id="${CSS.escape(f.id)}"]`);
      if (node) targets.items.push({ el: node, at: start(f.rect), kind: 'frame' });
    }
    for (const c of scene.cards) {
      if (!fresh(`n:${c.node.id}`)) continue;
      const node = q(`.sm-card[data-card-id="${CSS.escape(c.node.id)}"]`);
      if (node) targets.items.push({ el: node, at: pos(c.rect), kind: 'card' });
      // Route-end dots and a start marker belong to their card: they arrive with it, not before.
      for (const mark of el.querySelectorAll<HTMLElement>(`[data-handle-of="${CSS.escape(c.node.id)}"], [data-start-mark="${CSS.escape(c.node.id)}"]`))
        targets.items.push({ el: mark, at: pos(c.rect), kind: 'card' });
    }
    for (const e of scene.edges) {
      const path = fresh(`e:${e.id}`) && q<SVGPathElement>(`path[data-edge-id="${CSS.escape(e.id)}"]`);
      if (!path) continue;
      const label = q(`[data-edge-label="${CSS.escape(e.id)}"]`) ?? undefined;
      // Dashed and dotted connections fade in: drawing them would show a solid line that snaps to dashes.
      targets.edges.push({ el: path as unknown as SVGPathElement, from: centre.get(e.from) ?? 0, to: centre.get(e.to) ?? 0, async: e.kind !== 'sync', label });
    }
    const motion = revealScene(targets);
    return () => motion.cancel();
  }, [root, scene, restored]);
}
