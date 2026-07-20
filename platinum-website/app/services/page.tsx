import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/sections/PageHeader";
import { ConversionBlock } from "@/components/sections/ConversionBlock";
import { Reveal } from "@/components/ui/Reveal";
import { services } from "@/content/services";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Services",
  description:
    "Residential renovation, commercial build-outs, specialty installations, and general contracting in New York — each a defined scope of accountability.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Services"
        title="Defined scopes of accountability"
        lead="We organize our capabilities around client problems and outcomes — not an endless list of trades. Every service page explains who it serves, what is included, how the work is controlled, and where the boundaries are."
      />
      <section className="py-14 lg:py-20">
        <Container>
          <div className="space-y-16">
            {services.map((service, i) => (
              <Reveal key={service.slug}>
                <article
                  className={`group relative grid items-center gap-8 lg:grid-cols-2 lg:gap-14 ${
                    i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
                  }`}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-platinum">
                    <Image
                      src={service.image.src}
                      alt={service.image.alt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                    />
                  </div>
                  <div>
                    <h2 className="font-display text-h2 text-ink">
                      <Link
                        href={`/services/${service.slug}`}
                        className="after:absolute after:inset-0 after:content-[''] group-hover:text-bronze-dark"
                      >
                        {service.title}
                      </Link>
                    </h2>
                    <p className="mt-4 text-lead text-slate">{service.promise}</p>
                    <p className="mt-4 text-sm text-slate">{service.audience}</p>
                    <span className="mt-6 inline-block text-sm font-medium text-bronze-dark underline decoration-bronze underline-offset-4">
                      Explore {service.shortTitle.toLowerCase()} services
                    </span>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
      <ConversionBlock />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Services", path: "/services" },
            ]),
          ),
        }}
      />
    </>
  );
}
