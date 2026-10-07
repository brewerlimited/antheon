import type { CandidateFilters, Recruiter, Town, Trade } from "./types";
export const DEMO_TODAY = "2026-10-07";
export const statusLabels = {
  available: "Available now",
  open: "Open to work",
  working: "Working",
  "not-looking": "Not looking",
  unknown: "Status unknown",
};
export const trades: Trade[] = [
  "Groundworker",
  "Labourer",
  "Carpenter",
  "Bricklayer",
  "Electrician",
  "Plumber",
  "Pipefitter",
  "Dryliner",
  "Ceiling Fixer",
  "Plasterer",
  "Painter",
  "Roofer",
  "Scaffolder",
  "Steel Fixer",
  "Shuttering Carpenter",
  "Concrete Finisher",
  "Plant Operator",
  "360 Operator",
  "Dumper Driver",
  "Telehandler Operator",
  "Crane Operator",
  "Slinger / Signaller",
  "Traffic Marshal",
  "Site Manager",
  "Site Supervisor",
  "Quantity Surveyor",
  "Setting Out Engineer",
  "General Operative",
  "MEWP Operator",
  "Machine Driver",
  "Cleaner",
  "Banksman",
].map((name) => ({ id: name, name }));
export const recruiters: Recruiter[] = [
  { id: "am", name: "Alex Morgan", initials: "AM", colour: "violet" },
  { id: "sk", name: "Sophie King", initials: "SK", colour: "green" },
  { id: "jt", name: "James Taylor", initials: "JT", colour: "blue" },
  { id: "ep", name: "Ella Parker", initials: "EP", colour: "amber" },
];
export const towns: Town[] = [
  ["Northampton", "NN1 1AA", 52.2405, -0.9027],
  ["Milton Keynes", "MK9 1AA", 52.0406, -0.7594],
  ["Bedford", "MK40 1AA", 52.1364, -0.4667],
  ["Wellingborough", "NN8 1AA", 52.3027, -0.6945],
  ["Kettering", "NN15 7AA", 52.3972, -0.7276],
  ["Rugby", "CV21 3AA", 52.3709, -1.265],
  ["London", "EC1A 1AA", 51.5074, -0.1278],
  ["Birmingham", "B1 1AA", 52.4862, -1.8904],
  ["Manchester", "M1 1AA", 53.4808, -2.2426],
  ["Leeds", "LS1 1AA", 53.8008, -1.5491],
  ["Oxford", "OX1 1AA", 51.752, -1.2577],
  ["Cambridge", "CB1 1AA", 52.2053, 0.1218],
  ["Coventry", "CV1 1AA", 52.4068, -1.5197],
  ["Nottingham", "NG1 1AA", 52.9548, -1.1581],
  ["Leicester", "LE1 1AA", 52.6369, -1.1398],
  ["Sheffield", "S1 1AA", 53.3811, -1.4701],
  ["Bristol", "BS1 1AA", 51.4545, -2.5879],
  ["Reading", "RG1 1AA", 51.4543, -0.9781],
  ["Derby", "DE1 1AA", 52.9225, -1.4746],
  ["Luton", "LU1 1AA", 51.8787, -0.42],
].map(([name, postcode, lat, lng]) => ({
  name: String(name),
  postcode: String(postcode),
  lat: Number(lat),
  lng: Number(lng),
}));
export const blankFilters: CandidateFilters = {
  search: "",
  availability: "",
  availableBy: "",
  trade: "",
  town: "",
  radius: "30",
  postcode: "",
  ticket: "",
  expiry: "",
  experience: "",
  lastContact: "",
  clientId: "",
  siteId: "",
  recruiterId: "",
  payType: "",
  source: "",
  preference: "",
  contactable: "",
};
export const sources = [
  "Website registration",
  "Referral",
  "Job board",
  "Returning worker",
  "Recruiter network",
];
export const payTypes = ["CIS", "PAYE", "Ltd / subcontract"] as const;
export const channels = ["SMS", "WhatsApp", "Email"] as const;
export function day(offset: number) {
  return new Date(Date.parse(DEMO_TODAY + "T12:00:00Z") + offset * 86400000)
    .toISOString()
    .slice(0, 10);
}
export function daysUntil(date: string) {
  return Math.round(
    (Date.parse(date + "T12:00:00Z") - Date.parse(DEMO_TODAY + "T12:00:00Z")) /
      86400000,
  );
}
export function dateLabel(value: string) {
  if (!value) return "Not set";
  return new Date(value + "T12:00:00Z").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}
export function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((s) => s[0])
    .join("");
}
export function relativeDate(value: string) {
  const days = -daysUntil(value.slice(0, 10));
  return days <= 0 ? "Today" : days === 1 ? "Yesterday" : `${days} days ago`;
}
export function money(n: number) {
  return "£" + n.toFixed(2);
}
