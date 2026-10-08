import { VectorIcon } from "@/components/VectorIcon";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ConceptCard } from "@/components/ConceptCard";
import { Reveal } from "@/components/Reveal";
import { concepts, featuredConcepts, additionalConcepts } from "@/data/concepts";
import { siteLinks } from "@/data/site";
import { notFound } from "next/navigation";
import { getPublishedService } from "@/lib/site-content";
import { pageMetadata } from "@/lib/site-metadata";
import { serviceGraph } from "@/lib/public-seo/structured-data";
import { JsonLd } from "@/components/public-content/JsonLd";
import { ServiceBody, ServiceLinks } from "@/components/public-content/ServiceContent";

export async function generateMetadata(): Promise<Metadata> {
  const document = await getPublishedService("web-design");
  if (!document) notFound();
  return pageMetadata(document);
}

export default async function WebDesignPage() {
  const document = await getPublishedService("web-design");
  if (!document) notFound();
  return <>
    <Header />
    <main id="main-content" tabIndex={-1} className="web-design-page">
      <section className="site-container gallery-intro" aria-labelledby="gallery-title">
        <p className="section-label">Anthēon / Web Design</p>
        <div className="work-heading">
          <h1 className="section-title" id="gallery-title">Designed to be<br />experienced.</h1>
          <p className="work-intro">Different businesses. Distinctive directions. Open a design and explore the full homepage — scroll, hover and discover the details.</p>
        </div>
        <div className="gallery-meta"><span>Selected design concepts</span><span>{String(concepts.length).padStart(2, "0")} designs to explore</span></div>
      </section>
      <section className="site-container gallery-collection" aria-label="Website design concepts">
        <div className="concept-grid gallery-grid">
          {featuredConcepts.map((concept, index) => <Reveal key={concept.slug} delay={index % 3 === 1 ? "short" : index % 3 === 2 ? "medium" : "none"}><ConceptCard concept={concept} index={index} /></Reveal>)}
        </div>
        <details className="more-designs">
          <summary><span className="more-designs-closed">Show more designs <span>({additionalConcepts.length})</span></span><span className="more-designs-open">Show fewer designs</span><span className="more-designs-chevron" aria-hidden="true" /></summary>
          <div className="concept-grid gallery-grid more-designs-grid">
            {additionalConcepts.map((concept, index) => <Reveal key={concept.slug} delay={index % 3 === 1 ? "short" : index % 3 === 2 ? "medium" : "none"}><ConceptCard concept={concept} index={featuredConcepts.length + index} /></Reveal>)}
          </div>
        </details>
        <p className="concept-disclaimer">Independent design explorations. Shown as concepts, not commissioned client projects.</p>
      </section>
      <section className="site-container website-pricing" id="pricing" aria-labelledby="pricing-title">
        <Reveal>
          <div className="pricing-heading">
            <div>
              <p className="section-label">Your next project / A clear investment</p>
              <h2 className="section-title" id="pricing-title">Designed for you.<br /><span>Looked after by us.</span></h2>
            </div>
            <p className="pricing-intro">A complete website, ongoing care and support for your visibility in search. From the first design to what comes next.</p>
          </div>
        </Reveal>
        <Reveal delay="short">
          <div className="pricing-panel">
            <div className="pricing-offers">
              <article className="pricing-offer" aria-labelledby="website-setup-title">
                <p className="pricing-step"><span>01</span> Design &amp; launch</p>
                <h3 id="website-setup-title">Website design &amp; setup</h3>
                <p className="pricing-amount"><span className="pricing-value">£695</span><span className="pricing-cadence">one-off</span></p>
                <p className="pricing-description">Your business, brought to life online.</p>
                <ul className="pricing-inclusions">
                  <li>Full website design &amp; build</li>
                  <li>Responsive across desktop, tablet &amp; mobile</li>
                  <li>Website setup &amp; launch</li>
                </ul>
              </article>
              <article className="pricing-offer" aria-labelledby="website-care-title">
                <p className="pricing-step"><span>02</span> Ongoing care</p>
                <h3 id="website-care-title">Management &amp; hosting</h3>
                <p className="pricing-amount"><span className="pricing-value">£35</span><span className="pricing-cadence">per month</span></p>
                <p className="pricing-description">A little less on your to-do list.</p>
                <ul className="pricing-inclusions">
                  <li>Managed website hosting</li>
                  <li>Ongoing website management</li>
                  <li>Website updates &amp; maintenance</li>
                </ul>
              </article>
              <article className="pricing-offer" aria-labelledby="website-seo-title">
                <p className="pricing-step"><span>03</span> Search visibility</p>
                <h3 id="website-seo-title">SEO Monitoring &amp; Optimisation</h3>
                <p className="pricing-amount"><span className="pricing-value">£149</span><span className="pricing-cadence">per month</span></p>
                <p className="pricing-description">Helping your website get found.</p>
                <ul className="pricing-inclusions">
                  <li>SEO performance monitoring</li>
                  <li>Search visibility reviews</li>
                  <li>Ongoing website optimisation</li>
                </ul>
              </article>
            </div>
            <div className="pricing-footer">
              <div><p>One website. Taken care of.</p><span>Website: £695 one-off, plus £35 per month.</span><span>SEO Monitoring &amp; Optimisation: £149 per month.</span></div>
              <a className="button button-primary" href={`mailto:${siteLinks.email}?subject=Website%20design%20enquiry`}>Discuss your website <span aria-hidden="true"><VectorIcon name="arrow-up-right" /></span></a>
            </div>
          </div>
        </Reveal>
      </section>
      <div className="site-container"><ServiceLinks current="/web-design" /><ServiceBody document={document} compact /></div>
    </main>
    <JsonLd data={serviceGraph(document)} />
    <Footer />
  </>;
}
