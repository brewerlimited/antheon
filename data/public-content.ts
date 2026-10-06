/** Reviewed public copy. Layout, URLs, proof classifications and pricing stay controlled in code. */
export const serviceSlugs = ["web-design", "website-redesign", "seo-services", "website-care"] as const;
export type ServiceSlug = (typeof serviceSlugs)[number];

export interface ServiceDocument {
  slug: ServiceSlug;
  path: string;
  status: "published" | "draft";
  title: string;
  description: string;
  eyebrow: string;
  heading: string;
  intro: string;
  sections: { id: string; title: string; body: string[]; points?: string[] }[];
  faqs: { question: string; answer: string }[];
  proof: { label: string; href: string; kind: "concept" | "venture" | "implementation"; description: string }[];
  related: ServiceSlug[];
  /** A real editorial revision date, never a generated build timestamp. */
  updatedAt?: string;
}

export const serviceNavigation = [
  { label: "Web design", href: "/web-design" },
  { label: "Website redesign", href: "/website-redesign" },
  { label: "SEO", href: "/seo-services" },
  { label: "Website care", href: "/website-care" },
  { label: "Contact", href: "/contact" },
] as const;

export const serviceDocuments: ServiceDocument[] = [
  {
    slug: "web-design", path: "/web-design", status: "published",
    title: "Website Design & Development | Anthēon",
    description: "Considered website design and development for independent businesses. Explore Anthēon’s interactive concepts, approach and £695 website design and setup.",
    eyebrow: "Website design & development",
    heading: "A better first impression. A clearer next step.",
    intro: "A website should make the quality of your business clear. We bring distinctive design, useful service information and a straightforward enquiry journey together, with the same care on a phone as on a large screen.",
    sections: [
      { id: "who-it-is-for", title: "For businesses with something worth showing.", body: ["For independent businesses, specialist services and growing ventures that need a credible place to explain what they do. You might be launching for the first time, or finding that your current website no longer reflects the business behind it.", "For construction, interiors and trade businesses, that often means helping visitors understand your services, see the detail of your work and make a relevant enquiry. Real project photographs and accurate service information do more than generic claims."] },
      { id: "included", title: "Designed around the way people choose.", body: ["Our website design and setup includes a full design and build, responsive layouts for desktop, tablet and mobile, and website setup and launch. We agree the page list, content, functionality and any additional requirements before work starts."], points: ["A considered visual direction, shaped around your identity", "A clear structure for services, examples and enquiries", "Responsive typography, imagery and interactions", "Page titles, descriptions and a readable HTML foundation", "Launch checks for key pages, links and enquiry routes"] },
      { id: "process", title: "From the first conversation to the final details.", body: ["First, we clarify your audience, the action you want visitors to take and the content you already have. We then agree the structure and design direction, build the website and review it with you.", "Before launch, we check the agreed pages and interactions across screen sizes. We confirm the domain and hosting arrangements, and take care when connecting an existing domain so its email settings are preserved. Timing and any third-party costs are agreed for your project."] },
    ],
    faqs: [
      { question: "What does the £695 website price cover?", answer: "The published package is £695 for website design, build, responsive layouts and setup, with management and hosting at £35 per month. The page list and functionality are agreed before work begins. Ecommerce, complex integrations or substantial additional content need a separate scope; send the brief so we can confirm what fits." },
      { question: "Do I need to provide the words and photographs?", answer: "Bring any existing brand assets, service details and photographs you have permission to use. We will identify gaps while planning the website and agree who is supplying each item before the build." },
      { question: "Can you build a website for a construction or trade business?", answer: "Yes. The starting point is your actual services, customers and work. Our gallery includes independent flooring and interiors concepts that show possible design directions; they are not commissioned client projects or evidence of client results." },
      { question: "Are search optimisation and ongoing care included?", answer: "The build includes the basic page structure and metadata. Ongoing management and hosting is £35 per month. SEO Monitoring & Optimisation is a separate £149 per month service, with the work and priorities agreed for your website." },
    ],
    proof: [
      { label: "Surefix Interiors", href: "/concepts/surefix-interiors", kind: "concept", description: "Architectural photography, service selectors and considered motion in an independent interiors concept." },
      { label: "Hamilton Flooring", href: "/concepts/hamilton-flooring", kind: "concept", description: "An independent exploration of materials, project imagery and a continuous, scroll-led story." },
    ], related: ["website-redesign", "website-care", "seo-services"],
  },
  {
    slug: "website-redesign", path: "/website-redesign", status: "published",
    title: "Website Redesign for Growing Businesses | Anthēon",
    description: "Bring an outdated website closer to the business you are today. Anthēon plans considered redesigns around content, enquiries and careful URL migration.",
    eyebrow: "Website redesign",
    heading: "Keep what works. Make the rest feel like you.",
    intro: "When the business has moved forward but the website has stood still, a redesign can close the gap. We look at the existing experience before deciding what needs to change.",
    sections: [
      { id: "starting-point", title: "A clearer reason to redesign.", body: ["An outdated visual identity, awkward mobile pages or a confusing enquiry route can make a good business harder to understand. A redesign starts with those specific problems, rather than changing every page for the sake of it.", "We review your current pages, content and important journeys. Where you have access to Search Console or analytics, those records can help distinguish useful pages from assumptions. Missing data stays a question to investigate."] },
      { id: "scope", title: "A considered change, with the practical details covered.", body: ["The agreed scope can include a refreshed visual direction, a simpler page structure, revised service content and an improved enquiry journey. Existing useful material is assessed for reuse, with new photography or copy needs identified early."], points: ["Inventory of important pages and existing URLs", "Design and content decisions linked to the brief", "Responsive page layouts and interactions", "A redirect map when URLs genuinely need to change", "Checks of key forms, contact links and launch settings"] },
      { id: "migration", title: "Plan the move before the launch.", body: ["A new design should not casually discard working links. We identify pages to retain, combine or retire, and map changed URLs to relevant replacements. We also review the domain, hosting and email dependencies before any switch.", "After launch, checks focus on real HTTP responses, canonicals, the sitemap and the enquiry journey. Search visibility can change during a migration; nobody can guarantee that a redesign will preserve every ranking or produce a particular result."] },
      { id: "process", title: "Review. Design. Build. Check.", body: ["Send us the current website and what you would like it to do better. We agree the scope, plan the content and design, then build and review the replacement before an approved launch. Your current site remains the reference for what must be preserved.", "The right starting point may be a targeted improvement rather than a complete rebuild. Costs and timings follow the agreed work."] },
    ],
    faqs: [
      { question: "Can I keep my existing domain?", answer: "Usually, yes. We first check who controls the domain, where the site is hosted and which records support email or other services. A redesign does not automatically require changing the domain or nameservers." },
      { question: "Will a redesign affect my Google visibility?", answer: "It can. Changes to URLs, content, internal links and rendering can affect search performance. Keeping useful URLs, mapping necessary redirects and checking the replacement reduces avoidable disruption, but rankings cannot be guaranteed." },
      { question: "Can we improve just part of the website?", answer: "Yes, where the existing platform and implementation make that practical. Share the current website and the problem first; we can agree whether a focused change or a fuller rebuild makes more sense." },
      { question: "What should I send with my enquiry?", answer: "Your website address, the parts you want to keep, the problems you want to solve and any timing constraints. Do not send passwords or private customer data through the enquiry form." },
    ],
    proof: [
      { label: "Explore the design directions", href: "/web-design", kind: "concept", description: "Six interactive, independent concepts show our approach to visual identity and interaction. They do not claim a measured before-and-after client result." },
    ], related: ["web-design", "seo-services", "website-care"],
  },
  {
    slug: "seo-services", path: "/seo-services", status: "published",
    title: "SEO Monitoring & Optimisation | Anthēon",
    description: "Practical SEO monitoring and improvement for business websites. Understand visibility, resolve technical issues and prioritise useful changes. £149 per month.",
    eyebrow: "SEO monitoring & optimisation",
    heading: "Understand what gets found. Improve what matters.",
    intro: "Search works best when your website clearly answers the questions your customers bring. Our approach combines technical checks, useful content and measured improvements, without promises of a particular ranking.",
    sections: [
      { id: "who-it-is-for", title: "For businesses ready to work beyond the launch.", body: ["A website needs more than a place online. It needs clear service pages, accessible information and a way to understand how people find it. This service is for businesses that want to make those improvements deliberately over time.", "We begin with what your business offers, the pages already in place and the data you can provide. Search opportunities should reflect real services and customers, rather than a long list of loosely related keywords."] },
      { id: "included", title: "A practical monthly focus.", body: ["SEO Monitoring & Optimisation is £149 per month. It covers SEO performance monitoring, search visibility reviews and ongoing website optimisation. The priorities and scope are agreed for your site."], points: ["Review search visibility and relevant landing pages", "Identify technical obstacles to crawling and understanding pages", "Improve page structure, titles and useful service information", "Prioritise a manageable set of changes", "Record what changed and review the available evidence afterwards"] },
      { id: "measurement", title: "Different measures. Different meanings.", body: ["Search Console describes impressions, clicks, queries and average position in Google Search. Analytics can describe website visits and configured actions where consent and tracking allow. A recorded enquiry is a separate business event; a click on an email link is only an indication of intent.", "Access to your accounts and sufficient history are needed for meaningful reporting. Exact location-specific rank tracking, backlink databases and other paid tools are separate capabilities and costs to agree, rather than assumed inclusions."] },
      { id: "process", title: "A useful cycle of improvement.", body: ["First we establish the current position and check the foundations. Then we select a specific issue or opportunity, agree the change and implement it. We review the subsequent data in context, allowing for seasonality, small sample sizes and the time search systems need to revisit pages.", "Recommendations might involve clearer service content, a technical repair or a better enquiry route. We do not create interchangeable town pages, buy links or publish unsupported claims about your business."] },
    ],
    faqs: [
      { question: "Can you guarantee first-page rankings?", answer: "No. Search results depend on many factors outside any provider’s control. We can agree work, explain its purpose and report what the available data shows." },
      { question: "How long does SEO take?", answer: "There is no fixed result timeline. A technical correction may be seen after a recrawl; content and competitive changes can take longer to assess. We establish a baseline and avoid drawing conclusions from a few days or a handful of visits." },
      { question: "Do I need a new website first?", answer: "Not necessarily. We review what your existing website can support. Some issues can be resolved within the current site; a redesign is only a separate recommendation if the constraints justify it." },
      { question: "What access will you need?", answer: "Typically website access and suitable permissions for Search Console and Analytics, if those accounts exist. Use account invitations or approved connection flows, rather than sharing passwords. We will identify any missing setup with you." },
    ],
    proof: [
      { label: "See our website approach", href: "/web-design", kind: "concept", description: "Inspect the structure and interaction of our independent website concepts. They demonstrate design work, not SEO ranking or lead-generation results." },
    ], related: ["web-design", "website-redesign", "website-care"],
  },
  {
    slug: "website-care", path: "/website-care", status: "published",
    title: "Website Management, Hosting & Care | Anthēon",
    description: "Keep your website looked after with Anthēon’s £35 per month management and hosting, including ongoing updates and maintenance within an agreed scope.",
    eyebrow: "Website management & hosting",
    heading: "A website is never quite finished. We keep it looked after.",
    intro: "When your services, work or contact details change, your website should keep up. Ongoing care gives those practical updates a clear home, alongside the hosting and maintenance that support the site.",
    sections: [
      { id: "who-it-is-for", title: "Less website administration on your to-do list.", body: ["For business owners who want a maintained website without handling every technical detail themselves. Care is a natural next step after an Anthēon build; an existing website needs an initial review so we can confirm what its platform requires."] },
      { id: "included", title: "The everyday essentials, clearly scoped.", body: ["Management and hosting is £35 per month. The published service includes managed website hosting, ongoing website management, updates and maintenance. We agree how changes are requested and what is covered for your site."], points: ["Managed website hosting", "Ongoing website management", "Website content updates and maintenance", "A clear route for requesting changes"] },
      { id: "boundaries", title: "Routine care and new projects have different needs.", body: ["A new service paragraph and a new booking system are different pieces of work. Routine updates are considered within your agreed care scope; substantial redesigns, new functionality and third-party subscriptions are discussed separately.", "Domain registration, business email and other account costs should be identified explicitly. Website hosting does not automatically include every service connected to your domain, and existing email records need to be protected when hosting changes."] },
      { id: "process", title: "A clear handover, then a practical rhythm.", body: ["We confirm the platform, account access and responsibilities at the start. When you need a change, provide the approved text or assets and the affected page. We review the request, confirm anything outside scope and check the agreed update before it goes live.", "Search visibility work has its own priorities and measurement. Our separate SEO Monitoring & Optimisation service is £149 per month."] },
    ],
    faqs: [
      { question: "Does £35 per month include unlimited changes?", answer: "No unlimited commitment is implied. Management, hosting, updates and maintenance are included within an agreed scope. Larger changes or new features need a separate agreement." },
      { question: "Can you look after a website someone else built?", answer: "We need to review its platform, hosting, access and condition first. That assessment determines whether ongoing care is practical and whether any initial work is needed." },
      { question: "Will changing website hosting affect my email?", answer: "It can if domain records are changed incorrectly. We check existing records and dependencies first. Moving a website does not automatically mean moving business email." },
      { question: "Is SEO included in website care?", answer: "Website care covers the agreed management, hosting and maintenance work. Ongoing search monitoring and optimisation is a separate £149 per month service." },
    ],
    proof: [
      { label: "The websites we design", href: "/web-design", kind: "concept", description: "Explore the independent concepts and design approach that ongoing care can support after a website is built." },
    ], related: ["web-design", "website-redesign", "seo-services"],
  },
];

/** Publication needs genuine evidence and owner approval; no example results are invented. */
export interface ProjectCaseStudy {
  slug: string;
  status: "draft" | "published";
  kind: "commissioned" | "concept" | "venture" | "experiment";
  title: string;
  summary: string;
  challenge: string;
  work: string[];
  evidence: { claim: string; source: string; verifiedAt: string }[];
  publicationApproval?: { approvedBy: string; approvedAt: string };
}

export const projectCaseStudyDrafts: ProjectCaseStudy[] = [
  { slug: "antheon-city", status: "draft", kind: "experiment", title: "The Anthēon city experience", summary: "A potential implementation story about the scroll-driven Three.js city.", challenge: "Document the actual design constraints, implementation and measured findings before publication.", work: [], evidence: [] },
];
