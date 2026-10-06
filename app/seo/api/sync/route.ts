import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { databaseReady, serviceDb } from '@/lib/seo/db';
import { syncProject } from '@/lib/seo/sync';
export const maxDuration=300;
// Scheduler-ready, not scheduled automatically. Process one stale connection per call.
export async function POST(request:Request){
 const configured=process.env.SEO_CRON_SECRET,provided=request.headers.get('authorization')??'';
 const expected='Bearer '+configured;
 if(!configured||provided.length!==expected.length||!timingSafeEqual(Buffer.from(provided),Buffer.from(expected)))return NextResponse.json({error:'Unauthorised'},{status:401});
 if(!databaseReady())return NextResponse.json({error:'Not configured'},{status:503});
 const{data}=await serviceDb().from('seo_integrations').select('project_id,provider,seo_projects!inner(status)').eq('seo_projects.status','active').eq('state','connected').in('provider',['gsc','ga4']).not('property_id','is',null).or(`last_success_at.is.null,last_success_at.lt.${new Date(Date.now()-86400000).toISOString()}`).order('last_success_at',{ascending:true,nullsFirst:true}).limit(1);
 if(!data?.length)return NextResponse.json({status:'idle'});
 try{await syncProject(data[0].project_id,data[0].provider);return NextResponse.json({status:'complete'});}catch{return NextResponse.json({status:'retry_later'},{status:503});}
}
