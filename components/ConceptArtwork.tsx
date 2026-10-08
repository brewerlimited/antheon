import Image from "next/image";
import type { Concept } from "@/data/concepts";
import styles from "./ConceptArtwork.module.css";

/** A lightweight branded cover; the full interactive design opens on the concept page. */
export function ConceptArtwork({ concept, sizes, wide = false }: { concept: Concept; sizes: string; wide?: boolean }) {
  const image = <Image src={concept.image} alt={concept.imageAlt} width={1600} height={1000} sizes={sizes} style={concept.slug === "paye" ? { objectPosition: "left top" } : undefined} />;
  if (concept.slug !== "pioneer-bros") return image;
  return <div className={`${styles.cover} ${wide ? styles.wide : ""}`}>
    {image}
    <div className={styles.shade} aria-hidden="true" />
    <div className={styles.navigation} aria-hidden="true"><span className={styles.logo} /><span className={styles.navigationLinks}>Our story<span>Scaffolding</span>Our work</span><span className={styles.quote}>Get a quote</span></div>
    <div className={styles.copy} aria-hidden="true"><span className={styles.pill}>Family-run. Professionally delivered.</span><span className={styles.heading}>Good people.<br />Great heights.</span><span className={styles.description}>Scaffolding that gets your project moving.</span><span className={styles.ctas}><span>Get a quote</span><span>Explore our work</span></span></div>
    <div className={styles.ticker} aria-hidden="true">Domestic<span>Commercial</span>Industrial<span>Temporary roofs</span>Chimney access</div>
  </div>;
}
