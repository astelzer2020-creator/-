import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router";

import { t } from "../i18n";
import type { ScenarioInput } from "../lib/contracts";
import { useCreateScenario } from "../lib/queries";
import {
  parseDecimalInput,
  parseIntegerInput,
  parsePercentInput,
  parseShekelInput,
} from "../lib/money";
import { issuesToFieldErrors, scenarioSchema } from "../lib/validation";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { useToast } from "../components/ui/Toast";

/** Raw (string) form state; money stays text until parsed to integer agorot on submit. */
interface MixRowDraft {
  key: number;
  rooms: string;
  count: string;
  areaSqm: string;
  salePriceShekels: string;
}

interface ScenarioDraft {
  name: string;
  mix: MixRowDraft[];
  buildCostPerSqmShekels: string;
  otherCostsShekels: string;
  discountRatePercent: string;
  constructionMonths: string;
}

let nextRowKey = 1;

function emptyRow(): MixRowDraft {
  return { key: nextRowKey++, rooms: "", count: "", areaSqm: "", salePriceShekels: "" };
}

const INVALID = Number.NaN; // zod reports NaN as invalid_type → Hebrew "invalid number" message

/**
 * Converts the raw draft to typed, unit-correct values (₪ input → integer agorot,
 * % input → decimal fraction). Unparseable fields become NaN so the schema attaches
 * the error to the right path.
 */
function draftToInput(draft: ScenarioDraft): ScenarioInput {
  return {
    name: draft.name,
    apartmentMix: draft.mix.map((row) => ({
      rooms: parseIntegerInput(row.rooms) ?? INVALID,
      count: parseIntegerInput(row.count) ?? INVALID,
      areaSqm: parseDecimalInput(row.areaSqm) ?? INVALID,
      salePricePerUnitAgorot: parseShekelInput(row.salePriceShekels) ?? INVALID,
    })),
    buildCostPerSqmAgorot: parseShekelInput(draft.buildCostPerSqmShekels) ?? INVALID,
    otherCostsAgorot: parseShekelInput(draft.otherCostsShekels) ?? INVALID,
    discountRate: parsePercentInput(draft.discountRatePercent) ?? INVALID,
    constructionMonths: parseIntegerInput(draft.constructionMonths) ?? INVALID,
  };
}

