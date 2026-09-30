// The wordmark is never typeset (Type rule 06): these are the outlined lockup files.
export function Lockup({ height = 24 }: { height?: number }) {
  const width = Math.round((height * 219) / 48);
  return (
    <>
      <img className="lockup-light block" src="/brand/stackmap-lockup.svg" alt="stackmap" width={width} height={height} />
      <img className="lockup-dark block" src="/brand/stackmap-lockup-dark.svg" alt="stackmap" width={width} height={height} />
    </>
  );
}
