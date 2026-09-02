import { Reveal } from "./Reveal";

export function GroupIntro() {
  return (
    <section className="section section-ruled" id="about" aria-labelledby="about-title">
      <div className="site-container two-column">
        <Reveal>
          <div>
            <p className="section-label">01 / The Group</p>
            <h2 id="about-title" className="section-title">
              One group.
              <br />
              Different ideas.
              <br />
              Built with the same intent.
            </h2>
          </div>
        </Reveal>
        <Reveal delay="short" className="copy-column">
          <p>
            Anthēon Group develops and operates independent businesses across software,
            services, design and consumer markets.
          </p>
          <p>
            From identifying an opportunity through to brand, product, technology and
            commercial execution, we build ideas into real businesses.
          </p>
          <p>
            Alongside our own ventures, we selectively partner with established companies
            where our experience in digital design, positioning and product development can
            create meaningful value.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
