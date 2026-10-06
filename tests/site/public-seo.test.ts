import test from "node:test";
import assert from "node:assert/strict";
import { serviceDocuments, projectCaseStudyDrafts } from "../../data/public-content";
import { pageMetadata, publicUrl } from "../../lib/site-metadata";
import { organisationGraph, serviceGraph, serializeJsonLd } from "../../lib/public-seo/structured-data";
import { publicSitemapEntries } from "../../lib/public-seo/sitemap";
import { validateServiceDocument } from "../../lib/site-content-schema";

test("reviewed service defaults conform to the same controlled schema used by the editor", () => {
  assert.equal(serviceDocuments.length, 4);
  for (const document of serviceDocuments) {
    assert.deepEqual(validateServiceDocument(document), document);
    assert.ok(document.sections.some(section => section.id === "process"));
    assert.ok(document.faqs.length > 0);
    for (const proof of document.proof) {
      if (proof.href.startsWith("/concepts/")) assert.equal(proof.kind, "concept");
    }
  }
  assert.ok(projectCaseStudyDrafts.every(document => document.status === "draft" && !document.publicationApproval));
});

test("public metadata consistently uses the verified production domain independent of preview hosts", () => {
  for (const document of serviceDocuments) {
    const metadata = pageMetadata(document);
    assert.equal(metadata.alternates?.canonical, `https://www.antheon.co.uk${document.path}`);
    assert.equal(metadata.description, document.description);
    assert.equal(metadata.openGraph?.url, metadata.alternates?.canonical);
  }
  assert.equal(publicUrl(), "https://www.antheon.co.uk/");
  assert.throws(() => publicUrl("//evil.example/test"));
  assert.throws(() => publicUrl("https://preview.example"));
});

test("sitemap excludes drafts and never invents last-modified dates", () => {
  const documents = structuredClone(serviceDocuments);
  documents[1].status = "draft";
  documents[2].updatedAt = "2026-10-06T12:00:00.000Z";
  const entries = publicSitemapEntries(documents);
  assert.ok(!entries.some(entry => entry.url.endsWith("/website-redesign")));
  assert.equal(entries.find(entry => entry.url.endsWith("/seo-services"))?.lastModified, documents[2].updatedAt);
  assert.equal(entries.find(entry => entry.url.endsWith("/web-design"))?.lastModified, undefined);
  assert.ok(entries.every(entry => !/\/seo\/|\/concepts\/|\/client-preview\//.test(entry.url)));
});

test("structured data uses shared entity IDs, visible services, and no unsupported business facts", () => {
  const organisation = organisationGraph();
  assert.equal(organisation["@graph"][0]["@type"], "Organization");
  assert.equal(organisation["@graph"][0]["@id"], "https://www.antheon.co.uk/#organisation");
  const text = JSON.stringify(organisation);
  for (const forbidden of ["LocalBusiness", "streetAddress", "aggregateRating", "openingHours", "sameAs"]) assert.ok(!text.includes(forbidden));
  for (const document of serviceDocuments) {
    const graph = serviceGraph(document)["@graph"];
    assert.equal(graph[0]["@type"], "Service");
    assert.equal("description" in graph[0] ? graph[0].description : undefined, document.intro);
    assert.equal(graph[1]["@type"], "BreadcrumbList");
    assert.ok(!JSON.stringify(graph).includes("FAQPage"));
  }
});

test("JSON-LD encoding cannot terminate its script element", () => {
  const malicious = { text: "</script><script>alert('x')</script>" };
  const encoded = serializeJsonLd(malicious);
  assert.ok(!encoded.includes("<"));
  assert.deepEqual(JSON.parse(encoded), malicious);
});
