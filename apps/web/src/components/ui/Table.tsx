import type { ReactNode } from "react";

export interface TableProps {
  /** Accessible summary rendered as <caption> (visually styled, not hidden). */
  caption: string;
  interactive?: boolean;
  children: ReactNode;
}

/**
 * Semantic table wrapper: horizontal overflow scrolls inside the wrapper so the
 * page never scrolls sideways; header/data cell semantics come from the children
 * (use <th scope="col"> / <th scope="row">).
 */
export function Table({ caption, interactive = false, children }: TableProps) {
  return (
    <div className="table-scroll" role="group" aria-label={caption}>
      <table className={["table", interactive ? "table--interactive" : ""].filter(Boolean).join(" ")}>
        <caption>{caption}</caption>
        {children}
      </table>
    </div>
  );
}
