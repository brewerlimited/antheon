import Image from 'next/image';
import {
  ArrowUpRight,
  ArrowDown,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  Camera,
  LockKeyhole,
  Lightbulb,
  Snowflake,
} from 'lucide-react';
import {
  SiteHeader,
  ServiceCards,
  WorkGallery,
  Questions,
  ContactForm,
  MotionControl,
  CountUp,
} from './experience';

export default function Home() {
  return (
    <main id="top">
      <div className="reading-progress" aria-hidden="true" />
      <a className="skip-link" href="#services">
        Skip to content
      </a>
      <SiteHeader />
      <section
        className="hero"
        aria-label="Specialist automotive detailing in Cheshire"
      >
        <Image
          unoptimized
          className="hero-image"
          src="/previews/intimate-detail/images/hero.jpg"
          alt="Graphite sports car with immaculate reflective paintwork in a dark studio"
          width={1672}
          height={941}
          fetchPriority="high"
        />
        <div className="hero-shade" />
        <div className="hero-light" aria-hidden="true" />
        <div className="hero-scan" aria-hidden="true" />
        <div className="hero-topline">
          <span>DETAILING. REFINEMENT. PROTECTION.</span>
          <span>
            LEDSHAM, CHESHIRE <span className="status-dot" />
          </span>
        </div>
        <div className="hero-copy">
          <h1>
            <span className="hero-line">
              <span>OBSESSED WITH</span>
            </span>
            <span className="hero-line hero-line-main">
              <span>
                EVERY DETAIL<span className="hero-full-stop">.</span>
              </span>
            </span>
          </h1>
          <div className="hero-introduction">
            <span className="fine-line" />
            <p>
              Extraordinary care for extraordinary cars.
              <br />
              Specialist detailing, correction & ceramic protection.
            </p>
            <a className="hero-cta" data-reactive="magnetic" href="#contact">
              <span>Experience exceptional</span>
              <span className="cta-orbit">
                <ArrowUpRight size={25} />
              </span>
            </a>
          </div>
        </div>
        <div className="hero-side-note" aria-hidden="true">
          PRECISION IS PERSONAL.
        </div>
        <div className="hero-bottom">
          <a href="#services" className="scroll-cue">
            <ArrowDown size={18} />
            <span>SCROLL TO EXPLORE</span>
          </a>
          <span className="hero-bottom-note">
            Prestige. Performance. Protected.
          </span>
        </div>
      </section>
      <div className="credentials">
        <p>
          Expert hands.
          <br />
          <span className="type-accent">Complete confidence.</span>
        </p>
        <div>
          <b>
            <CountUp value={30} />
            <span>+</span>
          </b>
          <span>Years in the automotive world</span>
        </div>
        <div>
          <b>
            IGL <small>COATINGS</small>
          </b>
          <span>Accredited Master Installer</span>
        </div>
        <div>
          <b>Koch-Chemie</b>
          <span>Approved expertise</span>
        </div>
        <div>
          <b>Fully insured</b>
          <span>Every car in our care</span>
        </div>
      </div>
      <section className="section expertise" id="services">
        <div className="section-heading" data-reveal>
          <div>
            <div className="eyebrow">01 / THE TREATMENTS</div>
            <h2>
              Considered care.
              <br />
              <span className="type-accent">Exceptional results.</span>
            </h2>
          </div>
          <p>
            Three disciplines. One exacting standard. Each treatment tailored to
            your car, its condition and the way you drive it.
          </p>
        </div>
        <ServiceCards />
      </section>
      <section className="philosophy" id="studio">
        <div className="philosophy-image" data-reveal>
          <span className="image-topnote">THE CRAFT BEHIND THE FINISH</span>
          <Image
            unoptimized
            src="/previews/intimate-detail/images/detailing.jpg"
            alt="Hand finishing paintwork with meticulous care"
            loading="lazy"
            width={900}
            height={1000}
          />
          <div className="image-note">
            <span>
              <CountUp value={30} />
              <sup>+</sup>
            </span>
            <p>
              Years of automotive
              <br />
              understanding.
            </p>
          </div>
        </div>
        <div className="philosophy-copy" data-reveal>
          <div className="eyebrow">02 / THE STANDARD</div>
          <h2>
            It’s never
            <br />
            <span className="type-accent">just a car.</span>
          </h2>
          <p>
            You notice the little things. So do we. The clarity of a reflection.
            The depth of a finish. The feeling of seeing your car at its very
            best.
          </p>
          <p>
            With over 30 years of experience across automotive manufacture,
            repair and restoration, Phil brings a lifetime of understanding to
            every surface. From cherished classics to modern exotics.
          </p>
          <div className="studio-features">
            <span>
              <ShieldCheck size={18} /> Fully insured care
            </span>
            <span>
              <LockKeyhole size={18} /> Secure, CCTV-covered studio
            </span>
            <span>
              <Lightbulb size={18} /> Precision LED lighting
            </span>
            <span>
              <Snowflake size={18} /> Climate-controlled space
            </span>
          </div>
          <a href="#contact" className="text-link" data-reactive="magnetic">
            A conversation with Phil <ArrowUpRight size={17} />
          </a>
        </div>
      </section>
      <section className="section selected-work" id="work">
        <div className="section-heading" data-reveal>
          <div>
            <div className="eyebrow">03 / SELECTED WORK</div>
            <h2>
              The work.
              <br />
              <span className="type-accent">In its own words.</span>
            </h2>
          </div>
          <a
            className="text-link"
            data-reactive="magnetic"
            href="https://www.instagram.com/intimatedetail/"
            target="_blank"
            rel="noopener noreferrer"
          >
            More from the studio <Camera size={17} />
            <ArrowUpRight size={16} />
          </a>
        </div>
        <WorkGallery />
        <p className="portfolio-note">
          Selected work from the IntimateDetail portfolio. Every car, a personal
          responsibility.
        </p>
      </section>
      <section className="testimonial" data-reveal>
        <div className="eyebrow">WORDS FROM THE DRIVER’S SEAT</div>

        <blockquote>
          “A true professional with an
          <br className="desktop-break" />
          <span className="type-accent">obsession for perfection.</span>”
        </blockquote>
        <div className="quote-attribution">
          <span className="attribution-line" />
          <p>
            Steve<span>Ford Escort Mk II · Chester</span>
          </p>
        </div>
      </section>
      <section className="section faq-section">
        <div data-reveal>
          <div className="eyebrow">THE DETAILS, EXPLAINED</div>
          <h2>
            A little
            <br />
            <span className="type-accent">more detail.</span>
          </h2>
          <p>Personal advice is always part of the service.</p>
          <a
            className="text-link"
            data-reactive="magnetic"
            href="tel:+447581229029"
          >
            Talk to Phil <ArrowUpRight size={17} />
          </a>
        </div>
        <div data-reveal>
          <Questions />
        </div>
      </section>
      <section id="contact" className="section contact">
        <div className="contact-copy" data-reveal>
          <div className="eyebrow">04 / YOUR NEXT CHAPTER</div>
          <h2>
            For your
            <br />
            <span className="type-accent">pride & joy.</span>
          </h2>
          <p>
            Tell us what you drive. We’ll take care of the details.
            <br />A personal consultation. A finish worth looking back at.
          </p>
          <div className="contact-links">
            <a href="tel:+447581229029">
              <Phone size={19} />
              <span>07581 229 029</span>
              <ArrowUpRight size={18} />
            </a>
            <a href="mailto:phil@intimatedetail.co.uk">
              <Mail size={19} />
              <span>phil@intimatedetail.co.uk</span>
              <ArrowUpRight size={18} />
            </a>
          </div>
          <div className="studio-address">
            <MapPin size={20} />
            <div>
              <strong>Our Cheshire studio</strong>
              <address>
                Unit B1, Bank Farm, Ledsham Lane
                <br />
                Ledsham, Ellesmere Port · CH66 0NA
              </address>
              <a
                href="https://www.google.com/maps/search/?api=1&query=IntimateDetail%20Unit%20B1%20Bank%20Farm%20CH66%200NA"
                target="_blank"
                rel="noopener noreferrer"
              >
                Get directions <ArrowUpRight size={14} />
              </a>
            </div>
          </div>
        </div>
        <div data-reveal>
          <ContactForm />
        </div>
      </section>
      <footer className="site-footer">
        <div className="footer-wordmark" aria-hidden="true">
          intimate<span className="type-accent">detail.</span>
        </div>
        <div className="footer-main">
          <a
            href="#top"
            className="brand"
            aria-label="Intimate Detail back to top"
          >
            <span className="brand-name">
              intimate<span>detail</span>
            </span>
            <span className="brand-descriptor">PRECISION AUTOMOTIVE CARE</span>
          </a>
          <p>Exceptional cars. Extraordinary care.</p>
          <div className="footer-social">
            <a
              href="https://www.instagram.com/intimatedetail/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram <ArrowUpRight size={14} />
            </a>
            <a
              href="https://www.facebook.com/intimatedetail/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Facebook <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} IntimateDetail. All rights reserved.
          </span>
          <div>
            <a
              href="https://www.intimatedetail.co.uk/terms-conditions"
              target="_blank"
              rel="noopener noreferrer"
            >
              Terms & conditions
            </a>
            <a
              href="https://business.yell.com/websites-privacy-cookie-policy/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy
            </a>
            <MotionControl />
            <a href="#top" className="back-top" aria-label="Back to top">
              <ArrowUpRight size={18} />
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
