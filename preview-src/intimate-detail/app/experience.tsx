'use client';

import { useEffect, useRef, useState, type SyntheticEvent } from 'react';
import {
  ArrowUpRight,
  ArrowRight,
  Check,
  Plus,
  Menu,
  Mail,
  Pause,
  Play,
} from 'lucide-react';
import Image from 'next/image';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const services = [
  {
    title: 'Ceramic protection',
    label: 'PROTECT',
    image: '/previews/intimate-detail/images/ceramic.jpg',
    alt: 'Green McLaren with reflective paintwork and carbon fibre at IntimateDetail',
    intro:
      'An invisible layer. An unmistakable difference. Deep gloss and lasting protection for the road ahead.',
    description:
      'Protect the finish you love with professionally applied IGL ceramic coatings. As an accredited Master Installer, we select a coating to suit your car, its use and the way you care for it.',
    items: [
      'Paintwork preparation and coating',
      'Protection for wheels, glass and trim',
      'Leather and fabric coating options',
      'New car protection packages',
    ],
    note: 'Coating choice and durability depend on the package and aftercare. We’ll talk you through the right option for your car.',
  },
  {
    title: 'Paint correction',
    label: 'REFINE',
    image: '/previews/intimate-detail/images/paint-correction.jpg',
    alt: 'Real paint correction comparison showing swirl marks beside refined glossy paint',
    intro:
      'Restore clarity. Reveal depth. Meticulous machine polishing to bring your paintwork back to its best.',
    description:
      'Swirls, marring and tired paintwork can hide a beautiful finish. We assess the paint, remove contamination and choose an appropriate correction process to restore clarity and gloss.',
    items: [
      'Safe wash and paint decontamination',
      'Single-stage gloss enhancement',
      'Two-stage correction for deeper defects',
      'Protective sealant, with ceramic upgrades',
    ],
    note: 'Every finish is assessed individually. The achievable correction depends on the condition and thickness of the paint.',
  },
  {
    title: 'Signature detailing',
    label: 'RESTORE',
    image: '/previews/intimate-detail/images/detailing.jpg',
    alt: 'A gloved detailer carefully finishing white automotive paint with a microfibre cloth',
    intro:
      'Inside. Outside. Every last detail. A considered reset for a car that deserves exceptional care.',
    description:
      'A thorough, personal approach to your car’s presentation. Our signature detail brings together exterior preparation, a light gloss enhancement and careful interior cleaning.',
    items: [
      'Wheels, arches and brake components cleaned',
      'Exterior wash and decontamination',
      'Single-stage machine polish',
      'Interior, leather, glass and luggage area care',
    ],
    note: 'Ongoing maintenance can help preserve the finish, with weekly, fortnightly or monthly options.',
  },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <a href="#top" className="brand" aria-label="Intimate Detail home">
        <span className="brand-name">
          intimate<span>detail</span>
        </span>
        <span className="brand-descriptor">PRECISION AUTOMOTIVE CARE</span>
      </a>
      <nav aria-label="Main navigation">
        <a href="#services">Our expertise</a>
        <a href="#work">Selected work</a>
        <a href="#studio">The studio</a>
      </nav>
      <div className="header-actions">
        <a
          className="button button-small"
          data-reactive="magnetic"
          href="#contact"
        >
          Discuss your car <ArrowUpRight size={17} />
        </a>
        <Dialog>
          <DialogTrigger className="mobile-menu" aria-label="Open navigation">
            <Menu size={23} />
          </DialogTrigger>
          <DialogContent className="mobile-navigation">
            <DialogTitle>Explore Intimate Detail</DialogTitle>
            <DialogDescription>
              Automotive detailing, redefined.
            </DialogDescription>
            <nav aria-label="Mobile navigation">
              {[
                ['Our expertise', '#services'],
                ['Selected work', '#work'],
                ['The studio', '#studio'],
                ['Your enquiry', '#contact'],
              ].map(([name, href]) => (
                <DialogClose
                  key={href}
                  render={<a href={href} aria-label={name} />}
                >
                  {name}
                  <ArrowUpRight size={22} />
                </DialogClose>
              ))}
            </nav>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}

