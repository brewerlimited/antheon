import { VectorIcon } from "@/components/VectorIcon";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Brand } from "@/components/Brand";
import { InteractivePreview } from "@/components/InteractivePreview";
import { Footer } from "@/components/Footer";
import { concepts } from "@/data/concepts";
import { siteLinks } from "@/data/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return concepts.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const concept = concepts.find((item) => item.slug === slug);
  if (!concept) notFound();
  return {
    title: `${concept.name} — Website Concept | Anthēon Group`,
    description: concept.description,
    alternates: { canonical: `/concepts/${concept.slug}` },
    robots: { index: false, follow: true },
    openGraph: { title: `${concept.name} — Website Concept`, description: concept.description, url: `/concepts/${concept.slug}`, images: [] },
    twitter: { card: "summary", title: `${concept.name} — Website Concept`, description: concept.description, images: [] },
  };
}

export default async function ConceptPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const concept = concepts.find((item) => item.slug === slug);
  if (!concept) notFound();
  const nextConcept = concepts[(concepts.findIndex((item) => item.slug === slug) + 1) % concepts.length];

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className="site-header site-header-solid">
        <nav className="site-container nav-inner" aria-label="Concept navigation">
          <Link href="/" className="brand-link"><Brand /></Link>
          <Link href="/web-design" className="text-link"><VectorIcon name="arrow-left" /> All website designs</Link>
        </nav>
      </header>
      <main id="main-content" className="concept-page" tabIndex={-1}>
        <section className="site-container concept-detail-intro" aria-labelledby="concept-title">
          <p className="section-label">{concept.category} / Website concept</p>
          <h1 className="section-title" id="concept-title">{concept.name}</h1>
          <div className="concept-detail-copy">
            <p>{concept.description}</p>
            <p className="concept-status">An independent design exploration by Anthēon. This is not a commissioned project or the business’s official website.</p>
          </div>
        </section>
        <section className="site-container concept-preview-section" aria-label={`${concept.name} interactive design`}>
          <InteractivePreview key={concept.slug} slug={concept.slug} name={concept.name} />
        </section>
        <section className="section site-container concept-direction" aria-labelledby="direction-title">
          <div>
            <p className="section-label">The thinking</p>
            <h2 className="section-title" id="direction-title">Designed around<br />the business.</h2>
          </div>
          <ol>{concept.decisions.map((decision) => <li key={decision}>{decision}</li>)}</ol>
        </section>
        <div className="site-container concept-pagination">
          <Link className="text-link" href="/web-design"><VectorIcon name="arrow-left" /> All six designs</Link>
          <Link className="text-link" href={`/concepts/${nextConcept.slug}`}>Next: {nextConcept.name} <span aria-hidden="true"><VectorIcon name="arrow-up-right" /></span></Link>
        </div>
        <section className="section site-container concept-enquiry" aria-labelledby="enquiry-title">
          <div><p className="section-label">Your next project</p><h2 className="section-title" id="enquiry-title">A direction of your own.</h2></div>
          <a className="button button-primary" href={`mailto:${siteLinks.email}?subject=${encodeURIComponent(`Website enquiry — ${concept.name} concept`)}`}>Discuss your website <span aria-hidden="true"><VectorIcon name="arrow-up-right" /></span></a>
        </section>
      </main>
      <Footer />
    </>
  );
}
