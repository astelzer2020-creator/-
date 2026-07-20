import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "primary-on-dark";

const base =
  "inline-flex min-h-12 items-center justify-center gap-2 px-7 py-3 text-sm font-medium tracking-wide transition-colors duration-200";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-ivory hover:bg-obsidian",
  "primary-on-dark": "bg-ivory text-ink hover:bg-platinum",
  secondary:
    "border border-ink/30 text-ink hover:border-ink hover:bg-ink hover:text-ivory",
  ghost: "text-ink underline decoration-bronze underline-offset-4 hover:text-bronze-dark",
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </Link>
  );
}

export function SubmitButton({
  children,
  pending = false,
  className = "",
}: {
  children: ReactNode;
  pending?: boolean;
  className?: string;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className={`${base} ${variants.primary} w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto ${className}`}
    >
      {pending ? "Sending…" : children}
    </button>
  );
}
