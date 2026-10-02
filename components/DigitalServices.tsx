import { VectorIcon } from "@/components/VectorIcon";
const services = [
  {
    number: "01",
    title: "Web Design & Development",
    text: "High-quality modern websites designed around the business, its customers and the way it wants to be perceived.",
  },
  {
    number: "02",
    title: "Digital Positioning",
    text: "Clearer messaging, structure and presentation designed to make established businesses communicate their value more effectively online.",
  },
  {
    number: "03",
    title: "Product & Interface Design",
    text: "Modern user interfaces and digital experiences focused equally on aesthetics, simplicity and usability.",
  },
];

export function DigitalServices() {
  return (
    <section className="section digital-section" id="digital" aria-labelledby="digital-title">
      <div className="site-container">
        <div className="two-column section-intro">
          <div>
            <p className="section-label">03 / Digital</p>
            <h2 id="digital-title" className="section-title">
              Digital work for
              <br />
              businesses that care
              <br />
              how they are perceived.
            </h2>
          </div>
          <div className="copy-column">
            <p>
              The same capabilities used to create and develop Anthēon&apos;s own ventures
              are selectively made available to external businesses.
            </p>
            <p>
              We work with a limited number of companies on modern websites, digital
              positioning and online experiences, particularly where an existing presence no
              longer reflects the quality of the business behind it.
            </p>
          </div>
        </div>

        <div className="service-grid">
          {services.map((service) => (
            <article className="service-item" key={service.title}>
              <p>{service.number} /</p>
              <h3>{service.title}</h3>
              <span>{service.text}</span>
            </article>
          ))}
        </div>

        <div className="selected-row">
          <span>Selected engagements only</span>
          <a href="#contact">
            Discuss a project <span aria-hidden="true"><VectorIcon name="arrow-up-right" /></span>
          </a>
        </div>
      </div>
    </section>
  );
}
