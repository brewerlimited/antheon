import { notFound } from 'next/navigation';
import { demoEnabled,requestTime } from '@/lib/seo/db';
import { demoProjects,demoWorkspace } from '@/lib/seo/demo';
import { periodFor } from '@/lib/seo/metrics';
import { slug,tabs,type Workspace } from '@/lib/seo/types';
import { Shell } from '@/components/seo/ui';
import { Overview,NewClient,GlobalPage,demoOverview } from '@/components/seo/admin';
import { WorkspaceView } from '@/components/seo/workspace';
export default async function DemoPage({params,searchParams}:{params:Promise<{path?:string[]}>;searchParams:Promise<{period?:string;start?:string;end?:string}>}){
 if(!demoEnabled())notFound();const{path=[]}=await params,q=await searchParams,period=periodFor(q.period,q.start,q.end),all=demoProjects.map(p=>demoWorkspace(p.id)!).filter(Boolean) as Workspace[],portal=path[0]==='portal',root=portal?'portal':'admin';let content:React.ReactNode,name='Studio overview',active=path[1]??'overview';
 if(path[0]&&path[0]!==root)notFound();
 if(portal){const tab=path[1]??'overview';if(!['overview','activity','reports'].includes(tab)||path.length>2)notFound();content=<WorkspaceView w={all[0]} period={period} portal demo tab={tab} periodValue={q.period}/>;name=all[0].project.name;}
 else if(path[1]==='clients'&&path[2]){const w=demoWorkspace(path[2]),tab=path[3]??'overview';if(!w||!tabs.some(t=>slug(t)===tab)||path.length>4)notFound();content=<WorkspaceView w={w} period={period} demo tab={tab} periodValue={q.period}/>;name=w.project.name;active='clients';}
 else if(path[1]==='new'){content=<NewClient demo/>;active='clients';name='New client';}
 else if(!path[1]||path[1]==='clients'){content=<Overview now={requestTime()} rows={demoOverview(all,period)} period={period} featured={all[0]} tasks={all[0].tasks.map(r=>({...r,project_id:all[0].project.id,seo_projects:{name:all[0].project.name}}))} clientsOnly={path[1]==='clients'} demo periodValue={q.period}/>;}
 else if(['tasks','activity','reports','integrations','settings'].includes(path[1])){const tab=path[1],rows=tab==='integrations'?demoOverview(all,period):tab==='tasks'?all.flatMap(w=>w.tasks.map(r=>({...r,project_id:w.project.id,seo_projects:{name:w.project.name}}))):tab==='activity'?all.flatMap(w=>w.activity.map(r=>({...r,project_id:w.project.id,seo_projects:{name:w.project.name}}))):[];content=<GlobalPage now={requestTime()} tab={tab} rows={rows} demo superAdmin/>;name=tab;}
 else notFound();return <Shell demo portal={portal} name={name} active={active}><>{content}</></Shell>;
}
