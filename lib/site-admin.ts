import 'server-only';
import { requireIdentity } from './seo/db';
export type SiteRow=Record<string,unknown>;
export async function siteAdminData(){
 const user=await requireIdentity(true);const tables=['site_content_drafts','site_content_published','site_content_revisions','site_operations','site_case_studies','site_change_log','site_checks','site_enquiries'] as const;
 const rows=await Promise.all(tables.map(async table=>{
  const order=table==='site_operations'?'updated_at':table==='site_content_drafts'?'updated_at':table==='site_content_published'?'published_at':table==='site_checks'?'checked_at':'created_at';
  const {data,error}=await user.db.from(table).select('*').order(order,{ascending:false}).limit(100);
  if(error)throw new Error('Apply the site-operations database migrations before opening this area.');return [table,data] as const;
 }));
 return {user,records:Object.fromEntries(rows) as Record<string,SiteRow[]>};
}
