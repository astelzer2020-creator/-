import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";

import { t } from "../i18n";
import { useApi } from "../lib/api-context";
import { isDemoMode } from "../lib/api";
import { authStore, scheduleTokenRefresh } from "../lib/auth-store";
import { issuesToFieldErrors, loginSchema } from "../lib/validation";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";

export function LoginPage() {
  const api = useApi();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const login = useMutation({
    mutationFn: () => api.login({ email, password }),
    onSuccess: ({ token }) => {
      // Token stays in memory only — see lib/auth-store.ts (localStorage audit finding).
      authStore.setToken(token);
      scheduleTokenRefresh();
      const from = (location.state as { from?: string } | null)?.from;
      void navigate(from ?? "/projects", { replace: true });
    },
  });

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setFieldErrors(issuesToFieldErrors(parsed.error));
      return;
    }
    setFieldErrors({});
    login.mutate();
  }

  return (
    <div className="login-layout">
      <Card className="login-card">
        <div className="stack">
          <h1>{t("auth.title")}</h1>
          {isDemoMode() ? (
            <p className="text-muted text-sm">{t("auth.demoHint")}</p>
          ) : null}
          <form className="form" onSubmit={onSubmit} noValidate>
            <Input
              label={t("auth.email")}
              type="email"
              name="email"
              autoComplete="username"
              dir="ltr"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
              }}
              error={fieldErrors.email}
            />
            <Input
              label={t("auth.password")}
              type="password"
              name="password"
              autoComplete="current-password"
              dir="ltr"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
              }}
              error={fieldErrors.password}
            />
            {login.isError ? (
              <p className="form-error-summary" role="alert">
                {t("auth.errors.loginFailed")}
              </p>
            ) : null}
            <Button type="submit" isLoading={login.isPending}>
              {login.isPending ? t("auth.submitting") : t("auth.submit")}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
