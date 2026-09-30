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
      <section className="section site-container concept-enquiry" aria-labelledby="gallery-enquiry-title">
        <div><p className="section-label">Your next project</p><h2 className="section-title" id="gallery-enquiry-title">Something distinctly yours.</h2></div>
        <a className="button button-primary" href={`mailto:${siteLinks.email}?subject=Website%20design%20enquiry`}>Discuss your website <span aria-hidden="true">↗</span></a>
      </section>
    </main>
    <Footer />
  </>;
}