export function ScenarioFormPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId ?? "";
  const navigate = useNavigate();
  const { showToast } = useToast();
  const createScenario = useCreateScenario(projectId);

  const [draft, setDraft] = useState<ScenarioDraft>({
    name: "",
    mix: [emptyRow()],
    buildCostPerSqmShekels: "",
    otherCostsShekels: "0",
    discountRatePercent: "7",
    constructionMonths: "36",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function updateRow(key: number, patch: Partial<MixRowDraft>) {
    setDraft((current) => ({
      ...current,
      mix: current.mix.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    }));
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = scenarioSchema.safeParse(draftToInput(draft));
    if (!parsed.success) {
      setFieldErrors(issuesToFieldErrors(parsed.error));
      return;
    }
    setFieldErrors({});
    createScenario.mutate(parsed.data, {
      onSuccess: (scenario) => {
        showToast(t("scenario.created"), "success");
        void navigate(`/projects/${projectId}/scenarios/${scenario.id}/results`);
      },
    });
  }

  const hasErrors = Object.keys(fieldErrors).length > 0;

  return (
    <>
      <div className="page-header">
        <h1>{t("scenario.form.title")}</h1>
        <Link to={`/projects/${projectId}`}>{t("common.back")}</Link>
      </div>

      <Card>
        <form className="form" onSubmit={onSubmit} noValidate>
          {hasErrors ? (
            <p className="form-error-summary" role="alert">
              {t("scenario.form.errorSummary")}
            </p>
          ) : null}

          <Input
            label={t("scenario.form.name")}
            value={draft.name}
            onChange={(event) => {
              setDraft((current) => ({ ...current, name: event.target.value }));
            }}
            error={fieldErrors.name}
          />

          <fieldset>
            <legend>{t("scenario.form.mixLegend")}</legend>
            {fieldErrors.apartmentMix !== undefined ? (
              <p className="field-error" role="alert">
                {fieldErrors.apartmentMix}
              </p>
            ) : null}
            {draft.mix.map((row, index) => (
              <div
                key={row.key}
                className="form-row"
                role="group"
                aria-label={t("scenario.form.mix.rowLabel", { row: index + 1 })}
              >
                <Input
                  label={t("scenario.form.mix.rooms")}
                  numeric
                  value={row.rooms}
                  onChange={(event) => {
                    updateRow(row.key, { rooms: event.target.value });
                  }}
                  error={fieldErrors[`apartmentMix.${String(index)}.rooms`]}
                />
                <Input
                  label={t("scenario.form.mix.count")}
                  numeric
                  value={row.count}
                  onChange={(event) => {
                    updateRow(row.key, { count: event.target.value });
                  }}
                  error={fieldErrors[`apartmentMix.${String(index)}.count`]}
                />
                <Input
                  label={t("scenario.form.mix.areaSqm")}
                  numeric
                  value={row.areaSqm}
                  onChange={(event) => {
                    updateRow(row.key, { areaSqm: event.target.value });
                  }}
                  error={fieldErrors[`apartmentMix.${String(index)}.areaSqm`]}
                />
                <Input
                  label={t("scenario.form.mix.salePrice")}
                  numeric
                  value={row.salePriceShekels}
                  onChange={(event) => {
                    updateRow(row.key, { salePriceShekels: event.target.value });
                  }}
                  error={fieldErrors[`apartmentMix.${String(index)}.salePricePerUnitAgorot`]}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={draft.mix.length === 1}
                  aria-label={t("scenario.form.mix.removeRow", { row: index + 1 })}
                  onClick={() => {
                    setDraft((current) => ({
                      ...current,
                      mix: current.mix.filter((candidate) => candidate.key !== row.key),
                    }));
                  }}
                >
                  ✕
                </Button>
              </div>
            ))}
            <div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setDraft((current) => ({ ...current, mix: [...current.mix, emptyRow()] }));
                }}
              >
                {t("scenario.form.mix.addRow")}
              </Button>
            </div>
          </fieldset>

          <fieldset>
            <legend>{t("scenario.form.costsLegend")}</legend>
            <div className="form-row">
              <Input
                label={t("scenario.form.buildCostPerSqm")}
                numeric
                value={draft.buildCostPerSqmShekels}
                onChange={(event) => {
                  setDraft((current) => ({ ...current, buildCostPerSqmShekels: event.target.value }));
                }}
                error={fieldErrors.buildCostPerSqmAgorot}
              />
              <Input
                label={t("scenario.form.otherCosts")}
                numeric
                value={draft.otherCostsShekels}
                onChange={(event) => {
                  setDraft((current) => ({ ...current, otherCostsShekels: event.target.value }));
                }}
                error={fieldErrors.otherCostsAgorot}
              />
              <Input
                label={t("scenario.form.discountRate")}
                numeric
                value={draft.discountRatePercent}
                onChange={(event) => {
                  setDraft((current) => ({ ...current, discountRatePercent: event.target.value }));
                }}
                error={fieldErrors.discountRate}
              />
              <Input
                label={t("scenario.form.constructionMonths")}
                numeric
                value={draft.constructionMonths}
                onChange={(event) => {
                  setDraft((current) => ({ ...current, constructionMonths: event.target.value }));
                }}
                error={fieldErrors.constructionMonths}
              />
            </div>
          </fieldset>

          {createScenario.isError ? (
            <p className="form-error-summary" role="alert">
              {t("errors.generic")}
            </p>
          ) : null}

          <div className="form-actions">
            <Button type="submit" isLoading={createScenario.isPending}>
              {createScenario.isPending ? t("scenario.form.submitting") : t("scenario.form.submit")}
            </Button>
          </div>
        </form>
      </Card>
    </>
  );
}