export function ServiceCards() {
  return (
    <>
      <Tabs
        defaultValue={0}
        orientation="vertical"
        className="treatment-editorial"
      >
        <TabsList
          variant="line"
          className="treatment-index"
          aria-label="Our detailing treatments"
        >
          {services.map((service, i) => (
            <TabsTrigger
              key={service.title}
              value={i}
              className="treatment-row"
              data-reactive="glow"
            >
              <span className="treatment-count">0{i + 1}</span>
              <span className="treatment-row-content">
                <span className="treatment-category">{service.label}</span>
                <span className="treatment-name">{service.title}</span>
                <span className="treatment-summary">{service.intro}</span>
              </span>
              <ArrowUpRight className="treatment-arrow" size={24} />
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="treatment-stage">
          {services.map((service, i) => (
            <TabsContent
              key={service.title}
              value={i}
              className="treatment-panel"
            >
              <div className="treatment-image" data-reactive="glow">
                <Image
                  unoptimized
                  src={service.image}
                  alt={service.alt}
                  loading="lazy"
                  width={900}
                  height={1100}
                />
                <span className="image-edition">
                  THE TREATMENTS <span>NO. 0{i + 1}</span>
                </span>
                <span className="treatment-image-title">
                  {service.label.toLowerCase()}
                  <i>.</i>
                </span>
              </div>
              <Dialog>
                <DialogTrigger
                  className="treatment-explore"
                  data-reactive="glow"
                >
                  Discover {service.title.toLowerCase()}{' '}
                  <ArrowUpRight size={20} />
                </DialogTrigger>
                <DialogContent className="service-dialog">
                  <span className="eyebrow">
                    0{i + 1} / {service.label}
                  </span>
                  <DialogTitle className="dialog-title">
                    {service.title}
                  </DialogTitle>
                  <DialogDescription className="dialog-description">
                    {service.description}
                  </DialogDescription>
                  <ul className="treatment-list">
                    {service.items.map((item) => (
                      <li key={item}>
                        <Check size={17} />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="dialog-note">{service.note}</p>
                  <DialogClose
                    render={
                      <a
                        href="#contact"
                        className="button"
                        aria-label="Discuss your car"
                      />
                    }
                  >
                    Discuss your car <ArrowUpRight size={18} />
                  </DialogClose>
                </DialogContent>
              </Dialog>
            </TabsContent>
          ))}
        </div>
      </Tabs>
      <div className="maintenance-line" data-reveal>
        <p>
          <span className="status-dot" /> A beautiful finish deserves to stay
          that way.
        </p>
        <a href="#contact" className="text-link" data-reactive="magnetic">
          Discover ongoing maintenance <ArrowUpRight size={18} />
        </a>
      </div>
    </>
  );
}

const projects = [
  {
    image: '/previews/intimate-detail/images/portfolio-one.jpg',
    name: 'Ferrari 488',
    label: 'PERFORMANCE, PRESERVED',
    alt: 'Red Ferrari 488 photographed outside with the IntimateDetail van',
  },
  {
    image: '/previews/intimate-detail/images/ceramic.jpg',
    name: 'McLaren',
    label: 'THE FINER DETAILS',
    alt: 'Lime green McLaren with polished paint and carbon fibre in the studio',
  },
  {
    image: '/previews/intimate-detail/images/portfolio-two.jpg',
    name: 'Ford Escort Mk II',
    label: 'AN ICON, REFINED',
    alt: 'Pristine white Ford Escort Mk II in the IntimateDetail workshop',
  },
];
export function WorkGallery() {
  return (
    <div className="work-grid">
      {projects.map((project, i) => (
        <Dialog key={project.name}>
          <figure className={`work-item work-item-${i}`} data-reveal>
            <div className="work-meta">
              <span>FIG. 0{i + 1}</span>
              <span>{project.label}</span>
            </div>
            <DialogTrigger
              className="work-trigger"
              data-reactive="tilt"
              aria-label={`View ${project.name} photograph`}
            >
              <Image
                unoptimized
                src={project.image}
                alt={project.alt}
                loading="lazy"
                width={1400}
                height={1200}
              />
              <span className="work-view">
                Look closer <Plus size={18} />
              </span>
            </DialogTrigger>
            <figcaption>
              <span className="work-name">{project.name}</span>
              <span className="work-caption-label">INTIMATE DETAIL</span>
              <ArrowUpRight size={22} />
            </figcaption>
          </figure>
          <DialogContent className="gallery-dialog">
            <DialogTitle className="sr-only">{project.name}</DialogTitle>
            <DialogDescription className="sr-only">
              {project.alt}. From the IntimateDetail portfolio.
            </DialogDescription>
            <Image
              unoptimized
              src={project.image}
              alt={project.alt}
              width={1920}
              height={1400}
            />
            <p>
              {project.name}
              <span>INTIMATE DETAIL / SELECTED WORK</span>
            </p>
          </DialogContent>
        </Dialog>
      ))}
      <div className="work-postscript" data-reveal>
        <span className="eyebrow">FROM CLASSIC TO EXOTIC</span>
        <p>
          Different cars.
          <br />
          The same <span className="type-accent">obsession.</span>
        </p>
        <a href="#contact" className="text-link" data-reactive="magnetic">
          Let’s talk about yours <ArrowUpRight size={18} />
        </a>
      </div>
    </div>
  );
}

export function Questions() {
  const questions = [
    [
      'Which treatment is right for my car?',
      'Tell us about your car, its condition and the finish you want. We’ll assess what it needs and explain the options, from a gloss enhancement to a full detail and ceramic protection.',
    ],
    [
      'Can you protect a brand-new car?',
      'Yes. New car protection packages combine careful preparation with ceramic coatings for suitable surfaces. Get in touch before delivery to discuss your car and arrange the right treatment.',
    ],
    [
      'How much will my detail cost?',
      'Every car and finish is different, so we provide a personal quote based on its size, condition and the treatment required. Start with a few details below or call us to discuss your vehicle.',
    ],
    [
      'Where will my car be looked after?',
      'At our clean, secure studio in Ledsham, Cheshire, a few miles from M53 Junction 5. The studio has full LED lighting, air conditioning and CCTV, and vehicles in our care are fully insured.',
    ],
  ];
  return (
    <Accordion className="faq-list">
      {questions.map(([q, a], i) => (
        <AccordionItem key={q} value={i}>
          <AccordionTrigger>{q}</AccordionTrigger>
          <AccordionContent>
            <p>{a}</p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export function ContactForm() {
  const [service, setService] = useState('Help me choose');
  const [emailLink, setEmailLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [enquiry, setEnquiry] = useState('');
  const [copyError, setCopyError] = useState(false);
  function prepare(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const field = (name: string) => {
      const value = data.get(name);
      return typeof value === 'string' ? value.trim() : '';
    };
    const body = `Hello Phil,\n\nI’d like to discuss a detail for my car.\n\nName: ${field('name')}\nEmail: ${field('email')}\nPhone: ${field('phone') || 'Not provided'}\nVehicle: ${field('vehicle')}\nYear / age: ${field('age') || 'Not provided'}\nLocation: ${field('location') || 'Not provided'}\nInterested in: ${service}\nCondition and goals: ${field('message') || 'Please advise'}\n\nThank you.`;
    const url = `mailto:phil@intimatedetail.co.uk?subject=${encodeURIComponent(`Detailing enquiry — ${field('vehicle')}`)}&body=${encodeURIComponent(body)}`;
    setEnquiry(body);
    setEmailLink(url);
    setCopied(false);
    setCopyError(false);
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(enquiry);
      setCopied(true);
      setCopyError(false);
    } catch {
      setCopyError(true);
    }
  }
  return (
    <form className="enquiry-form" onSubmit={prepare}>
      <div className="form-heading">
        <span className="eyebrow">YOUR CAR. YOUR FINISH.</span>
        <p>A few details. A personal recommendation.</p>
      </div>
      <div className="form-row">
        <label>
          Your name <span>*</span>
          <input
            name="name"
            autoComplete="name"
            placeholder="Alex Smith"
            required
            maxLength={100}
          />
        </label>
        <label>
          Email address <span>*</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            placeholder="alex@example.com"
            required
            maxLength={200}
          />
        </label>
      </div>
      <div className="form-row">
        <label>
          Make & model <span>*</span>
          <input
            name="vehicle"
            placeholder="e.g. Porsche 911 GTS"
            required
            maxLength={150}
          />
        </label>
        <label>
          Vehicle year
          <input name="age" placeholder="e.g. 2024" maxLength={30} />
        </label>
      </div>
      <div className="form-row">
        <label>
          Phone number
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="Your preferred contact number"
            maxLength={40}
          />
        </label>
        <label>
          Your location
          <input
            name="location"
            autoComplete="address-level2"
            placeholder="Town or postcode"
            maxLength={100}
          />
        </label>
      </div>
      <div className="form-field">
        <label id="service-label" htmlFor="service-choice">
          I’m interested in
        </label>
        <Select
          value={service}
          onValueChange={(value) => setService(value ?? 'Help me choose')}
        >
          <SelectTrigger
            id="service-choice"
            aria-labelledby="service-label"
            className="service-select"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="contact-options">
            {[
              'Help me choose',
              'Ceramic protection',
              'New car protection',
              'Paint correction',
              'Signature detailing',
              'Ongoing maintenance',
            ].map((value) => (
              <SelectItem key={value} value={value}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <label>
        Tell us about your car
        <textarea
          name="message"
          placeholder="Its condition, the finish you’re looking for, and anything else we should know…"
          rows={3}
          maxLength={1800}
        />
      </label>
      <button
        className="button contact-submit"
        data-reactive="magnetic"
        type="submit"
      >
        Prepare my enquiry <ArrowUpRight size={20} />
      </button>
      <p className="form-note">
        We’ll prepare your message for you to send from your email app.
      </p>
      <Dialog
        open={!!emailLink}
        onOpenChange={(open) => {
          if (!open) setEmailLink('');
        }}
      >
        <DialogContent className="service-dialog enquiry-dialog">
          <span className="eyebrow">ONE LAST STEP</span>
          <DialogTitle className="dialog-title">
            Your enquiry is ready.
          </DialogTitle>
          <DialogDescription className="dialog-description">
            Open your email app, review your message and send it to Phil. Your
            enquiry has not been sent yet.
          </DialogDescription>
          <a href={emailLink} className="button">
            Open email & review <Mail size={18} />
          </a>
          <button type="button" onClick={copy} className="copy-enquiry">
            {copied ? 'Enquiry copied' : 'Copy enquiry instead'}{' '}
            {copied ? <Check size={16} /> : <ArrowRight size={16} />}
          </button>
          <output className="dialog-note">
            {copyError
              ? 'Copy the text below and email it to phil@intimatedetail.co.uk.'
              : copied
                ? 'Paste your message into an email to phil@intimatedetail.co.uk.'
                : 'Prefer to talk? Call 07581 229 029.'}
          </output>
          <details className="enquiry-text">
            <summary>Review your message</summary>
            <pre>{enquiry}</pre>
          </details>
        </DialogContent>
      </Dialog>
    </form>
  );
}

export function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let frame = 0;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        observer.disconnect();
        if (
          media.matches ||
          document.documentElement.dataset.motion === 'paused'
        )
          return;
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - start) / 1200, 1);
          node.textContent = String(
            Math.round(value * (1 - Math.pow(1 - p, 3))),
          );
          if (p < 1 && document.documentElement.dataset.motion !== 'paused')
            frame = requestAnimationFrame(tick);
          else node.textContent = String(value);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);
  return (
    <span className="count-up" aria-label={String(value)}>
      <span ref={ref} aria-hidden="true">
        {value}
      </span>
    </span>
  );
}

export function MotionControl() {
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    const elements = document.querySelectorAll<HTMLElement>('[data-reveal]');
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.08 },
    );
    elements.forEach((element, index) => {
      element.style.setProperty('--reveal-delay', `${(index % 2) * 80}ms`);
      element.classList.add('reveal-ready');
      observer.observe(element);
    });
    const hero = document.querySelector<HTMLElement>('.hero');
    const header = document.querySelector<HTMLElement>('.site-header');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    let scrollFrame = 0,
      pointerFrame = 0,
      active: HTMLElement | null = null,
      clientX = 0,
      clientY = 0,
      pointerTarget: EventTarget | null = null;
    const reset = (node: HTMLElement | null) => {
      if (!node) return;
      node.style.setProperty('--shift-x', '0px');
      node.style.setProperty('--shift-y', '0px');
      node.style.setProperty('--tilt-x', '0deg');
      node.style.setProperty('--tilt-y', '0deg');
    };
    const updateScroll = () => {
      scrollFrame = 0;
      const y = window.scrollY;
      header?.classList.toggle('is-scrolled', y > 100);
      const max = root.scrollHeight - window.innerHeight;
      root.style.setProperty(
        '--page-progress',
        String(max > 0 ? Math.min(y / max, 1) : 0),
      );
      if (reduce.matches || root.dataset.motion === 'paused') return;
      if (hero && y < hero.offsetHeight + 100)
        hero.style.setProperty('--hero-scroll', `${Math.min(y * 0.12, 130)}px`);
    };
    const onScroll = () => {
      if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll);
    };
    const updatePointer = () => {
      pointerFrame = 0;
      if (reduce.matches || !fine.matches || root.dataset.motion === 'paused')
        return;
      const next =
        pointerTarget instanceof Element
          ? pointerTarget.closest<HTMLElement>('[data-reactive]')
          : null;
      if (active !== next) {
        reset(active);
        active = next;
      }
      if (active) {
        const box = active.getBoundingClientRect();
        const x = clientX - box.left,
          y = clientY - box.top;
        const nx = x / Math.max(box.width, 1) - 0.5,
          ny = y / Math.max(box.height, 1) - 0.5;
        active.style.setProperty('--pointer-x', `${x}px`);
        active.style.setProperty('--pointer-y', `${y}px`);
        active.style.setProperty('--shift-x', `${nx * 10}px`);
        active.style.setProperty('--shift-y', `${ny * 8}px`);
        active.style.setProperty('--tilt-x', `${-ny * 4}deg`);
        active.style.setProperty('--tilt-y', `${nx * 4}deg`);
      }
      if (hero && window.scrollY < hero.offsetHeight) {
        const box = hero.getBoundingClientRect();
        hero.style.setProperty('--light-x', `${clientX - box.left}px`);
        hero.style.setProperty('--light-y', `${clientY - box.top}px`);
        hero.style.setProperty(
          '--hero-x',
          `${(clientX / window.innerWidth - 0.5) * 10}px`,
        );
        hero.style.setProperty(
          '--hero-y',
          `${(clientY / window.innerHeight - 0.5) * 7}px`,
        );
      }
    };
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      clientX = event.clientX;
      clientY = event.clientY;
      pointerTarget = event.target;
      if (!pointerFrame) pointerFrame = requestAnimationFrame(updatePointer);
    };
    const onLeave = () => {
      reset(active);
      active = null;
      if (hero) {
        hero.style.setProperty('--hero-x', '0px');
        hero.style.setProperty('--hero-y', '0px');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    document.addEventListener('pointermove', onPointer, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    window.addEventListener('blur', onLeave);
    updateScroll();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(scrollFrame);
      cancelAnimationFrame(pointerFrame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      document.removeEventListener('pointermove', onPointer);
      document.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('blur', onLeave);
    };
  }, []);
  useEffect(() => {
    document.documentElement.dataset.motion = paused ? 'paused' : 'active';
  }, [paused]);
  return (
    <button
      type="button"
      className="motion-control"
      onClick={() => setPaused((value) => !value)}
      aria-pressed={paused}
    >
      {paused ? <Play size={13} /> : <Pause size={13} />}{' '}
      {paused ? 'Play motion' : 'Pause motion'}
    </button>
  );
}
