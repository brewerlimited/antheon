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
          {ventures.map((venture) => {
            const content = <>
              <div className="venture-mark" aria-hidden="true">
                {venture.mark}
              </div>
              <div className="venture-main">
                <h3>{venture.name}</h3>
                <p>{venture.category}</p>
                {venture.href ? <span className="venture-link">Visit website <span aria-hidden="true">↗</span></span> : null}
              </div>
              <p className="venture-description">{venture.description}</p>
            </>;

            return venture.href ? (
              <a key={venture.name} href={venture.href} className="venture-row venture-row-linked"
                target="_blank" rel="noopener noreferrer"
                aria-label={`${venture.name} — visit website (opens in a new tab)`}>
                {content}
              </a>
            ) : <article className="venture-row" key={venture.name}>{content}</article>;
          })}
        </div>
      </div>
    </section>
  );
}
