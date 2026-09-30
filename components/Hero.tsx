import Image from "next/image";
import { heroImage } from "@/data/site";
import { Reveal } from "./Reveal";

export function Hero() {
  return (
    <section className="hero-section" id="top" aria-labelledby="hero-title">
      <div className="hero-image-wrap" aria-hidden="true">
        <Image
          src={heroImage.src}
          alt=""
          fill
          priority
          loading="eager"
          sizes="100vw"
          className="hero-image"
        />
      </div>
      <div className="hero-grid-lines" aria-hidden="true" />
      <div className="site-container hero-content">
        <div className="hero-rule" aria-hidden="true" />
        <Reveal>
          <p className="eyebrow">Independent Venture &amp; Digital Group</p>
        </Reveal>
        <Reveal delay="short">
          <h1 id="hero-title" className="hero-title">
            We build businesses,
            <br />
            products and digital
            <br />
            experiences.
          </h1>
        </Reveal>
        <Reveal delay="medium">
          <p className="hero-copy">
            Anthēon is an independent UK group developing ventures across technology,
            services and design, alongside selected digital work for ambitious businesses.
          </p>
          <div className="hero-actions" aria-label="Primary actions">
            <a href="#about" className="button button-primary">
              Explore the Group <span aria-hidden="true">↓</span>
            </a>
            <a href="#work" className="button button-secondary">
              View our work <span aria-hidden="true">↓</span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
