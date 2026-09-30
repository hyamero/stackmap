import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';

/** One board timeline: GSAP percentage keyframes over a scene's 10 s, each frame's `ease` being the ease into it. */
export interface Tween {
  target: string;
  frames: Record<string, Record<string, string>>;
}

/** Every scene's timeline runs 10 s; scroll through its pin maps onto that (Motion rule 01). */
export const SCENE_SECONDS = 10;

const eases = new Map<string, string>();

// The board's curves are cubic-beziers ("cb:x1,y1,x2,y2"); GSAP gets each as a CustomEase, made once.
function ease(name: string | undefined): string | undefined {
  if (!name?.startsWith('cb:')) return name;
  let id = eases.get(name);
  if (!id) {
    const [x1, y1, x2, y2] = name.slice(3).split(',');
    id = `sm-${eases.size}`;
    CustomEase.create(id, `M0,0 C${x1},${y1} ${x2},${y2} 1,1`);
    eases.set(name, id);
  }
  return id;
}

const IDENTITY = { x: 0, y: 0, z: 0, scale: 1, rotation: 0, rotationX: 0, rotationY: 0 };

/**
 * A CSS transform string as GSAP's own transform properties, which it animates on HTML and SVG alike
 * (it writes SVG transforms as attributes, where a CSS string doesn't parse). GSAP composes them as
 * translate, rotate, scale, the order nearly every board transform is already written in.
 */
export function transformVars(css: string): gsap.TweenVars {
  if (css.trim() === 'none') return { ...IDENTITY };
  const out: gsap.TweenVars = {};
  for (const [, fn, args] of css.matchAll(/(\w+)\(([^)]*)\)/g)) {
    const v = args!.split(',').map((a) => a.trim());
    const n = (i: number) => parseFloat(v[i] ?? '0');
    // A percentage moves by the element's own size: GSAP's xPercent and yPercent.
    const axis = (i: number, name: 'x' | 'y') => ((v[i] ?? '').endsWith('%') ? { [`${name}Percent`]: n(i) } : { [name]: n(i) });
    if (fn === 'translate') Object.assign(out, axis(0, 'x'), axis(1, 'y'));
    else if (fn === 'translateX') Object.assign(out, axis(0, 'x'));
    else if (fn === 'translateY') Object.assign(out, axis(0, 'y'));
    else if (fn === 'translateZ') out.z = n(0);
    else if (fn === 'scale') Object.assign(out, v.length > 1 ? { scaleX: n(0), scaleY: n(1) } : { scale: n(0) });
    else if (fn === 'rotate') out.rotation = n(0);
    else if (fn === 'rotateX') out.rotationX = n(0);
    else if (fn === 'rotateY') out.rotationY = n(0);
  }
  return out;
}

function keyframes(frames: Tween['frames']) {
  const out: Record<string, gsap.TweenVars> = {};
  for (const [at, { ease: e, transform, ...props }] of Object.entries(frames)) {
    out[at] = { ...props, ...(transform ? transformVars(transform) : {}), ...(e ? { ease: ease(e) } : {}) };
  }
  return out;
}

/** The scene's timeline: every tween whose target is inside it, all starting at 0 and filling the 10 s. */
export function sceneTimeline(scene: Element, tweens: Tween[]): gsap.core.Timeline {
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
  for (const t of tweens) {
    const targets = scene.querySelectorAll(t.target);
    if (!targets.length) continue;
    // SVG shapes transform about their own box, as the board's `transform-box: fill-box` has them.
    const svg = targets[0] instanceof SVGElement && (targets[0] as SVGElement).ownerSVGElement !== null;
    tl.to(targets, { keyframes: keyframes(t.frames), duration: SCENE_SECONDS, ease: 'none', ...(svg ? { transformOrigin: '50% 50%' } : {}) }, 0);
  }
  tl.set({}, {}, SCENE_SECONDS);
  return tl;
}

/** Timelines a scene computes from its own data (the kinds' slots, the viewer's drops), in a JSON script inside it. */
export function sceneExtras(scene: Element): Tween[] {
  return [...scene.querySelectorAll<HTMLScriptElement>('script[data-timelines]')].flatMap((s) => JSON.parse(s.textContent || '[]') as Tween[]);
}
