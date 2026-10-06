import 'server-only';
import { serviceDb } from './db';
import { fetchSearch, fetchAnalytics, googleToken, IntegrationError, type GoogleService } from './google';
import { iso, shift } from './metrics';
export async function syncProject(projectId: string, service: GoogleService, end = shift(iso(new Date()), -3)) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(end) || !Number.isFinite(Date.parse(end)) || end > shift(iso(new Date()), -3) || end < shift(iso(new Date()), -480)) throw new IntegrationError('invalid_period');
  const db = serviceDb(), start = shift(end, -27), lock = `sync:${projectId}`;
  const { data: acquired, error: lockError } = await db.rpc('seo_acquire_lock', { lock_key: lock, seconds: 300 });
  if (lockError || !acquired) throw new IntegrationError('sync_running');
  let logId: string | undefined;
  try {
    const { data: project } = await db.from('seo_projects').select('organisation_id').eq('id', projectId).single();
    const { data: integration } = await db.from('seo_integrations').select('property_id').eq('project_id', projectId).eq('provider', service).single();
    if (!project) throw new IntegrationError('not_connected');
    if (!integration?.property_id) throw new IntegrationError('property_required');
    const { data: log, error } = await db.from('seo_sync_logs').insert({ project_id: projectId, organisation_id: project.organisation_id, provider: service, status: 'running', coverage_start: start, coverage_end: end }).select('id').single();
    if (error) throw new IntegrationError('storage_error'); logId = log.id;
    await db.from('seo_integrations').update({ last_attempted_at: new Date().toISOString() }).eq('project_id', projectId).eq('provider', service);
    const token = await googleToken(projectId, service);
    const result = service === 'gsc' ? await fetchSearch(token, integration.property_id, start, end) : await fetchAnalytics(token, integration.property_id, start, end);
    // Replace one complete interval atomically. A failed provider call cannot erase good history.
    const { error: storeError } = await db.rpc('seo_store_sync', { target_project: projectId, provider: service, from_date: start, to_date: end, rows_json: result.rows });
    if (storeError) throw new IntegrationError('storage_error');
    const time = new Date().toISOString();
    await db.from('seo_integrations').update({ state: 'connected', last_success_at: time, error_code: result.truncated ? 'limited_rows' : null }).eq('project_id', projectId).eq('provider', service);
    await db.from('seo_sync_logs').update({ status: result.truncated ? 'partial' : 'success', records_processed: result.rows.length, truncated: result.truncated, finished_at: time }).eq('id', logId);
    if (service === 'ga4') {
      const latest = new Map<string, string>();
      for (const row of result.rows) if ('actions' in row && row.kind === 'event' && row.actions > 0 && row.date > (latest.get(row.dimension) ?? '')) latest.set(row.dimension, row.date);
      // One write per configured event, rather than one per daily observation.
      const { data: configured } = await db.from('seo_conversions').select('event_name').eq('project_id', projectId);
      for (const event of configured ?? []) {
        const date = latest.get(event.event_name);
        if (date) await db.from('seo_conversions').update({ last_seen_at: date }).eq('project_id', projectId).eq('event_name', event.event_name).or(`last_seen_at.is.null,last_seen_at.lt.${date}`);
      }
    }
    return { count: result.rows.length, truncated: result.truncated };
  } catch (e) {
    const code = e instanceof IntegrationError ? e.code : 'sync_failed';
    if (logId) await db.from('seo_sync_logs').update({ status: 'error', error_code: code, finished_at: new Date().toISOString() }).eq('id', logId);
    await db.from('seo_integrations').update({ state: 'error', error_code: code }).eq('project_id', projectId).eq('provider', service);
    throw new IntegrationError(code);
  } finally { await db.from('seo_job_locks').delete().eq('key', lock); }
}
