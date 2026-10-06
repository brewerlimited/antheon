begin;
-- A second website belongs to the existing client and inherits its memberships.
create function public.seo_add_website(org uuid, site_url text, project_name text)
returns uuid language plpgsql security invoker set search_path='' as $$
declare website uuid; project uuid;
begin
 if not public.seo_is_admin() then raise exception 'Not permitted'; end if;
 insert into public.seo_websites(organisation_id,url,name) values(org,site_url,project_name) returning id into website;
 insert into public.seo_projects(organisation_id,website_id,name) values(org,website,project_name) returning id into project;
 insert into public.seo_domains(project_id,organisation_id,hostname) values(project,org,site_url);
 insert into public.seo_conversions(project_id,organisation_id,event_name,label)
 select project,org,event,label from (values('quote_form_submitted','Quote requests'),('phone_clicked','Phone clicks'),('email_clicked','Email clicks'),('whatsapp_clicked','WhatsApp clicks'),('brochure_download','Brochure downloads'),('callback_requested','Callback requests')) x(event,label);
 return project;
end; $$;
revoke all on function public.seo_add_website(uuid,text,text) from public,anon;
grant execute on function public.seo_add_website(uuid,text,text) to authenticated;
-- History is scoped to a project. Never silently mix data from different Google properties.
create function public.seo_guard_property() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if old.property_id is distinct from new.property_id then
  if exists(select 1 from public.seo_job_locks where key='sync:'||old.project_id::text and expires_at>now())
   or (old.provider='gsc' and exists(select 1 from public.seo_search_daily where project_id=old.project_id))
   or (old.provider='ga4' and exists(select 1 from public.seo_analytics_daily where project_id=old.project_id)) then
   raise exception 'Create a separate website project to use a different reporting property';
  end if;
 end if;
 return new;
end; $$;
create trigger seo_property_history_guard before update of property_id on public.seo_integrations for each row execute function public.seo_guard_property();
commit;
