import type { AnalyticsDay, Project, Row, SearchDay, Workspace } from './types';
import { iso, shift, periodFor, opportunities } from './metrics';

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
export const demoProjects: Project[] = [
  { id: id(1), organisation_id: id(11), website_id: id(21), name: 'Alder & Stone', url: 'https://alderandstone.example', status: 'active', service_area: 'Surrey & Hampshire', services: ['Stonework', 'Brickwork', 'Restoration'], start_date: '2026-04-01' },
  { id: id(2), organisation_id: id(12), website_id: id(22), name: 'Northline Roofing', url: 'https://northlineroofing.example', status: 'active', service_area: 'Greater Manchester', services: ['Roofing', 'Repairs'], start_date: '2026-05-12' },
  { id: id(3), organisation_id: id(13), website_id: id(23), name: 'Vale Groundworks', url: 'https://valegroundworks.example', status: 'setup', service_area: 'Oxfordshire', services: ['Groundworks'], start_date: '2026-09-01' },
];
export function demoWorkspace(projectId = id(1)): Workspace | null {
  const project = demoProjects.find(p => p.id === projectId); if (!project) return null;
  const seed = demoProjects.indexOf(project), end = shift(iso(new Date()), -3), search: SearchDay[] = [], analytics: AnalyticsDay[] = [];
  const queries = ['stonework contractor surrey', 'brickwork specialists guildford', 'stone restoration hampshire', 'commercial masonry contractor', 'flint wall repairs surrey', 'bespoke stonework', 'alder and stone'];
  const paths = ['/services/stonework', '/services/brickwork', '/services/restoration', '/commercial', '/areas/surrey', '/', '/'];
  if (seed !== 2) for (let i = 0; i < 400; i++) {
    const date = shift(end, i - 399), wave = Math.sin(i * .41) * 9 + Math.cos(i * .17) * 5;
    const growth = seed === 1 ? 1.6 - i / 290 : .25 + Math.exp(i / 170) * .14;
    const clicks = Math.max(6, Math.round((48 + wave) * growth)), impressions = Math.round(clicks * (28 + Math.sin(i) * 3));
    const position = Math.max(6, 24 - i / 25 + seed * 5 + Math.sin(i / 9) * 1.2);
    search.push({ date, kind: 'total', dimension: '', page: '', clicks, impressions, position });
    queries.forEach((q, j) => { const share = [.28, .20, .16, .13, .10, .07, .06][j]; const query = seed === 1 ? q.replace(/stonework|brickwork|masonry|stone/g, 'roofing') : q; const page = project.url + paths[j];
      search.push({ date, kind: 'query', dimension: query, page: '', clicks: Math.round(clicks * share), impressions: Math.round(impressions * share), position: position + j * 1.4 });
      if (j < 6) search.push({ date, kind: 'page', dimension: page, page: '', clicks: Math.round(clicks * share), impressions: Math.round(impressions * share), position: position + j });
    });
    const sessions = Math.round(clicks * 1.14);
    analytics.push({ date, kind: 'total', dimension: '', users: Math.round(sessions * .82), sessions, engaged_sessions: Math.round(sessions * .73), actions: 0 });
    ['quote_form_submitted', 'phone_clicked', 'email_clicked', 'whatsapp_clicked'].forEach((event, j) => analytics.push({ date, kind: 'event', dimension: event, users: 0, sessions: 0, engaged_sessions: 0, actions: Math.max(0, Math.round(clicks * [.028, .035, .012, .008][j] + Math.sin(i + j))) }));
    paths.slice(0, 4).forEach((path, j) => analytics.push({ date, kind: 'landing', dimension: path, users: Math.round(sessions * .2), sessions: Math.round(sessions * [.4, .27, .2, .13][j]), engaged_sessions: 0, actions: 0 }));
  }
  let seq = 100 + seed * 1000;
  const row = (data: Record<string, Row[string]>): Row => ({ id: id(++seq), project_id: project.id, organisation_id: project.organisation_id, created_at: `${end}T09:00:00Z`, updated_at: `${end}T09:00:00Z`, ...data });
  const integrations = seed === 2 ? [] : ['gsc', 'ga4'].map(provider => row({ provider, state: 'connected', account: 'studio@alderandstone.example', property_id: provider === 'gsc' ? project.url : '123456789', property_name: project.name, last_success_at: `${iso(new Date())}T06:30:00Z`, last_attempted_at: `${iso(new Date())}T06:30:00Z`, error_code: null }));
  const tasks = [
    row({ title: 'Strengthen the stone restoration service page', description: 'Add recent project evidence and address conservation enquiries.', category: 'Content', priority: 'high', status: 'in_progress', due_date: shift(end, 4), client_visible: true, url: project.url + '/services/restoration' }),
    row({ title: 'Resolve broken links from the project archive', description: 'Update three legacy links to the current project pages.', category: 'Technical', priority: 'high', status: 'todo', due_date: shift(end, 2), client_visible: true }),
    row({ title: 'Publish the monthly performance review', description: 'Review results, completed work and next priorities.', category: 'Reporting', priority: 'medium', status: 'todo', due_date: shift(end, 7), client_visible: false }),
    row({ title: 'Improve service page titles and descriptions', description: 'Aligned titles to service intent and local relevance.', category: 'On-page', priority: 'medium', status: 'done', due_date: shift(end, -7), completed_at: `${shift(end, -6)}T10:00:00Z`, client_visible: true }),
  ];
  const activity = [
    row({ title: 'A clearer route from search to enquiry', description: 'Rewrote the stonework page title and introduction around the questions customers actually ask.', category: 'On-page', occurred_at: shift(end, -2), client_visible: true, urls: [project.url + '/services/stonework'] }),
    row({ title: 'Connected related projects and services', description: 'Added useful internal links from six completed projects to the matching service pages.', category: 'Content', occurred_at: shift(end, -6), client_visible: true, urls: [] }),
    row({ title: 'Quote request tracking checked', description: 'Confirmed successful form submissions are recorded separately from phone and email clicks.', category: 'Analytics', occurred_at: shift(end, -11), client_visible: true, urls: [] }),
    row({ title: 'Updated business profile services', description: 'Reviewed categories and services for accuracy. No Google Business Profile performance data is connected.', category: 'Local', occurred_at: shift(end, -16), client_visible: true, urls: [] }),
  ];
  const issues = [row({ fingerprint: 'links', title: 'Three internal links lead to a missing page', severity: 'warning', explanation: 'Visitors and crawlers reach a 404 from the project archive.', recommendation: 'Update the source links to the current destination. Redirect only where there is an equivalent page.', urls: [project.url + '/projects/old-courtyard'], status: 'open', discovered_at: end }), row({ fingerprint: 'meta', title: 'Two pages share a meta description', severity: 'opportunity', explanation: 'Identical snippets make it harder to distinguish the pages in search.', recommendation: 'Write a useful, specific description for each page.', urls: [project.url + '/services/stonework', project.url + '/services/restoration'], status: 'in_progress', discovered_at: end }), row({ fingerprint: 'https', title: 'HTTPS is in place', severity: 'passed', explanation: 'Checked pages use a secure connection.', recommendation: 'Keep the certificate and redirects maintained.', urls: [project.url], status: 'resolved', discovered_at: end })];
  const keywords = queries.map((keyword, i) => row({ keyword, target_url: project.url + paths[i], location: 'Surrey, UK', device: 'mobile', priority: i < 3 ? 'high' : 'medium', tags: ['service', 'local'], paused: false }));
  const ranks = keywords.flatMap((keyword, i) => [row({ keyword_id: keyword.id, date: end, position: [4, 7, 11, 18, 6, 14, 1][i], search_volume: [320, 170, 140, 210, 90, 260, 70][i], provider: 'demo_fixture' }), row({ keyword_id: keyword.id, date: shift(end, -28), position: [9, 12, 17, 22, 10, 18, 1][i], provider: 'demo_fixture' })]);
  const pages = paths.slice(0, 6).map((path, i) => row({ url: project.url + path, title: ['Specialist stonework in Surrey', 'Brickwork specialists', 'Stone restoration', 'Commercial masonry', 'Stonework in Surrey', project.name][i], status_code: 200, indexable: true, canonical: project.url + path, checked_at: end, data: { h1: 1 } }));
  const conversions = ['quote_form_submitted', 'phone_clicked', 'email_clicked', 'whatsapp_clicked', 'callback_requested', 'brochure_download'].map((event_name, i) => row({ event_name, label: ['Quote requests', 'Phone clicks', 'Email clicks', 'WhatsApp clicks', 'Callback requests', 'Brochure downloads'][i], configured: seed !== 2 && i < 4, last_seen_at: seed !== 2 && i < 4 ? end : null }));
  const ops = opportunities(search, periodFor()).slice(0, 8).map(o => row({ ...o, status: 'new' }));
  const migration = row({ old_domain: 'https://alderstone-old.example', new_domain: project.url, status: 'monitoring', migration_date: shift(end, -45), checklist: { crawl: true, gsc: true, analytics: true, urls: true, redirects: true, canonical: true, robots: true, sitemap: true, live: true, monitor: false } });
  return { project, search, analytics, integrations, keywords: seed === 2 ? [] : keywords, ranks: seed === 2 ? [] : ranks, issues: seed === 2 ? [] : issues, opportunities: ops, tasks, activity, reports: [], pages, conversions, competitors: [row({ name: 'Example local specialist', domain: 'competitor.example' })], backlinks: [], citations: [row({ directory: 'Local trade directory', url: '', status: 'reviewed', notes: 'Business details checked manually.' })], local: [], audits: [row({ status: 'complete', pages_checked: 24, finished_at: `${end}T08:00:00Z`, limit_reached: false, summary: { scope: 'Homepage and discovered internal links' } })], pageMetrics: [row({ url: project.url, performance: 93, accessibility: 98, lighthouse_seo: 100, best_practices: 96, lcp_ms: 1850, inp_ms: 140, cls: .03, field_data: true, strategy: 'mobile', checked_at: end })], baselines: [], migrations: [migration], redirects: [row({ migration_id: migration.id, old_url: 'https://alderstone-old.example/stone', new_url: project.url + '/services/stonework', redirect_status: 'verified', http_status: 301, old_indexed: null, new_indexed: null })], notes: [row({ body: 'Internal planning note: prioritise restoration enquiries over low-value repair work.' })], syncLogs: integrations.map(r => row({ provider: r.provider, status: 'success', records_processed: 1680, finished_at: `${end}T06:30:00Z`, started_at: `${end}T06:29:00Z` })), searchProperties: [], analyticsProperties: [], members: [], notifications: [], truncated: false };
}
