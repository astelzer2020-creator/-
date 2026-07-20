import type { ServiceFaq } from "@/content/services";

/**
 * Accessible FAQ using native details/summary — keyboard and screen
 * reader support without client JavaScript.
 */
export function FaqList({ faqs }: { faqs: ServiceFaq[] }) {
  return (
    <div className="divide-y divide-ink/10 border-y border-ink/10">
      {faqs.map((faq) => (
        <details key={faq.question} className="group py-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-medium text-ink [&::-webkit-details-marker]:hidden">
            {faq.question}
            <span
              aria-hidden="true"
              className="text-bronze-dark transition-transform duration-200 group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <p className="mt-3 max-w-2xl text-slate">{faq.answer}</p>
        </details>
      ))}
    </div>
  );
}
