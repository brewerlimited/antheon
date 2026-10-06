'use server';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath, updateTag } from 'next/cache';
import { requireIdentity, rateLimit } from '@/lib/seo/db';
import { serviceDocuments } from '@/data/public-content';
import { caseStudySchema, managedSlugs, operationalRecordSchema, validateServiceDocument } from '@/lib/site-content-schema';
import { runPublicHealthCheck } from '@/lib/site-health';
const value=(form:FormData,key:string)=>String(form.get(key)??'');
export async function siteAction(form:FormData){
 const user=await requireIdentity(true);let path='/seo/admin/site',message='saved';
 try{
  await rateLimit('site-admin:'+user.id,30,60);
  const action=value(form,'action');
  if(action==='withdraw')throw new Error('protected_route');
  if(['save','publish','withdraw','restore'].includes(action)){
   const slug=z.enum(managedSlugs).parse(value(form,'slug')),version=z.coerce.number().int().min(0).parse(value(form,'version'));path+='/content/'+slug;
   if(action==='save'){
    const base=serviceDocuments.find(d=>d.slug===slug)!;
    const input=validateServiceDocument({...base,status:'draft',title:value(form,'title'),description:value(form,'description'),heading:value(form,'heading'),intro:value(form,'intro'),
     sections:base.sections.map((section,i)=>({...section,title:value(form,`section-title-${i}`),body:value(form,`section-body-${i}`).split(/\n\s*\n/).map(s=>s.trim()).filter(Boolean),points:section.points?value(form,`section-points-${i}`).split('\n').map(s=>s.trim()).filter(Boolean):undefined})),
     faqs:base.faqs.map((_,i)=>({question:value(form,`faq-question-${i}`),answer:value(form,`faq-answer-${i}`)}))});
    const {error}=await user.db.rpc('site_save_content',{target_slug:slug,payload:input,expected_version:version});if(error)throw new Error(error.message.includes('newer revision')?'conflict':'save_failed');
   }else if(action==='restore'){
    const revision=z.coerce.number().int().positive().parse(value(form,'revision'));
    const {data}=await user.db.from('site_content_revisions').select('slug').eq('id',revision).single();if(data?.slug!==slug)throw new Error('invalid_input');
    const {error}=await user.db.rpc('site_restore_content',{target_revision:revision,expected_version:version});if(error)throw new Error('conflict');message='restored';
   }else{
    const {data}=await user.db.from('site_content_drafts').select('document').eq('slug',slug).single();if(!data)throw new Error('save_first');validateServiceDocument(data.document);
    const {error}=await user.db.rpc('site_publish_content',{target_slug:slug,expected_version:version,withdraw:action==='withdraw'});if(error)throw new Error('conflict');message=action==='withdraw'?'withdrawn':'published';updateTag('site-content');revalidatePath('/'+slug);revalidatePath('/sitemap.xml');
   }
  }else if(action==='operation'){
   path+='/operations';const record=operationalRecordSchema.parse({key:value(form,'key'),status:value(form,'status'),note:value(form,'note'),evidence_url:value(form,'evidence_url'),verified_at:value(form,'verified_at')||undefined});
   if(record.status==='verified'&&(!record.verified_at||!record.evidence_url))throw new Error('evidence_required');
   const {error}=await user.db.rpc('site_record_operation',{record_key:record.key,record_status:record.status,record_note:record.note,record_evidence:record.evidence_url,record_verified:record.verified_at??null});if(error)throw new Error('save_failed');
  }else if(action==='case-study'){
   path+='/projects';const input=caseStudySchema.parse(Object.fromEntries(['title','kind','summary','image','problem','delivery','evidence','permission'].map(k=>[k,value(form,k)])));
   const {error}=await user.db.from('site_case_studies').insert({document:input,created_by:user.id});if(error)throw new Error('save_failed');
  }else if(action==='check'){
   path+='/health';await rateLimit('site-health',2,3600);const summary=await runPublicHealthCheck();
   const {error}=await user.db.from('site_checks').insert({kind:'public-live-http',summary,checked_by:user.id});if(error)throw new Error('save_failed');message='checked';
  }else if(action==='enquiry'){
   path+='/enquiries';const {data,error}=await user.db.from('site_enquiries').update({status:z.enum(['new','reviewed','closed']).parse(value(form,'status'))}).eq('id',z.uuid().parse(value(form,'id'))).select('id');if(error||!data?.length)throw new Error('save_failed');
  }else if(action==='annotation'){
   path+='/changes';const {error}=await user.db.from('site_change_log').insert({actor:user.id,action:z.string().trim().min(1).max(160).parse(value(form,'title')),detail:z.string().trim().min(1).max(3000).parse(value(form,'detail'))});if(error)throw new Error('save_failed');
  }else throw new Error('invalid_input');
 }catch(e){message=e instanceof z.ZodError?'invalid_input':e instanceof Error&&['conflict','save_first','evidence_required','rate_limited','protected_route'].includes(e.message)?e.message:'save_failed';}
 revalidatePath('/seo/admin/site','layout');redirect(path+'?message='+message);
}
