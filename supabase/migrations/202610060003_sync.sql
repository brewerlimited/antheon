begin;
create function public.seo_store_sync(target_project uuid,provider text,from_date date,to_date date,rows_json jsonb)
returns void language plpgsql security invoker set search_path='' as $$
declare org uuid;
begin
 if to_date<from_date or to_date-from_date>28 or jsonb_array_length(rows_json)>300000 then raise exception 'Invalid sync interval'; end if;
 select organisation_id into strict org from public.seo_projects where id=target_project;
 if provider='gsc' then
 delete from public.seo_search_daily where project_id=target_project and date between from_date and to_date;
 insert into public.seo_search_daily(project_id,organisation_id,date,kind,dimension,page,clicks,impressions,position)
 select target_project,org,r.date,r.kind,r.dimension,r.page,r.clicks,r.impressions,r.position from jsonb_to_recordset(rows_json) as r(date date,kind text,dimension text,page text,clicks numeric,impressions numeric,position numeric) where r.date between from_date and to_date;
 elsif provider='ga4' then
 delete from public.seo_analytics_daily where project_id=target_project and date between from_date and to_date;
 insert into public.seo_analytics_daily(project_id,organisation_id,date,kind,dimension,users,sessions,engaged_sessions,actions)
 select target_project,org,r.date,r.kind,r.dimension,r.users,r.sessions,r.engaged_sessions,r.actions from jsonb_to_recordset(rows_json) as r(date date,kind text,dimension text,users numeric,sessions numeric,engaged_sessions numeric,actions numeric) where r.date between from_date and to_date;
 else raise exception 'Unknown provider'; end if;
end; $$;
revoke all on function public.seo_store_sync(uuid,text,date,date,jsonb) from public,anon,authenticated;
grant execute on function public.seo_store_sync(uuid,text,date,date,jsonb) to service_role;
commit;
