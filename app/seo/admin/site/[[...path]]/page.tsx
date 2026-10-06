import { notFound } from 'next/navigation';
import { siteAdminData } from '@/lib/site-admin';
import { Shell } from '@/components/seo/ui';
import { SiteAdmin } from '@/components/site-admin/SiteAdmin';
import { managedSlugs } from '@/lib/site-content-schema';
export const maxDuration=180;
export default async function SiteAdminPage({params,searchParams}:{params:Promise<{path?:string[]}>;searchParams:Promise<{message?:string}>}){
 const {path=[]}=await params,{message}=await searchParams,tab=path[0]??'overview';
 if(!['overview','content','operations','projects','health','enquiries','changes'].includes(tab)||path.length>2||(path[1]&&(tab!=='content'||!managedSlugs.some(s=>s===path[1]))))notFound();
 const {user,records}=await siteAdminData();let projectId:string|undefined;
 if(process.env.SITE_ANTHEON_PROJECT_ID){const {data}=await user.db.from('seo_projects').select('id,seo_websites(url)').eq('id',process.env.SITE_ANTHEON_PROJECT_ID).single();const site=data?.seo_websites as unknown as {url:string}|undefined;if(site&&['antheon.co.uk','www.antheon.co.uk'].includes(new URL(site.url).hostname))projectId=data!.id;}
 return <Shell active="site" name="Anthēon site operations" role={user.role}><SiteAdmin tab={tab} slug={path[1]} records={records} message={message} projectId={projectId}/></Shell>;
}
