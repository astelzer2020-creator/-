import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/SectionIntro";

export function PageHeader({
  eyebrow,
  title,
  lead,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
}) {
  return (
    <section className="border-b border-ink/10 bg-ivory pb-14 pt-16 lg:pb-20 lg:pt-24">
      <Container>
        <div className="max-w-3xl">
          {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
          <h1 className="font-display text-hero text-ink">{title}</h1>
          {lead ? <p className="mt-6 max-w-2xl text-lead text-slate">{lead}</p> : null}
        </div>
      </Container>
    </section>
  );
}
