import { VectorIcon } from "@/components/VectorIcon";
import Link from "next/link";
import { featuredConcepts } from "@/data/concepts";
import { ConceptCard } from "./ConceptCard";
import { Reveal } from "./Reveal";

export function SelectedWork() {
  return (
    <section className="section work-section" id="work" aria-labelledby="work-title">
      <div className="site-container">
        <Reveal className="work-heading">
          <div>
            <p className="section-label">04 / Selected Concepts</p>
            <h2 id="work-title" className="section-title">A sense of<br />what we can build.</h2>
          </div>
          <p className="work-intro">Different businesses. Different expressions. Explore three of our website concepts, with the scrolling, motion and detail of the full homepage.</p>
        </Reveal>
        <div className="concept-grid">
          {featuredConcepts.map((concept, index) => (
            <Reveal key={concept.slug} delay={index === 1 ? "short" : index === 2 ? "medium" : "none"}>
              <ConceptCard concept={concept} index={index} />
            </Reveal>
          ))}
        </div>
        <div className="work-gallery-link">
          <p>Six directions. One considered approach.</p>
          <Link className="button button-secondary" href="/web-design">View all website designs <span aria-hidden="true"><VectorIcon name="arrow-up-right" /></span></Link>
        </div>
        <p className="concept-disclaimer">Independent design explorations. Shown as concepts, not commissioned client projects.</p>
      </div>
    </section>
  );
}
