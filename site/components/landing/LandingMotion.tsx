'use client';

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TWEENS as DESKTOP } from './desktop/timelines';
import { TWEENS as MOBILE } from './mobile/timelines';
import { sceneExtras, sceneTimeline, type Tween } from './timeline';

gsap.registerPlugin(useGSAP, ScrollTrigger, CustomEase);

// Each pinned scene owns one GSAP timeline, scrubbed by ScrollTrigger through its pin (Motion rule 01).
// All of it lives inside gsap.matchMedia: with reduced motion, on the other composition's widths, or
// before any script runs, nothing is set and every scene stays the resting frame the server drew (rule 02).

interface Route {
  el: SVGPathElement;
  a: number;
  b: number;
  head: SVGGElement | null;
  len: number;
  k0: number;
}

const clamp = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);

function routesOf(root: HTMLElement, owner: string): Route[] {
  return [...root.querySelectorAll<SVGPathElement>(`[data-route="${owner}"]`)].map((el) => ({
    el,
    a: parseFloat(el.dataset.r0 ?? '0'),
    b: parseFloat(el.dataset.r1 ?? '1'),
    head: el.dataset.head ? el.parentElement!.querySelector<SVGGElement>(`[data-route-head="${el.dataset.head}"]`) : null,
    len: 0,
    k0: 0,
  }));
}

function measureRoute(r: Route) {
  r.len = r.el.getTotalLength();
  // A route entering at its frame's top starts drawn a little way in, so the line from the scene above carries on.
  const top = r.len > 0 && r.el.getPointAtLength(0).y < 2;
  r.k0 = top ? Math.min(0.5, Number(r.el.dataset.stub ?? 104) / r.len) : 0;
}

// The route through-line draws with its scene's progress, in the gutter, and its head rides the tip.
function drawRoute(r: Route, p: number) {
  const k = Math.max(r.k0, clamp((p - r.a) / Math.max(0.0001, r.b - r.a)));
  r.el.style.strokeDashoffset = String(1 - k);
  if (r.head && r.len) {
    const at = r.el.getPointAtLength(k * r.len);
    r.head.setAttribute('transform', `translate(${at.x} ${at.y})`);
    r.head.style.opacity = k > 0.002 && k < 0.998 ? '1' : '0';
  }
}

