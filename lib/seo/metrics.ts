import type { AnalyticsDay, Period, SearchDay, Totals } from "./types";
const DAY = 86400000;
export const iso = (date: Date) => date.toISOString().slice(0, 10);
export const shift = (date: string, days: number) => iso(new Date(Date.parse(date + "T12:00:00Z") + days * DAY));
export function periodFor(value = "28", start?: string, end?: string, now = new Date()): Period {
  const latest = shift(iso(now), -3);
  const days = ({ "7": 7, "28": 28, "previous": 28, "90": 90, "180": 180, "365": 365 } as Record<string, number>)[value] ?? 28;
  let finish = value === "previous" ? shift(latest, -28) : latest;
  let begin = shift(finish, 1 - days);
  const valid = (s: string | undefined): s is string => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s) && Number.isFinite(Date.parse(s)) && iso(new Date(s)) === s;
  if (value === "custom" && valid(start) && valid(end) && start <= end && end <= latest && (Date.parse(end) - Date.parse(start)) / DAY < 366) { begin = start; finish = end; }
  const span = Math.round((Date.parse(finish) - Date.parse(begin)) / DAY) + 1;
  return { start: begin, end: finish, previousStart: shift(begin, -span), previousEnd: shift(begin, -1), label: `${begin} — ${finish}` };
}
export const inPeriod = (date: string, start: string, end: string) => date.slice(0, 10) >= start && date.slice(0, 10) <= end;
export function totals(search: SearchDay[], analytics: AnalyticsDay[], start: string, end: string, configuredEvents: string[] = []): Totals {
  const s = search.filter(r => r.kind === "total" && inPeriod(r.date, start, end));
  const a = analytics.filter(r => r.kind === "total" && inPeriod(r.date, start, end));
  const impressions = s.reduce((v, r) => v + Number(r.impressions), 0), clicks = s.reduce((v, r) => v + Number(r.clicks), 0);
  return { clicks, impressions, ctr: impressions ? clicks / impressions * 100 : 0,
    position: impressions ? s.reduce((v, r) => v + r.position * r.impressions, 0) / impressions : null,
    sessions: a.reduce((v, r) => v + Number(r.sessions), 0), engaged: a.reduce((v, r) => v + Number(r.engaged_sessions), 0),
    actions: analytics.filter(r => r.kind === "event" && configuredEvents.includes(r.dimension) && inPeriod(r.date, start, end)).reduce((v, r) => v + Number(r.actions), 0),
    searchDays: new Set(s.map(r => r.date)).size, analyticsDays: new Set(a.map(r => r.date)).size };
}
export function movement(current: number | null, previous: number | null, lowerIsBetter = false) {
  if (current === null || previous === null || previous === 0) return { value: null, good: null, label: "No comparable baseline" };
  const value = (current - previous) / Math.abs(previous) * 100;
  return { value, good: value === 0 ? null : lowerIsBetter ? value < 0 : value > 0, label: `${value > 0 ? "+" : ""}${value.toFixed(1)}%` };
}
export function performanceStatus(current: Totals, previous: Totals, critical: number) {
  if (!current.searchDays) return { name: "Setup required", tone: "muted", reason: "No Search Console data in the selected period." };
  if (critical) return { name: "Attention", tone: "warning", reason: `${critical} unresolved critical technical issue${critical === 1 ? "" : "s"}.` };
  if (current.searchDays !== previous.searchDays || previous.clicks < 30) return { name: "Building baseline", tone: "muted", reason: "Comparable coverage and at least 30 previous clicks are needed before classifying movement." };
  const change = (current.clicks - previous.clicks) / previous.clicks * 100;
  const name = change >= 25 ? "Strong growth" : change >= 10 ? "Improving" : change <= -15 ? "Declining" : "Stable";
  return { name, tone: change >= 10 ? "positive" : change <= -15 ? "warning" : "muted", reason: `Clicks ${change >= 0 ? "+" : ""}${change.toFixed(1)}% against the preceding equal-length period. Growth ≥25%, improving ≥10%, declining ≤−15%.` };
}
export function groupSearch(rows: SearchDay[], kind: string, start: string, end: string) {
  const grouped = new Map<string, { dimension: string; clicks: number; impressions: number; weighted: number; position: number; ctr: number }>();
  for (const row of rows.filter(r => r.kind === kind && inPeriod(r.date, start, end))) {
    const key = row.dimension, item = grouped.get(key) ?? { dimension: key, clicks: 0, impressions: 0, weighted: 0, position: 0, ctr: 0 };
    item.clicks += Number(row.clicks); item.impressions += Number(row.impressions); item.weighted += row.position * row.impressions; grouped.set(key, item);
  }
  return [...grouped.values()].map(r => ({ ...r, position: r.impressions ? r.weighted / r.impressions : 0, ctr: r.impressions ? r.clicks / r.impressions * 100 : 0 })).sort((a, b) => b.clicks - a.clicks);
}
export type Opportunity = { fingerprint: string; title: string; category: string; priority: string; evidence: Record<string, string | number>; action: string; impact: string; url?: string; query?: string };
export function opportunities(rows: SearchDay[], period: Period): Opportunity[] {
  const current = groupSearch(rows, "query", period.start, period.end), previous = groupSearch(rows, "query", period.previousStart, period.previousEnd);
  const output: Opportunity[] = [];
  for (const row of current) {
    if (row.impressions >= 100 && row.position >= 8 && row.position <= 20) output.push({ fingerprint: `near:${row.dimension}`, title: `Strengthen “${row.dimension}”`, category: "Content", priority: "high", evidence: { impressions: row.impressions, position: +row.position.toFixed(1), period: period.label, rule: "100+ impressions and average position 8–20" }, action: "Review search intent, improve the relevant service page and add helpful internal links.", impact: "May improve visibility; no ranking increase is guaranteed.", query: row.dimension });
    if (row.impressions >= 300 && row.position <= 10 && row.ctr < 1) output.push({ fingerprint: `ctr:${row.dimension}`, title: `Improve the search snippet for “${row.dimension}”`, category: "On-page", priority: "medium", evidence: { impressions: row.impressions, ctr: +row.ctr.toFixed(2), rule: "300+ impressions, average position ≤10 and CTR <1%", period: period.label }, action: "Review title and description against the intent of the query; compare again after an equal period.", impact: "Potential to earn more clicks from existing visibility.", query: row.dimension });
    const old = previous.find(r => r.dimension === row.dimension);
    if (old && old.clicks >= 20 && row.clicks >= old.clicks * 1.4) output.push({ fingerprint: `momentum:${row.dimension}`, title: `Build on momentum for “${row.dimension}”`, category: "Content", priority: "medium", evidence: { clicks: row.clicks, previousClicks: old.clicks, rule: "Previous ≥20 clicks; current clicks ≥40% higher", period: period.label }, action: "Check the pages gaining visibility and strengthen useful supporting content.", impact: "Protect and develop an observed trend.", query: row.dimension });
  }
  const oldPages = groupSearch(rows, "page", period.previousStart, period.previousEnd);
  const pages = groupSearch(rows, "page", period.start, period.end);
  for (const old of oldPages) { const current = pages.find(r => r.dimension === old.dimension); if (old.clicks >= 30 && (current?.clicks ?? 0) < old.clicks * .7) output.push({ fingerprint: `decline:${old.dimension}`, title: "Investigate a page losing clicks", category: "Traffic", priority: "high", evidence: { previousClicks: old.clicks, clicks: current?.clicks ?? 0, rule: "Previous ≥30 clicks and decline >30%; absence in limited API rows does not prove zero", period: period.label }, action: "Check data coverage, seasonality, indexing changes and page updates before deciding on a fix.", impact: "Identify a possible loss of relevant demand.", url: old.dimension }); }
  const queryPages = new Map<string, Set<string>>();
  for (const r of rows.filter(r => r.kind === "query_page" && inPeriod(r.date, period.start, period.end) && r.impressions >= 10)) { const set = queryPages.get(r.dimension) ?? new Set(); set.add(r.page); queryPages.set(r.dimension, set); }
  for (const [query, urls] of queryPages) if (urls.size > 1) output.push({ fingerprint: `overlap:${query}`, title: `Review overlapping pages for “${query}”`, category: "Content", priority: "low", evidence: { pages: [...urls].join(", "), rule: "Multiple pages receive ≥10 impressions for the same query on a day", period: period.label }, action: "Check whether the pages serve distinct intent. Multiple results are not automatically cannibalisation.", impact: "Clarify page targeting where intent genuinely overlaps.", query });
  return output;
}
