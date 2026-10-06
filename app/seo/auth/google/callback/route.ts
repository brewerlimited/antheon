import { NextResponse, type NextRequest } from 'next/server';
import { requireIdentity, appOrigin } from '@/lib/seo/db';
import { finishGoogle } from '@/lib/seo/google';
export async function GET(request:NextRequest){
 const user=await requireIdentity(true);
 try{const project=await finishGoogle(user.id,request.nextUrl.searchParams.get('state')??'',request.nextUrl.searchParams.get('code')??'');return NextResponse.redirect(new URL(`/seo/admin/clients/${project}/integrations?message=connected`,appOrigin()));}
 catch{return NextResponse.redirect(new URL('/seo/admin/integrations?message=invalid_state',appOrigin()));}
}
