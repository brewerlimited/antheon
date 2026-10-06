import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ContactForm } from "@/components/measurement/ContactForm";
import { ServiceLinks } from "@/components/public-content/ServiceContent";
import { JsonLd } from "@/components/public-content/JsonLd";
import { breadcrumbs } from "@/lib/public-seo/structured-data";
import { pageMetadata, publicUrl } from "@/lib/site-metadata";
import { siteLinks } from "@/data/site";
import styles from "@/components/public-content/public-content.module.css";

export const metadata = pageMetadata({ title: "Contact Anthēon | Websites, SEO & Digital Projects", description: "Talk to Anthēon about a website, redesign, ongoing care or search optimisation. Share your current website and what you would like to improve.", path: "/contact" });

export default function ContactPage() {
  return <><Header /><main id="main-content" tabIndex={-1} className={styles.page}><div className="site-container"><nav className={styles.breadcrumbs} aria-label="Breadcrumb"><Link href="/">Anthēon</Link><span aria-hidden="true">/</span><span aria-current="page">Contact</span></nav><header className={styles.hero}><p className="section-label">Anthēon / Start something</p><h1>A good conversation.<br />A clear next step.</h1><div className={styles.heroBottom}><p>A website, a digital product or a better way of doing things. Tell us what you have in mind and where you would like to get to.</p></div></header><ServiceLinks current="/contact" /><div className={styles.contactGrid}><section className={styles.contactIntro} aria-labelledby="contact-brief-title"><p className="section-label">Your next project</p><h2 id="contact-brief-title">Start with the useful details.</h2><p>If you have a website, share the address and what needs to work better. For a new project, tell us about the business, the people it is for and any timing or budget considerations.</p><p>Prefer email?</p><a className={styles.contactEmail} href={`mailto:${siteLinks.email}`}>{siteLinks.email}</a><p>Buckinghamshire, United Kingdom.<br />Conversations and project work take place online.</p></section><ContactForm /></div></div></main><JsonLd data={{ "@context": "https://schema.org", "@graph": [{ "@type": "ContactPage", "@id": publicUrl("/contact#page"), name: "Contact Anthēon", url: publicUrl("/contact"), about: { "@id": publicUrl("/#organisation") } }, breadcrumbs("Contact", "/contact")] }} /><Footer /></>;
}
