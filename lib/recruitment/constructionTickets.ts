import type { Qualification, QualificationType } from "./types";
// Demonstration catalogue, not a complete register or verification service. See docs/recruitment-os.md.
const families: Record<string, string[]> = {
  CSCS: [
    "CSCS — Labourer card",
    "CSCS — Skilled Worker",
    "CSCS — Advanced Craft",
    "CSCS — Supervisor",
    "CSCS — Manager",
    "CSCS — Academically Qualified Person",
  ],
  CPCS: [
    "A09 | Forward Tipping Dumper",
    "A10 | Excavator 180° below 5 tonnes",
    "A12 | Excavator 180° above 5 tonnes",
    "A17 | Telescopic Handler",
    "A31 | Ride-on Roller",
    "A59 | Excavator 360° above 10 tonnes",
    "A58 | Excavator 360° below 10 tonnes",
    "A56 | Articulated Dump Truck",
    "A21 | Wheeled Loading Shovel",
    "A22 | Tracked Loading Shovel",
    "A23 | Skid Steer Loader",
    "A34 | Crawler Tractor / Dozer",
    "A19 | Grader",
    "A04 | Tower Crane",
    "A02 | Crawler Crane",
    "A60 | Mobile Crane",
    "A40 | Slinger / Signaller",
    "A61 | Appointed Person",
    "A62 | Crane / Lifting Operations Supervisor",
    "A20 | Hoist",
    "A16 | Industrial Forklift Truck",
  ],
  NPORS: [
    "360 Excavator",
    "Forward Tipping Dumper",
    "Ride-on Roller",
    "Telescopic Handler",
    "Industrial Counterbalance Forklift",
    "Loading Shovel",
    "Slinger / Signaller",
    "Plant / Vehicle Marshaller",
    "Excavation Marshal",
  ],
  IPAF: [
    "3a | Mobile Vertical",
    "3b | Mobile Boom",
    "1b | Static Boom",
    "MEWPs for Managers",
    "Harness Awareness",
    "Harness User",
  ],
  PASMA: ["Towers for Users", "Low Level Access", "Towers for Managers"],
  CISRS: [
    "Scaffolding Labourer",
    "Scaffold Inspection",
    "Scaffolder",
    "Advanced Scaffolder",
  ],
  "Site Safety Plus": [
    "SMSTS — Site Management Safety Training",
    "SSSTS — Site Supervision Safety Training",
    "Health and Safety Awareness",
    "Temporary Works Coordinator",
    "Temporary Works Supervisor",
  ],
  "Health & safety": [
    "Emergency First Aid at Work",
    "First Aid at Work",
    "Asbestos Awareness",
    "Manual Handling",
    "Working at Height",
    "Confined Spaces — Low Risk",
    "Confined Spaces — Medium Risk",
    "CAT & Genny / Cable Avoidance",
    "Abrasive Wheels",
    "Vehicle Banksman",
    "Traffic Marshal",
    "Fire Marshal",
    "Face Fit Test",
    "Harness Training",
    "Plant Marshall",
    "Slinger / Signaller Awareness",
  ],
  "Street works": ["NRSWA — Operative", "NRSWA — Supervisor"],
  Utilities: [
    "EUSR — National Water Hygiene",
    "EUSR — SHEA Gas",
    "EUSR — SHEA Power",
    "EUSR — SHEA Water",
    "EUSR — Excavation Safety",
  ],
  "Rail & underground": [
    "Sentinel — PTS",
    "Sentinel — ICI",
    "PTS — AC Electrification",
    "PTS — DCCR",
    "London Underground — ICI LU",
    "London Underground — Track Awareness",
  ],
  Professional: [
    "NVQ — Construction Operations",
    "NVQ — Carpentry & Joinery",
    "NVQ — Plant Operations",
    "ECS — Electrical",
    "JIB — Plumbing / Mechanical",
  ],
};
export const constructionTickets: QualificationType[] = Object.entries(
  families,
).flatMap(([family, names]) =>
  names.map((label, i) => {
    const [code, title] = label.includes(" | ")
      ? label.split(" | ")
      : ["", label];
    return {
      id:
        family === "CSCS" && i === 0
          ? "cscs"
          : family === "CPCS" && code === "A09"
            ? "cpcs-a09"
            : `${family.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${i}`,
      family,
      code: code || undefined,
      name: code
        ? `${family} — ${title}`
        : label.startsWith(family)
          ? label
          : `${family} — ${label}`,
      keywords: `${family} ${code} ${label}`,
    };
  }),
);
export function ticketName(q: Qualification) {
  return (
    q.customName ||
    constructionTickets.find((t) => t.id === q.typeId)?.name ||
    "Other qualification"
  );
}
export function ticketShort(q: Qualification) {
  const t = constructionTickets.find((t) => t.id === q.typeId);
  return (
    q.customName || (t?.code ? `${t.family} ${t.code}` : t?.family) || "Other"
  );
}
export function isValidTicket(q: Qualification, by: string) {
  return q.verified && (!q.expiry || q.expiry >= by);
}
