import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";

import { t } from "../i18n";
import type { Project, ProjectStatus } from "../lib/contracts";
import { useCreateProject, useProjects } from "../lib/queries";
import { formatNumber } from "../lib/money";
import { issuesToFieldErrors, newProjectSchema } from "../lib/validation";
import { Badge, type BadgeTone } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Dialog } from "../components/ui/Dialog";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { Input } from "../components/ui/Input";
import { SkeletonList } from "../components/ui/Skeleton";
import { Table } from "../components/ui/Table";
import { useToast } from "../components/ui/Toast";

const statusTone: Record<ProjectStatus, BadgeTone> = {
  planning: "neutral",
  approved: "info",
  inProgress: "warning",
  completed: "success",
};

const statusLabel: Record<ProjectStatus, string> = {
  planning: t("project.status.planning"),
  approved: t("project.status.approved"),
  inProgress: t("project.status.inProgress"),
  completed: t("project.status.completed"),
};

function NewProjectDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [caseNumber, setCaseNumber] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const createProject = useCreateProject();
  const { showToast } = useToast();
  const navigate = useNavigate();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = newProjectSchema.safeParse({ name, city, caseNumber });
    if (!parsed.success) {
      setFieldErrors(issuesToFieldErrors(parsed.error));
      return;
    }
    setFieldErrors({});
    createProject.mutate(parsed.data, {
      onSuccess: (project) => {
        showToast(t("projects.created"), "success");
        onClose();
        void navigate(`/projects/${project.id}`);
      },
    });
  }

  return (
    <Dialog open={open} title={t("projects.form.title")} onClose={onClose}>
      <form className="form" onSubmit={onSubmit} noValidate>
        <Input
          label={t("projects.form.name")}
          value={name}
          onChange={(event) => {
            setName(event.target.value);
          }}
          error={fieldErrors.name}
        />
        <Input
          label={t("projects.form.city")}
          value={city}
          onChange={(event) => {
            setCity(event.target.value);
          }}
          error={fieldErrors.city}
        />
        <Input
          label={t("projects.form.caseNumber")}
          value={caseNumber}
          onChange={(event) => {
            setCaseNumber(event.target.value);
          }}
          error={fieldErrors.caseNumber}
        />
        {createProject.isError ? (
          <p className="form-error-summary" role="alert">
            {t("errors.generic")}
          </p>
        ) : null}
        <div className="form-actions">
          <Button variant="secondary" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" isLoading={createProject.isPending}>
            {t("common.save")}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

function ProjectsTable({ projects }: { projects: Project[] }) {
  return (
    <Table caption={t("projects.tableCaption")} interactive>
      <thead>
        <tr>
          <th scope="col">{t("projects.columns.name")}</th>
          <th scope="col">{t("projects.columns.city")}</th>
          <th scope="col">{t("projects.columns.caseNumber")}</th>
          <th scope="col">{t("projects.columns.planType")}</th>
          <th scope="col" className="cell-num">
            {t("projects.columns.units")}
          </th>
          <th scope="col">{t("projects.columns.status")}</th>
        </tr>
      </thead>
      <tbody>
        {projects.map((project) => (
          <tr key={project.id}>
            <th scope="row">
              <Link to={`/projects/${project.id}`}>{project.name}</Link>
            </th>
            <td>{project.city}</td>
            <td className="cell-num">{project.caseNumber}</td>
            <td>{project.planType}</td>
            <td className="cell-num">
              {formatNumber(project.existingUnits)} ← {formatNumber(project.proposedUnits)}
            </td>
            <td>
              <Badge tone={statusTone[project.status]}>{statusLabel[project.status]}</Badge>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

export function ProjectsPage() {
  const projects = useProjects();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <div className="page-header">
        <h1>{t("projects.title")}</h1>
        <Button
          onClick={() => {
            setDialogOpen(true);
          }}
        >
          {t("projects.new")}
        </Button>
      </div>

      {projects.isPending ? <SkeletonList rows={5} /> : null}

      {projects.isError ? (
        <ErrorState
          title={t("projects.error.title")}
          onRetry={() => {
            void projects.refetch();
          }}
        />
      ) : null}

      {projects.isSuccess && projects.data.length === 0 ? (
        <EmptyState
          title={t("projects.empty.title")}
          description={t("projects.empty.description")}
          action={
            <Button
              onClick={() => {
                setDialogOpen(true);
              }}
            >
              {t("projects.empty.cta")}
            </Button>
          }
        />
      ) : null}

      {projects.isSuccess && projects.data.length > 0 ? <ProjectsTable projects={projects.data} /> : null}

      <NewProjectDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
        }}
      />
    </>
  );
}
