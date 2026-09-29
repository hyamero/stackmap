import { NODE_TYPES, type NodeType } from '@stackmap/core';

export const ARROW_MARKER_ID = 'sm-arrow';
/** Marker for an edge tinted by its source type (selection / trace, Q26). */
export const arrowMarkerId = (tint: NodeType | null) => (tint ? `${ARROW_MARKER_ID}-${tint}` : ARROW_MARKER_ID);

const LENGTH = 7;
const HEIGHT = 6;
// Handle dots are 7px and paint above edges; the tip stops 4px short of the port so the dot can't hide it.
const TIP_GAP = 4;

// One marker per colour: `context-stroke` would be neater but isn't reliable in every engine yet.
export function ArrowMarkerDefs() {
  return (
    <defs>
      {[null, ...NODE_TYPES].map((tint) => (
        <marker
          key={tint ?? 'default'}
          id={arrowMarkerId(tint)}
          viewBox={`0 0 ${LENGTH} ${HEIGHT}`}
          markerUnits="userSpaceOnUse"
          markerWidth={LENGTH}
          markerHeight={HEIGHT}
          refX={LENGTH + TIP_GAP}
          refY={HEIGHT / 2}
          orient="auto"
        >
          <path
            d={`M0,0 L${LENGTH},${HEIGHT / 2} L0,${HEIGHT} Z`}
            style={{ fill: tint ? `var(--sm-${tint}-accent)` : 'var(--sm-edge)' }}
          />
        </marker>
      ))}
    </defs>
  );
}
