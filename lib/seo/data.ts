import 'server-only';
import { requireIdentity, requireProject } from './db';
import type { Period, Project, Row, Workspace } from './types';
const sections = { integrations: 'integrations', keywords: 'keywords', ranks: 'keyword_ranks', issues: 'issues', opportunities: 'opportunities', tasks: 'tasks', activity: 'activity', reports: 'reports', pages: 'pages', conversions: 'conversions', competitors: 'competitors', backlinks: 'backlinks', citations: 'citations', local: 'local_rank_checks', audits: 'audits', pageMetrics: 'page_metrics', baselines: 'baselines', migrations: 'migrations', redirects: 'redirects', notes: 'notes', syncLogs: 'sync_logs', searchProperties: 'search_console_properties', analyticsProperties: 'analytics_properties', notifications: 'notifications' } as const;
const privateSections = new Set(['integrations', 'opportunities', 'migrations', 'redirects', 'notes', 'syncLogs', 'searchProperties', 'analyticsProperties', 'notifications']);
export async function projects(): Promise<Project[]> {
  const { db } = await requireIdentity();
  const { data, error } = await db.from('seo_projects').select('*,seo_websites(url),seo_organisations(service_area,start_date,services)').neq('status', 'archived').order('name').limit(250);
  if (error) throw new Error('Unable to load your workspaces. Please try again.');
  return (data ?? []).map(row => ({ ...row, url: row.seo_websites.url, ...row.seo_organisations })) as Project[];
}
// Only fetch the data used by the requested screen; snapshot jobs retain the full view.
const screenSections: Record<string, string[]> = {
  overview: ['integrations', 'conversions', 'issues', 'audits', 'tasks', 'activity', 'baselines', 'keywords', 'competitors'],
  'search-performance': ['conversions'], analytics: ['conversions'], rankings: ['keywords', 'ranks'],
  'local-seo': ['activity', 'citations', 'local'], technical: ['issues', 'audits', 'pageMetrics'],
  pages: ['pages'], competitors: ['competitors'], backlinks: ['backlinks'], conversions: ['conversions'],
  opportunities: ['opportunities'], tasks: ['tasks'], activity: ['activity'], reports: ['reports'],
  migration: ['migrations', 'redirects'], integrations: ['integrations', 'syncLogs', 'searchProperties', 'analyticsProperties'],
  settings: ['notes'], featured: [],
};
export async function workspace(id: string, period: Period, screen = 'all'): Promise<Workspace> {
  const { user, project } = await requireProject(id);
  const { db } = user;
  const [{ data: site }, { data: org }] = await Promise.all([db.from('seo_websites').select('url').eq('id', project.website_id).single(), db.from('seo_organisations').select('service_area,start_date,services').eq('id', project.organisation_id).single()]);
  if (!site || !org) throw new Error('Unable to load this workspace.');
  let truncated = false;
  async function history(table: string) {
    const result: unknown[] = [];
    for (let from = 0; from < 30000; from += 1000) {
      const { data, error } = await db.from(table).select('*').eq('project_id', id).gte('date', period.previousStart).lte('date', period.end).order('date').order('id').range(from, from + 999);
      if (error) throw new Error('Stored performance data could not be loaded.');
      result.push(...data); if (data.length < 1000) return result;
    }
    truncated = true; return result;
  }
  const wanted = screen === 'all' ? null : new Set(screenSections[screen] ?? []);
  const searchNeeded = ['all', 'overview', 'search-performance', 'featured'].includes(screen);
  const analyticsNeeded = ['all', 'overview', 'analytics', 'conversions'].includes(screen);
  const [search, analytics, results] = await Promise.all([searchNeeded ? history('seo_search_daily') : [], analyticsNeeded ? history('seo_analytics_daily') : [], Promise.all(Object.entries(sections).map(async ([key, table]) => {
    if ((wanted && !wanted.has(key)) || (user.role === 'client' && privateSections.has(key))) return [key, []] as const;
    const { data, error } = await db.from('seo_' + table).select('*').eq('project_id', id).order('created_at', { ascending: false }).limit(501);
    if (error) throw new Error('Part of this workspace could not be loaded. Please retry.');
    if (data.length > 500) truncated = true;
    return [key, data.slice(0, 500)] as const;
  }))]);
  const members = user.role === 'client' || !['all', 'settings'].includes(screen) ? [] : (await db.from('seo_members').select('user_id,seo_users(full_name)').eq('organisation_id', project.organisation_id)).data ?? [];
  return { project: { ...project, url: site.url, ...org }, search, analytics, ...Object.fromEntries(results), members, truncated } as Workspace;
}
export async function overview(period: Period, page = 0): Promise<Row[]> {
  const { db } = await requireIdentity(true);
  const { data, error } = await db.rpc('seo_overview', { from_date: period.start, to_date: period.end, previous_from: period.previousStart, previous_to: period.previousEnd, page_offset: Math.max(0, page) * 25 });
  if (error) throw new Error('The client overview could not be loaded. Check that the database migrations have been applied.');
  return data ?? [];
}
