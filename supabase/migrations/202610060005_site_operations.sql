begin;
-- Single-site editorial controls reuse agency auth. These do not add client tenancy.
create table public.site_content_drafts (
 slug text primary key check(slug in ('web-design','website-redesign','seo-services','website-care')),
 document jsonb not null check(jsonb_typeof(document)='object' and octet_length(document::text)<100000),
 version integer not null default 1, updated_at timestamptz not null default now(), updated_by uuid references public.seo_users(id)
);
create table public.site_content_published (
 slug text primary key references public.site_content_drafts(slug),
 document jsonb check(document is null or jsonb_typeof(document)='object'), published_at timestamptz not null default now()
);
create table public.site_content_revisions (
 id bigint generated always as identity primary key, slug text not null references public.site_content_drafts(slug),
 document jsonb not null, version integer not null, action text not null check(action in ('draft','publish','withdraw')),
 created_at timestamptz not null default now(), actor uuid references public.seo_users(id)
);
create table public.site_operations (
 key text primary key check(key in ('hosting','dns','ssl','monitoring','ga4','search-console','mailbox')),
 status text not null check(status in ('awaiting-configuration','configured-unverified','verified','needs-attention')),
 note text not null, evidence_url text not null default '', verified_at date,
 updated_at timestamptz not null default now(), updated_by uuid references public.seo_users(id)
);
create table public.site_case_studies (
 id uuid primary key default gen_random_uuid(), document jsonb not null,
 created_at timestamptz not null default now(), created_by uuid references public.seo_users(id)
);
create table public.site_change_log (
 id uuid primary key default gen_random_uuid(), action text not null, detail text not null,
 created_at timestamptz not null default now(), actor uuid references public.seo_users(id)
);
create table public.site_checks (
 id uuid primary key default gen_random_uuid(), kind text not null, summary jsonb not null,
 checked_at timestamptz not null default now(), checked_by uuid references public.seo_users(id)
);
do $$ declare t text; begin
 foreach t in array array['site_content_drafts','site_content_published','site_content_revisions','site_operations','site_case_studies','site_change_log','site_checks'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('revoke all on public.%I from anon,authenticated',t);
  execute format('grant all on public.%I to service_role',t);
  execute format('grant select on public.%I to authenticated',t);
  execute format('create policy site_admin_read on public.%I for select to authenticated using(public.seo_is_admin())',t);
 end loop;
end $$;
grant select on public.site_content_published to anon;
create policy site_public_read on public.site_content_published for select to anon using(true);
-- A private signed-in client can still read the same genuinely public published content.
create policy site_published_read on public.site_content_published for select to authenticated using(true);
grant insert on public.site_case_studies,public.site_change_log,public.site_checks to authenticated;
create policy site_case_create on public.site_case_studies for insert to authenticated with check(public.seo_is_admin() and created_by=auth.uid());
create policy site_log_create on public.site_change_log for insert to authenticated with check(public.seo_is_admin() and actor=auth.uid());
create policy site_check_create on public.site_checks for insert to authenticated with check(public.seo_is_admin() and checked_by=auth.uid());
create function public.site_save_content(target_slug text,payload jsonb,expected_version integer) returns integer language plpgsql security definer set search_path='' as $$
declare current_version integer; next_version integer;
begin
 if not public.seo_is_admin() then raise exception 'Not permitted'; end if;
 if target_slug not in ('web-design','website-redesign','seo-services','website-care') or payload->>'slug' is distinct from target_slug or payload->>'path' is distinct from '/'||target_slug then raise exception 'The published URL is locked'; end if;
 perform pg_advisory_xact_lock(hashtextextended('site-content:'||target_slug,0));
 select version into current_version from public.site_content_drafts where slug=target_slug;
 if coalesce(current_version,0)<>expected_version then raise exception 'A newer revision exists. Reload before saving'; end if;
 next_version:=coalesce(current_version,0)+1;
 payload:=jsonb_set(payload,'{status}','"draft"');
 insert into public.site_content_drafts(slug,document,version,updated_by) values(target_slug,payload,next_version,auth.uid())
 on conflict(slug) do update set document=excluded.document,version=excluded.version,updated_at=now(),updated_by=auth.uid();
 insert into public.site_content_revisions(slug,document,version,action,actor) values(target_slug,payload,next_version,'draft',auth.uid());
 insert into public.site_change_log(action,detail,actor) values('Content draft saved',target_slug||' · revision '||next_version,auth.uid());
 return next_version;
end $$;
create function public.site_publish_content(target_slug text,expected_version integer,withdraw boolean default false) returns void language plpgsql security definer set search_path='' as $$
declare draft public.site_content_drafts; payload jsonb;
begin
 if not public.seo_is_admin() then raise exception 'Not permitted'; end if;
 if withdraw then raise exception 'Core service routes are protected. Review navigation and redirects in code before removing a page'; end if;
 perform pg_advisory_xact_lock(hashtextextended('site-content:'||target_slug,0));
 select * into draft from public.site_content_drafts where slug=target_slug;
 if draft is null or draft.version<>expected_version then raise exception 'A newer revision exists. Reload before publishing'; end if;
 payload:=jsonb_set(jsonb_set(draft.document,'{status}','"published"'),'{updatedAt}',to_jsonb(to_char(clock_timestamp() at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')));
 insert into public.site_content_published(slug,document) values(target_slug,case when withdraw then null else payload end)
 on conflict(slug) do update set document=excluded.document,published_at=now();
 insert into public.site_content_revisions(slug,document,version,action,actor) values(target_slug,payload,draft.version,case when withdraw then 'withdraw' else 'publish' end,auth.uid());
 insert into public.site_change_log(action,detail,actor) values(case when withdraw then 'Content withdrawn' else 'Content published' end,target_slug||' · revision '||draft.version,auth.uid());
end $$;
create function public.site_restore_content(target_revision bigint,expected_version integer) returns integer language plpgsql security definer set search_path='' as $$
declare revision public.site_content_revisions;
begin
 if not public.seo_is_admin() then raise exception 'Not permitted'; end if;
 select * into revision from public.site_content_revisions where id=target_revision;
 if revision is null then raise exception 'Revision unavailable'; end if;
 return public.site_save_content(revision.slug,revision.document,expected_version);
end $$;
create function public.site_record_operation(record_key text,record_status text,record_note text,record_evidence text,record_verified date) returns void language plpgsql security definer set search_path='' as $$
begin
 if not public.seo_is_admin() then raise exception 'Not permitted'; end if;
 if char_length(record_note)>2000 or char_length(record_evidence)>2048 or (record_status='verified' and (record_verified is null or record_evidence='')) then raise exception 'Verified records require dated evidence'; end if;
 insert into public.site_operations(key,status,note,evidence_url,verified_at,updated_by) values(record_key,record_status,record_note,record_evidence,record_verified,auth.uid())
 on conflict(key) do update set status=excluded.status,note=excluded.note,evidence_url=excluded.evidence_url,verified_at=excluded.verified_at,updated_at=now(),updated_by=auth.uid();
 insert into public.site_change_log(action,detail,actor) values('Operational record updated',record_key||' · '||record_status,auth.uid());
end $$;
revoke all on function public.site_save_content(text,jsonb,integer),public.site_publish_content(text,integer,boolean),public.site_restore_content(bigint,integer),public.site_record_operation(text,text,text,text,date) from public,anon;
grant execute on function public.site_save_content(text,jsonb,integer),public.site_publish_content(text,integer,boolean),public.site_restore_content(bigint,integer),public.site_record_operation(text,text,text,text,date) to authenticated;
commit;
