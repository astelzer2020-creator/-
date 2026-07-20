import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/SectionIntro";

export function ConversionBlock() {
  return (
    <section aria-labelledby="conversion-heading" className="bg-obsidian">
      <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="max-w-2xl">
          <Eyebrow onDark>Start a conversation</Eyebrow>
          <h2 id="conversion-heading" className="font-display text-h2 text-ivory">
            Planning a renovation, build-out, or specialty installation in New
            York?
          </h2>
          <p className="mt-5 text-lead text-platinum">
            Tell us what you are building, where the project stands, and what a
            successful outcome looks like. We will confirm fit and the right
            next step.
          </p>
          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <ButtonLink href="/contact" variant="primary-on-dark">
              Start a Project Conversation
            </ButtonLink>
            <ButtonLink
              href="/work"
              variant="secondary"
              className="!border-platinum/40 !text-platinum hover:!border-ivory hover:!bg-ivory hover:!text-ink"
            >
              View Selected Work
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
