import { t } from "../../i18n";

export interface SpinnerProps {
  size?: number;
  /** When true, announces a loading status to assistive tech (standalone use). */
  announce?: boolean;
}

export function Spinner({ size = 20, announce = false }: SpinnerProps) {
  const svg = (
    <svg
      className="spinner"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="4"
      />
      <path
        d="M22 12a10 10 0 0 0-10-10"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
  if (!announce) {
    return svg;
  }
  return (
    <span role="status" aria-label={t("app.loading")}>
      {svg}
    </span>
  );
}
