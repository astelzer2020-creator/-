import { Link, useParams } from "react-router";

import { t } from "../i18n";
import type { ProjectDetail } from "../lib/contracts";
import { useProject } from "../lib/queries";
import { formatAgorot, formatFraction, formatNumber } from "../lib/money";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { SkeletonList } from "../components/ui/Skeleton";
import { Table } from "../components/ui/Table";

function DetailContent({ detail }: { detail: ProjectDetail }) {
  const { project, scenarios } = detail;
  return (
    <div className="stack">
      <Card title={t("project.meta.title")}>
        <dl className="meta-grid">
          <div>
            <dt>{t("project.meta.address")}</dt>
            <dd>{project.name}</dd>
          </div>
          <div>
            <dt>{t("project.meta.city")}</dt>
            <dd>{project.city}</dd>
          </div>
          <div>
            <dt>{t("project.meta.caseNumber")}</dt>
            <dd className="num">{project.caseNumber}</dd>
          </div>
          <div>
            <dt>{t("project.meta.planType")}</dt>
            <dd>{project.planType}</dd>
          </div>
          <div>
            <dt>{t("project.meta.existingUnits")}</dt>
            <dd className="num">{formatNumber(project.existingUnits)}</dd>
          </div>
          <div>
            <dt>{t("project.meta.proposedUnits")}</dt>
            <dd className="num">{formatNumber(project.proposedUnits)}</dd>
          </div>
          <div>
            <dt>{t("project.meta.landValue")}</dt>
            <dd className="num">{formatAgorot(project.landValueAgorot)}</dd>
          </div>
        </dl>
      </Card>

      <section className="page-section" aria-labelledby="scenarios-heading">
        <div className="page-header">
          <h2 id="scenarios-heading">{t("project.scenarios.title")}</h2>
          {/* Navigation actions are links styled as buttons — semantics stay honest for a11y. */}
          <Link className="btn btn--primary" to={`/projects/${project.id}/scenarios/new`}>
            {t("project.scenarios.new")}
          </Link>
        </div>

        {scenarios.length === 0 ? (
          <EmptyState
            title={t("project.scenarios.empty.title")}
            description={t("project.scenarios.empty.description")}
            action={
              <Link className="btn btn--primary" to={`/projects/${project.id}/scenarios/new`}>
                {t("project.scenarios.new")}
              </Link>
            }
          />
        ) : (
          <Table caption={t("project.scenarios.tableCaption")} interactive>
            <thead>
              <tr>
                <th scope="col">{t("project.scenarios.columns.name")}</th>
                <th scope="col" className="cell-num">
                  {t("project.scenarios.columns.units")}
                </th>
                <th scope="col" className="cell-num">
                  {t("project.scenarios.columns.discountRate")}
                </th>
                <th scope="col">{t("project.scenarios.columns.results")}</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((scenario) => {
                const unitCount = scenario.apartmentMix.reduce((sum, row) => sum + row.count, 0);
                return (
                  <tr key={scenario.id}>
                    <th scope="row">{scenario.name}</th>
                    <td className="cell-num">{formatNumber(unitCount)}</td>
                    <td className="cell-num">{formatFraction(scenario.discountRate)}</td>
                    <td>
                      <Link to={`/projects/${project.id}/scenarios/${scenario.id}/results`}>
                        {t("project.scenarios.viewResults")}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </section>
    </div>
  );
}

export function ProjectDetailPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId ?? "";
  const detail = useProject(projectId);

  return (
    <>
      {detail.isPending ? <SkeletonList rows={6} /> : null}
      {detail.isError ? (
        <ErrorState
          title={t("project.error.title")}
          onRetry={() => {
            void detail.refetch();
          }}
        />
      ) : null}
      {detail.isSuccess ? (
        <>
          <div className="page-header">
            <h1>{detail.data.project.name}</h1>
            <Link to="/projects">{t("common.back")}</Link>
          </div>
          <DetailContent detail={detail.data} />
        </>
      ) : null}
    </>
  );
}
