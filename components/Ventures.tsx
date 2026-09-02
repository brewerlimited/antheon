import { ventures } from "@/data/site";
import { Reveal } from "./Reveal";

export function Ventures() {
  return (
    <section className="section" id="ventures" aria-labelledby="ventures-title">
      <div className="site-container ventures-layout">
        <Reveal className="sticky-heading">
          <p className="section-label">02 / Our Ventures</p>
          <h2 id="ventures-title" className="section-title">
            Businesses built
            <br />
            within Anthēon.
          </h2>
        </Reveal>

        <div className="venture-list">
          {ventures.map((venture) => (
            <article className="venture-row" key={venture.name}>
              <div className="venture-mark" aria-hidden="true">
                {venture.mark}
              </div>
              <div className="venture-main">
                <h3>{venture.name}</h3>
                <p>{venture.category}</p>
              </div>
              <p className="venture-description">{venture.description}</p>
              {venture.href ? (
                <a href={venture.href} className="venture-link">
                  View Venture <span aria-hidden="true">↗</span>
                </a>
              ) : (
                <span className="venture-link venture-link-muted" aria-label="Venture link to be added">
                  View Venture <span aria-hidden="true">↗</span>
                </span>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
