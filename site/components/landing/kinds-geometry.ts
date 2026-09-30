import { DIAGRAM_KINDS, type DiagramKind, type LaidOutDiagram, type Rect } from '@stackmap/core';
import { toScene, type SceneCard } from '@stackmap/viewer/src/canvas/scene';
import { SLOT_COUNT, SLOTS } from '@/lib/checkout';

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

const MOVE = 'cubic-bezier(0.77, 0, 0.175, 1)';
const ENTER = 'cubic-bezier(0.23, 1, 0.32, 1)';
const round = (n: number) => Math.round(n * 10) / 10;

// Where a slot sits in a kind that leaves it empty: where it last was, or where it first will be.
function standIn(faces: (SlotFace | null)[], k: number): SlotFace {
  for (let j = k - 1; j >= 0; j--) if (faces[j]) return faces[j]!;
  for (let j = k + 1; j < faces.length; j++) if (faces[j]) return faces[j]!;
  throw new Error('a slot with no card in any kind');
}

/** Visible through kind k's hold, fading over `fade` percent either side; the first kind starts shown, the last stays. */
function window(k: number, fade: number): string {
  const [a, b] = HOLDS[k]!;
  const frames = [k === 0 ? '0%{opacity:1}' : `0%{opacity:0}${a - fade}%{opacity:0;animation-timing-function:${ENTER}}${a}%{opacity:1}`];
  frames.push(k === HOLDS.length - 1 ? '100%{opacity:1}' : `${b}%{opacity:1;animation-timing-function:${ENTER}}${b + fade}%{opacity:0}100%{opacity:0}`);
  return frames.join('');
}

/** The scene's generated timelines: slots glide between kinds, layers and faces cross over, the camera refits. */
export function kindsKeyframes(g: KindsGeometry, prefix: string): string {
  const out: string[] = [];
  g.slots.forEach((faces, i) => {
    const frames = HOLDS.flatMap(([a, b], k) => {
      const f = faces[k] ?? standIn(faces, k);
      const r = f.rect;
      const at = `left:${round(r.x)}px;top:${round(r.y)}px;width:${round(r.width)}px;height:${round(r.height)}px;opacity:${faces[k] ? 1 : 0};animation-timing-function:${MOVE}`;
      return [`${a}%{${at}}`, `${b}%{${at}}`];
    });
    out.push(`@keyframes ${prefix}tl-ks${i}{${frames.join('')}}`);
    faces.forEach((f, k) => f && out.push(`@keyframes ${prefix}tl-kf${i}_${k}{${window(k, 4)}}`));
  });
  g.layers.forEach((_, k) => out.push(`@keyframes ${prefix}tl-kl${k}{${window(k, 3)}}`));
  const cam = HOLDS.flatMap(([a, b], k) => {
    const at = `transform:scale(${round(g.layers[k]!.cam * 1000) / 1000});animation-timing-function:${MOVE}`;
    return [`${a}%{${at}}`, `${b}%{${at}}`];
  });
  out.push(`@keyframes ${prefix}tl-kcam{${cam.join('')}}`);
  return out.join('\n');
}
