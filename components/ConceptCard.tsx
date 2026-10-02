import { VectorIcon } from "@/components/VectorIcon";
import Image from "next/image";
import Link from "next/link";
import type { Concept } from "@/data/concepts";

export function ConceptCard({ concept, index }: { concept: Concept; index: number }) {
  return (
    <Link href={`/concepts/${concept.slug}`} className="concept-card">
      <div className="concept-image-frame">
        <div className="concept-browser" aria-hidden="true">
          <span className="browser-dots"><i /><i /><i /></span>
          <span>{concept.category}</span>
          <span>{String(index + 1).padStart(2, "0")}</span>
        </div>
        <div className="concept-image-crop">
          <Image src={concept.image} alt={concept.imageAlt} width={1440} height={1000}
            sizes="(max-width: 820px) calc(100vw - 40px), (max-width: 1120px) 46vw, 31vw" />
          <span className="concept-live-label">Interactive homepage <span aria-hidden="true"><VectorIcon name="arrow-up-right" /></span></span>
        </div>
      </div>
      <div className="concept-caption">
        <div><p className="concept-category">{concept.category}</p><h3>{concept.name}</h3></div>
        <span className="concept-arrow" aria-hidden="true"><VectorIcon name="arrow-up-right" /></span>
      </div>
      <p className="concept-summary">{concept.summary}</p>
      <span className="concept-view">Explore design <span aria-hidden="true"><VectorIcon name="arrow-up-right" /></span></span>
    </Link>
  );
}
