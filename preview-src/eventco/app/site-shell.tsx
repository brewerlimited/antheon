'use client';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ArrowUpRight, Menu } from 'lucide-react';
import { Sheet, SheetTrigger, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet';

const nav = [['Marquees','/marquees'],['Weddings','/weddings'],['Corporate & events','/corporate-events'],['Event essentials','/event-essentials']];
const menuItems = [
  { label:'Home', href:'/', image:'coastal-marquee.jpg' },
  { label:'Marquees', href:'/marquees', image:'orangery-daylight.jpg' },
  { label:'Weddings', href:'/weddings', image:'clear-roof-wedding.jpg' },
  { label:'Corporate & events', href:'/corporate-events', image:'corporate-night.jpg' },
  { label:'Event essentials', href:'/event-essentials', image:'classic-wedding.jpg' },
  { label:'Contact', href:'/contact', image:'orangery-evening.jpg' },
];
export function Brand(){return <a className="brand" href="/" aria-label="Eventco Marquees home"><img src="/previews/eventco/images/eventco-logo.png" width="1437" height="794" alt="Eventco Marquees"/></a>}
export function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [menuImage, setMenuImage] = useState('clear-roof-wedding.jpg');
  return <header className="site-header" data-home={path === '/'}>
    <Brand/>
    <nav className="desktop-nav" aria-label="Main navigation">{nav.map(([label,href])=><a key={href} href={href} aria-current={path.startsWith(href)?'page':undefined}>{label}</a>)}</nav>
    <div className="header-right"><a className="button header-cta" href="/contact">Plan your event<ArrowUpRight/></a>
      <Sheet open={open} onOpenChange={setOpen}><SheetTrigger className="menu-toggle" aria-label="Open navigation menu"><span>Menu</span><Menu size={23}/></SheetTrigger>
        <SheetContent className="mobile-menu"><SheetTitle className="sr-only">Explore Eventco</SheetTitle><SheetDescription className="sr-only">Find your occasion, explore the collection, or get in touch.</SheetDescription>
          <div className="menu-top"><Brand/><span className="eyebrow">A setting for every story</span></div>
          <div className="menu-body"><div className="menu-photo" aria-hidden="true"><img key={menuImage} src={'/previews/eventco/images/' + menuImage} alt=""/><span>Your vision.<br/><em>Made possible.</em></span></div>
            <nav className="mobile-links" aria-label="All pages">{menuItems.map((item,index)=><a key={item.href} href={item.href} aria-current={path===item.href?'page':undefined} onMouseEnter={()=>setMenuImage(item.image)} onFocus={()=>setMenuImage(item.image)} onClick={()=>setOpen(false)}><span className="menu-number">0{index+1}</span><span>{item.label}</span><ArrowUpRight/></a>)}</nav>
          </div>
          <div className="mobile-contact"><span>Based in Northern Ireland.<br/>Creating events across Ireland & the UK.</span><div><a href="tel:+442827657711">028 2765 7711</a><a href="mailto:info@eventcomarquees.com">info@eventcomarquees.com</a></div></div>
        </SheetContent>
      </Sheet>
    </div>
    <span className="reading-progress" aria-hidden="true"/>
  </header>;
}
export function Footer(){return <footer className="footer"><div className="wrap footer-grid"><div><Brand/><p style={{maxWidth:240,marginTop:25}}>Thoughtfully created spaces.<br/>Extraordinary occasions.</p></div><div><div className="eyebrow">Explore</div><div className="footer-links">{nav.map(([label,href])=><a key={href} href={href}>{label}</a>)}</div></div><div><div className="eyebrow">More from Eventco</div><div className="footer-links"><a href="/industrial-structures">Industrial structures</a><a href="/luxury-loo-hire">Luxury loo hire</a><a href="/stage-hire">Stage hire</a><a href="/contact">Get in touch</a></div></div><div><div className="eyebrow">Let’s make it happen</div><div className="footer-links"><a href="tel:+442827657711">028 2765 7711</a><a href="mailto:info@eventcomarquees.com">info@eventcomarquees.com</a></div><p className="footer-address">93A Anticur Road, Dunloy<br/>Ballymena, BT44 9DW<br/>Northern Ireland</p></div></div><div className="footer-signature" aria-hidden="true">eventco<span>®</span></div><div className="wrap footer-bottom"><span>© {new Date().getFullYear()} Eventco Marquees</span><span>Website concept · <a href="https://eventcomarquees.com/" target="_blank" rel="noreferrer">Visit current website ↗</a></span></div></footer>}
