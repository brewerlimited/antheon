'use server';
import { z } from 'zod';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { appOrigin, databaseReady, rateLimit, requireIdentity, requireProject, serviceDb, sessionDb } from '@/lib/seo/db';
import { digest } from '@/lib/seo/crypto';
import { workspace } from '@/lib/seo/data';
import { auditUrl, crawlSite, safeFetch } from '@/lib/seo/crawler';
import { disconnectGoogle, discoverProperties, IntegrationError } from '@/lib/seo/google';
import { syncProject } from '@/lib/seo/sync';
import { iso, shift, opportunities, periodFor } from '@/lib/seo/metrics';
import { reportSnapshot } from '@/lib/seo/reports';
const uuid = z.string().uuid(), short = z.string().trim().min(1).max(240), long = z.string().trim().max(6000), date = z.iso.date();
const webUrl = z.url().max(2048).refine(value => { try { auditUrl(value); return true; } catch { return false; } }, 'Use a public HTTP or HTTPS URL');
const categories = z.enum(['Technical', 'Content', 'On-page', 'Local', 'Backlinks', 'Analytics', 'Migration', 'Reporting']);
function get(form: FormData, field: string) { return String(form.get(field) ?? ''); }
function optional(form: FormData, field: string) { return get(form, field) || null; }
export async function login(form: FormData) {
  if (!databaseReady()) redirect('/seo/login?message=setup');
  const input = z.object({ email: z.email().max(254), password: z.string().min(8).max(200) }).safeParse({ email: get(form, 'email').trim().toLowerCase(), password: get(form, 'password') });
  if (!input.success) redirect('/seo/login?message=credentials');
  let failed = false;
  try { const h = await headers(); await rateLimit('login-account:' + digest(input.data.email), 10, 900); await rateLimit('login-ip:' + digest(h.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'), 40, 900); const db = await sessionDb(); const { error } = await db.auth.signInWithPassword(input.data); failed = !!error; } catch { failed = true; }
  if (failed) redirect('/seo/login?message=credentials');
  redirect('/seo');
}
export async function logout() { if (databaseReady()) await (await sessionDb()).auth.signOut(); redirect('/seo/login'); }
export async function resetPassword(form: FormData) {
  if (databaseReady()) try { const email = z.email().parse(get(form, 'email')); await rateLimit('reset:' + digest(email.toLowerCase()), 3, 3600); await (await sessionDb()).auth.resetPasswordForEmail(email, { redirectTo: appOrigin() + '/seo/login?message=password' }); } catch { /* Same response prevents account enumeration. */ }
  redirect('/seo/login?message=sent');
}
export async function setPassword(form: FormData) {
  const user = await requireIdentity(); const result = z.string().min(12).max(128).safeParse(get(form, 'password'));
  if (!result.success) redirect('/seo/login?message=password');
  const password = result.data;
  const { error } = await user.db.auth.updateUser({ password });
  if (error) redirect('/seo/login?message=credentials'); redirect('/seo');
}
export async function mutate(form: FormData) {
  const user = await requireIdentity(true), action = get(form, 'action');
  let destination = '/seo/admin'; let message = 'saved';
  try {
    await rateLimit('admin:' + user.id, 60, 60);
    if (action === 'add-client') {
      const input = z.object({ company: short, site_url: webUrl, area: z.string().max(240), service_list: z.array(z.string().max(100)).max(20), started: date }).parse({ company: get(form, 'company'), site_url: get(form, 'url'), area: get(form, 'area'), service_list: get(form, 'services').split(',').map(s => s.trim()).filter(Boolean), started: get(form, 'start_date') });
      const { data, error } = await user.db.rpc('seo_add_client', input); if (error) throw new Error('save_failed');
      destination = '/seo/admin/clients/' + data + '/integrations';
    } else if (action === 'role') {
      if (user.role !== 'super_admin') throw new Error('not_permitted');
      const target = uuid.parse(get(form, 'user_id')), role = z.enum(['super_admin', 'admin', 'client']).parse(get(form, 'role'));
      if (target === user.id) throw new Error('not_permitted');
      const { error } = await serviceDb().from('seo_users').update({ role }).eq('id', target); if (error) throw new Error('save_failed');
      destination = '/seo/admin/settings';
    } else {
      const projectId = uuid.parse(get(form, 'project_id')), { project } = await requireProject(projectId, true);
      const tab = z.enum(['overview','tasks','activity','rankings','local-seo','competitors','technical','opportunities','reports','migration','integrations','settings','conversions']).catch('overview').parse(get(form, 'return_tab'));
      destination = `/seo/admin/clients/${projectId}/${tab}`;
      const tenant = { project_id: projectId, organisation_id: project.organisation_id };
      async function insert(table: string, values: object) { const { error } = await user.db.from('seo_' + table).insert({ ...tenant, ...values }); if (error) throw new Error('save_failed'); }
      async function update(table: string, values: object) { const id = uuid.parse(get(form, 'id')); const { data, error } = await user.db.from('seo_' + table).update(values).eq('id', id).eq('project_id', projectId).select('id'); if (error || !data?.length) throw new Error('save_failed'); }
      if (action === 'add-website') {
        const { data, error } = await user.db.rpc('seo_add_website', { org: project.organisation_id, site_url: webUrl.parse(get(form,'url')), project_name: short.parse(get(form,'name')) });
        if (error) throw new Error('save_failed'); destination = '/seo/admin/clients/' + data + '/integrations';
      } else if (action === 'task') {
        const assigned = optional(form, 'assigned_to'); if (assigned) { uuid.parse(assigned); const { data } = await user.db.from('seo_users').select('id').eq('id', assigned).in('role', ['admin','super_admin']).single(); if (!data) throw new Error('invalid_input'); }
        await insert('tasks', { title: short.parse(get(form,'title')), description: long.parse(get(form,'description')), category: categories.parse(get(form,'category')), priority: z.enum(['high','medium','low']).parse(get(form,'priority')), due_date: optional(form,'due_date') ? date.parse(get(form,'due_date')) : null, assigned_to: assigned, url: optional(form,'url') ? webUrl.parse(get(form,'url')) : null, keyword: optional(form,'keyword') ? short.parse(get(form,'keyword')) : null, client_visible: form.has('client_visible') });
      } else if (action === 'task-status') { const status = z.enum(['todo','in_progress','done']).parse(get(form,'status')); await update('tasks', { status, completed_at: status === 'done' ? new Date().toISOString() : null });
      } else if (action === 'activity') await insert('activity', { title: short.parse(get(form,'title')), description: long.min(1).parse(get(form,'description')), category: categories.parse(get(form,'category')), occurred_at: date.parse(get(form,'date')), urls: get(form,'urls').split('\n').map(s=>s.trim()).filter(Boolean).slice(0,10).map(s=>webUrl.parse(s)), before_after: long.parse(get(form,'before_after')), author_id: user.id, client_visible: form.has('client_visible') });
      else if (action === 'keyword') await insert('keywords', { keyword: short.parse(get(form,'keyword')), target_url: optional(form,'url') ? webUrl.parse(get(form,'url')) : null, location: short.parse(get(form,'location')), device: z.enum(['mobile','desktop']).parse(get(form,'device')), priority: z.enum(['high','medium','low']).parse(get(form,'priority')), tags: get(form,'tags').split(',').map(s=>s.trim()).filter(Boolean).slice(0,10) });
      else if (action === 'keyword-pause') await update('keywords', { paused: get(form,'paused') === 'true' });
      else if (action === 'competitor') await insert('competitors', { name: short.parse(get(form,'name')), domain: new URL(webUrl.parse(get(form,'url'))).hostname });
      else if (action === 'citation') await insert('citations', { directory: short.parse(get(form,'directory')), url: optional(form,'url') ? webUrl.parse(get(form,'url')) : null, status: z.enum(['to_review','reviewed','corrected']).parse(get(form,'status')), notes: long.parse(get(form,'notes')) });
      else if (action === 'issue-status') { const status = z.enum(['open','in_progress','resolved','ignored']).parse(get(form,'status')); await update('issues', { status, fixed_at: status === 'resolved' ? new Date().toISOString() : null }); }
      else if (action === 'opportunity-status') await update('opportunities', { status: z.enum(['new','planned','in_progress','completed','dismissed']).parse(get(form,'status')) });
      else if (action === 'conversion') await update('conversions', { configured: form.has('configured') });
      else if (action === 'custom-conversion') await insert('conversions', { event_name: z.string().regex(/^[a-zA-Z][a-zA-Z0-9_]{0,39}$/).parse(get(form,'event_name')), label: short.parse(get(form,'label')), configured: false });
      else if (action === 'note') await insert('notes', { body: long.min(1).parse(get(form,'body')), author_id: user.id });
      else if (action === 'settings') { const status = z.enum(['setup','active','paused','archived']).parse(get(form,'status')); const { error } = await user.db.from('seo_projects').update({ status }).eq('id',projectId); if(error)throw new Error('save_failed'); }
      else if (action === 'invite') {
        const email = z.email().parse(get(form,'email')); await rateLimit('invite:'+user.id,10,3600);
        const { data, error } = await serviceDb().auth.admin.inviteUserByEmail(email, { redirectTo: appOrigin()+'/seo/login?message=password', data: { full_name: short.parse(get(form,'name')) } });
        if (error || !data.user) throw new Error('invite_failed');
        const { error: memberError } = await user.db.from('seo_members').insert({ organisation_id: project.organisation_id, user_id: data.user.id }); if (memberError) throw new Error('membership_failed');
      } else if (action === 'add-member') {
        const id = uuid.parse(get(form,'user_id')); const { data } = await user.db.from('seo_users').select('id,role').eq('id',id).single(); if (!data || data.role!=='client') throw new Error('invalid_input');
        const { error } = await user.db.from('seo_members').upsert({ organisation_id:project.organisation_id,user_id:id }); if(error)throw new Error('save_failed');
      } else if (action === 'remove-member') { const { error } = await user.db.from('seo_members').delete().eq('organisation_id',project.organisation_id).eq('user_id',uuid.parse(get(form,'user_id'))); if(error)throw new Error('save_failed');
      } else if (action === 'google-property') {
        const provider = z.enum(['gsc','ga4']).parse(get(form,'provider')), property = short.max(2048).parse(get(form,'property_id'));
        const { data } = await user.db.from(provider==='gsc'?'seo_search_console_properties':'seo_analytics_properties').select('*').eq('project_id',projectId).eq('property_id',property).single(); if(!data)throw new Error('invalid_input');
        const { error } = await user.db.from('seo_integrations').update({ property_id:property,property_name:data.name || property,state:'connected',error_code:null }).eq('project_id',projectId).eq('provider',provider); if(error)throw new Error('property_history');
      } else if (action === 'google-discover') await discoverProperties(projectId,project.organisation_id,z.enum(['gsc','ga4']).parse(get(form,'provider')));
      else if (action === 'google-disconnect') await disconnectGoogle(projectId,z.enum(['gsc','ga4']).parse(get(form,'provider')));
      else if (action === 'sync') { await rateLimit('sync-user:'+user.id,6,3600); const result=await syncProject(projectId,z.enum(['gsc','ga4']).parse(get(form,'provider')),optional(form,'end')??undefined); message=result.truncated?'partial':'synced'; }
      else if (action === 'opportunities') { const w=await workspace(projectId,periodFor()); const found=opportunities(w.search,periodFor()); for(const o of found){const {data}=await user.db.from('seo_opportunities').select('id').eq('project_id',projectId).eq('fingerprint',o.fingerprint).maybeSingle(); if(!data)await insert('opportunities',o);} }
      else if (action === 'baseline') { const period=periodFor(get(form,'period')||'28',optional(form,'start')??undefined,optional(form,'end')??undefined); const w=await workspace(projectId,period); if(w.truncated)throw new Error('incomplete_data'); await insert('baselines',{period_start:period.start,period_end:period.end,snapshot:reportSnapshot(w,period),captured_by:user.id}); }
      else if (action === 'report') {
        const month=z.string().regex(/^\d{4}-\d{2}$/).parse(get(form,'month')), start=date.parse(month+'-01'), end=iso(new Date(Date.UTC(Number(month.slice(0,4)),Number(month.slice(5,7)),0)));
        if(end>=shift(iso(new Date()),-3))throw new Error('incomplete_month');
        const previousEnd=shift(start,-1), previousStart=previousEnd.slice(0,7)+'-01'; const period={start,end,previousStart,previousEnd,label:`${start} — ${end}`}; const w=await workspace(projectId,period);if(w.truncated)throw new Error('incomplete_data');
        await insert('reports',{month:start,title:`${w.project.name} · ${month}`,snapshot:reportSnapshot(w,period),published:false});
      } else if (action === 'publish-report') await update('reports',{published:true});
      else if (action === 'migration') await insert('migrations',{old_domain:new URL(webUrl.parse(get(form,'old_domain'))).origin,new_domain:new URL(webUrl.parse(get(form,'new_domain'))).origin,migration_date:optional(form,'date')?date.parse(get(form,'date')):null});
      else if (action === 'migration-status') await update('migrations',{status:z.enum(['planning','ready','launched','monitoring','complete']).parse(get(form,'status'))});
      else if (action === 'migration-check') {const key=z.enum(['crawl','gsc','analytics','urls','backlinks','redirects','indexability','canonical','sitemap','robots','live','property','address','submit','gbp','citations','links','404','monitor']).parse(get(form,'key'));const {data}=await user.db.from('seo_migrations').select('checklist').eq('id',uuid.parse(get(form,'id'))).eq('project_id',projectId).single();if(!data)throw new Error('invalid_input');await update('migrations',{checklist:{...data.checklist,[key]:get(form,'checked')==='true'}});}
      else if (action === 'redirect') await insert('redirects',{migration_id:uuid.parse(get(form,'migration_id')),old_url:webUrl.parse(get(form,'old_url')),new_url:webUrl.parse(get(form,'new_url'))});
      else if (action === 'check-redirect') {const {data}=await user.db.from('seo_redirects').select('*').eq('id',uuid.parse(get(form,'id'))).eq('project_id',projectId).single();if(!data)throw new Error('invalid_input');await rateLimit('crawl:'+projectId,5,3600);const r=await safeFetch(data.old_url);await update('redirects',{http_status:r.redirectStatuses?.[0]??r.status,redirect_status:r.url===data.new_url&&r.redirects.length===1&&r.status===200&&[301,308].includes(r.redirectStatuses?.[0]??0)?'verified':'review',checked_at:new Date().toISOString()});}
      else if (action === 'audit') {
        await rateLimit('crawl:'+projectId,3,3600);const {data:site}=await user.db.from('seo_websites').select('url').eq('id',project.website_id).single();if(!site)throw new Error('invalid_input');
        const {data:run,error}=await user.db.from('seo_audits').insert({...tenant,status:'running'}).select('id').single();if(error)throw new Error('save_failed');
        try {const result=await crawlSite(site.url);for(const page of result.pages){const {error}=await user.db.from('seo_pages').upsert({...tenant,...page,checked_at:new Date().toISOString()},{onConflict:'project_id,url'});if(error)throw new Error('save_failed');}
          for(const issue of result.issues){const {data:old}=await user.db.from('seo_issues').select('status').eq('project_id',projectId).eq('fingerprint',issue.fingerprint).maybeSingle();const {error}=await user.db.from('seo_issues').upsert({...tenant,...issue,status:old?.status==='ignored'?'ignored':'open',fixed_at:null},{onConflict:'project_id,fingerprint'});if(error)throw new Error('save_failed');}
          await user.db.from('seo_audits').update({status:result.partial?'partial':'complete',pages_checked:result.pages.length,limit_reached:result.partial,summary:{scope:result.reason,sitemap:result.sitemapFound},finished_at:new Date().toISOString()}).eq('id',run.id);
        } catch(e){await user.db.from('seo_audits').update({status:'failed',finished_at:new Date().toISOString()}).eq('id',run.id);throw e;}
      } else if (action === 'pagespeed') {
        await rateLimit('pagespeed:'+projectId,3,3600);const {data:site}=await user.db.from('seo_websites').select('url').eq('id',project.website_id).single();if(!site)throw new Error('invalid_input');auditUrl(site.url);
        const params=new URLSearchParams({url:site.url,strategy:'mobile'});for(const category of ['performance','accessibility','best-practices','seo'])params.append('category',category);if(process.env.PAGESPEED_API_KEY)params.set('key',process.env.PAGESPEED_API_KEY);
        const response=await fetch('https://www.googleapis.com/pagespeedonline/v5/runPagespeed?'+params,{signal:AbortSignal.timeout(60000),cache:'no-store'});if(!response.ok)throw new Error('pagespeed_unavailable');const data=await response.json();const cat=data.lighthouseResult?.categories??{},field=data.loadingExperience?.metrics??{};
        await insert('page_metrics',{url:site.url,strategy:'mobile',performance:cat.performance?.score!=null?cat.performance.score*100:null,accessibility:cat.accessibility?.score!=null?cat.accessibility.score*100:null,best_practices:cat['best-practices']?.score!=null?cat['best-practices'].score*100:null,lighthouse_seo:cat.seo?.score!=null?cat.seo.score*100:null,lcp_ms:field.LARGEST_CONTENTFUL_PAINT_MS?.percentile??null,inp_ms:field.INTERACTION_TO_NEXT_PAINT?.percentile??null,cls:field.CUMULATIVE_LAYOUT_SHIFT_SCORE?.percentile!=null?field.CUMULATIVE_LAYOUT_SHIFT_SCORE.percentile/100:null,field_data:!!field.LARGEST_CONTENTFUL_PAINT_MS,data:{labLcp:data.lighthouseResult?.audits?.['largest-contentful-paint']?.numericValue??null,fieldCategory:data.loadingExperience?.overall_category??null}});
      } else throw new Error('invalid_input');
    }
  } catch (e) { message=e instanceof z.ZodError?'invalid_input':e instanceof IntegrationError?e.code:e instanceof Error&&['rate_limited','incomplete_month','invite_failed','membership_failed','pagespeed_unavailable','incomplete_data','property_history'].includes(e.message)?e.message:'save_failed'; }
  revalidatePath('/seo','layout');redirect(destination+'?message='+encodeURIComponent(message));
}
