import type { ReactNode } from "react";

export interface EmptyStateProps {
  title: string;
  description?: string;
  /** Call to action, e.g. a <Button> or a link. */
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="state-box">
      <svg
        className="state-box-icon"
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </svg>
      <h2>{title}</h2>
      {description !== undefined ? <p>{description}</p> : null}
      {action}
    </div>
  );
}
