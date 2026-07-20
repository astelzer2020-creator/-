import { WorkListing } from "@/components/work/WorkListing";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Selected Work",
  description:
    "Selected construction projects by Platinum in New York — residential renovations, commercial build-outs, and specialty installations, presented as full case studies.",
  path: "/work",
});

export default function WorkPage() {
  return <WorkListing />;
}
