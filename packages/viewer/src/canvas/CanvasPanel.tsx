import type { ReactNode } from 'react';

// 15px inset matches the M0 (React Flow <Panel>) placement the screenshots were signed off against.
const POSITION = {
  'top-left': 'top-[15px] left-[15px]',
  'bottom-left': 'bottom-[15px] left-[15px]',
  'bottom-right': 'bottom-[15px] right-[15px]',
} as const;

export function CanvasPanel({
  position,
  className = '',
  children,
}: {
  position: keyof typeof POSITION;
  className?: string;
  children: ReactNode;
}) {
  return <div className={`sm-panel absolute z-10 ${POSITION[position]} ${className}`}>{children}</div>;
}
