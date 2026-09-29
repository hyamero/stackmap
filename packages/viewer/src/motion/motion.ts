import { animate, svg, waapi } from 'animejs';
import type { Direction } from '@stackmap/core';

// The viewer's motion vocabulary. Custom curves: the stock CSS eases are too soft to read as intentional.
export const EASE_OUT = 'cubicBezier(0.23, 1, 0.32, 1)';
export const EASE_IN_OUT = 'cubicBezier(0.77, 0, 0.175, 1)';
export const DURATION = { press: 120, popover: 160, swap: 180, toast: 220, card: 340, draw: 380 } as const;
/** The intro wave never takes longer than this to reach the far end of a diagram. */
const WAVE_SPAN = 460;

// No WAAPI (jsdom) or reduced motion: nothing animates, everything is simply there.
export function motionAllowed(): boolean {
  if (typeof Element === 'undefined' || typeof Element.prototype.animate !== 'function') return false;
  return !globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

/** Handle for running motion: `cancel` jumps to the resting state and removes every inline trace. */
export interface Motion {
  cancel(): void;
}
const NONE: Motion = { cancel() {} };
const group = (parts: Motion[]): Motion => ({ cancel: () => parts.forEach((m) => m.cancel()) });

// Everything in flight, so an export can settle the page before cloning it.
const active = new Set<Motion>();

/** Jump every running animation to its resting state; resolves once anime's late style commits are undone too. */
export function settleAll(): Promise<void> {
  [...active].forEach((m) => m.cancel());
  return new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(() => done())));
}

type Style = 'opacity' | 'transform';
type Keyframes = Partial<Record<Style, (number | string)[]>>;

/**
 * One element, one tween, settled on its own. anime commits end values inline when a tween ends, and again a
 * frame after a mid-flight cancel; either would beat the CSS emphasis rules (dim, focus) that own the resting
 * state. So the element's own inline values are restored on finish, on cancel, and once more a frame later.
 */
function tween(el: HTMLElement | SVGElement, keyframes: Keyframes, duration: number, delay = 0, ease = EASE_OUT): Motion {
  const props = Object.keys(keyframes) as Style[];
  const before = props.map((p) => el.style.getPropertyValue(p));
  const restore = () => props.forEach((p, i) => (before[i] ? el.style.setProperty(p, before[i]!) : el.style.removeProperty(p)));
  const anim = waapi.animate(el as HTMLElement, { ...keyframes, duration, delay, ease });
  let done = false;
  const motion: Motion = {
    cancel() {
      if (done) return;
      done = true;
      active.delete(motion);
      anim.revert();
      restore();
      // A newer tween on the same element owns its style now; only clean up after ourselves when idle.
      requestAnimationFrame(() => el.getAnimations().length === 0 && restore());
    },
  };
  active.add(motion);
  void anim.then(() => motion.cancel());
  return motion;
}

// Everything svg.createDrawable writes onto a path; removing it leaves the path as React rendered it.
const DRAWABLE_ATTRS = ['data-drawing', 'pathLength', 'stroke-dasharray', 'stroke-dashoffset', 'draw'];

/**
 * A connection drawing from its source. Reverting a drawable restores its *from* value (an empty dash), so it is
 * cancelled and its attributes removed by hand. The arrowhead is hidden (CSS, `data-drawing`) until the line arrives.
 */
function draw(path: SVGPathElement, duration: number, delay: number): Motion {
  path.setAttribute('data-drawing', '');
  const anim = animate(svg.createDrawable(path), { draw: ['0 0', '0 1'], duration, delay, ease: 'out(3)' });
  let done = false;
  const motion: Motion = {
    cancel() {
      if (done) return;
      done = true;
      active.delete(motion);
      anim.cancel();
      DRAWABLE_ATTRS.forEach((a) => path.removeAttribute(a));
    },
  };
  active.add(motion);
  void anim.then(() => motion.cancel());
  return motion;
}

/** Popovers grow from their trigger: a short fade and a 3% scale from `origin`. */
export function popIn(el: HTMLElement | null, origin: string): Motion {
  if (!el || !motionAllowed()) return NONE;
  el.style.transformOrigin = origin;
  return tween(el, { opacity: [0, 1], transform: ['translateY(-4px) scale(0.97)', 'none'] }, DURATION.popover);
}

/** Content that replaces other content in place (the inspector): a quick fade with a 4px rise, children staggered. */
export function swapIn(parts: HTMLElement[]): Motion {
  if (!parts.length || !motionAllowed()) return NONE;
  return group(parts.map((el, i) => tween(el, { opacity: [0, 1], transform: ['translateY(4px)', 'none'] }, DURATION.swap, Math.min(i, 5) * 28)));
}

/** Toasts rise into place from below. */
export function riseIn(el: HTMLElement | null): Motion {
  if (!el || !motionAllowed()) return NONE;
  return tween(el, { opacity: [0, 1], transform: ['translateY(8px)', 'none'] }, DURATION.toast);
}

/** Slide the view-tab indicator from one tab to another (transform only: no layout per frame). */
export function slideIndicator(el: HTMLElement | null, from: { x: number; width: number }, to: { x: number; width: number }): Motion {
  if (!el || !motionAllowed() || !to.width) return NONE;
  el.style.transformOrigin = '0 0';
  const at = (r: { x: number; width: number }) => `translateX(${r.x}px) scaleX(${r.width / to.width})`;
  return tween(el, { transform: [at(from), at(to)] }, DURATION.swap, 0, EASE_IN_OUT);
}

/** Chrome panels settle in with the diagram, one after another. */
export function revealChrome(panels: HTMLElement[]): Motion {
  if (!panels.length || !motionAllowed()) return NONE;
  return group(panels.map((el, i) => tween(el, { opacity: [0, 1], transform: ['translateY(-6px)', 'none'] }, 280, i * 50)));
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
        ? tween(i.el, { opacity: [0, 1] }, 320, wave(i.at) * 0.6)
        : tween(i.el, { opacity: [0, 1], transform: ['translateY(6px) scale(0.985)', 'none'] }, DURATION.card, 60 + wave(i.at)),
    ),
    ...edges.map((e) => (e.async ? tween(e.el, { opacity: [0, 1] }, DURATION.draw, edgeDelay(e)) : draw(e.el, DURATION.draw, edgeDelay(e)))),
    ...edges.flatMap((e) => (e.label ? [tween(e.label, { opacity: [0, 1] }, 200, edgeDelay(e) + DURATION.draw * 0.6)] : [])),
  ]);
}

/** Where along the reading direction a rect sits (x for RIGHT, y for DOWN), for ordering the wave. */
export const flowPosition = (direction: Direction, r: { x: number; y: number; width: number; height: number }) =>
  direction === 'RIGHT' ? r.x + r.width / 2 : r.y + r.height / 2;
