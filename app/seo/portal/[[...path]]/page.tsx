import { notFound } from 'next/navigation';
import Link from 'next/link';
import { requireIdentity } from '@/lib/seo/db';
import { projects,workspace } from '@/lib/seo/data';
import { periodFor } from '@/lib/seo/metrics';
import { Shell,Empty } from '@/components/seo/ui';
import { WorkspaceView } from '@/components/seo/workspace';
export default async function PortalPage({params,searchParams}:{params:Promise<{path?:string[]}>;searchParams:Promise<{project?:string;period?:string;start?:string;end?:string}>}){
 await requireIdentity();const{path=[]}=await params,q=await searchParams,available=await projects(),project=available.find(p=>p.id===q.project)??(q.project?null:available[0]),tab=path[0]??'overview';
 if(q.project&&!project)notFound();if(!['overview','activity','reports'].includes(tab)||path.length>2||(path[1]&&tab!=='reports'))notFound();
 if(!project)return <Shell portal><Empty title="Your workspace is being prepared.">Anthēon will connect your company to this account. No other client’s data is accessible.</Empty></Shell>;
 const period=periodFor(q.period,q.start,q.end),w=await workspace(project.id,period,tab);
 return <Shell portal projectId={project.id} name={project.name} active={tab}>{available.length>1&&<nav className="seo-website-picker" aria-label="Your websites">{available.map(p=><Link key={p.id} href={'/seo/portal?project='+p.id} aria-current={p.id===project.id?'page':undefined}>{p.name}</Link>)}</nav>}<WorkspaceView w={w} period={period} portal tab={tab} periodValue={q.period} reportId={path[1]}/></Shell>;
}
