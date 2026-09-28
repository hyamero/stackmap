export const ARROW_MARKER_ID = 'sm-arrow';

const LENGTH = 7;
const HEIGHT = 6;
// Handle dots are 7px and paint above edges; the tip stops 4px short of the port so the dot can't hide it.
const TIP_GAP = 4;

export function ArrowMarkerDefs() {
  return (
    <defs>
      <marker
        id={ARROW_MARKER_ID}
        viewBox={`0 0 ${LENGTH} ${HEIGHT}`}
        markerUnits="userSpaceOnUse"
        markerWidth={LENGTH}
        markerHeight={HEIGHT}
        refX={LENGTH + TIP_GAP}
        refY={HEIGHT / 2}
        orient="auto"
      >
        <path d={`M0,0 L${LENGTH},${HEIGHT / 2} L0,${HEIGHT} Z`} style={{ fill: 'var(--sm-edge)' }} />
      </marker>
    </defs>
  );
}
