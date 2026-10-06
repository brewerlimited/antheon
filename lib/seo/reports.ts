import { groupSearch, inPeriod, totals } from './metrics';
import type { Period, Workspace } from './types';
export function reportSnapshot(w: Workspace, period: Period) {
  const events = w.conversions.filter(r => r.configured === true).map(r => String(r.event_name));
  const current = totals(w.search, w.analytics, period.start, period.end, events), previous = totals(w.search, w.analytics, period.previousStart, period.previousEnd, events);
  return { version: 1, generatedAt: new Date().toISOString(), company: w.project.name, website: w.project.url, period, current, previous,
    summary: current.searchDays ? `${current.clicks.toLocaleString('en-GB')} organic search clicks were recorded during this period. Review the comparison and coverage below alongside the work completed.` : 'Search performance data was not available for this period. This report records work and next priorities without inferring results.',
    coverage: { searchDays: current.searchDays, analyticsDays: current.analyticsDays, limited: w.truncated, note: 'Search Console final data. GA4 organic-search attribution. Tracked actions are not sales; query totals can omit anonymised searches.' },
    topPages: groupSearch(w.search, 'page', period.start, period.end).slice(0, 10),
    work: w.activity.filter(r => r.client_visible && inPeriod(String(r.occurred_at), period.start, period.end)).map(r => ({ title: r.title, description: r.description, date: r.occurred_at, category: r.category })),
    priorities: w.tasks.filter(r => r.client_visible && r.status !== 'done').slice(0, 5).map(r => ({ title: r.title, description: r.description, due: r.due_date ?? null })),
    technical: { open: w.issues.filter(r => !['resolved', 'ignored'].includes(String(r.status)) && r.severity !== 'passed').length, auditedPages: w.pages.length, note: 'Technical status at report generation; historical issue state is not reconstructed.' },
    conversions: w.conversions.map(r => ({ label: r.label, configured: r.configured, actions: r.configured && current.analyticsDays ? w.analytics.filter(a => a.kind === 'event' && a.dimension === r.event_name && inPeriod(a.date, period.start, period.end)).reduce((sum, r) => sum + r.actions, 0) : null })),
    rankings: w.ranks.length ? 'Independent rank history is available in the workspace; no Search Console average is presented as an exact rank.' : 'An independent ranking provider is not connected.',
  };
}
