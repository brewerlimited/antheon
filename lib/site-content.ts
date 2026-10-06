import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';
import { serviceDocuments, type ServiceDocument } from '@/data/public-content';
import { validateServiceDocument } from './site-content-schema';
const contentConfigured=()=>!!(process.env.SUPABASE_URL&&process.env.SUPABASE_ANON_KEY);
// Anonymous published-only access: drafts, actor IDs and revisions never enter public reads.
const publishedDocuments=unstable_cache(async()=>{
 const db=createClient(process.env.SUPABASE_URL!,process.env.SUPABASE_ANON_KEY!,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data,error}=await db.from('site_content_published').select('slug,document');
 if(error)throw new Error('Published content could not be loaded. Check the site-operations migration.');
 return data as {slug:string;document:unknown|null}[];
},['antheon-published-services-v1'],{tags:['site-content'],revalidate:60});
export async function getPublishedServices():Promise<ServiceDocument[]>{
 if(!contentConfigured())return serviceDocuments.filter(d=>d.status==='published');
 const rows=await publishedDocuments();
 return serviceDocuments.flatMap(base=>{const stored=rows.find(r=>r.slug===base.slug);if(!stored)return base.status==='published'?[base]:[];if(stored.document===null)return [];const doc=validateServiceDocument(stored.document);return doc.status==='published'?[doc]:[];});
}
export async function getPublishedService(slug:string){return(await getPublishedServices()).find(d=>d.slug===slug);}
