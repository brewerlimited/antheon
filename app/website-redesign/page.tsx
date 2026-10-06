import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedService } from "@/lib/site-content";
import { pageMetadata } from "@/lib/site-metadata";
import { ServicePage } from "@/components/public-content/ServiceContent";

export async function generateMetadata(): Promise<Metadata> {
  const document = await getPublishedService("website-redesign");
  if (!document) notFound();
  return pageMetadata(document);
}

export default async function WebsiteRedesignPage() {
  const document = await getPublishedService("website-redesign");
  if (!document) notFound();
  return <ServicePage document={document} />;
}
