"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitLead } from "@/app/actions/lead";
import { SubmitButton } from "@/components/ui/Button";
import { track } from "@/lib/analytics";
import {
  desiredStartOptions,
  projectTypes,
  type LeadFormState,
} from "@/lib/validation";

const initialState: LeadFormState = { status: "idle" };

const inputClass =
  "w-full border border-ink/25 bg-white/70 px-4 py-3 text-ink placeholder:text-slate/60 focus:border-bronze-dark";

function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      {hint ? <p id={`${htmlFor}-hint`} className="mb-1.5 text-xs text-slate">{hint}</p> : null}
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="mt-1.5 text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function LeadForm() {
  const [state, formAction, pending] = useActionState(submitLead, initialState);
  const startedRef = useRef(false);
  const projectTypeRef = useRef<HTMLSelectElement>(null);
  const errors = state.fieldErrors ?? {};

  // Preselect the project type from ?type= (links like
  // /contact?type=commercial on service pages). Client-side so the
  // page itself stays fully static.
  useEffect(() => {
    const hintMap: Record<string, (typeof projectTypes)[number]> = {
      residential: "Residential renovation",
      commercial: "Commercial build-out",
      installations: "Specialty installation",
      "general-contracting": "General contracting",
    };
    const hint = new URLSearchParams(window.location.search).get("type");
    const select = projectTypeRef.current;
    if (!hint || !select || select.value) return;
    const match = hintMap[hint.toLowerCase()];
    if (match) select.value = match;
  }, []);

  const onFirstInteraction = () => {
    if (!startedRef.current) {
      startedRef.current = true;
      track({
        name: "form_start",
        params: { form_id: "lead", page_path: window.location.pathname },
      });
    }
  };

  return (
    <form action={formAction} onFocus={onFirstInteraction} noValidate>
      {state.status === "error" && state.formError ? (
        <div
          role="alert"
          className="mb-6 border border-red-800/30 bg-red-50 px-4 py-3 text-sm text-red-900"
        >
          {state.formError}
        </div>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Name" htmlFor="lead-name" error={errors.name}>
          <input
            id="lead-name"
            defaultValue={state.values?.name ?? ""}
            name="name"
            type="text"
            autoComplete="name"
            required
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "lead-name-error" : undefined}
            className={inputClass}
          />
        </Field>

        <Field label="Email" htmlFor="lead-email" error={errors.email}>
          <input
            id="lead-email"
            defaultValue={state.values?.email ?? ""}
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "lead-email-error" : undefined}
            className={inputClass}
          />
        </Field>

        <Field label="Phone" htmlFor="lead-phone" error={errors.phone}>
          <input
            id="lead-phone"
            defaultValue={state.values?.phone ?? ""}
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "lead-phone-error" : undefined}
            className={inputClass}
          />
        </Field>

        <Field
          label="Project type"
          hint="Select the closest fit"
          htmlFor="lead-project-type"
          error={errors.projectType}
        >
          <select
            id="lead-project-type"
            name="projectType"
            required
            ref={projectTypeRef}
            key={state.values?.projectType ?? "initial"}
            defaultValue={state.values?.projectType ?? ""}
            aria-invalid={Boolean(errors.projectType)}
            aria-describedby={errors.projectType ? "lead-project-type-error" : "lead-project-type-hint"}
            className={inputClass}
          >
            <option value="" disabled>
              Select…
            </option>
            {projectTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="Project location"
          hint="Neighborhood / city is enough for now"
          htmlFor="lead-location"
          error={errors.projectLocation}
        >
          <input
            id="lead-location"
            defaultValue={state.values?.projectLocation ?? ""}
            name="projectLocation"
            type="text"
            required
            aria-invalid={Boolean(errors.projectLocation)}
            aria-describedby={errors.projectLocation ? "lead-location-error" : "lead-location-hint"}
            className={inputClass}
          />
        </Field>

        <Field label="Desired start" htmlFor="lead-start" error={errors.desiredStart}>
          <select id="lead-start" name="desiredStart" key={state.values?.desiredStart ?? "initial"} defaultValue={state.values?.desiredStart ?? ""} className={inputClass}>
            <option value="">No preference yet</option>
            {desiredStartOptions.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-6">
        <Field
          label="About the project"
          hint="What are you building, where does the project stand, and what does a successful outcome look like?"
          htmlFor="lead-message"
          error={errors.message}
        >
          <textarea
            id="lead-message"
            defaultValue={state.values?.message ?? ""}
            name="message"
            rows={6}
            required
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? "lead-message-error" : "lead-message-hint"}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="mt-6">
        <Field label="How did you hear about us? (optional)" htmlFor="lead-referral" error={errors.referralSource}>
          <input id="lead-referral"
            defaultValue={state.values?.referralSource ?? ""} name="referralSource" type="text" className={inputClass} />
        </Field>
      </div>

      {/* Honeypot — hidden from real users and assistive tech. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="lead-company-website">Leave this field empty</label>
        <input
          id="lead-company-website"
          name="company_website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <p className="mt-6 text-xs leading-relaxed text-slate">
        Plans or inspiration files can be shared after the first conversation —
        we will send a secure upload link. Your details are used only to respond
        to this inquiry. See our{" "}
        <a href="/privacy" className="underline underline-offset-2">
          privacy policy
        </a>
        .
      </p>

      <div className="mt-8">
        <SubmitButton pending={pending}>Start a Project Conversation</SubmitButton>
      </div>
    </form>
  );
}
