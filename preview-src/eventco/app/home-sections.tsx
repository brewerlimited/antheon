import { ArrowUpRight } from 'lucide-react';
import { CTA, Steps, Testimonial } from './editorial';
import { extraServices } from './content';
import { CollectionExplorer, OrangeryExperience } from './experience';

const occasions = [
  { title:'Weddings', image:'clear-roof-wedding.jpg', alt:'Sunlit marquee wedding with wooden dining tables', href:'/weddings', sub:'A day that is entirely yours.' },
  { title:'Corporate & events', image:'corporate-night.jpg', alt:'Illuminated corporate event marquee at night', href:'/corporate-events', sub:'Make an unforgettable impression.' },
  { title:'Event essentials', image:'classic-wedding.jpg', alt:'Elegant wedding furniture and table setting', href:'/event-essentials', sub:'Every detail, beautifully considered.' },
];

export function HomeSections() {
  return <>
    <section className="wrap home-occasions"><div className="section-heading"><div><div className="eyebrow">Made for your moment</div><h2>What brings<br/><em>you together?</em></h2></div><p>Big ideas. Intimate gatherings.<br/>Find a space that feels like you.</p></div><div className="occasion-grid">{occasions.map((item,index)=><a className="occasion-card" key={item.href} href={item.href}><img src={'/previews/eventco/images/'+item.image} alt={item.alt} width="700" height="900" loading="lazy"/><span className="occasion-index">0{index+1}</span><div className="occasion-content"><span className="eyebrow">Your occasion</span><h3>{item.title}</h3><div><span>{item.sub}</span><span className="occasion-arrow"><ArrowUpRight size={23}/></span></div></div></a>)}</div></section>
    <CollectionExplorer/>
    <OrangeryExperience/>
    <div className="soft-surface"><Steps/></div>
    <Testimonial/>
    <section className="wrap other-services"><div className="eyebrow">There’s more to Eventco</div><div className="other-links">{extraServices.map(item=><a href={'/'+item.slug} key={item.slug}><h3>{item.title}</h3><ArrowUpRight/></a>)}</div></section>
    <CTA/>
  </>;
}
