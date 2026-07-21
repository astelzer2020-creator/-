import { forwardRef, useId, type SelectHTMLAttributes } from "react";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ label, error, id, className, children, ...rest }, ref) {
    const autoId = useId();
    const selectId = id ?? autoId;
    const errorId = `${selectId}-error`;

    return (
      <div className="field">
        <label className="field-label" htmlFor={selectId}>
          {label}
        </label>
        <select
          ref={ref}
          id={selectId}
          className={["field-input", className ?? ""].filter(Boolean).join(" ")}
          aria-invalid={error !== undefined ? true : undefined}
          aria-describedby={error !== undefined ? errorId : undefined}
          {...rest}
        >
          {children}
        </select>
        {error !== undefined ? (
          <p className="field-error" id={errorId}>
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
