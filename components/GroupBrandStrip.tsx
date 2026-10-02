import { VectorIcon } from "@/components/VectorIcon";
import Image from "next/image";
import { heroImage, ventures } from "@/data/site";

export function GroupBrandStrip() {
  return (
    <section className="brand-strip" aria-labelledby="brand-strip-title">
      <Image
        src={heroImage.src}
        alt=""
        fill
        sizes="100vw"
        className="brand-strip-image"
      />
      <div className="brand-strip-overlay" aria-hidden="true" />
      <div className="site-container brand-strip-content">
        <h2 id="brand-strip-title">ANTHĒON</h2>
        <div className="gold-rule" aria-hidden="true" />
        <p>GROUP</p>
        <div className="venture-rail" aria-label="Anthēon Group ventures">
          {ventures.map((venture) => venture.href ? (
            <a key={venture.name} href={venture.href} target="_blank" rel="noopener noreferrer"
              aria-label={`${venture.name} — visit website (opens in a new tab)`}>
              {venture.name} <span aria-hidden="true"><VectorIcon name="arrow-up-right" /></span>
            </a>
          ) : <span key={venture.name}>{venture.name}</span>)}
        </div>
      </div>
    </section>
  );
}
