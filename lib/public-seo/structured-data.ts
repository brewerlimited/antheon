import { siteIdentity, siteLinks } from "../../data/site";
import type { ServiceDocument } from "../../data/public-content";
import { publicUrl } from "../site-metadata";

export function organisationGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": publicUrl("/#organisation"), name: siteIdentity.name, alternateName: siteIdentity.alternateName, description: siteIdentity.description, url: publicUrl(), email: siteLinks.email },
      { "@type": "WebSite", "@id": publicUrl("/#website"), name: siteIdentity.name, alternateName: siteIdentity.alternateName, url: publicUrl(), inLanguage: "en-GB", publisher: { "@id": publicUrl("/#organisation") } },
    ],
  };
}

export function breadcrumbs(label: string, path: string) {
  return {
    "@type": "BreadcrumbList",
    "@id": publicUrl(`${path}#breadcrumbs`),
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Anthēon", item: publicUrl() },
      { "@type": "ListItem", position: 2, name: label, item: publicUrl(path) },
    ],
  };
}

export function serviceGraph(document: ServiceDocument) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Service", "@id": publicUrl(`${document.path}#service`), name: document.eyebrow, description: document.intro, serviceType: document.eyebrow, url: publicUrl(document.path), provider: { "@type": "Organization", "@id": publicUrl("/#organisation"), name: siteIdentity.name, url: publicUrl() } },
      breadcrumbs(document.eyebrow, document.path),
    ],
  };
}

/** Prevent a CMS string from closing the script element. Content is never executable HTML. */
export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
