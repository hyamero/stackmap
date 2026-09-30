import type { LaidOutDiagram } from '@stackmap/core';
import { Agent } from './desktop/Agent';
import { Features } from './desktop/Features';
import { Files } from './desktop/Files';
import { Hero } from './desktop/Hero';
import { Install } from './desktop/Install';
import { Kinds } from './desktop/Kinds';
import { Unmapped } from './desktop/Unmapped';
import { Viewer } from './desktop/Viewer';
import { LandingMotion } from './LandingMotion';
import './desktop.css';
import './mobile.css';
import './site.css';

/**
 * The landing: the canvas's desktop composition (1440 × 900 frames), and its phone composition below 768px.
 * Both render on the server as their resting frames; LandingMotion scrubs whichever one is on screen.
 */
export function Landing({ demo, checkout }: { demo: LaidOutDiagram; checkout: Record<string, LaidOutDiagram> }) {
  return (
    <>
      <div id="lp-d" className="lp lp-d" data-theme="dark" data-h="7900">
        <Hero />
        <Unmapped />
        <Agent />
        <Viewer demo={demo} />
        <Features />
        <Kinds checkout={checkout} />
        <Files />
        <Install />
      </div>
      <LandingMotion rootId="lp-d" prefix="d-" />
    </>
  );
}
