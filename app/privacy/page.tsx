import { VectorIcon } from "@/components/VectorIcon";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { siteLinks } from "@/data/site";

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main id="main-content" className="privacy-page" tabIndex={-1}>
        <section className="site-container privacy-content" aria-labelledby="privacy-title">
          <p className="section-label">Privacy</p>
          <h1 id="privacy-title" className="section-title">Privacy Notice</h1>
          <div className="copy-column">
            <p>
              Anthēon Group keeps enquiries simple. If you contact us by email, we will use
              the details you provide to respond to your message and manage the enquiry.
            </p>
            <p>
              We do not use this website to collect payment information, operate user
              accounts or publish mailing-list sign-up forms. Any future changes to how data
              is collected will be reflected on this page.
            </p>
            <p>
              We use Vercel Web Analytics to understand visitor numbers, page views,
              referral sources and device types through aggregated statistics. This
              service does not use third-party cookies. Read more about{" "}
              <a href="https://vercel.com/docs/analytics/privacy-policy">Vercel Web Analytics privacy</a>.
            </p>
            <p>
              For privacy questions, contact{" "}
              <a href={`mailto:${siteLinks.email}`}>{siteLinks.email}</a>.
            </p>
          </div>
          <Link className="text-link privacy-return" href="/">
            Return to Anthēon Group <span aria-hidden="true"><VectorIcon name="arrow-up-right" /></span>
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
