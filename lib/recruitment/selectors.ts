import { blankFilters, daysUntil, DEMO_TODAY, towns } from "./catalogue";
import { isValidTicket, ticketName } from "./constructionTickets";
import type {
  Broadcast,
  Candidate,
  CandidateFilters,
  Channel,
  DemoData,
  Job,
} from "./types";
export function currentPlacement(data: DemoData, id: string) {
  return data.placements.find(
    (p) => p.candidateId === id && p.status === "current",
  );
}
export function distance(from: string, to: string) {
  const a = towns.find((t) => t.name === from),
    b = towns.find((t) => t.name === to);
  if (!a || !b) return undefined;
  const rad = Math.PI / 180,
    dLat = (b.lat - a.lat) * rad,
    dLng = (b.lng - a.lng) * rad,
    h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return Math.round(3958.8 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)));
}
export function locationFrom(filters: CandidateFilters) {
  if (filters.postcode) {
    const outward = filters.postcode.trim().toUpperCase().split(" ")[0];
    return towns.find((t) => t.postcode.split(" ")[0] === outward)?.name;
  }
  return filters.town || undefined;
}
export function finishing(data: DemoData, c: Candidate, within = 14) {
  const p = currentPlacement(data, c.id);
  return (
    c.status === "working" &&
    !!p &&
    daysUntil(p.finish) >= 0 &&
    daysUntil(p.finish) <= within
  );
}
export function matchesFilters(
  c: Candidate,
  f: CandidateFilters,
  data: DemoData,
  placements?: Map<string, DemoData["placements"][number]>,
) {
  const p = placements ? placements.get(c.id) : currentPlacement(data, c.id),
    origin = locationFrom(f);
  if (
    f.search &&
    !`${c.name} ${c.trade} ${c.secondary.join(" ")} ${c.town} ${c.postcode}`
      .toLowerCase()
      .includes(f.search.toLowerCase())
  )
    return false;
  if (f.availability.startsWith("finish")) {
    if (
      c.status !== "working" ||
      !p ||
      daysUntil(p.finish) < 0 ||
      daysUntil(p.finish) > Number(f.availability.slice(6))
    )
      return false;
  } else if (f.availability && c.status !== f.availability) return false;
  if (
    f.availableBy &&
    (!c.availableFrom ||
      c.availableFrom > f.availableBy ||
      ["not-looking", "unknown"].includes(c.status))
  )
    return false;
  if (f.trade && c.trade !== f.trade && !c.secondary.includes(f.trade))
    return false;
  if (f.postcode && !origin) return false;
  if (origin && (distance(origin, c.town) ?? Infinity) > Number(f.radius || 30))
    return false;
  if (
    f.ticket &&
    !f.ticket
      .split(",")
      .every((ticket) =>
        c.qualifications.some(
          (q) =>
            (q.typeId === ticket ||
              (ticket === "cscs" && ticketName(q).startsWith("CSCS"))) &&
            isValidTicket(q, f.availableBy || DEMO_TODAY),
        ),
      )
  )
    return false;
  if (
    f.expiry &&
    !c.qualifications.some(
      (q) =>
        q.expiry &&
        (f.expiry === "expired"
          ? daysUntil(q.expiry) < 0
          : daysUntil(q.expiry) >= 0 &&
            daysUntil(q.expiry) <= Number(f.expiry)),
    )
  )
    return false;
  if (f.experience && c.experience < Number(f.experience)) return false;
  if (f.lastContact && -daysUntil(c.lastContact) < Number(f.lastContact))
    return false;
  if (f.clientId && p?.clientId !== f.clientId) return false;
  if (f.siteId && p?.siteId !== f.siteId) return false;
  if (f.recruiterId && c.recruiterId !== f.recruiterId) return false;
  if (f.payType && c.payType !== f.payType) return false;
  if (f.source && c.source !== f.source) return false;
  if (f.preference && c.preference !== f.preference) return false;
  if (
    (f.contactable === "yes" && c.doNotContact) ||
    (f.contactable === "no" && !c.doNotContact)
  )
    return false;
  return true;
}
export function filterCandidates(data: DemoData, filters: CandidateFilters) {
  const placements = new Map(
    data.placements
      .filter((p) => p.status === "current")
      .map((p) => [p.candidateId, p]),
  );
  return data.candidates.filter((c) =>
    matchesFilters(c, filters, data, placements),
  );
}
export function metrics(data: DemoData) {
  return {
    total: data.candidates.length,
    working: data.candidates.filter((c) => c.status === "working").length,
    available: data.candidates.filter((c) => c.status === "available").length,
    open: data.candidates.filter((c) => c.status === "open").length,
    finishing: data.candidates.filter((c) => finishing(data, c)).length,
    unknown: data.candidates.filter((c) => c.status === "unknown").length,
  };
}
export function filled(data: DemoData, jobId: string) {
  return data.placements.filter(
    (p) => p.jobId === jobId && p.status !== "completed",
  ).length;
}
export function audience(
  data: DemoData,
  ids: string[],
  channel: Channel,
  excludeWorking: boolean,
) {
  const wanted = new Set(ids),
    included: Candidate[] = [],
    excluded: { candidate: Candidate; reason: string }[] = [];
  for (const c of data.candidates) {
    if (!wanted.has(c.id)) continue;
    const reason = c.doNotContact
      ? "Do not contact"
      : excludeWorking && c.status === "working"
        ? "Currently working"
        : channel === "Email"
          ? !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(c.email)
            ? "Invalid email"
            : ""
          : !/^07700\s?900\d{3}$/.test(c.phone)
            ? "Invalid demo number"
            : "";
    if (reason) excluded.push({ candidate: c, reason });
    else included.push(c);
  }
  return { included, excluded };
}
export function renderMessage(
  template: string,
  c: Candidate,
  job: Job | undefined,
  data: DemoData,
) {
  const site = data.sites.find((s) => s.id === job?.siteId);
  const vars: Record<string, string> = {
    firstName: c.name.split(" ")[0],
    role: job?.trade ?? "construction",
    location: site?.town ?? c.town,
    startDate: job?.start ?? "the next available date",
    rate: job ? `£${job.rate.toFixed(2)}/hr ${job.payType}` : "the agreed rate",
  };
  return template.replace(/\{\{(\w+)\}\}/g, (all, k) => vars[k] ?? all);
}
export interface MatchOptions {
  radius: number;
  window: number;
  trade: string;
  tickets: string[];
}
export function matchCandidates(
  data: DemoData,
  job: Job,
  options: MatchOptions,
) {
  const site = data.sites.find((s) => s.id === job.siteId);
  return data.candidates
    .filter(
      (c) => !c.doNotContact && !["unknown", "not-looking"].includes(c.status),
    )
    .map((c) => {
      const miles = distance(c.town, site?.town ?? ""),
        trade =
          c.trade === options.trade || c.secondary.includes(options.trade),
        available =
          !!c.availableFrom &&
          daysUntil(c.availableFrom) <= daysUntil(job.start) + options.window &&
          !data.placements.some(
            (p) =>
              p.candidateId === c.id &&
              p.status === "upcoming" &&
              p.start <= job.finish &&
              p.finish >= job.start,
          ),
        valid = options.tickets.every((id) =>
          c.qualifications.some(
            (q) => q.typeId === id && isValidTicket(q, job.start),
          ),
        ),
        history = data.placements.some(
          (p) =>
            p.candidateId === c.id &&
            p.status === "completed" &&
            p.role === job.trade,
        );
      const reasons = [
        {
          label: available
            ? c.status === "working"
              ? `Finishes ${c.availableFrom}`
              : "Available for this start"
            : "Availability outside window",
          points: available ? 25 : 0,
        },
        {
          label: `${miles ?? "Unknown"} miles from site`,
          points: miles !== undefined && miles <= options.radius ? 25 : 0,
        },
        {
          label: trade
            ? `${options.trade} experience`
            : "Different primary trade",
          points: trade ? 25 : 0,
        },
        {
          label: valid
            ? "Required tickets valid and verified"
            : "Ticket verification needed",
          points: valid ? 15 : 0,
        },
        {
          label: history
            ? "Similar placement history"
            : "No comparable placement on record",
          points: history ? 10 : 0,
        },
      ];
      return {
        candidate: c,
        score: reasons.reduce((a, r) => a + r.points, 0),
        reasons,
        suitable:
          trade &&
          available &&
          valid &&
          miles !== undefined &&
          miles <= options.radius,
        miles,
      };
    })
    .filter(
      (m) =>
        m.reasons[2].points > 0 &&
        m.miles !== undefined &&
        m.miles <= options.radius,
    )
    .sort((a, b) => b.score - a.score || (a.miles ?? 0) - (b.miles ?? 0));
}
export function interested(b: Broadcast) {
  return b.recipients
    .filter((r) => r.response === "Interested")
    .map((r) => r.candidateId);
}
export function parseSearch(text: string): CandidateFilters | null {
  const lower = text.toLowerCase(),
    town = towns.find((t) => lower.includes(t.name.toLowerCase()));
  if (!lower.includes("groundwork") || !town) return null;
  return {
    ...blankFilters,
    trade: "Groundworker",
    town: town.name,
    radius: lower.match(/(\d+)\s*mile/)?.[1] ?? "30",
    ticket: lower.includes("cscs") ? "cscs" : "",
    availability: lower.includes("available now") ? "available" : "",
    availableBy: lower.includes("monday") ? "2026-10-12" : "",
  };
}
