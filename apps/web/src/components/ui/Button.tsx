import { forwardRef, type ButtonHTMLAttributes } from "react";

import { Spinner } from "./Spinner";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "sm" | "md";
  /** Shows a spinner and disables the button while a mutation is in flight. */
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      className,
      children,
      ...rest
    },
    ref,
  ) {
    const classes = [
      "btn",
      `btn--${variant}`,
      size === "sm" ? "btn--sm" : "",
      className ?? "",
    ]
      .filter(Boolean)
      .join(" ");
    return (
      <button
        ref={ref}
        type={rest.type ?? "button"}
        className={classes}
        disabled={disabled ?? isLoading}
        aria-busy={isLoading || undefined}
        {...rest}
      >
        {isLoading ? <Spinner size={16} /> : null}
        {children}
      </button>
    );
  },
);
