'use client';

import { useState } from 'react';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { marqueeItems } from './content';

const scenes = [
  { id: 'weddings', label: 'Weddings', image: 'orangery-evening.jpg', alt: 'The Ivy Pavilion Orangery glowing with warm light as evening falls', line: 'For the moments', emphasis: 'that stay with you.', text: 'Extraordinary marquee settings. Entirely your occasion.', link: '/weddings', cta: 'Find your wedding setting' },
  { id: 'events', label: 'Corporate & events', image: 'corporate-daylight.jpg', alt: 'Eventco hospitality marquees in the grounds of a historic country house', line: 'Make an entrance.', emphasis: 'Leave an impression.', text: 'Considered spaces for your brand, your guests and your next big occasion.', link: '/corporate-events', cta: 'Explore corporate events' },
  { id: 'essentials', label: 'The essentials', image: 'classic-wedding.jpg', alt: 'Elegant tables and flowers inside a beautifully dressed wedding marquee', line: 'It’s all in', emphasis: 'the details.', text: 'From the first chair to the finishing touches. Bring it all together.', link: '/event-essentials', cta: 'Discover event essentials' },
];

export function HeroShowcase() {
  const [scene, setScene] = useState('weddings');
  return <section className="cinema-hero" aria-label="Discover Eventco">
    <Tabs value={scene} onValueChange={value => setScene(String(value))} className="cinema-tabs">
      {scenes.map(item => <TabsContent key={item.id} value={item.id} className="cinema-panel">
        <div className="cinema-photo"><img src={'/previews/eventco/images/' + item.image} alt={item.alt} fetchPriority={item.id === 'weddings' ? 'high' : 'auto'} width="1440" height="960" /></div>
        <div className="cinema-shade" />
        <div className="cinema-copy">
          <span className="eyebrow cinema-eyebrow"><span /> Marquees & events · Ireland & the UK</span>
          <h1><span className="line-mask"><span>{item.line}</span></span><span className="line-mask"><em>{item.emphasis}</em></span></h1>
          <div className="cinema-description"><p>{item.text}</p><a className="text-link" href={item.link}>{item.cta}<ArrowUpRight /></a></div>
        </div>
        <a className="round-link cinema-orbit" href="/marquees" aria-label="Explore the marquee collection"><span>Explore<br/>the collection</span><ArrowUpRight /></a>
      </TabsContent>)}
      <div className="cinema-bottom">
        <a className="scroll-cue" href="#discover"><span className="scroll-cue-icon"><ArrowDown size={17}/></span><span>Scroll to discover</span></a>
        <TabsList className="scene-tabs" aria-label="Explore by occasion">{scenes.map((item,index) => <TabsTrigger className="scene-tab" value={item.id} key={item.id}><span className="scene-index">0{index + 1}</span><span>{item.label}</span><span className="scene-line" /></TabsTrigger>)}</TabsList>
        <span className="cinema-coordinate">Your vision.<br/>Our expertise.</span>
      </div>
    </Tabs>
  </section>;
}

export function CollectionExplorer() {
  const [active, setActive] = useState(marqueeItems[0].slug);
  return <section className="wrap section collection-section">
    <div className="section-heading"><div><div className="eyebrow">The marquee collection</div><h2>A space for<br/><em>every story.</em></h2></div><p>Three distinctive collections.<br/>A world of possibility.</p></div>
    <Tabs className="collection-explorer" orientation="vertical" value={active} onValueChange={value => setActive(String(value))}>
      <div className="collection-visual">{marqueeItems.map((item,index) => <TabsContent
        value={item.slug}
        key={item.slug}
        className="collection-panel"
        keepMounted
        // Keep both sides of the fade painted. Inactive panels remain inert via Tabs.
        hidden={false}
        aria-hidden={active !== item.slug}
        data-selected={active === item.slug ? '' : undefined}
      ><a href={'/' + item.slug} aria-label={'Explore ' + item.title}><img src={'/previews/eventco/images/' + item.image} alt={item.alt} loading="eager" decoding="async" width="1000" height="1000"/><span className="collection-image-footer"><span>0{index + 1} / {item.title}</span><span className="collection-open"><ArrowUpRight/></span></span></a></TabsContent>)}</div>
      <div className="collection-selection"><TabsList aria-label="Preview a marquee collection" className="collection-list">{marqueeItems.map((item,index) => <TabsTrigger value={item.slug} key={item.slug} className="collection-choice"><span className="collection-number">0{index+1}</span><span className="collection-wording"><span className="collection-title">{item.title === 'The Ivy Pavilion Orangery' ? 'Ivy Pavilion Orangery' : item.title}</span><span className="collection-summary">{item.description}</span></span><ArrowUpRight/></TabsTrigger>)}</TabsList><a className="text-link" href={'/' + active}>Explore this collection<ArrowUpRight/></a></div>
    </Tabs>
  </section>;
}

export function OrangeryExperience() {
  return <section className="orangery-experience">
    <div className="wrap orangery-heading"><div><div className="eyebrow">The Ivy Pavilion Orangery</div><h2>From daylight<br/>to <em>dance floor.</em></h2></div><p>Architectural glass. Beautiful natural light.<br/>A completely different atmosphere after dark.</p></div>
    <Tabs defaultValue="day" className="orangery-tabs">
      <TabsList className="ambience-switch" aria-label="View the Orangery by day or night"><TabsTrigger value="day">By day</TabsTrigger><TabsTrigger value="night">By night</TabsTrigger></TabsList>
      <TabsContent value="day" className="ambience-panel"><img src="/previews/eventco/images/orangery-daylight.jpg" alt="The Ivy Pavilion Orangery filled with daylight and dressed tables" width="900" height="600" loading="lazy"/><span className="ambience-caption">01 / Bathed in natural light</span></TabsContent>
      <TabsContent value="night" className="ambience-panel"><img src="/previews/eventco/images/orangery-evening.jpg" alt="The Ivy Pavilion Orangery with warm chandeliers and blue evening light" width="900" height="600" loading="lazy"/><span className="ambience-caption">02 / A little after-dark magic</span></TabsContent>
    </Tabs>
    <div className="wrap orangery-footer"><p>Black architectural frames, sweeping glass and a sense of occasion.</p><a className="text-link" href="/ivy-pavilion-orangery">Meet the Ivy Pavilion<ArrowUpRight/></a></div>
  </section>;
}
