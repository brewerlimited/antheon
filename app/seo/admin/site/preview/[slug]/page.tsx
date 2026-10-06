import { notFound } from 'next/navigation';
import Link from 'next/link';
import { requireIdentity } from '@/lib/seo/db';
import { validateServiceDocument } from '@/lib/site-content-schema';
import { ServiceBody, ServicePage } from '@/components/public-content/ServiceContent';
export default async function DraftPreview({params}:{params:Promise<{slug:string}>}){
 const user=await requireIdentity(true),{slug}=await params;const {data}=await user.db.from('site_content_drafts').select('document,version').eq('slug',slug).single();if(!data)notFound();
 const document=validateServiceDocument(data.document);
 return <><aside style={{position:'relative',zIndex:100,padding:16,background:'#182138',color:'#d3ddff'}}>Private draft · revision {data.version}. <Link href={'/seo/admin/site/content/'+slug}>Return to editing →</Link></aside>{slug==='web-design'?<main className="site-container"><h1>Web-design service content preview</h1><p>This previews the editable service section. The existing gallery and pricing remain above it on the public page.</p><ServiceBody document={document} compact/></main>:<ServicePage document={document}/>}</>;
}
