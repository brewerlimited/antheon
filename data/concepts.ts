export const concepts = [
  {
    slug: "pioneer-bros",
    name: "Pioneer Bros Scaffolding",
    category: "Scaffolding & Construction",
    summary: "Real work, considered motion and a clearer way to plan the access.",
    image: "/previews/pioneer-bros/assets/pioneer/hero-scaffold.webp",
    imageAlt: "Pioneer Bros Scaffolding design concept with original project photography, blue branding and a cinematic hero.",
    description: "An independent website redesign concept for Pioneer Bros Scaffolding, combining its original branding and real project photography with a cinematic homepage and an interactive scaffold enquiry builder.",
    decisions: [
      "Original photography, blue branding and a floating glass header establish a distinctive first impression.",
      "Alternating gallery entrances and subtle parallax bring the company’s work into focus.",
      "A visual scaffold builder turns building and access selections into a structured enquiry brief.",
    ],
  },
  {
    slug: "paye",
    name: "PAYE Stonework & Restoration",
    category: "Heritage & Architecture",
    summary: "Monumental photography. A continuous story of stone, craft and conservation.",
    image: "/images/concepts/paye-hero.webp",
    imageAlt: "PAYE website concept with distinctive sans serif typography and a monumental National Gallery photograph.",
    description: "An independent architectural website concept for PAYE Stonework & Restoration. Real project photography moves through an uninterrupted sequence of full-screen landscapes, with restrained typography and close studies of the craft.",
    decisions: [
      "Five enormous landscape photographs hand directly into one another as the visitor scrolls, with project captions held in place.",
      "Bricolage Grotesque headings and Instrument Sans reading text bring character to a warm, restrained visual identity.",
      "A hand-carved stone detail grows to fill the screen, connecting the scale of the building to the skill of the craftsperson.",
    ],
  },
  {
    slug: "intimate-detail",
    name: "Intimate Detail",
    category: "Automotive",
    summary: "A cinematic approach to specialist automotive care.",
    image: "/images/concepts/intimate-detail-hero.webp",
    imageAlt: "Intimate Detail website concept with a dark automotive hero and oversized editorial typography.",
    description: "A website concept for an automotive detailing business, using dramatic photography and a restrained palette to put the quality of the finish at the centre of the experience.",
    decisions: [
      "Large automotive imagery establishes the visual direction immediately.",
      "A clear hierarchy gives treatments and service information room to breathe.",
      "A considered enquiry journey connects the work to the next step.",
    ],
  },
  {
    slug: "eventco",
    name: "Eventco Marquees",
    category: "Events & Hospitality",
    summary: "An atmospheric setting for occasions worth remembering.",
    image: "/images/concepts/eventco-hero.webp",
    imageAlt: "Eventco Marquees website concept featuring marquee photography and elegant event-led typography.",
    description: "A design exploration for a marquee business, balancing the atmosphere of an event with the practical details people need when planning one.",
    decisions: [
      "Immersive event photography helps visitors picture their own occasion.",
      "Editorial layouts make space for both inspiration and planning information.",
      "A consistent visual language connects the marquee collection and enquiry journey.",
    ],
  },
  {
    slug: "pride-flooring",
    name: "Pride Flooring",
    category: "Interiors & Trade",
    summary: "A confident, image-led direction for a flooring specialist.",
    image: "/images/concepts/pride-flooring-hero.webp",
    imageAlt: "Pride Flooring website concept with a red brand accent and a full-width interior photograph.",
    description: "A flooring website concept that gives materials, craftsmanship and finished spaces a more prominent role, with a clear route from inspiration to enquiry.",
    decisions: [
      "A strong red accent brings continuity to navigation and calls to action.",
      "Interior photography shows flooring in the context of a complete space.",
      "Clear service categories help visitors find the work relevant to them.",
    ],
  },
  {
    slug: "surefix-interiors",
    name: "Surefix Interiors",
    category: "Interiors & Construction",
    summary: "A bold, animated showcase for specialist interiors and craftsmanship.",
    image: "/images/concepts/surefix-interiors-hero.webp",
    imageAlt: "Surefix Interiors homepage concept with full-width interior photography, oversized typography and red accents.",
    description: "A website design concept for Surefix Interiors, combining architectural photography, interactive service selectors and considered motion to showcase specialist interior work.",
    decisions: [
      "Full-width photography and bold typography establish a confident first impression.",
      "Interactive service selectors connect each area of expertise with the work behind it.",
      "Scroll reveals, subtle parallax and responsive hover states bring the page to life.",
    ],
  },
  {
    slug: "hamilton-flooring",
    name: "Hamilton Flooring",
    category: "Commercial Flooring",
    summary: "An expressive, scroll-led story about the spaces beneath our feet.",
    image: "/images/concepts/hamilton-flooring-hero.webp",
    imageAlt: "Hamilton Commercial Flooring concept with oversized type and architectural flooring photography.",
    description: "A design concept for Hamilton Commercial Flooring, bringing materials and completed spaces together in a continuous, animated story.",
    decisions: [
      "Scroll-led scenes reveal the photography and guide the story at the visitor’s pace.",
      "Interactive material tabs give each flooring finish its own space.",
      "Warm tones and architectural typography reflect the craft behind the work.",
    ],
  },
  {
    slug: "anchor-flooring",
    name: "Anchor Flooring",
    category: "Specialist Trade",
    summary: "Bold typography and a direct approach to specialist flooring.",
    image: "/images/concepts/anchor-flooring-hero.webp",
    imageAlt: "Anchor Flooring homepage design concept with a strong visual identity and flooring imagery.",
    description: "A confident website direction for Anchor Flooring, presenting specialist services and project photography with a clear, practical hierarchy.",
    decisions: [
      "Distinctive typography establishes the business’s identity from the first screen.",
      "Project imagery connects the services to the spaces they help create.",
      "Considered motion adds depth without interrupting the path through the page.",
    ],
  },
] as const;

export type Concept = (typeof concepts)[number];
// Curated homepage selection stays stable as the main collection grows.
export const featuredConcepts = ["pioneer-bros", "paye", "eventco"].map(
  (slug) => concepts.find((concept) => concept.slug === slug)!,
);
export const additionalConcepts = concepts.filter(
  (concept) => !featuredConcepts.some((featured) => featured.slug === concept.slug),
);
