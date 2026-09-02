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
          {ventures.map((venture) => (
            <span key={venture.name}>{venture.name}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