function animate(root: HTMLElement, tweens: Tween[]) {
  const nav = document.querySelector<HTMLElement>('header[data-nav]');
  const nav0 = nav?.dataset.theme;
  root.classList.add('live');
  const mark = root.querySelector<SVGElement>('[data-mark-route]');
  mark?.classList.remove('drawn');
  const progress = new Map<string, number>();
  const triggers = new Map<string, ScrollTrigger>();
  const allRoutes: Route[] = [];

  for (const el of root.querySelectorAll<HTMLElement>('[data-scene]')) {
    const id = el.dataset.scene!;
    const stage = el.querySelector<HTMLElement>('[data-stage]')!;
    const frame = el.querySelector<HTMLElement>('[data-frame]')!;
    const fw = Number(el.dataset.fw) || 1440;
    const fh = Number(el.dataset.fh) || 900;
    const runway = parseFloat(el.dataset.runway ?? '0');
    const routes = routesOf(root, id);
    allRoutes.push(...routes);
    // The frame keeps its design size and scales to fit the window, centred in the pinned stage.
    const fit = () => Math.min(1, innerWidth / fw, innerHeight / fh);
    gsap.set([el, stage], { height: '100vh' });
    gsap.set(frame, { top: '50%', left: '50%', xPercent: -50, yPercent: -50, scale: fit });
    const tl = sceneTimeline(el, [...tweens, ...sceneExtras(el)]);
    const st = ScrollTrigger.create({
      trigger: el,
      pin: true,
      start: 'top top',
      end: () => `+=${runway * innerHeight}`,
      scrub: true,
      animation: tl,
      invalidateOnRefresh: true,
      onRefresh: () => gsap.set(frame, { scale: fit() }),
      onUpdate: (self) => {
        const p = self.progress;
        progress.set(id, p);
        for (const r of routes) drawRoute(r, p);
        // The mark's route draws once, never scrubbed (Motion rule 03).
        if (id === 'unmapped' && p >= 0.53) mark?.classList.add('drawn');
        el.dispatchEvent(new CustomEvent('scene', { detail: p }));
      },
    });
    triggers.set(id, st);
    progress.set(id, 0);
  }

  // Sections that don't pin (features, install) draw their stretch of the route as they pass.
  for (const el of root.querySelectorAll<HTMLElement>('[data-sec]')) {
    const routes = routesOf(root, el.dataset.sec!);
    allRoutes.push(...routes);
    ScrollTrigger.create({ trigger: el, start: 'top 78%', end: 'bottom 78%', onUpdate: (self) => routes.forEach((r) => drawRoute(r, self.progress)) });
  }
  const measureRoutes = () => allRoutes.forEach(measureRoute);
  measureRoutes();
  ScrollTrigger.addEventListener('refresh', measureRoutes);

  for (const el of root.querySelectorAll<HTMLElement>('[data-rv]')) {
    ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => el.classList.add('in') });
  }

  // The nav takes the theme of the section under it; the viewer's light, and the files scene's, can cover it first.
  const themed = [...root.querySelectorAll<HTMLElement>('[data-theme-sec]')];
  const files = root.querySelector<HTMLElement>('[data-scene="files"]');
  const viewer = root.querySelector<HTMLElement>('[data-scene="viewer"]');
  const under = (el: HTMLElement | null) => {
    const r = el?.getBoundingClientRect();
    return !!r && r.top <= 40 && r.bottom > 40;
  };
  const navTheme = () => {
    if (!nav) return;
    let theme = themed.find(under)?.dataset.themeSec ?? root.dataset.theme ?? 'dark';
    if (under(files) && (progress.get('files') ?? 0) < Number(files!.dataset.lit ?? 0)) theme = 'light';
    if (under(viewer) && (progress.get('viewer') ?? 0) < 0.07) theme = 'dark';
    if (nav.dataset.theme !== theme) nav.dataset.theme = theme;
  };
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: navTheme, onRefresh: navTheme });

  // The kind pills ask for a point in a scene's pin.
  const onSeek = (e: Event) => {
    const { id, p } = (e as CustomEvent<{ id: string; p: number }>).detail;
    const st = triggers.get(id);
    if (st) scrollTo({ top: Math.round(st.start + (st.end - st.start) * p), behavior: 'smooth' });
  };
  root.addEventListener('seek', onSeek);

  // Hero parallax: the unmapped files drift against the pointer.
  const hero = root.querySelector<HTMLElement>('[data-scene="top"]');
  const heroFrame = hero?.querySelector<HTMLElement>('[data-frame]');
  const onPointer = (e: PointerEvent) => {
    const r = hero!.getBoundingClientRect();
    heroFrame!.style.setProperty('--mx', (((e.clientX - r.left) / r.width - 0.5) * 2).toFixed(3));
    heroFrame!.style.setProperty('--my', (((e.clientY - r.top) / r.height - 0.5) * 2).toFixed(3));
  };
  hero?.addEventListener('pointermove', onPointer);

  return () => {
    root.classList.remove('live');
    root.removeEventListener('seek', onSeek);
    hero?.removeEventListener('pointermove', onPointer);
    ScrollTrigger.removeEventListener('refresh', measureRoutes);
    for (const r of allRoutes) {
      r.el.style.strokeDashoffset = '';
      r.head?.removeAttribute('transform');
    }
    for (const el of root.querySelectorAll('[data-rv].in')) el.classList.remove('in');
    // At rest the mark is simply drawn.
    mark?.classList.add('drawn');
    if (nav && nav0) nav.dataset.theme = nav0;
  };
}

const COMPOSITIONS = {
  desktop: { rootId: 'lp-d', media: '(min-width: 768px)', tweens: DESKTOP },
  phone: { rootId: 'lp-m', media: '(max-width: 767px)', tweens: MOBILE },
};

/** Scrubs one composition, desktop or phone, while its widths match and motion is allowed. */
export function LandingMotion({ composition }: { composition: keyof typeof COMPOSITIONS }) {
  const { rootId, media, tweens } = COMPOSITIONS[composition];
  useGSAP(() => {
    const root = document.getElementById(rootId);
    if (!root) return;
    root.querySelector('[data-mark-route]')?.classList.add('drawn');
    const mm = gsap.matchMedia();
    mm.add(`${media} and (prefers-reduced-motion: no-preference)`, () => animate(root, tweens));
    return () => mm.revert();
  }, [rootId, media, tweens]);
  return null;
}
