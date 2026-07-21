import type { ReactNode } from "react";

export interface CardProps {
  title?: string;
  className?: string;
  children: ReactNode;
}

export function Card({ title, className, children }: CardProps) {
  return (
    <section className={["card", className ?? ""].filter(Boolean).join(" ")}>
      {title !== undefined ? <h2 className="card-title">{title}</h2> : null}
      {children}
    </section>
  );
}
