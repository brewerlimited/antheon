-- Public enquiry endpoint uses the service role. Visitors cannot read the inbox.
begin;
create table public.site_enquiries (
 id uuid primary key default gen_random_uuid(), created_at timestamptz not null default now(),
 name text not null check(char_length(name) between 1 and 120), email text not null check(char_length(email) between 3 and 254),
 service text not null check(service in ('web-design','redesign','seo','website-care','other')),
 message text not null check(char_length(message) between 15 and 6000),
 request_hash text not null check(request_hash ~ '^[0-9a-f]{64}$'), idempotency_key uuid not null unique,
 status text not null default 'new' check(status in ('new','reviewed','closed'))
);
create index site_enquiries_inbox_idx on public.site_enquiries(created_at desc);
alter table public.site_enquiries enable row level security;
revoke all on public.site_enquiries from public,anon,authenticated;
grant select on public.site_enquiries to authenticated;
grant update(status) on public.site_enquiries to authenticated;
grant all on public.site_enquiries to service_role;
create policy site_enquiries_admin_read on public.site_enquiries for select to authenticated using(public.seo_is_admin());
create policy site_enquiries_admin_status on public.site_enquiries for update to authenticated using(public.seo_is_admin()) with check(public.seo_is_admin());
comment on table public.site_enquiries is 'Private enquiry inbox. No email notification provider connected. Review retention regularly; do not export to analytics.';
commit;
