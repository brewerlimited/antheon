import type { Metadata } from "next";
import { siteIdentity, siteLinks } from "../data/site";

export function publicUrl(path = "/") {
  if (!path.startsWith("/") || path.startsWith("//")) throw new Error("Public URLs must use a site path");
  return new URL(path, siteLinks.domain).href;
}

export function pageMetadata({ title, description, path }: { title: string; description: string; path: string }): Metadata {
  const url = publicUrl(path);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website", title, description, url, siteName: siteIdentity.name, locale: "en_GB",
      images: [{ url: publicUrl("/og.png"), width: 1200, height: 630, alt: "Anthēon Group — ventures, digital products and web design." }],
    },
    twitter: { card: "summary_large_image", title, description, images: [publicUrl("/og.png")] },
  };
}
