import { notFound } from 'next/navigation';
import { requireIdentity,requestTime } from '@/lib/seo/db';
import { overview,workspace } from '@/lib/seo/data';
import { periodFor } from '@/lib/seo/metrics';
import { tabs,slug,type Row } from '@/lib/seo/types';
import { Shell,Message } from '@/components/seo/ui';
import { Overview,NewClient,GlobalPage } from '@/components/seo/admin';
import { WorkspaceView } from '@/components/seo/workspace';
export const maxDuration=300;
export default async function AdminPage({params,searchParams}:{params:Promise<{path?:string[]}>;searchParams:Promise<{period?:string;start?:string;end?:string;page?:string;message?:string}>}){
 const user=await requireIdentity(true),{path=[]}=await params,query=await searchParams,period=periodFor(query.period,query.start,query.end),page=Math.max(0,Math.min(10000,Number(query.page)||0));
 let content:React.ReactNode,name='Studio overview',active=path[0]??'overview';
 if(path[0]==='clients'&&path[1]){const tab=path[2]??'overview';if(!tabs.some(t=>slug(t)===tab)||path.length>4||(path[3]&&tab!=='reports'))notFound();const w=await workspace(path[1],period,tab);content=<WorkspaceView w={w} period={period} tab={tab} periodValue={query.period} reportId={path[3]}/>;name=w.project.name;active='clients';}
 else if(!path.length||path[0]==='clients'){const rows=await overview(period,page),{data:tasks}=await user.db.from('seo_tasks').select('*,seo_projects(name)').neq('status','done').order('due_date',{ascending:true,nullsFirst:false}).limit(8);let featured;if(rows[0])featured=await workspace(rows[0].id,period,'featured');content=<Overview now={requestTime()} rows={rows} period={period} tasks={(tasks??[]) as Row[]} featured={featured} clientsOnly={path[0]==='clients'} page={page} periodValue={query.period}/>;}
 else if(path[0]==='new'&&path.length===1){content=<NewClient/>;name='New client';active='clients';}
 else if(['tasks','activity','reports','integrations','settings'].includes(path[0])&&path.length===1){let rows:Row[]=[];if(path[0]==='integrations')rows=await overview(period,page);else if(['tasks','activity','reports'].includes(path[0])){const{data,error}=await user.db.from('seo_'+path[0]).select('*,seo_projects(name)').order(path[0]==='tasks'?'due_date':'created_at',{ascending:path[0]==='tasks',nullsFirst:false}).limit(100);if(error)throw new Error('Unable to load this section.');rows=data as Row[];}content=<GlobalPage now={requestTime()} tab={path[0]} rows={rows} superAdmin={user.role==='super_admin'}/>;name=path[0];}
 else notFound();
 return <Shell name={name} active={active} role={user.role}><Message code={query.message}/>{content}</Shell>;
}
