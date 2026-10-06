import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { serviceDocuments } from '../../data/public-content';
import { validateServiceDocument, caseStudySchema, operationalRecordSchema } from '../../lib/site-content-schema';
const admin='50000000-0000-4000-8000-000000000001',client='50000000-0000-4000-8000-000000000002';
test('controlled content accepts reviewed defaults and rejects route changes, markup and arbitrary assets',()=>{
 for(const doc of serviceDocuments)assert.equal(validateServiceDocument(doc).slug,doc.slug);
 const doc=serviceDocuments[0];assert.throws(()=>validateServiceDocument({...doc,sections:[{...doc.sections[0],id:'pricing'}]}));assert.equal(operationalRecordSchema.safeParse({key:'ssl',status:'configured-unverified',note:'Test',evidence_url:'https://%broken'}).success,false);assert.throws(()=>validateServiceDocument({...doc,path:'/seo'}));assert.throws(()=>validateServiceDocument({...doc,intro:'<script>alert(1)</script>'}));assert.throws(()=>caseStudySchema.parse({title:'Case',kind:'concept',summary:'Private',problem:'Real problem',delivery:'Actual delivery',evidence:'Evidence pending',permission:'awaiting',image:'https://unapproved.example/x.svg'}));
});
test('content persistence isolates drafts, keeps public reads published-only and protects concurrent revisions',async()=>{
 const db=new PGlite();await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;grant usage on schema auth to authenticated,service_role;create table auth.users(id uuid primary key,raw_user_meta_data jsonb default '{}');create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid; $$;`);
 for(const file of(await fs.readdir('supabase/migrations')).sort())await db.exec(await fs.readFile('supabase/migrations/'+file,'utf8'));
 await db.query('insert into auth.users(id) values($1),($2)',[admin,client]);await db.query("update seo_users set role='super_admin' where id=$1",[admin]);
 async function as(role:string,id=''){await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id]);await db.exec('set role '+role);}
 await as('authenticated',admin);const payload={...serviceDocuments[0],intro:'Private draft text for testing'};
 await db.query('select site_save_content($1,$2,0)',[payload.slug,JSON.stringify(payload)]);
 await as('anon');assert.equal((await db.query('select * from site_content_published')).rows.length,0);await assert.rejects(()=>db.query('select * from site_content_drafts'));await assert.rejects(()=>db.query('select * from site_content_revisions'));
 await as('authenticated',client);assert.equal((await db.query('select * from site_content_drafts')).rows.length,0);await assert.rejects(()=>db.query('select site_save_content($1,$2,1)',[payload.slug,JSON.stringify(payload)]));await assert.rejects(()=>db.query('select site_publish_content($1,1,false)',[payload.slug]));
 await as('authenticated',admin);await assert.rejects(()=>db.query('select site_save_content($1,$2,0)',[payload.slug,JSON.stringify(payload)]),'stale draft cannot overwrite newer version');await db.query('select site_publish_content($1,1,false)',[payload.slug]);
 await as('anon');let published=await db.query<{document:Record<string,unknown>}>('select document from site_content_published');assert.equal(published.rows[0].document.intro,payload.intro);assert.equal(published.rows[0].document.status,'published');assert.ok(published.rows[0].document.updatedAt);
 await as('authenticated',admin);await db.query('select site_save_content($1,$2,1)',[payload.slug,JSON.stringify({...payload,intro:'Newer unreviewed text'})]);
 await as('anon');published=await db.query('select document from site_content_published');assert.equal(published.rows[0].document.intro,payload.intro,'draft save leaves published unchanged');
 await as('authenticated',admin);await db.query('select site_restore_content(1,2)');assert.equal((await db.query<{version:number}>('select version from site_content_drafts')).rows[0].version,3);await assert.rejects(()=>db.query("update site_content_revisions set document='{}'"));await assert.rejects(()=>db.query('select site_publish_content($1,3,true)',[payload.slug]),'core service route cannot be removed through RPC');
 await as('anon');assert.equal((await db.query<{document:Record<string,unknown>}>('select document from site_content_published')).rows[0].document.intro,payload.intro,'rejected withdrawal preserves the published page');
 await as('authenticated',admin);await assert.rejects(()=>db.query("select site_record_operation('ga4','verified','Just configured','',null)"));await db.query("select site_record_operation('ga4','configured-unverified','Awaiting real data','https://analytics.google.com',null)");
 await as('authenticated',client);assert.equal((await db.query('select * from site_operations')).rows.length,0);await assert.rejects(()=>db.query("select site_record_operation('ga4','configured-unverified','Wrong user','',null)"));
 await db.close();
});
