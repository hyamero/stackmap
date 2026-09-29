import type { CSSProperties, ReactNode, Ref } from 'react';

export const PANEL_CLASS = 'rounded-2xl bg-panel';
export const PANEL_STYLE: CSSProperties = {
  boxShadow: 'inset 0 0 0 1px var(--sm-panel-border), 0 1px 2px rgb(0 0 0 / 0.04), 0 8px 24px -12px rgb(0 0 0 / 0.12)',
};

export function IconButton({
  label,
  onClick,
  pressed,
  expanded,
  ref,
  children,
}: {
  label: string;
  onClick?: () => void;
  pressed?: boolean;
  expanded?: boolean;
  ref?: Ref<HTMLButtonElement>;
  children: ReactNode;
}) {
  return (
    <button
      ref={ref}
      type="button"
      aria-expanded={expanded}
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      onClick={onClick}
      className="grid size-9 place-items-center rounded-xl text-fg-muted transition-colors hover:bg-page hover:text-fg aria-pressed:bg-page aria-pressed:text-fg"
    >
      {children}
    </button>
  );
}

export function ToolbarDivider() {
  return <span aria-hidden="true" className="mx-1 h-5 w-px bg-divider" />;
}
