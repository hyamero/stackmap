import { animate, svg, waapi, type JSAnimation, type WAAPIAnimation } from 'animejs';
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

type Anim = WAAPIAnimation | JSAnimation;
/** Handle for a set of animations: `cancel` jumps to the resting state and removes every inline trace. */
export interface Motion {
  cancel(): void;
}
const NONE: Motion = { cancel() {} };

// anime commits final values inline when an animation ends; revert() hands the element back to its CSS
// (the explorer's dim/focus states live there) exactly as React rendered it.
// Drawables are the exception: reverting one restores its *from* value (an empty dash), so those are stopped
// and cleaned by hand instead (`stop` + `after`).
function settle(anims: Anim[], after?: () => void, stop: JSAnimation[] = []): Motion {
  let done = false;
  const cancel = () => {
    if (done) return;
    done = true;
    anims.forEach((a) => a.revert());
    stop.forEach((a) => a.cancel());
    after?.();
  };
  void Promise.all([...anims, ...stop].map((a) => a.then())).then(cancel);
  return { cancel };
}

// Everything svg.createDrawable writes onto a path; removing it leaves the path as React rendered it.
const DRAWABLE_ATTRS = ['data-drawing', 'pathLength', 'stroke-dasharray', 'stroke-dashoffset', 'draw'];

const enter = (targets: Element | Element[], keyframes: { opacity?: number[]; transform?: string[] }, duration: number, delay: number | ((el: Element, i: number) => number) = 0) =>
  waapi.animate(targets as HTMLElement[], { ...keyframes, duration, delay: delay as never, ease: EASE_OUT });

/** Popovers grow from their trigger: a short fade and a 3% scale from `origin`. */
export function popIn(el: HTMLElement | null, origin: string): Motion {
  if (!el || !motionAllowed()) return NONE;
  el.style.transformOrigin = origin;
  return settle([enter(el, { opacity: [0, 1], transform: ['translateY(-4px) scale(0.97)', 'none'] }, DURATION.popover)]);
}

/** Content that replaces other content in place (the inspector): a quick fade with a 4px rise, children staggered. */
export function swapIn(parts: HTMLElement[]): Motion {
  if (!parts.length || !motionAllowed()) return NONE;
  return settle([enter(parts, { opacity: [0, 1], transform: ['translateY(4px)', 'none'] }, DURATION.swap, (_, i) => Math.min(i, 5) * 28)]);
}

/** Toasts rise into place from below. */
export function riseIn(el: HTMLElement | null): Motion {
  if (!el || !motionAllowed()) return NONE;
  return settle([enter(el, { opacity: [0, 1], transform: ['translateY(8px)', 'none'] }, DURATION.toast)]);
}

/** Slide the view-tab indicator from one tab to another (transform only: no layout per frame). */
export function slideIndicator(el: HTMLElement | null, from: { x: number; width: number }, to: { x: number; width: number }): Motion {
  if (!el || !motionAllowed() || !to.width) return NONE;
  el.style.transformOrigin = '0 0';
  const at = (r: { x: number; width: number }) => `translateX(${r.x}px) scaleX(${r.width / to.width})`;
  return settle([waapi.animate(el, { transform: [at(from), at(to)], duration: DURATION.swap, ease: EASE_IN_OUT })]);
}

/** Chrome panels settle in with the diagram, one after another. */
export function revealChrome(panels: HTMLElement[]): Motion {
  if (!panels.length || !motionAllowed()) return NONE;
  return settle([enter(panels, { opacity: [0, 1], transform: ['translateY(-6px)', 'none'] }, 280, (_, i) => i * 50)]);
}

export interface RevealTargets {
  /** cards/frames/labels to bring in, and the diagram-space point that orders them */
  items: { el: HTMLElement; at: number; kind: 'card' | 'frame' | 'label' }[];
  edges: { el: SVGPathElement; from: number; to: number; async: boolean; label?: HTMLElement }[];
}

/**
 * The diagram arrives as a wave in its own reading direction: frames first, then cards in flow order, then each
 * connection draws from its source once both of its ends are in place. Positions are normalised to one span,
 * so a 500-node diagram takes as long as a 5-node one.
 */
export function revealScene({ items, edges }: RevealTargets): Motion {
  if ((!items.length && !edges.length) || !motionAllowed()) return NONE;
  const positions = [...items.map((i) => i.at), ...edges.flatMap((e) => [e.from, e.to])];
  const min = Math.min(...positions);
  const range = Math.max(...positions) - min || 1;
  const wave = (at: number) => ((at - min) / range) * WAVE_SPAN;

  const anims: Anim[] = [];
  const stop: JSAnimation[] = [];
  const frames = items.filter((i) => i.kind === 'frame');
  const cards = items.filter((i) => i.kind === 'card');
  if (frames.length) anims.push(enter(frames.map((f) => f.el), { opacity: [0, 1] }, 320, (_, i) => wave(frames[i]!.at) * 0.6));
  if (cards.length) {
    anims.push(enter(cards.map((c) => c.el), { opacity: [0, 1], transform: ['translateY(6px) scale(0.985)', 'none'] }, DURATION.card, (_, i) => 60 + wave(cards[i]!.at)));
  }

  const drawn = edges.filter((e) => !e.async);
  const faded = edges.filter((e) => e.async);
  const edgeDelay = (e: RevealTargets['edges'][number]) => 60 + wave(Math.max(e.from, e.to)) + DURATION.card * 0.5;
  if (drawn.length) {
    // The arrowhead would sit at the far end before the line reaches it; CSS hides markers while drawing.
    drawn.forEach((e) => e.el.setAttribute('data-drawing', ''));
    stop.push(
      animate(svg.createDrawable(drawn.map((e) => e.el)), {
        draw: ['0 0', '0 1'],
        duration: DURATION.draw,
        delay: ((_: unknown, i: number) => edgeDelay(drawn[i]!)) as never,
        ease: 'out(3)',
      }),
    );
  }
  if (faded.length) anims.push(enter(faded.map((e) => e.el), { opacity: [0, 1] }, DURATION.draw, (_, i) => edgeDelay(faded[i]!)));
  const labelled = edges.filter((e) => e.label);
  if (labelled.length) {
    anims.push(enter(labelled.map((e) => e.label!), { opacity: [0, 1] }, 200, (_, i) => edgeDelay(labelled[i]!) + DURATION.draw * 0.6));
  }
  return settle(anims, () => drawn.forEach((e) => DRAWABLE_ATTRS.forEach((a) => e.el.removeAttribute(a))), stop);
}

/** Where along the reading direction a rect sits (x for RIGHT, y for DOWN), for ordering the wave. */
export const flowPosition = (direction: Direction, r: { x: number; y: number; width: number; height: number }) =>
  direction === 'RIGHT' ? r.x + r.width / 2 : r.y + r.height / 2;
