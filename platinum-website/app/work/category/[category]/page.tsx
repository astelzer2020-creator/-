import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { WorkListing, categorySlugs } from "@/components/work/WorkListing";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return Object.keys(categorySlugs).map((category) => ({ category }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const resolved = categorySlugs[category];
  if (!resolved) return {};
  return pageMetadata({
    title: `${resolved} Work`,
    description: `${resolved} construction projects by Platinum in New York, presented as full case studies with scope, approach, and outcome.`,
    path: `/work/category/${category}`,
  });
}

export default async function WorkCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const resolved = categorySlugs[category];
  if (!resolved) notFound();
  return <WorkListing activeCategory={resolved} />;
}
