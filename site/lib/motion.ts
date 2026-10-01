'use client';

import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// The viewer's three curves (packages/viewer/src/motion/motion.ts), registered once for the page's own motion.
gsap.registerPlugin(CustomEase, ScrollTrigger);
CustomEase.create('stackmap.out', '0.23, 1, 0.32, 1');
CustomEase.create('stackmap.inOut', '0.77, 0, 0.175, 1');
CustomEase.create('stackmap.draw', '0.33, 1, 0.68, 1');

export { gsap, ScrollTrigger };
