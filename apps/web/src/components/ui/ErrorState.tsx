import { t } from "../../i18n";
import { Button } from "./Button";

export interface ErrorStateProps {
  title: string;
  /** Detail line; defaults to the generic Hebrew error message. */
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({ title, description, onRetry }: ErrorStateProps) {
  return (
    <div className="state-box state-box--error" role="alert">
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
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v6M12 16.5v.5" strokeLinecap="round" />
      </svg>
      <h2>{title}</h2>
      <p>{description ?? t("errors.generic")}</p>
      {onRetry ? (
        <Button variant="secondary" onClick={onRetry}>
          {t("common.retry")}
        </Button>
      ) : null}
    </div>
  );
}
