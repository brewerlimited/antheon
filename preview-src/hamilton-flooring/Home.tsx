'use client';
/* eslint-disable @next/next/no-img-element -- This standalone preview runs without a Next image server. */

import { useEffect, useRef, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';

const materials = [
  {id:'vinyl',name:'Vinyl & LVT',image:'herringbone.jpg',line:'The freedom to find your pattern.',text:'From crisp herringbone to flowing plank layouts. Versatile finishes, carefully set out for the way your space works.',tag:'VERSATILE / PRECISE / PRACTICAL'},
  {id:'tile',name:'Ceramic & timber',image:'holiday-inn.jpg',line:'A meeting of materials.',text:'Natural character meets precise geometry. Considered transitions, detailed cuts and a finish that brings the whole room together.',tag:'CHARACTER / DETAIL / DURABILITY'},
  {id:'safety',name:'Safety & soft flooring',image:'gym.jpg',line:'Performance in every step.',text:'Safety vinyl, carpet tiles and rubber flooring for demanding spaces. From busy workplaces to changing rooms and studio floors.',tag:'COMFORT / GRIP / PERFORMANCE'},
];
const projects = [
  {name:'Wagamama',place:'Coventry',category:'HOSPITALITY',image:'wagamama.jpg',text:'A complete restaurant foundation. Ceramic tiles, timber accents and practical vinyl, delivered in two weeks.',url:'wagamama.htm'},
  {name:'Holiday Inn',place:'Leicester',category:'HOSPITALITY',image:'holiday-inn.jpg',text:'Hexagonal ceramics meet plank vinyl. A considered palette of flooring across the hotel’s shared spaces.',url:'holiday-inn-leicester.htm'},
  {name:'McDonald’s',place:'Leicester',category:'RESTAURANT',image:'mcdonalds.jpg',text:'A flowing figure-of-eight, cut with precision. An intricate ceramic and timber installation for a full restaurant refit.',url:'mcdonalds.htm'},
];
const words = 'A floor is never just a floor. It’s where a space becomes a place.'.split(' ');
const clamp = (n:number,min=0,max=1)=>Math.min(max,Math.max(min,n));

export default function Home() {
 const root=useRef<HTMLElement>(null);
 const [motion,setMotion]=useState(()=>{
   const preference=!window.matchMedia('(prefers-reduced-motion: reduce)').matches;
   try{const saved=localStorage.getItem('hamilton-motion-v1');return saved===null?preference:saved==='on';}
   catch{return preference;}
 });
 const [chapter,setChapter]=useState(0);
 const [material,setMaterial]=useState('vinyl');
 useEffect(()=>{
   const query=window.matchMedia('(prefers-reduced-motion: reduce)');
   const update=()=>setMotion(!query.matches);
   query.addEventListener('change',update);return()=>query.removeEventListener('change',update);
 },[]);
 useEffect(()=>{
   if(!root.current)return;
   const el=root.current;
   const sections=Array.from(el.querySelectorAll<HTMLElement>('[data-scene]'));
   const wordEls=Array.from(el.querySelectorAll<HTMLElement>('.story-word'));
   let frame=0;
   const paint=()=>{
     frame=0; const vh=window.innerHeight;const y=window.scrollY;
     const reads=sections.map(s=>({s,r:s.getBoundingClientRect()}));
     const total=document.documentElement.scrollHeight-vh;
     el.style.setProperty('--total',String(clamp(y/total)));
     reads.forEach(({s,r})=>{
       const p=clamp(-r.top/Math.max(1,r.height-vh));
       const view=clamp((vh-r.top)/(vh+r.height));
       s.style.setProperty('--p',String(motion?p:0));
       s.style.setProperty('--view',String(motion?view:.5));
       if(s.id==='story')wordEls.forEach((w,i)=>w.style.opacity=String(!motion?1:clamp((view-.17)*3.3-i/words.length,.16,1)));
     });
     const active=reads.reduce((a,{r},i)=>r.top<vh*.55?i:a,0);setChapter(active);
   };
   const queue=()=>{if(!frame)frame=requestAnimationFrame(paint)};
   window.addEventListener('scroll',queue,{passive:true});window.addEventListener('resize',queue);paint();
   return()=>{window.removeEventListener('scroll',queue);window.removeEventListener('resize',queue);cancelAnimationFrame(frame)};
 },[motion]);
 const toggleMotion=()=>setMotion(current=>{try{localStorage.setItem('hamilton-motion-v1',!current?'on':'off')}catch{/* Storage may be unavailable inside a private preview. */}return !current});
 return <main ref={root} className={motion?'motion-on':'motion-off'}>
  <a className="skip-link" href="#story">Skip to content</a>
  <div className="reading-progress" aria-hidden="true"/>
  <header className="header"><a href="#top" className="brand" aria-label="Hamilton Commercial Flooring home">hamilton<span>COMMERCIAL FLOORING</span></a><nav aria-label="Main navigation"><a href="#story">Our approach</a><a href="#work">Selected work</a><a className="contact-link" href="#contact">Let’s talk <span>↗</span></a></nav></header>
  <aside className="chapter-nav" aria-label="Story chapters">{['top','story','materials','work','craft','contact'].map((id,i)=><a key={id} href={`#${id}`} className={chapter===i?'active':''} aria-label={`Go to ${['the beginning','our approach','materials','selected work','our craft','contact'][i]}`} aria-current={chapter===i?'location':undefined}><span>{String(i+1).padStart(2,'0')}</span><i/></a>)}</aside>
  <button className="motion-control" onClick={toggleMotion} aria-pressed={motion}><span aria-hidden="true">{motion?'Ⅱ':'▷'}</span> Motion {motion?'on':'off'}</button>
  <section id="top" className="hero" data-scene>
   <div className="hero-stage">
    <div className="eyebrow hero-kicker"><i/> BUILT ON EXPERIENCE. OPEN TO POSSIBILITY.</div>
    <h1 className="hero-title">Extraordinary<br/><span>starts below.</span></h1>
    <div className="hero-photo"><img src="/previews/hamilton-flooring/images/hero.jpg" alt="Precision fitted tiles meeting warm timber in Hamilton’s original project photography" fetchPriority="high"/><div className="photo-shade"/><div className="hero-reveal"><span className="eyebrow">THE START OF SOMETHING EXTRAORDINARY</span><p>Every space.<br/>Every step.<br/><em>Considered.</em></p></div></div>
    <div className="hero-small"><img src="/previews/hamilton-flooring/images/pattern.jpg" alt="Geometric patterned flooring installed at Harris & Hoole"/><span>DETAIL MAKES THE DIFFERENCE.</span></div>
    <div className="hero-aside">A foundation for<br/>everything that follows.<br/><span>Commercial flooring.<br/>UK & Ireland.</span></div>
    <div className="hero-bottom"><a href="#story">SCROLL TO EXPLORE <span>↓</span></a><span>25+ YEARS OF CRAFT, UNDERFOOT.</span><span>01 — THE FOUNDATION</span></div>
   </div>
  </section>
  <section id="story" className="intro" data-scene>
   <div className="section-top"><span className="eyebrow">01 / A DIFFERENT PERSPECTIVE</span><span className="tiny-cross" aria-hidden="true">+</span></div>
   <h2 className="story-sentence">{words.map((word,i)=><span key={i} className={`story-word ${i>10?'copper':''}`}>{word} </span>)}</h2>
   <div className="intro-bottom"><div className="experience"><strong>25<span>+</span></strong><span>YEARS OF EXPERIENCE.<br/>A FAMILY-RUN FOUNDATION.</span></div><div><p>Before the first guest. Before the morning rush. Before a business opens its doors. We create the foundation for everything that follows.</p><p className="muted">Hamilton supplies and fits commercial flooring across the UK and Ireland. Experienced people, thoughtful preparation and pride in every finish.</p><a className="text-link" href="#materials">Discover what’s underfoot <span>↘</span></a></div></div>
   <div className="moving-type" aria-hidden="true">EXPERTISE IN EVERY LAYER. </div>
  </section>
  <section id="materials" className="materials" data-material={material} data-scene>
   <div className="section-top"><span className="eyebrow">02 / MATERIAL POSSIBILITIES</span><span>MADE FOR THE WAY YOU MOVE</span></div>
   <div className="materials-heading"><h2>Feel the<br/><em>difference.</em></h2><p>Beautiful on the surface.<br/>Purposeful in every layer.</p></div>
   <Tabs value={material} onValueChange={value=>setMaterial(String(value))} className="material-tabs"><TabsList className="material-list" variant="line" aria-label="Explore flooring materials">{materials.map((m,i)=><TabsTrigger className="material-tab" key={m.id} value={m.id}><small>0{i+1}</small>{m.name}<span>↗</span></TabsTrigger>)}</TabsList><div className="material-panels">{materials.map(m=><TabsContent key={m.id} value={m.id} aria-hidden={material!==m.id} className="material-panel"><div className="material-image"><img decoding="async" src={`/previews/hamilton-flooring/images/${m.image}`} alt={`${m.name} from Hamilton’s completed installations`}/><span className="image-index">H / MATERIAL STUDY</span></div><div className="material-copy"><span className="eyebrow">{m.tag}</span><h3>{m.line}</h3><p>{m.text}</p><a href="#contact" className="text-link">Find your finish <span>↗</span></a></div></TabsContent>)}</div></Tabs>
  </section>
  <section className="trusted" aria-label="Selected Hamilton clients"><span className="eyebrow">FOUNDATIONS FOR FAMILIAR NAMES</span><div className="client-window"><div className="client-track">{[0,1].map(n=><div key={n} aria-hidden={n===1?true:undefined}><span className="client-serif">wagamama</span><span className="client-heavy">McDonald’s</span><span className="client-serif italic">Holiday Inn</span><span className="client-heavy">STARBUCKS</span><span>PureGym</span><span className="client-serif">Holland & Barrett</span></div>)}</div></div></section>
  <section id="work" className="work" data-scene><div className="work-stage"><div className="work-header"><div><span className="eyebrow">03 / SPACES WITH STORIES</span><h2>On solid <em>ground.</em></h2></div><span className="work-direction">SCROLL TO DISCOVER <span>⟶</span></span></div><div className="project-track">{projects.map((p,i)=><article className="project" key={p.name}><a href={`https://www.hamiltoncommercialflooring.co.uk/case-studies/${p.url}`} target="_blank" rel="noreferrer" className="project-image" aria-label={`Read the original ${p.name} case study, opens in a new tab`}><img src={`/previews/hamilton-flooring/images/${p.image}`} alt={`${p.name} ${p.place}, flooring installed by Hamilton`} loading="lazy"/><span className="project-number">0{i+1}</span><span className="round-arrow">↗</span></a><div className="project-meta"><h3>{p.name}</h3><span>{p.place} / {p.category}</span></div><p>{p.text}</p></article>)}</div><div className="work-footer"><span>REAL PROJECTS. LASTING IMPRESSIONS.</span><span>UK & IRELAND <i>↗</i></span></div></div></section>
  <section id="craft" className="craft" data-scene><div className="craft-image"><img src="/previews/hamilton-flooring/images/hero.jpg" alt="Detailed tile installation and finishing" loading="lazy"/><div className="craft-image-label">IT’S WHAT’S UNDERNEATH<br/>THAT SETS US APART.</div></div><div className="craft-copy"><span className="eyebrow">04 / FROM FIRST PLAN TO FINAL FINISH</span><h2>Nothing<br/>overlooked.<br/><em>Everything<br/>underfoot.</em></h2><div className="process"><div><span>01</span><h3>Prepare with purpose.</h3><p>A great finish begins beneath the surface. We take care of the floor preparation that makes it possible.</p></div><div><span>02</span><h3>Fit with precision.</h3><p>Fit-only or supply-and-fit. Skilled operatives with CSCS cards and Asbestos Awareness Certificates.</p></div><div><span>03</span><h3>Finish with pride.</h3><p>Every junction, edge and transition considered. Workmanship built for the life of your space.</p></div></div></div></section>
  <section id="contact" className="contact" data-scene><div className="section-top"><span className="eyebrow">05 / YOUR NEXT CHAPTER</span><a href="#top" className="back-top">BACK TO THE TOP ↑</a></div><p className="contact-intro">Something extraordinary starts with a conversation.</p><a className="contact-headline" href="mailto:info@hamiltoncommercialflooring.co.uk"><span>Let’s make<br/><em>ground.</em></span><span className="contact-arrow">↗</span></a><div className="contact-details"><a href="mailto:info@hamiltoncommercialflooring.co.uk">info@hamiltoncommercialflooring.co.uk ↗</a><a href="tel:+447884313179">+44 (0)7884 313 179 ↗</a><p>22 Tunstall Gardens, Redcar<br/>Cleveland, TS10 2TR</p></div><footer><a className="brand" href="#top">hamilton<span>COMMERCIAL FLOORING</span></a><span>FAMILY RUN. NATIONWIDE REACH.</span><a href="https://www.hamiltoncommercialflooring.co.uk/" target="_blank" rel="noreferrer">Original website & project photography ↗</a></footer></section>
 </main>
}
