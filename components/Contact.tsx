import { VectorIcon } from "@/components/VectorIcon";
import { siteLinks } from "@/data/site";

export function Contact() {
  return (
    <section className="section contact-section" id="contact" aria-labelledby="contact-title">
      <div className="site-container contact-layout">
        <div>
          <p className="section-label">06 / Contact</p>
          <h2 id="contact-title" className="section-title">
            Have something
            <br />
            worth building?
          </h2>
        </div>
        <div className="contact-main">
          <p>
            For venture enquiries, collaborations and selected digital projects, speak
            directly with Anthēon Group.
          </p>
          <a className="email-link" href={`mailto:${siteLinks.email}`}>
            {siteLinks.email} <span aria-hidden="true"><VectorIcon name="arrow-up-right" /></span>
          </a>
          <div className="contact-meta">
            <span>Buckinghamshire</span>
            <span>United Kingdom</span>
          </div>
          {siteLinks.linkedin ? (
            <a href={siteLinks.linkedin} className="text-link">
              LinkedIn <span aria-hidden="true"><VectorIcon name="arrow-up-right" /></span>
            </a>
          ) : (
            null
          )}
        </div>
      </div>
    </section>
  );
}
