import type { MetadataRoute } from "next";
import { getPublishedServices } from "@/lib/site-content";
import { publicSitemapEntries } from "@/lib/public-seo/sitemap";

// Published revisions are read on request; drafts and private previews never enter this list.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const documents = await getPublishedServices();
  return publicSitemapEntries(documents);
}
