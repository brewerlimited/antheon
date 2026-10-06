-- Anthēon SEO. Apply once to a dedicated Supabase project, in migration order.
-- No public signup can grant agency privileges. Every tenant relationship is constrained.
begin;
create schema if not exists seo_private;
revoke all on schema seo_private from public, anon, authenticated;
create table public.seo_users (
 id uuid primary key references auth.users(id) on delete cascade,
 full_name text not null default '', role text not null default 'client' check(role in ('super_admin','admin','client')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create function public.seo_is_admin() returns boolean language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.seo_users where id=auth.uid() and role in ('super_admin','admin'));
$$;
create function public.seo_is_super_admin() returns boolean language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.seo_users where id=auth.uid() and role='super_admin');
$$;
create function public.seo_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin insert into public.seo_users(id,full_name) values(new.id,coalesce(new.raw_user_meta_data->>'full_name','')); return new; end; $$;
create trigger seo_profile_created after insert on auth.users for each row execute function public.seo_new_user();
create table public.seo_organisations (
 id uuid primary key default gen_random_uuid(), name text not null, service_area text not null default '', services text[] not null default '{}',
 start_date date not null default current_date, archived boolean not null default false,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.seo_members (
 organisation_id uuid not null references public.seo_organisations(id) on delete cascade,
 user_id uuid not null references public.seo_users(id) on delete cascade,
 created_at timestamptz not null default now(), primary key(organisation_id,user_id)
);
create index seo_members_user_idx on public.seo_members(user_id,organisation_id);
create function public.seo_can_read(org uuid) returns boolean language sql stable security definer set search_path = '' as $$
 select public.seo_is_admin() or exists(select 1 from public.seo_members where organisation_id=org and user_id=auth.uid());
$$;
create table public.seo_websites (
 id uuid primary key default gen_random_uuid(), organisation_id uuid not null references public.seo_organisations(id) on delete cascade,
 url text not null check(url ~ '^https?://'), name text not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(id,organisation_id)
);
create table public.seo_projects (
 id uuid primary key default gen_random_uuid(), organisation_id uuid not null references public.seo_organisations(id) on delete cascade,
 website_id uuid not null, name text not null, status text not null default 'setup' check(status in ('setup','active','paused','archived')),
 onboarding jsonb not null default '{}', created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key(website_id,organisation_id) references public.seo_websites(id,organisation_id), unique(id,organisation_id)
);
create table public.seo_domains (
 id uuid primary key default gen_random_uuid(), project_id uuid not null, organisation_id uuid not null,
 hostname text not null, kind text not null default 'current' check(kind in ('current','previous','planned')), verified boolean not null default false,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key(project_id,organisation_id) references public.seo_projects(id,organisation_id) on delete cascade
);
create index seo_domains_tenant_idx on public.seo_domains(organisation_id,project_id);
create table public.seo_integrations (
 id uuid primary key default gen_random_uuid(), project_id uuid not null, organisation_id uuid not null,
 provider text not null, state text not null default 'not_configured' check(state in ('not_configured','configured','connected','error')), account text, property_id text, property_name text, last_attempted_at timestamptz, last_success_at timestamptz, error_code text, unique(project_id,provider),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key(project_id,organisation_id) references public.seo_projects(id,organisation_id) on delete cascade
);
create index seo_integrations_tenant_idx on public.seo_integrations(organisation_id,project_id);
create table public.seo_google_connections (
 id uuid primary key default gen_random_uuid(), project_id uuid not null, organisation_id uuid not null,
 service text not null check(service in ('gsc','ga4')), account text not null, scopes text[] not null default '{}', connected_by uuid references public.seo_users(id), unique(project_id,service),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key(project_id,organisation_id) references public.seo_projects(id,organisation_id) on delete cascade
);
create index seo_google_connections_tenant_idx on public.seo_google_connections(organisation_id,project_id);
create table public.seo_search_console_properties (
 id uuid primary key default gen_random_uuid(), project_id uuid not null, organisation_id uuid not null,
 property_id text not null, permission text not null, selected boolean not null default false, unique(project_id,property_id),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key(project_id,organisation_id) references public.seo_projects(id,organisation_id) on delete cascade
);
create index seo_search_console_properties_tenant_idx on public.seo_search_console_properties(organisation_id,project_id);
create table public.seo_analytics_properties (
 id uuid primary key default gen_random_uuid(), project_id uuid not null, organisation_id uuid not null,
 property_id text not null, name text not null, selected boolean not null default false, unique(project_id,property_id),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key(project_id,organisation_id) references public.seo_projects(id,organisation_id) on delete cascade
);
create index seo_analytics_properties_tenant_idx on public.seo_analytics_properties(organisation_id,project_id);
create table public.seo_search_daily (
 id uuid primary key default gen_random_uuid(), project_id uuid not null, organisation_id uuid not null,
 date date not null, kind text not null check(kind in ('total','query','page','query_page','device','country')), dimension text not null default '', page text not null default '', clicks numeric not null default 0, impressions numeric not null default 0, position numeric not null default 0, unique(project_id,date,kind,dimension,page),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key(project_id,organisation_id) references public.seo_projects(id,organisation_id) on delete cascade
);
create index seo_search_daily_tenant_idx on public.seo_search_daily(organisation_id,project_id);
create table public.seo_analytics_daily (
 id uuid primary key default gen_random_uuid(), project_id uuid not null, organisation_id uuid not null,
 date date not null, kind text not null check(kind in ('total','landing','source','event')), dimension text not null default '', users numeric not null default 0, sessions numeric not null default 0, engaged_sessions numeric not null default 0, actions numeric not null default 0, unique(project_id,date,kind,dimension),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key(project_id,organisation_id) references public.seo_projects(id,organisation_id) on delete cascade
);
create index seo_analytics_daily_tenant_idx on public.seo_analytics_daily(organisation_id,project_id);
create table public.seo_keywords (
 id uuid primary key default gen_random_uuid(), project_id uuid not null, organisation_id uuid not null,
 keyword text not null, target_url text, location text not null default 'United Kingdom', device text not null default 'mobile' check(device in ('mobile','desktop')), priority text not null default 'medium' check(priority in ('high','medium','low')), tags text[] not null default '{}', paused boolean not null default false, unique(id,project_id,organisation_id),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key(project_id,organisation_id) references public.seo_projects(id,organisation_id) on delete cascade
);
create index seo_keywords_tenant_idx on public.seo_keywords(organisation_id,project_id);
create table public.seo_keyword_ranks (
 id uuid primary key default gen_random_uuid(), project_id uuid not null, organisation_id uuid not null,
 keyword_id uuid not null, date date not null, position integer check(position between 1 and 100), search_volume integer, serp_features text[] not null default '{}', provider text not null, foreign key(keyword_id,project_id,organisation_id) references public.seo_keywords(id,project_id,organisation_id) on delete cascade, unique(keyword_id,date,provider),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key(project_id,organisation_id) references public.seo_projects(id,organisation_id) on delete cascade
);
create index seo_keyword_ranks_tenant_idx on public.seo_keyword_ranks(organisation_id,project_id);
create table public.seo_competitors (
 id uuid primary key default gen_random_uuid(), project_id uuid not null, organisation_id uuid not null,
 name text not null, domain text not null, unique(id,project_id,organisation_id),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key(project_id,organisation_id) references public.seo_projects(id,organisation_id) on delete cascade
);
create index seo_competitors_tenant_idx on public.seo_competitors(organisation_id,project_id);
create table public.seo_competitor_ranks (
 id uuid primary key default gen_random_uuid(), project_id uuid not null, organisation_id uuid not null,
 competitor_id uuid not null, keyword text not null, date date not null, position integer, provider text not null, foreign key(competitor_id,project_id,organisation_id) references public.seo_competitors(id,project_id,organisation_id) on delete cascade,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key(project_id,organisation_id) references public.seo_projects(id,organisation_id) on delete cascade
);
create index seo_competitor_ranks_tenant_idx on public.seo_competitor_ranks(organisation_id,project_id);
create table public.seo_conversions (
 id uuid primary key default gen_random_uuid(), project_id uuid not null, organisation_id uuid not null,
 event_name text not null, label text not null, configured boolean not null default false, last_seen_at timestamptz, unique(project_id,event_name),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key(project_id,organisation_id) references public.seo_projects(id,organisation_id) on delete cascade
);
create index seo_conversions_tenant_idx on public.seo_conversions(organisation_id,project_id);
create table public.seo_issues (
 id uuid primary key default gen_random_uuid(), project_id uuid not null, organisation_id uuid not null,
 fingerprint text not null, title text not null, severity text not null check(severity in ('critical','warning','opportunity','passed')), explanation text not null, recommendation text not null, urls text[] not null default '{}', status text not null default 'open' check(status in ('open','in_progress','resolved','ignored')), discovered_at timestamptz not null default now(), fixed_at timestamptz, unique(project_id,fingerprint), unique(id,project_id,organisation_id),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key(project_id,organisation_id) references public.seo_projects(id,organisation_id) on delete cascade
);
create index seo_issues_tenant_idx on public.seo_issues(organisation_id,project_id);
create table public.seo_opportunities (
 id uuid primary key default gen_random_uuid(), project_id uuid not null, organisation_id uuid not null,
 fingerprint text not null, title text not null, category text not null, priority text not null check(priority in ('high','medium','low')), evidence jsonb not null, action text not null, impact text not null, url text, query text, status text not null default 'new' check(status in ('new','planned','in_progress','completed','dismissed')), unique(project_id,fingerprint), unique(id,project_id,organisation_id),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key(project_id,organisation_id) references public.seo_projects(id,organisation_id) on delete cascade
);
create index seo_opportunities_tenant_idx on public.seo_opportunities(organisation_id,project_id);
create table public.seo_tasks (
 id uuid primary key default gen_random_uuid(), project_id uuid not null, organisation_id uuid not null,
 title text not null, description text not null default '', category text not null default 'Technical', priority text not null default 'medium' check(priority in ('high','medium','low')), status text not null default 'todo' check(status in ('todo','in_progress','done')), due_date date, completed_at timestamptz, assigned_to uuid references public.seo_users(id), url text, keyword text, issue_id uuid, opportunity_id uuid, client_visible boolean not null default false, foreign key(issue_id,project_id,organisation_id) references public.seo_issues(id,project_id,organisation_id), foreign key(opportunity_id,project_id,organisation_id) references public.seo_opportunities(id,project_id,organisation_id),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key(project_id,organisation_id) references public.seo_projects(id,organisation_id) on delete cascade
);
create index seo_tasks_tenant_idx on public.seo_tasks(organisation_id,project_id);
create table public.seo_activity (
 id uuid primary key default gen_random_uuid(), project_id uuid not null, organisation_id uuid not null,
 title text not null, description text not null, category text not null, urls text[] not null default '{}', occurred_at date not null default current_date, author_id uuid references public.seo_users(id), before_after text, client_visible boolean not null default true,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key(project_id,organisation_id) references public.seo_projects(id,organisation_id) on delete cascade
);
create index seo_activity_tenant_idx on public.seo_activity(organisation_id,project_id);
create table public.seo_audits (
 id uuid primary key default gen_random_uuid(), project_id uuid not null, organisation_id uuid not null,
 status text not null check(status in ('running','complete','partial','failed')), pages_checked integer not null default 0, limit_reached boolean not null default false, summary jsonb not null default '{}', started_at timestamptz not null default now(), finished_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key(project_id,organisation_id) references public.seo_projects(id,organisation_id) on delete cascade
);
create index seo_audits_tenant_idx on public.seo_audits(organisation_id,project_id);
create table public.seo_pages (
 id uuid primary key default gen_random_uuid(), project_id uuid not null, organisation_id uuid not null,
 url text not null, title text, description text, canonical text, status_code integer, indexable boolean, data jsonb not null default '{}', checked_at timestamptz, unique(project_id,url),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key(project_id,organisation_id) references public.seo_projects(id,organisation_id) on delete cascade
);
create index seo_pages_tenant_idx on public.seo_pages(organisation_id,project_id);
create table public.seo_page_metrics (
 id uuid primary key default gen_random_uuid(), project_id uuid not null, organisation_id uuid not null,
 url text not null, checked_at timestamptz not null default now(), strategy text not null default 'mobile', performance numeric, accessibility numeric, best_practices numeric, lighthouse_seo numeric, lcp_ms numeric, inp_ms numeric, cls numeric, field_data boolean not null default false, data jsonb not null default '{}',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key(project_id,organisation_id) references public.seo_projects(id,organisation_id) on delete cascade
);
create index seo_page_metrics_tenant_idx on public.seo_page_metrics(organisation_id,project_id);
create table public.seo_backlinks (
 id uuid primary key default gen_random_uuid(), project_id uuid not null, organisation_id uuid not null,
 source_url text not null, target_url text not null, anchor text, provider text not null, first_seen date, last_seen date,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key(project_id,organisation_id) references public.seo_projects(id,organisation_id) on delete cascade
);
create index seo_backlinks_tenant_idx on public.seo_backlinks(organisation_id,project_id);
create table public.seo_citations (
 id uuid primary key default gen_random_uuid(), project_id uuid not null, organisation_id uuid not null,
 directory text not null, url text, status text not null default 'to_review', notes text not null default '',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key(project_id,organisation_id) references public.seo_projects(id,organisation_id) on delete cascade
);
create index seo_citations_tenant_idx on public.seo_citations(organisation_id,project_id);
create table public.seo_local_rank_checks (
 id uuid primary key default gen_random_uuid(), project_id uuid not null, organisation_id uuid not null,
 keyword text not null, checked_at timestamptz not null, latitude numeric, longitude numeric, grid jsonb not null, provider text not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key(project_id,organisation_id) references public.seo_projects(id,organisation_id) on delete cascade
);
create index seo_local_rank_checks_tenant_idx on public.seo_local_rank_checks(organisation_id,project_id);
create table public.seo_reports (
 id uuid primary key default gen_random_uuid(), project_id uuid not null, organisation_id uuid not null,
 month date not null, title text not null, snapshot jsonb not null, published boolean not null default false, unique(project_id,month),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key(project_id,organisation_id) references public.seo_projects(id,organisation_id) on delete cascade
);
create index seo_reports_tenant_idx on public.seo_reports(organisation_id,project_id);
create table public.seo_notes (
 id uuid primary key default gen_random_uuid(), project_id uuid not null, organisation_id uuid not null,
 body text not null, author_id uuid references public.seo_users(id),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key(project_id,organisation_id) references public.seo_projects(id,organisation_id) on delete cascade
);
create index seo_notes_tenant_idx on public.seo_notes(organisation_id,project_id);
create table public.seo_notifications (
 id uuid primary key default gen_random_uuid(), project_id uuid not null, organisation_id uuid not null,
 title text not null, body text not null, read_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key(project_id,organisation_id) references public.seo_projects(id,organisation_id) on delete cascade
);
create index seo_notifications_tenant_idx on public.seo_notifications(organisation_id,project_id);
create table public.seo_sync_logs (
 id uuid primary key default gen_random_uuid(), project_id uuid not null, organisation_id uuid not null,
 provider text not null, status text not null check(status in ('running','success','partial','error')), records_processed integer not null default 0, error_code text, started_at timestamptz not null default now(), finished_at timestamptz, coverage_start date, coverage_end date, truncated boolean not null default false,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key(project_id,organisation_id) references public.seo_projects(id,organisation_id) on delete cascade
);
create index seo_sync_logs_tenant_idx on public.seo_sync_logs(organisation_id,project_id);
create table public.seo_baselines (
 id uuid primary key default gen_random_uuid(), project_id uuid not null, organisation_id uuid not null,
 period_start date not null, period_end date not null, snapshot jsonb not null, captured_by uuid references public.seo_users(id), check(period_end>=period_start),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key(project_id,organisation_id) references public.seo_projects(id,organisation_id) on delete cascade
);
create index seo_baselines_tenant_idx on public.seo_baselines(organisation_id,project_id);
create table public.seo_migrations (
 id uuid primary key default gen_random_uuid(), project_id uuid not null, organisation_id uuid not null,
 old_domain text not null, new_domain text not null, status text not null default 'planning' check(status in ('planning','ready','launched','monitoring','complete')), migration_date date, checklist jsonb not null default '{}', unique(id,project_id,organisation_id),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key(project_id,organisation_id) references public.seo_projects(id,organisation_id) on delete cascade
);
create index seo_migrations_tenant_idx on public.seo_migrations(organisation_id,project_id);
create table public.seo_redirects (
 id uuid primary key default gen_random_uuid(), project_id uuid not null, organisation_id uuid not null,
 migration_id uuid not null, old_url text not null, new_url text not null, http_status integer, redirect_status text not null default 'unchecked', old_indexed boolean, new_indexed boolean, checked_at timestamptz, foreign key(migration_id,project_id,organisation_id) references public.seo_migrations(id,project_id,organisation_id) on delete cascade,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key(project_id,organisation_id) references public.seo_projects(id,organisation_id) on delete cascade
);
create index seo_redirects_tenant_idx on public.seo_redirects(organisation_id,project_id);
create index seo_search_history_idx on public.seo_search_daily(project_id,kind,date);
create index seo_analytics_history_idx on public.seo_analytics_daily(project_id,kind,date);
create index seo_tasks_due_idx on public.seo_tasks(status,due_date) where status<>'done';
create index seo_activity_time_idx on public.seo_activity(project_id,occurred_at desc);
create index seo_logs_time_idx on public.seo_sync_logs(project_id,started_at desc);
create function public.seo_touch_updated() returns trigger language plpgsql set search_path = '' as $$ begin new.updated_at=now(); return new; end; $$;
alter table public.seo_users enable row level security;
revoke all on public.seo_users from anon;
grant select,insert,update,delete on public.seo_users to authenticated;
create trigger seo_users_updated before update on public.seo_users for each row execute function public.seo_touch_updated();
create policy seo_users_read on public.seo_users for select to authenticated using(id=auth.uid() or public.seo_is_admin());
revoke insert,update,delete on public.seo_users from authenticated;
alter table public.seo_organisations enable row level security;
revoke all on public.seo_organisations from anon;
grant select,insert,update,delete on public.seo_organisations to authenticated;
create trigger seo_organisations_updated before update on public.seo_organisations for each row execute function public.seo_touch_updated();
create policy seo_organisations_read on public.seo_organisations for select to authenticated using(public.seo_can_read(id));
create policy seo_organisations_admin on public.seo_organisations for all to authenticated using(public.seo_is_admin()) with check(public.seo_is_admin());
alter table public.seo_members enable row level security;
revoke all on public.seo_members from anon;
grant select,insert,update,delete on public.seo_members to authenticated;
create policy seo_members_read on public.seo_members for select to authenticated using(user_id=auth.uid() or public.seo_is_admin());
create policy seo_members_admin on public.seo_members for all to authenticated using(public.seo_is_admin()) with check(public.seo_is_admin());
alter table public.seo_websites enable row level security;
revoke all on public.seo_websites from anon;
grant select,insert,update,delete on public.seo_websites to authenticated;
create trigger seo_websites_updated before update on public.seo_websites for each row execute function public.seo_touch_updated();
create policy seo_websites_read on public.seo_websites for select to authenticated using(public.seo_can_read(organisation_id));
create policy seo_websites_admin on public.seo_websites for all to authenticated using(public.seo_is_admin()) with check(public.seo_is_admin());
alter table public.seo_projects enable row level security;
revoke all on public.seo_projects from anon;
grant select,insert,update,delete on public.seo_projects to authenticated;
create trigger seo_projects_updated before update on public.seo_projects for each row execute function public.seo_touch_updated();
create policy seo_projects_read on public.seo_projects for select to authenticated using(public.seo_can_read(organisation_id));
create policy seo_projects_admin on public.seo_projects for all to authenticated using(public.seo_is_admin()) with check(public.seo_is_admin());
alter table public.seo_domains enable row level security;
revoke all on public.seo_domains from anon;
grant select,insert,update,delete on public.seo_domains to authenticated;
create trigger seo_domains_updated before update on public.seo_domains for each row execute function public.seo_touch_updated();
create policy seo_domains_read on public.seo_domains for select to authenticated using(public.seo_can_read(organisation_id));
create policy seo_domains_admin on public.seo_domains for all to authenticated using(public.seo_is_admin()) with check(public.seo_is_admin());
alter table public.seo_integrations enable row level security;
revoke all on public.seo_integrations from anon;
grant select,insert,update,delete on public.seo_integrations to authenticated;
create trigger seo_integrations_updated before update on public.seo_integrations for each row execute function public.seo_touch_updated();
create policy seo_integrations_read on public.seo_integrations for select to authenticated using(public.seo_is_admin());
create policy seo_integrations_admin on public.seo_integrations for all to authenticated using(public.seo_is_admin()) with check(public.seo_is_admin());
alter table public.seo_google_connections enable row level security;
revoke all on public.seo_google_connections from anon;
grant select,insert,update,delete on public.seo_google_connections to authenticated;
create trigger seo_google_connections_updated before update on public.seo_google_connections for each row execute function public.seo_touch_updated();
create policy seo_google_connections_read on public.seo_google_connections for select to authenticated using(public.seo_is_admin());
create policy seo_google_connections_admin on public.seo_google_connections for all to authenticated using(public.seo_is_admin()) with check(public.seo_is_admin());
alter table public.seo_search_console_properties enable row level security;
revoke all on public.seo_search_console_properties from anon;
grant select,insert,update,delete on public.seo_search_console_properties to authenticated;
create trigger seo_search_console_properties_updated before update on public.seo_search_console_properties for each row execute function public.seo_touch_updated();
create policy seo_search_console_properties_read on public.seo_search_console_properties for select to authenticated using(public.seo_is_admin());
create policy seo_search_console_properties_admin on public.seo_search_console_properties for all to authenticated using(public.seo_is_admin()) with check(public.seo_is_admin());
alter table public.seo_analytics_properties enable row level security;
revoke all on public.seo_analytics_properties from anon;
grant select,insert,update,delete on public.seo_analytics_properties to authenticated;
create trigger seo_analytics_properties_updated before update on public.seo_analytics_properties for each row execute function public.seo_touch_updated();
create policy seo_analytics_properties_read on public.seo_analytics_properties for select to authenticated using(public.seo_is_admin());
create policy seo_analytics_properties_admin on public.seo_analytics_properties for all to authenticated using(public.seo_is_admin()) with check(public.seo_is_admin());
alter table public.seo_search_daily enable row level security;
revoke all on public.seo_search_daily from anon;
grant select,insert,update,delete on public.seo_search_daily to authenticated;
create trigger seo_search_daily_updated before update on public.seo_search_daily for each row execute function public.seo_touch_updated();
create policy seo_search_daily_read on public.seo_search_daily for select to authenticated using(public.seo_can_read(organisation_id));
create policy seo_search_daily_admin on public.seo_search_daily for all to authenticated using(public.seo_is_admin()) with check(public.seo_is_admin());
alter table public.seo_analytics_daily enable row level security;
revoke all on public.seo_analytics_daily from anon;
grant select,insert,update,delete on public.seo_analytics_daily to authenticated;
create trigger seo_analytics_daily_updated before update on public.seo_analytics_daily for each row execute function public.seo_touch_updated();
create policy seo_analytics_daily_read on public.seo_analytics_daily for select to authenticated using(public.seo_can_read(organisation_id));
create policy seo_analytics_daily_admin on public.seo_analytics_daily for all to authenticated using(public.seo_is_admin()) with check(public.seo_is_admin());
alter table public.seo_keywords enable row level security;
revoke all on public.seo_keywords from anon;
grant select,insert,update,delete on public.seo_keywords to authenticated;
create trigger seo_keywords_updated before update on public.seo_keywords for each row execute function public.seo_touch_updated();
create policy seo_keywords_read on public.seo_keywords for select to authenticated using(public.seo_can_read(organisation_id));
create policy seo_keywords_admin on public.seo_keywords for all to authenticated using(public.seo_is_admin()) with check(public.seo_is_admin());
alter table public.seo_keyword_ranks enable row level security;
revoke all on public.seo_keyword_ranks from anon;
grant select,insert,update,delete on public.seo_keyword_ranks to authenticated;
create trigger seo_keyword_ranks_updated before update on public.seo_keyword_ranks for each row execute function public.seo_touch_updated();
create policy seo_keyword_ranks_read on public.seo_keyword_ranks for select to authenticated using(public.seo_can_read(organisation_id));
create policy seo_keyword_ranks_admin on public.seo_keyword_ranks for all to authenticated using(public.seo_is_admin()) with check(public.seo_is_admin());
alter table public.seo_competitors enable row level security;
revoke all on public.seo_competitors from anon;
grant select,insert,update,delete on public.seo_competitors to authenticated;
create trigger seo_competitors_updated before update on public.seo_competitors for each row execute function public.seo_touch_updated();
create policy seo_competitors_read on public.seo_competitors for select to authenticated using(public.seo_can_read(organisation_id));
create policy seo_competitors_admin on public.seo_competitors for all to authenticated using(public.seo_is_admin()) with check(public.seo_is_admin());
alter table public.seo_competitor_ranks enable row level security;
revoke all on public.seo_competitor_ranks from anon;
grant select,insert,update,delete on public.seo_competitor_ranks to authenticated;
create trigger seo_competitor_ranks_updated before update on public.seo_competitor_ranks for each row execute function public.seo_touch_updated();
create policy seo_competitor_ranks_read on public.seo_competitor_ranks for select to authenticated using(public.seo_can_read(organisation_id));
create policy seo_competitor_ranks_admin on public.seo_competitor_ranks for all to authenticated using(public.seo_is_admin()) with check(public.seo_is_admin());
alter table public.seo_conversions enable row level security;
revoke all on public.seo_conversions from anon;
grant select,insert,update,delete on public.seo_conversions to authenticated;
create trigger seo_conversions_updated before update on public.seo_conversions for each row execute function public.seo_touch_updated();
create policy seo_conversions_read on public.seo_conversions for select to authenticated using(public.seo_can_read(organisation_id));
create policy seo_conversions_admin on public.seo_conversions for all to authenticated using(public.seo_is_admin()) with check(public.seo_is_admin());
alter table public.seo_issues enable row level security;
revoke all on public.seo_issues from anon;
grant select,insert,update,delete on public.seo_issues to authenticated;
create trigger seo_issues_updated before update on public.seo_issues for each row execute function public.seo_touch_updated();
create policy seo_issues_read on public.seo_issues for select to authenticated using(public.seo_can_read(organisation_id));
create policy seo_issues_admin on public.seo_issues for all to authenticated using(public.seo_is_admin()) with check(public.seo_is_admin());
alter table public.seo_opportunities enable row level security;
revoke all on public.seo_opportunities from anon;
grant select,insert,update,delete on public.seo_opportunities to authenticated;
create trigger seo_opportunities_updated before update on public.seo_opportunities for each row execute function public.seo_touch_updated();
create policy seo_opportunities_read on public.seo_opportunities for select to authenticated using(public.seo_is_admin());
create policy seo_opportunities_admin on public.seo_opportunities for all to authenticated using(public.seo_is_admin()) with check(public.seo_is_admin());
alter table public.seo_tasks enable row level security;
revoke all on public.seo_tasks from anon;
grant select,insert,update,delete on public.seo_tasks to authenticated;
create trigger seo_tasks_updated before update on public.seo_tasks for each row execute function public.seo_touch_updated();
create policy seo_tasks_read on public.seo_tasks for select to authenticated using(public.seo_can_read(organisation_id) and (public.seo_is_admin() or client_visible));
create policy seo_tasks_admin on public.seo_tasks for all to authenticated using(public.seo_is_admin()) with check(public.seo_is_admin());
alter table public.seo_activity enable row level security;
revoke all on public.seo_activity from anon;
grant select,insert,update,delete on public.seo_activity to authenticated;
create trigger seo_activity_updated before update on public.seo_activity for each row execute function public.seo_touch_updated();
create policy seo_activity_read on public.seo_activity for select to authenticated using(public.seo_can_read(organisation_id) and (public.seo_is_admin() or client_visible));
create policy seo_activity_admin on public.seo_activity for all to authenticated using(public.seo_is_admin()) with check(public.seo_is_admin());
alter table public.seo_audits enable row level security;
revoke all on public.seo_audits from anon;
grant select,insert,update,delete on public.seo_audits to authenticated;
create trigger seo_audits_updated before update on public.seo_audits for each row execute function public.seo_touch_updated();
create policy seo_audits_read on public.seo_audits for select to authenticated using(public.seo_can_read(organisation_id));
create policy seo_audits_admin on public.seo_audits for all to authenticated using(public.seo_is_admin()) with check(public.seo_is_admin());
alter table public.seo_pages enable row level security;
revoke all on public.seo_pages from anon;
grant select,insert,update,delete on public.seo_pages to authenticated;
create trigger seo_pages_updated before update on public.seo_pages for each row execute function public.seo_touch_updated();
create policy seo_pages_read on public.seo_pages for select to authenticated using(public.seo_can_read(organisation_id));
create policy seo_pages_admin on public.seo_pages for all to authenticated using(public.seo_is_admin()) with check(public.seo_is_admin());
alter table public.seo_page_metrics enable row level security;
revoke all on public.seo_page_metrics from anon;
grant select,insert,update,delete on public.seo_page_metrics to authenticated;
create trigger seo_page_metrics_updated before update on public.seo_page_metrics for each row execute function public.seo_touch_updated();
create policy seo_page_metrics_read on public.seo_page_metrics for select to authenticated using(public.seo_can_read(organisation_id));
create policy seo_page_metrics_admin on public.seo_page_metrics for all to authenticated using(public.seo_is_admin()) with check(public.seo_is_admin());
alter table public.seo_backlinks enable row level security;
revoke all on public.seo_backlinks from anon;
grant select,insert,update,delete on public.seo_backlinks to authenticated;
create trigger seo_backlinks_updated before update on public.seo_backlinks for each row execute function public.seo_touch_updated();
create policy seo_backlinks_read on public.seo_backlinks for select to authenticated using(public.seo_can_read(organisation_id));
create policy seo_backlinks_admin on public.seo_backlinks for all to authenticated using(public.seo_is_admin()) with check(public.seo_is_admin());
alter table public.seo_citations enable row level security;
revoke all on public.seo_citations from anon;
grant select,insert,update,delete on public.seo_citations to authenticated;
create trigger seo_citations_updated before update on public.seo_citations for each row execute function public.seo_touch_updated();
create policy seo_citations_read on public.seo_citations for select to authenticated using(public.seo_can_read(organisation_id));
create policy seo_citations_admin on public.seo_citations for all to authenticated using(public.seo_is_admin()) with check(public.seo_is_admin());
alter table public.seo_local_rank_checks enable row level security;
revoke all on public.seo_local_rank_checks from anon;
grant select,insert,update,delete on public.seo_local_rank_checks to authenticated;
create trigger seo_local_rank_checks_updated before update on public.seo_local_rank_checks for each row execute function public.seo_touch_updated();
create policy seo_local_rank_checks_read on public.seo_local_rank_checks for select to authenticated using(public.seo_can_read(organisation_id));
create policy seo_local_rank_checks_admin on public.seo_local_rank_checks for all to authenticated using(public.seo_is_admin()) with check(public.seo_is_admin());
alter table public.seo_reports enable row level security;
revoke all on public.seo_reports from anon;
grant select,insert,update,delete on public.seo_reports to authenticated;
create trigger seo_reports_updated before update on public.seo_reports for each row execute function public.seo_touch_updated();
create policy seo_reports_read on public.seo_reports for select to authenticated using(public.seo_can_read(organisation_id) and (public.seo_is_admin() or published));
create policy seo_reports_admin on public.seo_reports for all to authenticated using(public.seo_is_admin()) with check(public.seo_is_admin());
alter table public.seo_notes enable row level security;
revoke all on public.seo_notes from anon;
grant select,insert,update,delete on public.seo_notes to authenticated;
create trigger seo_notes_updated before update on public.seo_notes for each row execute function public.seo_touch_updated();
create policy seo_notes_read on public.seo_notes for select to authenticated using(public.seo_is_admin());
create policy seo_notes_admin on public.seo_notes for all to authenticated using(public.seo_is_admin()) with check(public.seo_is_admin());
alter table public.seo_notifications enable row level security;
revoke all on public.seo_notifications from anon;
grant select,insert,update,delete on public.seo_notifications to authenticated;
create trigger seo_notifications_updated before update on public.seo_notifications for each row execute function public.seo_touch_updated();
create policy seo_notifications_read on public.seo_notifications for select to authenticated using(public.seo_is_admin());
create policy seo_notifications_admin on public.seo_notifications for all to authenticated using(public.seo_is_admin()) with check(public.seo_is_admin());
alter table public.seo_sync_logs enable row level security;
revoke all on public.seo_sync_logs from anon;
grant select,insert,update,delete on public.seo_sync_logs to authenticated;
create trigger seo_sync_logs_updated before update on public.seo_sync_logs for each row execute function public.seo_touch_updated();
create policy seo_sync_logs_read on public.seo_sync_logs for select to authenticated using(public.seo_is_admin());
create policy seo_sync_logs_admin on public.seo_sync_logs for all to authenticated using(public.seo_is_admin()) with check(public.seo_is_admin());
alter table public.seo_baselines enable row level security;
revoke all on public.seo_baselines from anon;
grant select,insert,update,delete on public.seo_baselines to authenticated;
create trigger seo_baselines_updated before update on public.seo_baselines for each row execute function public.seo_touch_updated();
create policy seo_baselines_read on public.seo_baselines for select to authenticated using(public.seo_can_read(organisation_id));
create policy seo_baselines_admin on public.seo_baselines for all to authenticated using(public.seo_is_admin()) with check(public.seo_is_admin());
alter table public.seo_migrations enable row level security;
revoke all on public.seo_migrations from anon;
grant select,insert,update,delete on public.seo_migrations to authenticated;
create trigger seo_migrations_updated before update on public.seo_migrations for each row execute function public.seo_touch_updated();
create policy seo_migrations_read on public.seo_migrations for select to authenticated using(public.seo_is_admin());
create policy seo_migrations_admin on public.seo_migrations for all to authenticated using(public.seo_is_admin()) with check(public.seo_is_admin());
alter table public.seo_redirects enable row level security;
revoke all on public.seo_redirects from anon;
grant select,insert,update,delete on public.seo_redirects to authenticated;
create trigger seo_redirects_updated before update on public.seo_redirects for each row execute function public.seo_touch_updated();
create policy seo_redirects_read on public.seo_redirects for select to authenticated using(public.seo_is_admin());
create policy seo_redirects_admin on public.seo_redirects for all to authenticated using(public.seo_is_admin()) with check(public.seo_is_admin());
-- Immutable evidence: published reports and baselines cannot silently change.
create function public.seo_immutable_snapshot() returns trigger language plpgsql set search_path='' as $$
begin
 if TG_TABLE_NAME='seo_baselines' or old.published then raise exception 'Historical snapshots are immutable'; end if;
 return new;
end; $$;
create trigger seo_reports_immutable before update or delete on public.seo_reports for each row execute function public.seo_immutable_snapshot();
create trigger seo_baselines_immutable before update or delete on public.seo_baselines for each row execute function public.seo_immutable_snapshot();
-- Secrets are service-only; even agency browser JWTs cannot read these tables.
create table public.seo_oauth_secrets (
 project_id uuid not null references public.seo_projects(id) on delete cascade, service text not null,
 encrypted_token text not null, primary key(project_id,service)
);
create table public.seo_oauth_states (
 hash text primary key, user_id uuid not null references public.seo_users(id) on delete cascade,
 project_id uuid not null references public.seo_projects(id) on delete cascade, service text not null,
 verifier text not null, expires_at timestamptz not null, created_at timestamptz not null default now()
);
create table public.seo_rate_limits (key text primary key, count integer not null, reset_at timestamptz not null);
create table public.seo_job_locks (key text primary key, expires_at timestamptz not null);
alter table public.seo_oauth_secrets enable row level security;
alter table public.seo_oauth_states enable row level security;
alter table public.seo_rate_limits enable row level security;
alter table public.seo_job_locks enable row level security;
revoke all on public.seo_oauth_secrets,public.seo_oauth_states,public.seo_rate_limits,public.seo_job_locks from anon,authenticated;
create function public.seo_take_rate_limit(bucket text, maximum integer, seconds integer) returns boolean language plpgsql security definer set search_path='' as $$
declare n integer;
begin
 insert into public.seo_rate_limits as r(key,count,reset_at) values(bucket,1,now()+make_interval(secs=>seconds))
 on conflict(key) do update set count=case when r.reset_at<=now() then 1 else r.count+1 end,
 reset_at=case when r.reset_at<=now() then now()+make_interval(secs=>seconds) else r.reset_at end returning count into n;
 return n<=maximum;
end; $$;
create function public.seo_acquire_lock(lock_key text, seconds integer) returns boolean language plpgsql security definer set search_path='' as $$
declare got text;
begin
 insert into public.seo_job_locks as l(key,expires_at) values(lock_key,now()+make_interval(secs=>seconds))
 on conflict(key) do update set expires_at=excluded.expires_at where l.expires_at<now() returning key into got;
 return got is not null;
end; $$;
revoke all on function public.seo_take_rate_limit(text,integer,integer),public.seo_acquire_lock(text,integer) from public,anon,authenticated;
grant execute on function public.seo_take_rate_limit(text,integer,integer),public.seo_acquire_lock(text,integer) to service_role;
do $$ declare t record; begin for t in select tablename from pg_tables where schemaname='public' and tablename like 'seo_%' loop execute format('grant all on public.%I to service_role',t.tablename); end loop; end $$;
-- Atomic incomplete onboarding, never orphan a company on partial form failure.
create function public.seo_add_client(company text, site_url text, area text, service_list text[], started date) returns uuid language plpgsql security invoker set search_path='' as $$
declare org uuid; website uuid; project uuid;
begin
 if not public.seo_is_admin() then raise exception 'Not permitted'; end if;
 insert into public.seo_organisations(name,service_area,services,start_date) values(company,area,service_list,started) returning id into org;
 insert into public.seo_websites(organisation_id,url,name) values(org,site_url,company) returning id into website;
 insert into public.seo_projects(organisation_id,website_id,name) values(org,website,company) returning id into project;
 insert into public.seo_domains(project_id,organisation_id,hostname) values(project,org,site_url);
 insert into public.seo_conversions(project_id,organisation_id,event_name,label)
 select project,org,event,label from (values('quote_form_submitted','Quote requests'),('phone_clicked','Phone clicks'),('email_clicked','Email clicks'),('whatsapp_clicked','WhatsApp clicks'),('brochure_download','Brochure downloads'),('callback_requested','Callback requests')) x(event,label);
 return project;
end; $$;
revoke all on function public.seo_add_client(text,text,text,text[],date) from public,anon;
grant execute on function public.seo_add_client(text,text,text,text[],date) to authenticated;
commit;
