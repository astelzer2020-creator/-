import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/sections/PageHeader";

export function LegalPage({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}) {
  return (
    <>
      <PageHeader eyebrow="Legal" title={title} />
      <section className="py-12 lg:py-16">
        <Container>
          <div className="prose-platinum max-w-2xl space-y-6 text-slate [&_h2]:font-display [&_h2]:text-h3 [&_h2]:text-ink [&_h2]:pt-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5">
            <p className="text-sm text-slate/80">Last updated: {lastUpdated}</p>
            {children}
          </div>
        </Container>
      </section>
    </>
  );
}
