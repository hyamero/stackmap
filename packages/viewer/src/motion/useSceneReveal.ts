import { useLayoutEffect, useRef, type RefObject } from 'react';
import type { Scene } from '../canvas/scene';
import { flowPosition, revealScene, type RevealTargets } from './motion';

/**
 * Plays the intro wave the first time a diagram is on screen, and on a live reload brings in only what is new.
 * A restored live session (camera kept across a server restart) skips the intro: the user has seen it.
 */
export function useSceneReveal(root: RefObject<HTMLElement | null>, scene: Scene, skipIntro: boolean) {
  const seen = useRef<Set<string> | null>(null);
  // Layout effect: targets are hidden before the first paint, so nothing flashes in and then out.
  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const prev = seen.current;
    const now = new Set([...scene.frames.map((f) => `f:${f.id}`), ...scene.cards.map((c) => `n:${c.node.id}`), ...scene.edges.map((e) => `e:${e.id}`)]);
    seen.current = now;
    if (!prev && skipIntro) return;
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
      const node = fresh(`n:${c.node.id}`) && q(`.sm-card[data-card-id="${CSS.escape(c.node.id)}"]`);
      if (node) targets.items.push({ el: node, at: pos(c.rect), kind: 'card' });
    }
    for (const e of scene.edges) {
      const path = fresh(`e:${e.id}`) && q<SVGPathElement>(`path[data-edge-id="${CSS.escape(e.id)}"]`);
      if (!path) continue;
      const label = q(`[data-edge-label="${CSS.escape(e.id)}"]`) ?? undefined;
      targets.edges.push({ el: path as unknown as SVGPathElement, from: centre.get(e.from) ?? 0, to: centre.get(e.to) ?? 0, async: e.kind === 'async', label });
    }
    const motion = revealScene(targets);
    return () => {
      motion.cancel();
      // StrictMode runs this effect twice on mount; the second run must still see everything as new.
      seen.current = prev;
    };
  }, [root, scene, skipIntro]);
}
