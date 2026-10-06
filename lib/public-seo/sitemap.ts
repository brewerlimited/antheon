import type { MetadataRoute } from "next";
import type { ServiceDocument } from "../../data/public-content";
import { publicUrl } from "../site-metadata";

export function publicSitemapEntries(documents: ServiceDocument[]): MetadataRoute.Sitemap {
  return [
    ...["/", "/contact", "/privacy"].map(path => ({ url: publicUrl(path) })),
    ...documents.filter(document => document.status === "published" && document.path === `/${document.slug}`).map(document => ({ url: publicUrl(document.path), ...(document.updatedAt ? { lastModified: document.updatedAt } : {}) })),
  ];
}
