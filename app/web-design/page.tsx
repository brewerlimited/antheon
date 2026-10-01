import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ConceptCard } from "@/components/ConceptCard";
import { Reveal } from "@/components/Reveal";
import { concepts } from "@/data/concepts";
import { siteLinks } from "@/data/site";

export const metadata: Metadata = {
  title: "Web Design & Interactive Concepts | Anthēon Group",
  description: "Explore six website design concepts by Anthēon, with full interactive homepages, considered motion and distinctive visual directions.",
  alternates: { canonical: "/web-design" },
  openGraph: { title: "Web Design & Interactive Concepts | Anthēon Group", description: "Six distinctive website design concepts. Explore the full interactive homepages.", url: "/web-design" },
};

export default function WebDesignPage() {
  return <>
    <Header />
    <main id="main-content" tabIndex={-1} className="web-design-page">
      <section className="site-container gallery-intro" aria-labelledby="gallery-title">
        <p className="section-label">Anthēon / Web Design</p>
        <div className="work-heading">
          <h1 className="section-title" id="gallery-title">Designed to be<br />experienced.</h1>
          <p className="work-intro">Six businesses. Six distinct directions. Open a design and explore the full homepage — scroll, hover and discover the details.</p>
        </div>
        <div className="gallery-meta"><span>Selected design concepts</span><span>01 — 06</span></div>
      </section>
      <section className="site-container gallery-collection" aria-label="Website design concepts">
        <div className="concept-grid gallery-grid">
          {concepts.map((concept, index) => <Reveal key={concept.slug} delay={index % 3 === 1 ? "short" : index % 3 === 2 ? "medium" : "none"}><ConceptCard concept={concept} index={index} /></Reveal>)}
        </div>
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
              <a className="button button-primary" href={`mailto:${siteLinks.email}?subject=Website%20design%20enquiry`}>Discuss your website <span aria-hidden="true">↗</span></a>
            </div>
          </div>
        </Reveal>
      </section>
    </main>
    <Footer />
  </>;
}
