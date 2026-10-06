begin;
-- RLS still applies: this function runs with the caller's privileges.
create function public.seo_overview(from_date date,to_date date,previous_from date,previous_to date,page_offset integer default 0)
returns jsonb language sql stable security invoker set search_path='' as $$
select coalesce(jsonb_agg(row_to_json(result)),'[]'::jsonb) from (
 select p.id,p.name,p.status,w.url,
 coalesce(s.clicks,0) clicks,coalesce(s.previous_clicks,0) previous_clicks,
 coalesce(s.impressions,0) impressions,coalesce(s.previous_impressions,0) previous_impressions,
 coalesce(s.days,0) days,coalesce(s.previous_days,0) previous_days,
 (select count(*) from public.seo_issues i where i.project_id=p.id and i.status not in ('resolved','ignored') and i.severity<>'passed') issues,
 (select count(*) from public.seo_issues i where i.project_id=p.id and i.status not in ('resolved','ignored') and i.severity='critical') critical,
 (select max(last_success_at) from public.seo_integrations i where i.project_id=p.id) last_sync,
 (select max(occurred_at) from public.seo_activity a where a.project_id=p.id) last_activity,
 case when exists(select 1 from public.seo_conversions c where c.project_id=p.id and c.configured) and exists(select 1 from public.seo_analytics_daily a where a.project_id=p.id and a.kind='total' and a.date between from_date and to_date) then (select coalesce(sum(a.actions),0) from public.seo_analytics_daily a where a.project_id=p.id and a.kind='event' and a.date between from_date and to_date and exists(select 1 from public.seo_conversions c where c.project_id=p.id and c.configured and c.event_name=a.dimension)) else null end actions
 from public.seo_projects p join public.seo_websites w on w.id=p.website_id
 left join lateral (
 select sum(clicks) filter(where date between from_date and to_date) clicks,
 sum(clicks) filter(where date between previous_from and previous_to) previous_clicks,
 sum(impressions) filter(where date between from_date and to_date) impressions,
 sum(impressions) filter(where date between previous_from and previous_to) previous_impressions,
 count(distinct date) filter(where date between from_date and to_date) days,
 count(distinct date) filter(where date between previous_from and previous_to) previous_days
 from public.seo_search_daily where project_id=p.id and kind='total' and date between previous_from and to_date
 ) s on true
 where public.seo_is_admin() and p.status<>'archived' order by p.name limit 25 offset greatest(0,page_offset)
) result;
$$;
revoke all on function public.seo_overview(date,date,date,date,integer) from public,anon;
grant execute on function public.seo_overview(date,date,date,date,integer) to authenticated;
commit;
