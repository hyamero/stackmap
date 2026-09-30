import { DIAGRAM_KINDS, type DiagramKind, type LaidOutDiagram, type Rect } from '@stackmap/core';
import { toScene, type SceneCard } from '@stackmap/viewer/src/canvas/scene';
import { SLOT_COUNT, SLOTS } from '@/lib/checkout';
import type { Tween } from './timeline';

/** The stage the kinds share, in frame pixels: its centre is the camera's origin. */
export interface Area {
  cx: number;
  cy: number;
  width: number;
  height: number;
}

export interface KindLayer {
  kind: DiagramKind;
  diagram: LaidOutDiagram;
  /** the layer's box on the frame at the shared scale */
  left: number;
  top: number;
  /** the camera's zoom for this kind: its own fit, never past `maxCam` */
  cam: number;
}

export interface SlotFace {
  card: SceneCard;
  compact: boolean;
  /** where the card sits on the frame, at the shared scale */
  rect: Rect;
}

export interface KindsGeometry {
  scale: number;
  layers: KindLayer[];
  /** slots[i][k]: slot i's card in kind k, or null when that kind has no card there */
  slots: (SlotFace | null)[][];
}

/** "Every kind is laid out at one shared scale; a camera scales the stage to each kind's own fit." */
export function kindsGeometry(checkout: Record<string, LaidOutDiagram>, area: Area, maxCam = 1.35): KindsGeometry {
  const scenes = DIAGRAM_KINDS.map((kind) => {
    const diagram = checkout[kind];
    if (!diagram) throw new Error(`no checkout drawn as ${kind}`);
    return { kind, diagram, scene: toScene(diagram) };
  });
  const scale = Math.min(...scenes.map(({ scene: { content } }) => Math.min(area.width / content.width, area.height / content.height)));
  const layers = scenes.map(({ kind, diagram, scene: { content } }) => ({
    kind,
    diagram,
    left: area.cx - (content.width * scale) / 2,
    top: area.cy - (content.height * scale) / 2,
    cam: Math.min(maxCam, area.width / (content.width * scale), area.height / (content.height * scale)),
  }));
  const slots = Array.from({ length: SLOT_COUNT }, (_, i) =>
    scenes.map(({ kind, scene }, k) => {
      const id = SLOTS[kind][i];
      if (!id) return null;
      const card = scene.cards.find((c) => c.node.id === id);
      if (!card) throw new Error(`${kind} checkout has no node ${id}`);
      const { left, top } = layers[k]!;
      const r = card.rect;
      return {
        card,
        compact: scene.compact,
        rect: { x: left + (r.x - scene.content.x) * scale, y: top + (r.y - scene.content.y) * scale, width: r.width * scale, height: r.height * scale },
      };
    }),
  );
  return { scale, layers, slots };
}

/** Each kind's hold, in percent of the pin (Motion board, #kinds). Between holds everything moves. */
export const HOLDS: [number, number][] = [
  [0, 16],
  [23, 36],
  [43, 56],
  [63, 76],
  [83, 100],
];

const MOVE = 'cb:0.77,0,0.175,1';
const ENTER = 'cb:0.23,1,0.32,1';
const px = (n: number) => `${Math.round(n * 10) / 10}px`;

// Where a slot sits in a kind that leaves it empty: where it last was, or where it first will be.
function standIn(faces: (SlotFace | null)[], k: number): SlotFace {
  for (let j = k - 1; j >= 0; j--) if (faces[j]) return faces[j]!;
  for (let j = k + 1; j < faces.length; j++) if (faces[j]) return faces[j]!;
  throw new Error('a slot with no card in any kind');
}

/** Held through each kind, moving between them on the in-out curve. */
function holds(at: (k: number) => Record<string, string>): Tween['frames'] {
  const frames: Tween['frames'] = {};
  HOLDS.forEach(([a, b], k) => {
    frames[`${a}%`] = { ...at(k), ...(k ? { ease: MOVE } : {}) };
    frames[`${b}%`] = at(k);
  });
  return frames;
}

/** Shown through kind k's hold, fading over `fade` percent either side; the first kind starts shown, the last stays. */
function shownIn(k: number, fade: number): Tween['frames'] {
  const [a, b] = HOLDS[k]!;
  const last = k === HOLDS.length - 1;
  return {
    '0%': { opacity: k === 0 ? '1' : '0' },
    ...(k === 0 ? {} : { [`${a - fade}%`]: { opacity: '0' }, [`${a}%`]: { opacity: '1', ease: ENTER } }),
    [`${b}%`]: { opacity: '1' },
    ...(last ? {} : { [`${b + fade}%`]: { opacity: '0', ease: ENTER } }),
    '100%': { opacity: last ? '1' : '0' },
  };
}

/** The phone's kinds: whole diagrams crossfading in their holds, one layer each. */
export function crossfadeTweens(count: number): Tween[] {
  return Array.from({ length: count }, (_, k) => ({ target: `.kl${k}`, frames: shownIn(k, 3) }));
}

/** The scene's generated timelines: slots glide between kinds, layers and faces cross over, the camera refits. */
export function kindsTweens(g: KindsGeometry): Tween[] {
  const out: Tween[] = [];
  g.slots.forEach((faces, i) => {
    out.push({
      target: `.ks${i}`,
      frames: holds((k) => {
        const { x, y, width, height } = (faces[k] ?? standIn(faces, k)).rect;
        return { left: px(x), top: px(y), width: px(width), height: px(height), opacity: faces[k] ? '1' : '0' };
      }),
    });
    faces.forEach((f, k) => f && out.push({ target: `.kf${i}_${k}`, frames: shownIn(k, 4) }));
  });
  g.layers.forEach((_, k) => out.push({ target: `.kl${k}`, frames: shownIn(k, 3) }));
  out.push({ target: '.kcam', frames: holds((k) => ({ scale: String(Math.round(g.layers[k]!.cam * 1000) / 1000) })) });
  return out;
}
