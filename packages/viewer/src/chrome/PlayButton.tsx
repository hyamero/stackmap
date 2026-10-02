import { Pause, Play } from 'lucide-react';
import { useExplore } from '../explore/ExploreContext';
import { SPEEDS } from '../explore/state';
import { motionAllowed } from '../motion/motion';
import { IconButton } from './ui';

/** Toggles flow playback; a toggle keeps one label (aria-pressed says whether it's on), only the icon swaps. */
export function PlayButton() {
  const { state, dispatch } = useExplore();
  const allowed = motionAllowed();
  const on = state.playing && allowed;
  return (
    <IconButton
      label={allowed ? 'Play the flow (P)' : 'Play the flow (off: reduced motion)'}
      pressed={on}
      disabled={!allowed}
      onClick={() => dispatch({ type: 'togglePlay' })}
    >
      {on ? <Pause size={17} strokeWidth={1.75} /> : <Play size={17} strokeWidth={1.75} />}
    </IconButton>
  );
}

/** While the flow plays: its speed, a click stepping 1× → 2× → 0.5×. */
export function SpeedButton() {
  const { state, dispatch } = useExplore();
  if (!state.playing || !motionAllowed()) return null;
  const next = SPEEDS[(SPEEDS.indexOf(state.speed) + 1) % SPEEDS.length];
  return (
    <IconButton label={`Flow speed ${state.speed}× (next: ${next}×)`} onClick={() => dispatch({ type: 'cycleSpeed' })}>
      <span className="text-[12px] font-medium tabular-nums">{state.speed}×</span>
    </IconButton>
  );
}
