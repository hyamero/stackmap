import type { LaidOutDiagram } from '@stackmap/core';
import { Agent } from './desktop/Agent';
import { Features } from './desktop/Features';
import { Files } from './desktop/Files';
import { Hero } from './desktop/Hero';
import { Install } from './desktop/Install';
import { Kinds } from './desktop/Kinds';
import { Unmapped } from './desktop/Unmapped';
import { Viewer } from './desktop/Viewer';
import { HashAnchors } from './HashAnchors';
import { LandingMotion } from './LandingMotion';
import { Agent as MAgent } from './mobile/Agent';
import { Features as MFeatures } from './mobile/Features';
import { Files as MFiles } from './mobile/Files';
import { Hero as MHero } from './mobile/Hero';
import { Install as MInstall } from './mobile/Install';
import { Kinds as MKinds } from './mobile/Kinds';
import { Unmapped as MUnmapped } from './mobile/Unmapped';
import { Viewer as MViewer } from './mobile/Viewer';
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
      <div id="lp-m" className="lp lp-m" data-theme="dark" data-h="7744">
        <MHero />
        <MUnmapped />
        <MAgent />
        <MViewer demo={demo} />
        <MFeatures />
        <MKinds checkout={checkout} />
        <MFiles />
        <MInstall />
      </div>
      <LandingMotion composition="desktop" />
      <LandingMotion composition="phone" />
      <HashAnchors />
    </>
  );
}
