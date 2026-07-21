export interface SkeletonProps {
  /** CSS inline-size (e.g. "100%", "8rem"). */
  width?: string;
  /** CSS block-size. */
  height?: string;
  className?: string;
}

/** Loading placeholder — purely decorative, hidden from assistive tech. */
export function Skeleton({ width = "100%", height = "1rem", className }: SkeletonProps) {
  return (
    <span
      className={["skeleton", className ?? ""].filter(Boolean).join(" ")}
      style={{ inlineSize: width, blockSize: height }}
      aria-hidden="true"
    />
  );
}

/** Stacked skeleton lines for list/table loading states, announced once as busy. */
export function SkeletonList({ rows = 4 }: { rows?: number }) {
  return (
    <div className="stack" role="status" aria-busy="true" aria-live="polite">
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} height="2.25rem" />
      ))}
    </div>
  );
}
