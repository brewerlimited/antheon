import { z } from 'zod';
import { concepts } from '@/data/concepts';
import type { ServiceDocument } from '@/data/public-content';
export const managedSlugs = ['web-design', 'website-redesign', 'seo-services', 'website-care'] as const;
const plain = (maximum: number) => z.string().trim().min(1).max(maximum).refine(value => !/[<>]/.test(value), 'Use plain text, not HTML.');
const reservedIds = new Set(['service-details','explore-title','questions-title','next-title','gallery-title','pricing','pricing-title']);
const localPath = z.string().max(240).regex(/^\/(?!\/)[a-z0-9/-]*(?:#[a-z0-9-]+)?$/);
export const serviceDocumentSchema = z.object({
 slug: z.enum(managedSlugs), path: localPath, status: z.enum(['published', 'draft']),
 title: plain(70), description: plain(180), eyebrow: plain(120), heading: plain(150), intro: plain(1600),
 sections: z.array(z.object({id: z.string().regex(/^[a-z0-9-]{1,60}$/), title: plain(160), body: z.array(plain(3000)).min(1).max(6), points: z.array(plain(500)).max(12).optional()})).min(1).max(10),
 faqs: z.array(z.object({question: plain(240), answer: plain(1800)})).max(12),
 proof: z.array(z.object({label: plain(160), href: localPath, kind: z.enum(['concept','venture','implementation']), description: plain(1000)})).max(12),
 related: z.array(z.enum(managedSlugs)).max(4), updatedAt: z.iso.datetime().optional(),
}).strict().superRefine((doc,ctx)=>{if(doc.path!=='/'+doc.slug)ctx.addIssue({code:'custom',message:'Published URLs are locked. A URL change requires a reviewed redirect.',path:['path']});if(doc.sections.some(s=>reservedIds.has(s.id)))ctx.addIssue({code:'custom',message:'This section ID is reserved by the page template.',path:['sections']});if(new Set(doc.sections.map(s=>s.id)).size!==doc.sections.length)ctx.addIssue({code:'custom',message:'Section IDs must be unique.',path:['sections']});});
export function validateServiceDocument(value: unknown): ServiceDocument {return serviceDocumentSchema.parse(value);}
export const caseStudySchema = z.object({title:plain(180),kind:z.enum(['commissioned','concept','internal','experimental']),summary:plain(1800),image:z.string().refine(v=>!v||concepts.some(c=>c.image===v),'Choose an existing managed asset.').optional(),problem:plain(3000),delivery:plain(3000),evidence:plain(3000),permission:z.enum(['awaiting','confirmed','not-applicable'])});
export const operationalRecordSchema=z.object({key:z.enum(['hosting','dns','ssl','monitoring','ga4','search-console','mailbox']),status:z.enum(['awaiting-configuration','configured-unverified','verified','needs-attention']),note:plain(2000),evidence_url:z.string().max(2048).refine(v=>{if(!v)return true;try{const url=new URL(v);return url.protocol==='https:'&&!url.username&&!url.password;}catch{return false;}},'Use a public HTTPS evidence link.'),verified_at:z.iso.date().optional()});
