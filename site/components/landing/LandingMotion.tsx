'use client';

import { useEffect } from 'react';

// The canvas prototype's scroll driver, ported. Each pinned scene plays one 10 s CSS timeline, paused;
// scroll progress through the pin seeks it (Motion rule 01). Without `.live` (reduced motion, no script,
// or a window too tall to scroll through a pin) nothing is seeked and every scene is its resting frame.

const TIMELINE_MS = 10_000;

interface Scene {
  el: HTMLElement;
  id: string;
  stage: HTMLElement;
  frame: HTMLElement;
  runway: number;
  fw: number;
  fh: number;
  h0: string;
  anims: Animation[] | null;
  p: number;
}

interface Route {
  el: SVGPathElement;
  owner: string;
  a: number;
  b: number;
  head: SVGGElement | null;
  len: number;
  k0: number;
  k: number;
}

const clamp = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);

function drive(root: HTMLElement, prefix: string): () => void {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scenes: Scene[] = [...root.querySelectorAll<HTMLElement>('[data-scene]')].map((el) => ({
    el,
    id: el.dataset.scene!,
    stage: el.querySelector<HTMLElement>('[data-stage]')!,
    frame: el.querySelector<HTMLElement>('[data-frame]')!,
    runway: parseFloat(el.dataset.runway ?? '0'),
    fw: Number(el.dataset.fw) || 1440,
    fh: Number(el.dataset.fh) || 900,
    h0: el.style.height,
    anims: null,
    p: -1,
  }));
  const reveals = [...root.querySelectorAll<HTMLElement>('[data-rv]')];
  const routes: Route[] = [...root.querySelectorAll<SVGPathElement>('[data-route]')].map((el) => ({
    el,
    owner: el.dataset.route!,
    a: parseFloat(el.dataset.r0 ?? '0'),
    b: parseFloat(el.dataset.r1 ?? '1'),
    head: el.dataset.head ? el.parentElement!.querySelector<SVGGElement>(`[data-route-head="${el.dataset.head}"]`) : null,
    len: 0,
    k0: 0,
    k: -1,
  }));
  const themed = [...root.querySelectorAll<HTMLElement>('[data-theme-sec]')];
  const mark = root.querySelector<SVGElement>('[data-mark-route]');
  const nav = document.querySelector<HTMLElement>('header[data-nav]');
  const navTheme0 = nav?.dataset.theme;
  let live = false;
  let vh = 0;
  let jsPin = false;
  let pinChecked = false;
  let raf = 0;
  let frames = 0;

  const measure = () => {
    vh = innerHeight;
    const vw = Math.min(innerWidth, root.clientWidth || innerWidth);
    // Against the resting height (data-h), so pinning, which makes the page taller, doesn't flip it back.
    const next = !reduce && root.offsetParent !== null && vh > 0 && vh < (Number(root.dataset.h) || root.offsetHeight) * 0.6;
    if (next !== live) {
      live = next;
      root.classList.toggle('live', live);
      for (const s of scenes) {
        s.anims = null;
        s.p = -1;
      }
      for (const el of reveals) el.classList.remove('in');
      for (const r of routes) r.k = -1;
      // The mark's route draws once (Motion rule 03); at rest it is simply drawn.
      if (!live) mark?.classList.add('drawn');
    }
    for (const s of scenes) {
      if (live) {
        const fit = Math.min(1, vw / s.fw, vh / s.fh);
        s.el.style.height = `${Math.round(vh * (1 + s.runway))}px`;
        s.stage.style.height = `${vh}px`;
        s.frame.style.transform = `translate(-50%, -50%) scale(${fit})`;
      } else {
        s.el.style.height = s.h0;
        s.stage.style.height = '';
        s.stage.style.transform = '';
        s.frame.style.transform = '';
      }
    }
    for (const r of routes) {
      try {
        r.len = r.el.getTotalLength();
        // A route entering at its frame's top is already drawn a little way in, so the line from the scene
        // above carries on while this frame scrolls into view.
        const top = r.len > 0 && r.el.getPointAtLength(0).y < 2;
        r.k0 = top ? Math.min(0.5, Number(r.el.dataset.stub ?? 104) / r.len) : 0;
      } catch {
        r.len = 0;
      }
    }
  };

  const collect = (s: Scene) => {
    s.anims = s.el.getAnimations({ subtree: true }).filter((a) => (a as CSSAnimation).animationName?.startsWith(`${prefix}tl-`));
    for (const a of s.anims) a.pause();
    s.p = -1;
  };

  const progressOf = (id: string) => scenes.find((s) => s.id === id)?.p ?? 1;

  const drawRoutes = () => {
    for (const r of routes) {
      const k = Math.max(r.k0, clamp((progressOf(r.owner) - r.a) / Math.max(0.0001, r.b - r.a)));
      if (Math.abs(k - r.k) < 0.0005) continue;
      r.k = k;
      r.el.style.strokeDashoffset = String(1 - k);
      if (r.head && r.len) {
        const at = r.el.getPointAtLength(k * r.len);
        r.head.setAttribute('transform', `translate(${at.x} ${at.y})`);
        r.head.style.opacity = k > 0.002 && k < 0.998 ? '1' : '0';
      }
    }
  };

  // The nav takes the theme of the section under it; the light of the viewer scene still covers it early on.
  const navTheme = () => {
    if (!nav) return;
    let theme = root.dataset.theme ?? 'dark';
    for (const el of themed) {
      const r = el.getBoundingClientRect();
      if (r.top <= 40 && r.bottom > 40) {
        theme = el.dataset.themeSec!;
        break;
      }
    }
    const files = scenes.find((s) => s.id === 'files');
    if (files) {
      const r = files.el.getBoundingClientRect();
      if (r.top <= 40 && r.bottom > 40 && files.p < Number(files.el.dataset.lit ?? 0)) theme = 'light';
    }
    const viewer = scenes.find((s) => s.id === 'viewer');
    if (viewer) {
      const r = viewer.el.getBoundingClientRect();
      if (r.top <= 40 && r.bottom > 40 && viewer.p < 0.07) theme = 'dark';
    }
    if (nav.dataset.theme !== theme) nav.dataset.theme = theme;
  };

  const frame = () => {
    raf = requestAnimationFrame(frame);
    frames++;
    if (!live) return;
    for (const s of scenes) {
      const r = s.el.getBoundingClientRect();
      const span = r.height - vh;
      const p = clamp(span > 1 ? -r.top / span : r.top <= 0 ? 1 : 0);
      if (jsPin) s.stage.style.transform = `translateY(${Math.max(0, Math.min(span, -r.top))}px)`;
      else if (!pinChecked && p > 0.05 && p < 0.95) {
        pinChecked = true;
        // A clipping ancestor breaks sticky: pin by transform instead.
        if (Math.abs(s.stage.getBoundingClientRect().top) > 4) {
          jsPin = true;
          root.classList.add('jspin');
        }
      }
      if (s.anims === null || (!s.anims.length && frames % 30 === 0)) collect(s);
      if (Math.abs(p - s.p) > 0.0003) {
        s.p = p;
        for (const a of s.anims!) a.currentTime = p * TIMELINE_MS;
        if (s.id === 'unmapped' && p >= 0.53) mark?.classList.add('drawn');
        s.el.dispatchEvent(new CustomEvent('scene', { detail: p }));
      }
    }
    for (const el of reveals) {
      if (el.classList.contains('in')) continue;
      const r = el.getBoundingClientRect();
      if (r.top < vh * 0.9 && r.bottom > 0) el.classList.add('in');
    }
    drawRoutes();
    navTheme();
  };

  // Kind pills (and anything else) ask for a point in a scene's pin.
  const onSeek = (e: Event) => {
    const { id, p } = (e as CustomEvent<{ id: string; p: number }>).detail;
    const s = scenes.find((x) => x.id === id);
    if (!s) return;
    const top = s.el.getBoundingClientRect().top + scrollY;
    scrollTo({ top: Math.round(top + (s.el.offsetHeight - vh) * p), behavior: reduce ? 'auto' : 'smooth' });
  };

  // Hero parallax: the unmapped files drift against the pointer.
  const hero = root.querySelector<HTMLElement>('#top, [data-scene="top"]');
  const heroFrame = hero?.querySelector<HTMLElement>('[data-frame]');
  const onPointer = (e: PointerEvent) => {
    if (!hero || !heroFrame) return;
    const r = hero.getBoundingClientRect();
    heroFrame.style.setProperty('--mx', (((e.clientX - r.left) / r.width - 0.5) * 2).toFixed(3));
    heroFrame.style.setProperty('--my', (((e.clientY - r.top) / r.height - 0.5) * 2).toFixed(3));
  };

  measure();
  // Fonts and late styles can start animations after mount: collect them again.
  const recollect = setTimeout(() => scenes.forEach((s) => (s.anims = null)), 900);
  addEventListener('resize', measure);
  root.addEventListener('seek', onSeek);
  if (!reduce) hero?.addEventListener('pointermove', onPointer);
  raf = requestAnimationFrame(frame);
  return () => {
    cancelAnimationFrame(raf);
    clearTimeout(recollect);
    removeEventListener('resize', measure);
    root.removeEventListener('seek', onSeek);
    hero?.removeEventListener('pointermove', onPointer);
    root.classList.remove('live', 'jspin');
    if (nav && navTheme0) nav.dataset.theme = navTheme0;
  };
}

/** Drives the composition with this id; the other composition (desktop or phone) is hidden and stays at rest. */
export function LandingMotion({ rootId, prefix }: { rootId: string; prefix: string }) {
  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!root) return;
    let stop = root.offsetParent !== null ? drive(root, prefix) : null;
    // Crossing the phone breakpoint swaps which composition is on screen.
    const onResize = () => {
      const shown = root.offsetParent !== null;
      if (shown && !stop) stop = drive(root, prefix);
      else if (!shown && stop) {
        stop();
        stop = null;
      }
    };
    addEventListener('resize', onResize);
    return () => {
      removeEventListener('resize', onResize);
      stop?.();
    };
  }, [rootId, prefix]);
  return null;
}
