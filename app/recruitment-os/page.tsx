import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductPreview } from "@/components/recruitment/ProductPreview";
import "./product.css";
export const metadata: Metadata = {
  title: "Recruitment OS — Construction Workforce Intelligence | Anthēon",
  description:
    "An interactive exploration of construction recruitment. Know who is working, who is available and who fits the next job. Built by Anthēon.",
  alternates: { canonical: "/recruitment-os" },
  openGraph: {
    title: "Recruitment OS — Construction Workforce Intelligence | Anthēon",
    description:
      "Know who is working. Know who is available. Know who fits the next job.",
    url: "/recruitment-os",
  },
};
export default function RecruitmentProduct() {
  return (
    <>
      <Header />
      <main className="rp-page">
        <section className="rp-hero">
          <div className="rp-topline">
            <span>ANTHĒON / PRODUCT EXPLORATION</span>
            <span>01 — RECRUITMENT OS</span>
          </div>
          <div className="rp-hero-grid">
            <div>
              <p className="rp-label">CONSTRUCTION WORKFORCE INTELLIGENCE</p>
              <h1>
                RECRUITMENT
                <br />
                WITHOUT THE
                <br />
                <em>ADMIN DRAG.</em>
              </h1>
              <p className="rp-hero-copy">
                A construction recruitment platform designed around the question
                recruiters actually need answered:
                <br />
                <strong>Who can I put on this job?</strong>
              </p>
              <div className="rp-hero-actions">
                <a className="rp-primary-link" href="/recruitment-os/demo">
                  LAUNCH INTERACTIVE DEMO <span>↗</span>
                </a>
                <a className="rp-text-link" href="#system">
                  EXPLORE THE SYSTEM <span>↓</span>
                </a>
              </div>
            </div>
            <div className="rp-signal-art" aria-hidden="true">
              <div className="rp-orbit rp-orbit-one" />
              <div className="rp-orbit rp-orbit-two" />
              <div className="rp-orbit rp-orbit-three" />
              <div className="rp-signal-center">
                R<span>OS</span>
              </div>
              <div className="rp-signal-tag tag-one">
                <i />
                318 AVAILABLE
              </div>
              <div className="rp-signal-tag tag-two">
                <i />
                94 FINISHING SOON
              </div>
              <div className="rp-signal-tag tag-three">
                <i />
                THE NEXT REQUIREMENT
              </div>
              <div className="rp-signal-coordinate">
                52.2405° N / 0.9027° W<br />
                PEOPLE. PLACES. POSSIBILITIES.
              </div>
            </div>
          </div>
          <div className="rp-hero-bottom">
            <span>
              <i /> LIVE PRODUCT DEMO
            </span>
            <span>DEMO DATA ONLY — EXPLORE FREELY</span>
            <span>LESS ADMIN. BETTER VISIBILITY. FASTER PLACEMENTS.</span>
          </div>
        </section>
        <section className="rp-system" id="system">
          <div className="rp-section-intro">
            <p className="rp-label">FROM DATABASE TO WORKFORCE.</p>
            <h2>
              One clear picture.
              <br />
              <span>Your next move, obvious.</span>
            </h2>
            <p>
              Know who’s working.
              <br />
              Know who’s available.
              <br />
              Know who fits the next job.
            </p>
          </div>
          <ProductPreview />
          <div className="rp-principles">
            <article>
              <span>01 / WORKFORCE VISIBILITY</span>
              <h3>
                Know who.
                <br />
                Know where.
                <br />
                Know when.
              </h3>
              <p>
                Who’s working, where they’re working and when they’re becoming
                available. Your whole workforce, in view.
              </p>
              <div className="rp-mini-status">
                <span>WORKING</span>
                <i>→</i>
                <span>FINISHING</span>
                <i>→</i>
                <span>AVAILABLE</span>
              </div>
            </article>
            <article>
              <span>02 / MATCH FASTER</span>
              <h3>
                The right people.
                <br />
                In seconds.
              </h3>
              <p>
                Trade. Location. Availability. Tickets. Experience. A clear
                reason for every match, with the controls in your hands.
              </p>
              <div className="rp-mini-match">
                <span>GROUNDWORKER</span>
                <span>30 MILES</span>
                <span>CSCS ✓</span>
                <b>38 MATCHES ↗</b>
              </div>
            </article>
            <article>
              <span>03 / ONE ACTION AWAY</span>
              <h3>
                From shortlist
                <br />
                to site.
              </h3>
              <p>
                Turn a filtered candidate list into a targeted job broadcast.
                Responses return against the requirement. Keep moving.
              </p>
              <div className="rp-mini-response">
                <i />
                <span>8 INTERESTED</span>
                <b>ADD TO SHORTLIST ↗</b>
              </div>
            </article>
            <article>
              <span>04 / BUILT FOR CONSTRUCTION</span>
              <h3>
                Site-ready.
                <br />
                By design.
              </h3>
              <p>
                Trades, sites, tickets, expiry dates and placements are part of
                the system’s foundations. Built around the work you do.
              </p>
              <div className="rp-mini-ticket">
                <span>CPCS / A09</span>
                <b>14 DAYS TO RENEWAL</b>
                <i>↗</i>
              </div>
            </article>
          </div>
          <a className="rp-enter" href="/recruitment-os/demo">
            <span>ENOUGH LOOKING.</span>
            <strong>ENTER THE SYSTEM</strong>
            <span>↗</span>
          </a>
        </section>
        <section className="rp-connection">
          <p className="rp-label">WEBSITE ↔ CANDIDATES ↔ OPERATIONS</p>
          <h2>
            Built as one system.
            <br />
            <span>Because the work is connected.</span>
          </h2>
          <div className="rp-connection-flow">
            <span>
              <small>01 / YOUR WEBSITE</small>New registration
            </span>
            <i>→</i>
            <span>
              <small>02 / YOUR WORKFORCE</small>Candidate reviewed
            </span>
            <i>→</i>
            <span>
              <small>03 / YOUR NEXT JOB</small>Placement made
            </span>
          </div>
          <p>
            A product exploration. Every person, message and placement is
            fictional. No account needed, no real messages sent.
          </p>
        </section>
        <section className="rp-final">
          <p className="rp-label">BUILT AROUND YOUR RECRUITMENT BUSINESS.</p>
          <h2>
            YOUR DATABASE
            <br />
            SHOULD DO MORE
            <br />
            <span>THAN STORE NAMES.</span>
          </h2>
          <div>
            <p>
              Website. Candidate database. Recruitment operations.
              <br />
              Designed as one system.
            </p>
            <a className="rp-primary-link" href="/contact">
              BUILD YOUR SYSTEM <span>↗</span>
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
