export const concepts = [
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
  {
    slug: "hs-flooring",
    name: "HS Flooring",
    category: "Interiors & Flooring",
    summary: "A refined, tactile direction for Harvey Simon Flooring.",
    image: "/images/concepts/hs-flooring-hero.webp",
    imageAlt: "Harvey Simon Flooring homepage concept with elegant interior photography and a curated material palette.",
    description: "A website design concept for Harvey Simon Flooring, combining interior inspiration, material exploration and a more personal route to choosing a floor.",
    decisions: [
      "Interior photography puts the materials in the context of everyday spaces.",
      "Interactive exploration makes the collection feel approachable and personal.",
      "A restrained palette and careful spacing give the products room to speak.",
    ],
  },
] as const;

export type Concept = (typeof concepts)[number];
export const featuredConcepts = concepts.slice(0, 3);
