import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/SectionIntro";

export default function NotFound() {
  return (
    <section className="py-24 lg:py-36">
      <Container>
        <div className="max-w-2xl">
          <Eyebrow>404</Eyebrow>
          <h1 className="font-display text-hero text-ink">
            This page isn&rsquo;t here.
          </h1>
          <p className="mt-6 text-lead text-slate">
            The address may have changed, or the link may be out of date.
            The work and the conversation are still easy to find.
          </p>
          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <ButtonLink href="/work" variant="secondary">
              View Selected Work
            </ButtonLink>
            <ButtonLink href="/contact">Discuss Your Project</ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
