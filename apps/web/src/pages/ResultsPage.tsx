import { Link, useParams } from "react-router";

import { t } from "../i18n";
import type { SensitivityGrid, SimulationResult } from "../lib/contracts";
import { useProject, useSimulation } from "../lib/queries";
import {
  formatAgorot,
  formatFraction,
  formatFractionString,
  formatNumber,
} from "../lib/money";
import { Card } from "../components/ui/Card";
import { ErrorState } from "../components/ui/ErrorState";
import { SkeletonList } from "../components/ui/Skeleton";
import { Table } from "../components/ui/Table";

function kpiValueClass(agorot: number): string {
  if (agorot > 0) {
    return "kpi-value kpi-value--positive";
  }
  if (agorot < 0) {
    return "kpi-value kpi-value--negative";
  }
  return "kpi-value";
}

function KpiCards({ result }: { result: SimulationResult }) {
  const irrDisplay =
    result.irr === null ? null : formatFractionString(result.irr);
  const roiDisplay = formatFractionString(result.roiOnCost);

  return (
    <div className="kpi-grid">
      <Card>
        <p className="kpi-label">{t("results.kpi.irr")}</p>
        {irrDisplay === null ? (
          <>
            {/* Honest edge state: no fabricated number when IRR is undefined (AC-RES-2). */}
            <p className="kpi-value">{t("results.kpi.irrUndefined")}</p>
            <p className="text-muted text-sm">
              {t("results.kpi.irrUndefinedHint")}
            </p>
          </>
        ) : (
          <p className="kpi-value num">{irrDisplay}</p>
        )}
      </Card>
      <Card>
        <p className="kpi-label">{t("results.kpi.npv")}</p>
        <p className={`${kpiValueClass(result.npvAgorot)} num`}>
          {formatAgorot(result.npvAgorot)}
        </p>
      </Card>
      <Card>
        <p className="kpi-label">{t("results.kpi.profit")}</p>
        <p className={`${kpiValueClass(result.profitAgorot)} num`}>
          {formatAgorot(result.profitAgorot)}
        </p>
      </Card>
      <Card>
        <p className="kpi-label">{t("results.kpi.roiOnCost")}</p>
        <p className="kpi-value num">
          {roiDisplay ?? t("results.kpi.irrUndefined")}
        </p>
      </Card>
      <Card>
        <p className="kpi-label">{t("results.kpi.payback")}</p>
        <p className="kpi-value">
          {result.paybackPeriods === null
            ? t("results.kpi.paybackNone")
            : t("results.kpi.paybackMonths", {
                months: formatNumber(result.paybackPeriods),
              })}
        </p>
      </Card>
    </div>
  );
}

/**
 * Color scale is informational only — every cell always carries its full text
 * value, so meaning never depends on color alone (WCAG 1.4.1).
 */
function sensitivityCellClass(npvAgorot: number, maxAbs: number): string {
  if (npvAgorot === 0 || maxAbs === 0) {
    return "sens-cell sens-cell--zero";
  }
  const intensity = Math.abs(npvAgorot) / maxAbs;
  const bucket = intensity > 0.66 ? 3 : intensity > 0.33 ? 2 : 1;
  return `sens-cell sens-cell--${npvAgorot > 0 ? "pos" : "neg"}-${String(bucket)}`;
}

function deltaLabel(delta: number): string {
  return delta === 0
    ? t("results.sensitivity.baseCase")
    : formatFraction(delta);
}

function SensitivityTable({ grid }: { grid: SensitivityGrid }) {
  const maxAbs = Math.max(
    ...grid.npvAgorot.flat().map((value) => Math.abs(value)),
    0,
  );
  return (
    <section className="page-section" aria-labelledby="sensitivity-heading">
      <h2 id="sensitivity-heading">{t("results.sensitivity.title")}</h2>
      <Table caption={t("results.sensitivity.caption")}>
        <thead>
          <tr>
            <th scope="col">
              {t("results.sensitivity.buildCostAxis")} \{" "}
              {t("results.sensitivity.salePriceAxis")}
            </th>
            {grid.priceDeltas.map((delta) => (
              <th key={delta} scope="col" className="cell-num">
                {deltaLabel(delta)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {grid.npvAgorot.map((row, rowIndex) => {
            const buildCostDelta = grid.costDeltas[rowIndex];
            return (
              <tr key={buildCostDelta ?? rowIndex}>
                <th scope="row" className="cell-num">
                  {buildCostDelta === undefined
                    ? ""
                    : deltaLabel(buildCostDelta)}
                </th>
                {row.map((npvAgorot, columnIndex) => (
                  <td
                    key={grid.priceDeltas[columnIndex] ?? columnIndex}
                    className={`cell-num ${sensitivityCellClass(npvAgorot, maxAbs)}`}
                  >
                    {formatAgorot(npvAgorot)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </Table>
    </section>
  );
}

export function ResultsPage() {
  const params = useParams<{ projectId: string; scenarioId: string }>();
  const projectId = params.projectId ?? "";
  const scenarioId = params.scenarioId ?? "";
  const simulation = useSimulation(projectId, scenarioId);
  const detail = useProject(projectId);

  const scenarioName = detail.data?.scenarios.find(
    (scenario) => scenario.id === scenarioId,
  )?.name;

  return (
    <>
      <div className="page-header">
        <div>
          <h1>{t("results.title")}</h1>
          {scenarioName !== undefined ? (
            <p className="text-muted">
              {t("results.subtitle", { scenario: scenarioName })}
            </p>
          ) : null}
        </div>
        <Link to={`/projects/${projectId}`}>{t("common.back")}</Link>
      </div>

      {simulation.isPending ? <SkeletonList rows={5} /> : null}

      {simulation.isError ? (
        <ErrorState
          title={t("results.error.title")}
          onRetry={() => {
            void simulation.refetch();
          }}
        />
      ) : null}

      {simulation.isSuccess ? (
        <>
          <KpiCards result={simulation.data} />
          <SensitivityTable grid={simulation.data.sensitivity} />
        </>
      ) : null}
    </>
  );
}
