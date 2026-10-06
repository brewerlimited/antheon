import type { MetadataRoute } from "next";
import { publicUrl } from "@/lib/site-metadata";

export default function robots(): MetadataRoute.Robots {
  // Private routes enforce access and noindex themselves. Do not block their noindex from crawlers.
  // Public render resources remain crawlable. Preview deployments additionally return X-Robots-Tag.
  if (process.env.VERCEL_ENV !== "production") return { rules: { userAgent: "*", disallow: "/" } };
  return { rules: { userAgent: "*", allow: "/", disallow: ["/api/"] }, sitemap: publicUrl("/sitemap.xml") };
}
