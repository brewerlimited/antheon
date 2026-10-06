import 'server-only';
import { randomBytes, createHash } from 'node:crypto';
import { encrypt, decrypt, digest } from './crypto';
import { serviceDb, appOrigin, rateLimit } from './db';
import type { AnalyticsDay, SearchDay } from './types';
export type GoogleService = 'gsc' | 'ga4';
export class IntegrationError extends Error { constructor(public code: string) { super(code); } }
export const googleReady = () => !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REDIRECT_URI && /^[a-f0-9]{64}$/i.test(process.env.SEO_TOKEN_ENCRYPTION_KEY ?? ''));
const scopes = { gsc: 'https://www.googleapis.com/auth/webmasters.readonly', ga4: 'https://www.googleapis.com/auth/analytics.readonly' };
function oauthConfig() {
  if (!googleReady()) throw new IntegrationError('not_configured');
  if (new URL(process.env.GOOGLE_REDIRECT_URI!).origin !== appOrigin()) throw new IntegrationError('callback_mismatch');
  return { client_id: process.env.GOOGLE_CLIENT_ID!, client_secret: process.env.GOOGLE_CLIENT_SECRET!, redirect_uri: process.env.GOOGLE_REDIRECT_URI! };
}
async function tokenRequest(body: Record<string, string>) {
  const response = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(body), signal: AbortSignal.timeout(20000), cache: 'no-store' });
  const json = await response.json();
  if (!response.ok) throw new IntegrationError(json.error === 'invalid_grant' ? 'access_revoked' : 'google_unavailable');
  return json as { access_token: string; refresh_token?: string; expires_in: number; scope: string };
}
export async function beginGoogle(userId: string, projectId: string, service: GoogleService) {
  const config = oauthConfig(); await rateLimit('oauth:' + userId, 5, 300);
  const state = randomBytes(32).toString('base64url'), verifier = randomBytes(48).toString('base64url');
  const db = serviceDb();
  await db.from('seo_oauth_states').delete().lt('expires_at', new Date().toISOString());
  const { error } = await db.from('seo_oauth_states').insert({ hash: digest(state), user_id: userId, project_id: projectId, service, verifier, expires_at: new Date(Date.now() + 600000).toISOString() });
  if (error) throw new IntegrationError('storage_error');
  const query = new URLSearchParams({ client_id: config.client_id, redirect_uri: config.redirect_uri, response_type: 'code', scope: 'openid email ' + scopes[service], access_type: 'offline', prompt: 'consent', state, code_challenge: createHash('sha256').update(verifier).digest('base64url'), code_challenge_method: 'S256' });
  return 'https://accounts.google.com/o/oauth2/v2/auth?' + query;
}
export async function finishGoogle(userId: string, state: string, code: string) {
  if (!/^[A-Za-z0-9_-]{43}$/.test(state) || !code || code.length > 4096) throw new IntegrationError('invalid_state');
  const db = serviceDb();
  // DELETE RETURNING atomically consumes one state and binds it to the current user.
  const { data, error } = await db.from('seo_oauth_states').delete().eq('hash', digest(state)).eq('user_id', userId).gt('expires_at', new Date().toISOString()).select('*').single();
  if (error || !data) throw new IntegrationError('invalid_state');
  const tokens = await tokenRequest({ ...oauthConfig(), code, code_verifier: data.verifier, grant_type: 'authorization_code' });
  if (!tokens.refresh_token || !tokens.scope.split(' ').includes(scopes[data.service as GoogleService])) throw new IntegrationError('permissions_missing');
  const accountResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', { headers: { Authorization: 'Bearer ' + tokens.access_token }, signal: AbortSignal.timeout(15000) });
  if (!accountResponse.ok) throw new IntegrationError('google_unavailable');
  const account = await accountResponse.json();
  const { data: project } = await db.from('seo_projects').select('organisation_id').eq('id', data.project_id).single();
  if (!project) throw new IntegrationError('storage_error');
  const { error: storeError } = await db.from('seo_oauth_secrets').upsert({ project_id: data.project_id, service: data.service, encrypted_token: encrypt(JSON.stringify({ refresh_token: tokens.refresh_token })) });
  if (storeError) throw new IntegrationError('storage_error');
  const { error: connectionError } = await db.from('seo_google_connections').upsert({ project_id: data.project_id, organisation_id: project.organisation_id, service: data.service, account: account.email || 'Google account', connected_by: userId, scopes: tokens.scope.split(' ') }, { onConflict: 'project_id,service' });
  if (connectionError) throw new IntegrationError('storage_error');
  const { error: integrationError } = await db.from('seo_integrations').upsert({ project_id: data.project_id, organisation_id: project.organisation_id, provider: data.service, account: account.email || 'Google account', state: 'configured', error_code: null }, { onConflict: 'project_id,provider' });
  if (integrationError) throw new IntegrationError('storage_error');
  await discoverProperties(data.project_id, project.organisation_id, data.service);
  return data.project_id as string;
}
export async function googleToken(projectId: string, service: GoogleService) {
  const { data } = await serviceDb().from('seo_oauth_secrets').select('encrypted_token').eq('project_id', projectId).eq('service', service).single();
  if (!data) throw new IntegrationError('not_connected');
  const credentials = JSON.parse(decrypt(data.encrypted_token)) as { refresh_token: string };
  try {
    const tokens = await tokenRequest({ client_id: oauthConfig().client_id, client_secret: oauthConfig().client_secret, refresh_token: credentials.refresh_token, grant_type: 'refresh_token' });
    if (tokens.refresh_token) await serviceDb().from('seo_oauth_secrets').update({ encrypted_token: encrypt(JSON.stringify({ refresh_token: tokens.refresh_token })) }).eq('project_id', projectId).eq('service', service);
    return tokens.access_token;
  } catch (e) { if (e instanceof IntegrationError && e.code === 'access_revoked') await serviceDb().from('seo_integrations').update({ state: 'error', error_code: e.code }).eq('project_id', projectId).eq('provider', service); throw e; }
}
export async function googleJson(url: string, token: string, body?: object) {
  // Endpoint is constructed exclusively by these fixed provider adapters.
  const response = await fetch(url, { method: body ? 'POST' : 'GET', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined, cache: 'no-store', signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new IntegrationError(response.status === 429 ? 'quota_reached' : response.status === 403 ? 'access_revoked' : response.status === 404 ? 'property_unavailable' : 'google_unavailable');
  return response.json();
}
export async function discoverProperties(projectId: string, org: string, service: GoogleService) {
  const token = await googleToken(projectId, service), db = serviceDb();
  if (service === 'gsc') {
    const result = await googleJson('https://www.googleapis.com/webmasters/v3/sites', token) as { siteEntry?: { siteUrl: string; permissionLevel: string }[] };
    const entries = (result.siteEntry ?? []).filter(p => p.permissionLevel !== 'siteUnverifiedUser').map(p => ({ project_id: projectId, organisation_id: org, property_id: p.siteUrl, permission: p.permissionLevel }));
    if (entries.length) { const { error } = await db.from('seo_search_console_properties').upsert(entries, { onConflict: 'project_id,property_id' }); if (error) throw new IntegrationError('storage_error'); }
  } else {
    let next = '';
    for (let page = 0; page < 10; page++) {
      const result = await googleJson('https://analyticsadmin.googleapis.com/v1beta/accountSummaries?pageSize=200' + (next ? '&pageToken=' + encodeURIComponent(next) : ''), token) as { accountSummaries?: { propertySummaries?: { property: string; displayName: string }[] }[]; nextPageToken?: string };
      const entries = (result.accountSummaries ?? []).flatMap(a => a.propertySummaries ?? []).map(p => ({ project_id: projectId, organisation_id: org, property_id: p.property.replace('properties/', ''), name: p.displayName }));
      if (entries.length) { const { error } = await db.from('seo_analytics_properties').upsert(entries, { onConflict: 'project_id,property_id' }); if (error) throw new IntegrationError('storage_error'); }
      next = result.nextPageToken ?? ''; if (!next) break;
    }
  }
}
export async function disconnectGoogle(projectId: string, service: GoogleService) {
  const db = serviceDb();
  // Unlink this project only. Revoking the Google grant could break other projects
  // connected by the same account; account-wide revocation stays in Google's settings.
  const { error } = await db.from('seo_oauth_secrets').delete().eq('project_id', projectId).eq('service', service);
  if (error) throw new IntegrationError('storage_error');
  await db.from('seo_google_connections').delete().eq('project_id', projectId).eq('service', service);
  await db.from('seo_integrations').update({ state: 'not_configured', account: null, error_code: null }).eq('project_id', projectId).eq('provider', service);
}
export async function fetchSearch(token: string, property: string, start: string, end: string) {
  const rows: SearchDay[] = []; let truncated = false; const started=Date.now();
  const reports = [{ kind: 'total', dimensions: ['date'] }, { kind: 'query', dimensions: ['date', 'query'] }, { kind: 'page', dimensions: ['date', 'page'] }, { kind: 'query_page', dimensions: ['date', 'query', 'page'] }, { kind: 'device', dimensions: ['date', 'device'] }, { kind: 'country', dimensions: ['date', 'country'] }];
  for (const report of reports) {
    for (let offset = 0; offset < 50000; offset += 25000) {
      if(Date.now()-started>210000)throw new IntegrationError('sync_timeout');
      const result = await googleJson('https://www.googleapis.com/webmasters/v3/sites/' + encodeURIComponent(property) + '/searchAnalytics/query', token, { startDate: start, endDate: end, dimensions: report.dimensions, type: 'web', dataState: 'final', rowLimit: 25000, startRow: offset }) as { rows?: { keys: string[]; clicks: number; impressions: number; position: number }[] };
      const page = result.rows ?? [];
      for (const r of page) rows.push({ date: r.keys[0], kind: report.kind, dimension: r.keys[1] ?? '', page: report.kind === 'query_page' ? r.keys[2] : '', clicks: r.clicks, impressions: r.impressions, position: r.position });
      if (page.length < 25000) break;
      if (offset === 25000) truncated = true;
    }
  }
  return { rows, truncated };
}
export async function fetchAnalytics(token: string, property: string, start: string, end: string) {
  if (!/^\d+$/.test(property)) throw new IntegrationError('property_unavailable');
  const rows: AnalyticsDay[] = []; let truncated = false; const started=Date.now();
  const reports = [
    { kind: 'total', dimensions: ['date'], metrics: ['activeUsers', 'sessions', 'engagedSessions'] },
    { kind: 'landing', dimensions: ['date', 'landingPagePlusQueryString'], metrics: ['activeUsers', 'sessions', 'engagedSessions'] },
    { kind: 'source', dimensions: ['date', 'sessionSourceMedium'], metrics: ['activeUsers', 'sessions', 'engagedSessions'] },
    { kind: 'event', dimensions: ['date', 'eventName'], metrics: ['eventCount'] },
  ];
  for (const report of reports) {
    for (let offset = 0; offset < 50000; offset += 10000) {
      if(Date.now()-started>210000)throw new IntegrationError('sync_timeout');
      const result = await googleJson(`https://analyticsdata.googleapis.com/v1beta/properties/${property}:runReport`, token, { dateRanges: [{ startDate: start, endDate: end }], dimensions: report.dimensions.map(name => ({ name })), metrics: report.metrics.map(name => ({ name })), dimensionFilter: { filter: { fieldName: 'sessionDefaultChannelGroup', stringFilter: { matchType: 'EXACT', value: 'Organic Search' } } }, limit: '10000', offset: String(offset), returnPropertyQuota: true }) as { rowCount?: number; metadata?: { subjectToThresholding?: boolean; dataLossFromOtherRow?: boolean; samplingMetadatas?: unknown[] }; rows?: { dimensionValues: { value: string }[]; metricValues: { value: string }[] }[] };
      if (result.metadata?.subjectToThresholding || result.metadata?.dataLossFromOtherRow || result.metadata?.samplingMetadatas?.length) truncated = true;
      for (const r of result.rows ?? []) { const d = r.dimensionValues[0].value; const values = r.metricValues.map(v => Number(v.value)); rows.push({ date: `${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}`, kind: report.kind, dimension: r.dimensionValues[1]?.value ?? '', users: report.kind === 'event' ? 0 : values[0], sessions: values[1] ?? 0, engaged_sessions: values[2] ?? 0, actions: report.kind === 'event' ? values[0] : 0 }); }
      if (offset + 10000 >= (result.rowCount ?? 0)) break;
      if (offset === 40000) truncated = true;
    }
  }
  return { rows, truncated };
}
export const integrationMessages: Record<string, string> = { access_revoked: 'Google access has expired or been revoked. Reconnect this account.', property_unavailable: 'This property is no longer available to the connected account.', quota_reached: 'Google’s API quota was reached. Try again later.', google_unavailable: 'Google is temporarily unavailable. Stored data is still safe.', property_required: 'Choose a property before syncing.', not_connected: 'Connect a Google account first.', not_configured: 'Google credentials have not been configured.', invalid_state: 'This connection request expired or was already used. Start again.', storage_error: 'The connection could not be saved. Check database setup.', permissions_missing: 'Read access was not granted. Reconnect and allow the requested permissions.', callback_mismatch: 'The OAuth callback does not match the app URL.', sync_failed: 'The sync did not complete. Retry after checking the connection.' };
