import Link from "next/link";
import type { ServiceDocument } from "@/data/public-content";
import { serviceNavigation } from "@/data/public-content";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { VectorIcon } from "@/components/VectorIcon";
import { JsonLd } from "./JsonLd";
import { serviceGraph } from "@/lib/public-seo/structured-data";
import styles from "./public-content.module.css";

export function ServiceLinks({ current }: { current?: string }) {
  return <nav className={styles.serviceLinks} aria-label="Digital services">{serviceNavigation.map(item => <a key={item.href} href={item.href} aria-current={current === item.href ? "page" : undefined}>{item.label}</a>)}</nav>;
}

export function ServiceBody({ document, compact = false }: { document: ServiceDocument; compact?: boolean }) {
  return <div className={styles.content} id="service-details">
    {compact && <header className={styles.detailIntro}><p className="section-label">The approach / {document.eyebrow}</p><h2>{document.heading}</h2><p>{document.intro}</p></header>}
    <div className={styles.sections}>
      {document.sections.map((section, index) => <section className={styles.section} aria-labelledby={section.id} key={section.id}>
        <span className={styles.number} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
        <h2 id={section.id}>{section.title}</h2>
        <div className={styles.copy}>{section.body.map(paragraph => <p key={paragraph}>{paragraph}</p>)}{section.points && <ul>{section.points.map(point => <li key={point}>{point}</li>)}</ul>}</div>
      </section>)}
    </div>
    {document.proof.length > 0 && <section className={styles.proof} aria-labelledby="explore-title"><div><p className="section-label">Take a closer look</p><h2 id="explore-title">See the thinking<br />in the details.</h2></div><div className={styles.proofLinks}>{document.proof.map(proof => <a key={proof.href} href={proof.href}><span className={styles.proofKind}>{proof.kind === "concept" ? "Independent design exploration" : proof.kind === "venture" ? "Internal venture" : "Implementation"}</span><h3>{proof.label}<VectorIcon name="arrow-up-right" /></h3><p>{proof.description}</p></a>)}</div></section>}
    {document.faqs.length > 0 && <section className={styles.faq} aria-labelledby="questions-title"><div><p className="section-label">Before we begin</p><h2 id="questions-title">A few useful<br />answers.</h2></div><div>{document.faqs.map(faq => <details key={faq.question}><summary>{faq.question}<span aria-hidden="true">+</span></summary><p>{faq.answer}</p></details>)}</div></section>}
    <section className={styles.next} aria-labelledby="next-title"><p className="section-label">A conversation is a good start</p><h2 id="next-title">What would you<br /><span>like to build?</span></h2><a href="/contact" className="button button-primary" data-analytics-cta="service-enquiry">Tell us about your website <VectorIcon name="arrow-up-right" /></a><div className={styles.related}><span>Also from Anthēon</span>{document.related.map(slug => { const link = serviceNavigation.find(item => item.href === `/${slug}`); return link && <a key={slug} href={link.href}>{link.label}<VectorIcon name="arrow-up-right" /></a>; })}</div></section>
  </div>;
}

export function ServicePage({ document }: { document: ServiceDocument }) {
  return <><Header /><main id="main-content" tabIndex={-1} className={styles.page}><div className="site-container"><nav className={styles.breadcrumbs} aria-label="Breadcrumb"><Link href="/">Anthēon</Link><span aria-hidden="true">/</span><span aria-current="page">{document.eyebrow}</span></nav><header className={styles.hero}><p className="section-label">Anthēon / {document.eyebrow}</p><h1>{document.heading}</h1><div className={styles.heroBottom}><p>{document.intro}</p><a href="/contact" className="text-link" data-analytics-cta="service-enquiry">Discuss your website <VectorIcon name="arrow-up-right" /></a></div></header><ServiceLinks current={document.path} /><ServiceBody document={document} /></div></main><JsonLd data={serviceGraph(document)} /><Footer /></>;
}
