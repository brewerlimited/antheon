import { NextResponse, type NextRequest } from 'next/server';
import { requireProject } from '@/lib/seo/db';
import { beginGoogle } from '@/lib/seo/google';
export async function GET(request:NextRequest){
 const projectId=request.nextUrl.searchParams.get('project')??'',service=request.nextUrl.searchParams.get('service');
 if(service!=='gsc'&&service!=='ga4')return new NextResponse('Not found',{status:404});
 const {user}=await requireProject(projectId,true);
 try{return NextResponse.redirect(await beginGoogle(user.id,projectId,service));}catch{return NextResponse.redirect(new URL(`/seo/admin/clients/${projectId}/integrations?message=not_configured`,request.url));}
}
