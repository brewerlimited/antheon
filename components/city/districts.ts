export const districts = [
  {
    id: "core", number: "01", label: "Anthēon", title: "Independent thinking.\nShared ambition.",
    description: "The vision connecting our businesses. Different disciplines, built with the same intent.",
    detail: "THE CENTRE OF THE ECOSYSTEM", link: "Discover the group", href: "#about",
  },
  {
    id: "digital", number: "02", label: "Digital", title: "Distinct by design.",
    description: "Websites, brands and digital experiences. Considered in every detail, made to move a business forward.",
    detail: "DESIGN / DEVELOPMENT / EXPERIENCE", link: "Explore web design", href: "/web-design",
  },
  {
    id: "software", number: "03", label: "Software", title: "Complexity,\nmade useful.",
    description: "Tools, platforms and connected systems. Turning real business problems into products people want to use.",
    detail: "PRODUCTS / PLATFORMS / SYSTEMS", link: "Meet our products", href: "#ventures",
  },
  {
    id: "ventures", number: "04", label: "Ventures", title: "What comes next\nstarts here.",
    description: "New ideas and independent businesses. Developed from the first possibility through to the everyday details.",
    detail: "IDEAS / BUSINESSES / OPPORTUNITY", link: "Discover our ventures", href: "#ventures",
  },
] as const;

export type DistrictId = typeof districts[number]["id"];
