import { NODE_TYPES, type NodeType } from '@stackmap/core';

export const ARROW_MARKER_ID = 'sm-arrow';

/** An edge's colour: the default grey, ink for the happy path, or a node-type tint (trace, selection, tones). */
export type EdgeColor = NodeType | 'ink' | null;
export const edgeStroke = (color: EdgeColor) => (color === null ? 'var(--sm-edge)' : color === 'ink' ? 'var(--sm-text)' : `var(--sm-${color}-accent)`);

/** Marker for an edge of that colour; `open` is the reply arrowhead (a chevron, not a filled triangle). */
export const arrowMarkerId = (color: EdgeColor, open = false) => `${ARROW_MARKER_ID}${color ? `-${color}` : ''}${open ? '-open' : ''}`;

const LENGTH = 7;
const HEIGHT = 6;
// Handle dots are 7px and paint above edges; the tip stops 4px short of the port so the dot can't hide it.
const TIP_GAP = 4;
const COLORS: EdgeColor[] = [null, 'ink', ...NODE_TYPES];

// One marker per colour and shape: `context-stroke` would be neater but isn't reliable in every engine yet.
export function ArrowMarkerDefs() {
  return (
    <defs>
      {COLORS.flatMap((color) =>
        [false, true].map((open) => (
          <marker
            key={arrowMarkerId(color, open)}
            id={arrowMarkerId(color, open)}
            viewBox={`-1 -1 ${LENGTH + 2} ${HEIGHT + 2}`}
            markerUnits="userSpaceOnUse"
            markerWidth={LENGTH + 2}
            markerHeight={HEIGHT + 2}
            refX={LENGTH + TIP_GAP}
            refY={HEIGHT / 2}
            orient="auto"
          >
            <path
              d={open ? `M0,0 L${LENGTH},${HEIGHT / 2} L0,${HEIGHT}` : `M0,0 L${LENGTH},${HEIGHT / 2} L0,${HEIGHT} Z`}
              style={open ? { fill: 'none', stroke: edgeStroke(color), strokeWidth: 1.25, strokeLinejoin: 'round' } : { fill: edgeStroke(color) }}
            />
          </marker>
        )),
      )}
    </defs>
  );
}
