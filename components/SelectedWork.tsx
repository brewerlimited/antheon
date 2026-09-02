const workRows = [
  {
    label: "Venture Creation",
    title: "Brand, product and web systems for ideas developed inside Anthēon.",
  },
  {
    label: "Business Websites",
    title: "Positioning-led websites for companies whose existing digital presence is holding back perception.",
  },
  {
    label: "Digital Products",
    title: "Interfaces and product experiences shaped for clarity, credibility and practical use.",
  },
];

export function SelectedWork() {
  return (
    <section className="section work-section" id="work" aria-labelledby="work-title">
      <div className="site-container">
        <div className="work-heading">
          <p className="section-label">Selected Digital Work</p>
          <h2 id="work-title" className="section-title">
            Built quietly.
            <br />
            Judged by the standard of the result.
          </h2>
        </div>

        <div className="work-list">
          {workRows.map((row) => (
            <article className="work-row" key={row.label}>
              <p>{row.label}</p>
              <h3>{row.title}</h3>
              <a href="#contact" aria-label={`Discuss ${row.label.toLowerCase()} with Anthēon`}>
                Enquire <span aria-hidden="true">↗</span>
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
