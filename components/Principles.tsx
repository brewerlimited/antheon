const principles = [
  {
    number: "01",
    title: "Purpose",
    text: "Understand what the website needs to achieve before deciding how it should look.",
  },
  {
    number: "02",
    title: "Positioning",
    text: "Present the business at the level it deserves to be perceived.",
  },
  {
    number: "03",
    title: "Experience",
    text: "Remove unnecessary friction and make every interaction feel intentional.",
  },
  {
    number: "04",
    title: "Detail",
    text: "Typography, spacing, imagery and motion treated as part of the product, not decoration.",
  },
];

export function Principles() {
  return (
    <section className="section compact-section" aria-labelledby="principles-title">
      <div className="site-container principles-layout">
        <div>
          <p className="section-label">04 / How We Work</p>
          <h2 id="principles-title" className="section-title">
            Clarity
            <br />
            over noise.
          </h2>
        </div>
        <div className="principles-grid">
          {principles.map((principle) => (
            <article className="principle-item" key={principle.title}>
              <p>{principle.number} / {principle.title}</p>
              <span>{principle.text}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
