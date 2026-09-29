import type { Direction } from '@stackmap/core';

// The viewer's motion vocabulary. Custom curves: the stock CSS eases are too soft to read as intentional.
export const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';
export const EASE_IN_OUT = 'cubic-bezier(0.77, 0, 0.175, 1)';
const EASE_DRAW = 'cubic-bezier(0.33, 1, 0.68, 1)';
export const DURATION = { press: 120, popover: 160, swap: 180, toast: 220, card: 340, draw: 380 } as const;
/** The intro wave never takes longer than this to reach the far end of a diagram. */
const WAVE_SPAN = 460;

// No WAAPI (jsdom) or reduced motion: nothing animates, everything is simply there.
export function motionAllowed(): boolean {
  if (typeof Element === 'undefined' || typeof Element.prototype.animate !== 'function') return false;
  return !globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

/** Handle for running motion: `cancel` jumps to the resting state. */
export interface Motion {
  cancel(): void;
}
const NONE: Motion = { cancel() {} };
const group = (parts: Motion[]): Motion => ({ cancel: () => parts.forEach((m) => m.cancel()) });

// Everything in flight, so an export can settle the page before cloning it.
const active = new Set<Motion>();

/** Jump every running animation to its resting state. */
export async function settleAll(): Promise<void> {
  [...active].forEach((m) => m.cancel());
}

/**
 * One element, one Web Animation. `fill: 'backwards'` holds the first frame through the delay (a staggered card
 * stays hidden until its turn) and applies nothing once finished, so the resting state is always the CSS the
 * explorer's emphasis rules (dim, focus) own: no inline styles to clean up.
 */
function play(el: Element, keyframes: Keyframe[], duration: number, delay = 0, easing = EASE_OUT, after?: () => void): Motion {
  const anim = el.animate(keyframes, { duration, delay, easing, fill: 'backwards' });
  let done = false;
  const motion: Motion = {
    cancel() {
      if (done) return;
      done = true;
      active.delete(motion);
      anim.cancel();
      after?.();
    },
  };
  active.add(motion);
  // `finished` rejects when cancelled; that path has already run `cancel`.
  anim.finished.then(() => motion.cancel(), () => {});
  return motion;
}

const fadeUp = (from: string): Keyframe[] => [
  { opacity: 0, transform: from },
  { opacity: 1, transform: 'none' },
];
const fade: Keyframe[] = [{ opacity: 0 }, { opacity: 1 }];

/**
 * A connection drawing from its source: normalised to length 1, the dash starts fully offset and slides to 0.
 * The arrowhead waits (CSS hides markers on `data-drawing`) until the line arrives.
 */
function draw(path: SVGPathElement, duration: number, delay: number): Motion {
  path.setAttribute('data-drawing', '');
  path.setAttribute('pathLength', '1');
  path.setAttribute('stroke-dasharray', '1 1');
  return play(path, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], duration, delay, EASE_DRAW, () =>
    ['data-drawing', 'pathLength', 'stroke-dasharray'].forEach((a) => path.removeAttribute(a)),
  );
}

/** Popovers grow from their trigger: a short fade and a 3% scale from `origin`. */
export function popIn(el: HTMLElement | null, origin: string): Motion {
  if (!el || !motionAllowed()) return NONE;
  el.style.transformOrigin = origin;
  return play(el, fadeUp('translateY(-4px) scale(0.97)'), DURATION.popover);
}

/** Content that replaces other content in place (the inspector): a quick fade with a 4px rise, children staggered. */
export function swapIn(parts: HTMLElement[]): Motion {
  if (!parts.length || !motionAllowed()) return NONE;
  return group(parts.map((el, i) => play(el, fadeUp('translateY(4px)'), DURATION.swap, Math.min(i, 5) * 28)));
}

/** Toasts rise into place from below. */
export function riseIn(el: HTMLElement | null): Motion {
  if (!el || !motionAllowed()) return NONE;
  return play(el, fadeUp('translateY(8px)'), DURATION.toast);
}

/** Slide the view-tab indicator from one tab to another (transform only: no layout per frame). */
export function slideIndicator(el: HTMLElement | null, from: { x: number; width: number }, to: { x: number; width: number }): Motion {
  if (!el || !motionAllowed() || !to.width) return NONE;
  el.style.transformOrigin = '0 0';
  const at = (r: { x: number; width: number }) => `translateX(${r.x}px) scaleX(${r.width / to.width})`;
  return play(el, [{ transform: at(from) }, { transform: at(to) }], DURATION.swap, 0, EASE_IN_OUT);
}

/** Chrome panels settle in with the diagram, one after another. */
export function revealChrome(panels: HTMLElement[]): Motion {
  if (!panels.length || !motionAllowed()) return NONE;
  return group(panels.map((el, i) => play(el, fadeUp('translateY(-6px)'), 280, i * 50)));
}

export interface RevealTargets {
  /** cards and frames to bring in, and the position along the reading direction that orders them */
  items: { el: HTMLElement; at: number; kind: 'card' | 'frame' }[];
  edges: { el: SVGPathElement; from: number; to: number; async: boolean; label?: HTMLElement }[];
}

/**
 * The diagram arrives as a wave in its own reading direction: frames first, then cards in flow order, then each
 * connection draws from its source once both of its ends are in place. Positions are normalised to one span,
 * so a 500-node diagram takes as long as a 5-node one. Each element settles as soon as its own part is done,
 * so selecting or tracing mid-intro dims straight away.
 */
export function revealScene({ items, edges }: RevealTargets): Motion {
  if ((!items.length && !edges.length) || !motionAllowed()) return NONE;
  const positions = [...items.map((i) => i.at), ...edges.flatMap((e) => [e.from, e.to])];
  const min = Math.min(...positions);
  const range = Math.max(...positions) - min || 1;
  const wave = (at: number) => ((at - min) / range) * WAVE_SPAN;
  const edgeDelay = (e: RevealTargets['edges'][number]) => 60 + wave(Math.max(e.from, e.to)) + DURATION.card * 0.5;
  return group([
    ...items.map((i) =>
      i.kind === 'frame'
        ? play(i.el, fade, 320, wave(i.at) * 0.6)
        : play(i.el, fadeUp('translateY(6px) scale(0.985)'), DURATION.card, 60 + wave(i.at)),
    ),
    // Async edges keep their dash pattern, so they fade rather than draw.
    ...edges.map((e) => (e.async ? play(e.el, fade, DURATION.draw, edgeDelay(e)) : draw(e.el, DURATION.draw, edgeDelay(e)))),
    ...edges.flatMap((e) => (e.label ? [play(e.label, fade, 200, edgeDelay(e) + DURATION.draw * 0.6)] : [])),
  ]);
}

/** Where along the reading direction a rect sits (x for RIGHT, y for DOWN), for ordering the wave. */
export const flowPosition = (direction: Direction, r: { x: number; y: number; width: number; height: number }) =>
  direction === 'RIGHT' ? r.x + r.width / 2 : r.y + r.height / 2;
