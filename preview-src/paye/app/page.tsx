import Link from 'next/link';
import Photo from '@/components/Photo';
import ScrollComposition from '@/components/ScrollComposition';
import { articles } from '@/components/Journal';
import { projects } from '@/lib/projects';
import { services } from '@/lib/services';
import { meta, organization } from '@/lib/site';

export const metadata = meta('Stonework & restoration', 'The places we care for. Specialist stonework, restoration and conservation by PAYE.', '/');

const photographs = [
  { name: 'the-national-gallery-2-03', alt: 'The complete National Gallery façade across Trafalgar Square beneath a vast clouded sky', position: '50% 48%' },
  { name: 'old-war-office-hero', alt: 'The monumental stone façade and corner towers of the Old War Office on Whitehall', position: '50% 50%' },
  { name: 'theatre-royal-04', alt: 'The restored terracotta colonnade along the full frontage of Theatre Royal Brighton', position: '50% 50%' },
  { name: 'tower-hill-memorial-05', alt: 'Sunlight crossing the stone colonnade of Tower Hill Memorial', position: '50% 50%' },
  { name: 'the-royal-pavilion-01', alt: 'The Royal Pavilion seen from above, its domes and gardens set within the city of Brighton', position: '50% 56%' },
];

export default function Home() {
  return (
    <ScrollComposition>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', ...organization }) }} />
      <section className="photographic-reel" aria-label="Five places, an ongoing story">
        <div className="reel-stage">
          <div className="reel-introduction">
            <h1>For the life of a building.</h1>
            <p>Specialist stonework, restoration<br />and conservation. London & York.</p>
          </div>
          <div className="reel-frames">
            {projects.map((project, i) => (
              <article className="reel-frame" key={project.slug} aria-labelledby={`reel-title-${i}`}>
                <div className="reel-picture" style={{ '--image-position': photographs[i].position } as React.CSSProperties}>
                  <Photo name={photographs[i].name} alt={photographs[i].alt} priority={i === 0} />
                </div>
                <div className="reel-caption">
                  <div className="reel-register"><span>0{i + 1} / 05</span><span>Selected places</span><span>{project.material}</span></div>
                  <div className="reel-project">
                    <div><p>{project.location}</p><h2 id={`reel-title-${i}`}><Link href={`/projects/${project.slug}/`}>{project.name}<span aria-hidden="true">↗</span></Link></h2></div>
                    <p className="reel-discipline">{project.discipline}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="reel-footnote"><span>Scroll to explore ↓</span><Link href="/projects/">The full project archive ↗</Link></div>
        </div>
      </section>

      <section className="practice-note" aria-labelledby="practice-title">
        <p className="home-note">PAYE / The practice</p>
        <div><h2 id="practice-title">Our work is part of<br />a much longer story.</h2><p>Buildings hold the lives of the people who made them, used them and cared for them. We help that story continue — from a single carved detail to an entire landmark.</p><Link className="quiet-link" href="/about/">An introduction to PAYE <span aria-hidden="true">↗</span></Link></div>
        <figure><Photo name="the-national-gallery-2-06" alt="The small carved leaves and mouldings within a monumental National Gallery stone capital" sizes="(max-width: 799px) 65vw, 25vw" /><figcaption>01 / A closer look<br />Carved stone, The National Gallery</figcaption></figure>
      </section>

      <section className="craft-zoom" aria-labelledby="craft-title">
        <div className="craft-stage">
          <div className="craft-introduction"><p className="home-note">In the hands of a craftsperson</p><h2 id="craft-title">The building.<br />And every detail.</h2><Link className="quiet-link" href="/careers/">The people behind the work <span aria-hidden="true">↗</span></Link></div>
          <div className="craft-picture"><Photo name="old-war-office-07" alt="A PAYE stonemason carving the petals of an ornamental stone detail by hand" /><span>Hand carving / Old War Office, London</span></div>
        </div>
      </section>

      <section className="practice-directory" aria-labelledby="expertise-title">
        <div className="directory-heading"><p className="home-note">A complete understanding</p><h2 id="expertise-title">From the first survey<br />to the final stone.</h2><p>Specialist knowledge, practical skill and care for the whole building.</p></div>
        <div className="directory-links">{services.map((service, i) => <Link href={`/services/${service.slug}/`} key={service.slug}><span>0{i + 1}</span><h3>{service.name}</h3><span aria-hidden="true">↗</span></Link>)}</div>
      </section>

      <section className="practice-journal" aria-labelledby="journal-title">
        <div className="journal-heading"><h2 id="journal-title">From the practice</h2><Link href="/insights/">All insights ↗</Link></div>
        <div className="practice-stories">{articles.slice(0, 2).map(article => <a href={article.href} key={article.href} target="_blank" rel="noreferrer"><Photo name={article.image} alt={article.title} sizes="(max-width: 799px) 100vw, 44vw" /><div><p>{article.category} / {article.date}</p><h3>{article.title}<span aria-hidden="true">↗</span></h3><p>{article.summary}</p></div></a>)}</div>
      </section>
    </ScrollComposition>
  );
}
