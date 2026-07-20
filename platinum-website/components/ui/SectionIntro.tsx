import type { ReactNode } from "react";

export function Eyebrow({
  children,
  onDark = false,
}: {
  children: ReactNode;
  onDark?: boolean;
}) {
  return (
    <p
      className={`mb-4 text-xs font-medium uppercase tracking-eyebrow ${
        onDark ? "text-bronze" : "text-bronze-dark"
      }`}
    >
      {children}
    </p>
  );
}

export function SectionIntro({
  eyebrow,
  title,
  lead,
  onDark = false,
  className = "",
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  onDark?: boolean;
  className?: string;
}) {
  return (
    <div className={`max-w-2xl ${className}`}>
      {eyebrow ? <Eyebrow onDark={onDark}>{eyebrow}</Eyebrow> : null}
      <h2
        className={`font-display text-h2 ${onDark ? "text-ivory" : "text-ink"}`}
      >
        {title}
      </h2>
      {lead ? (
        <p className={`mt-5 text-lead ${onDark ? "text-platinum" : "text-slate"}`}>
          {lead}
        </p>
      ) : null}
    </div>
  );
}
