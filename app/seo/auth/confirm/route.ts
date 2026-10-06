import { NextResponse, type NextRequest } from 'next/server';
import { databaseReady, sessionDb, appOrigin } from '@/lib/seo/db';
export async function GET(request: NextRequest) {
  const hash=request.nextUrl.searchParams.get('token_hash'),type=request.nextUrl.searchParams.get('type');
  if(databaseReady()&&hash&&['invite','recovery','email'].includes(type??'')) {
    const {error}=await(await sessionDb()).auth.verifyOtp({token_hash:hash,type:type as 'invite'|'recovery'|'email'});
    if(!error)return NextResponse.redirect(new URL('/seo/login?message=password',appOrigin()));
  }
  return NextResponse.redirect(new URL('/seo/login?message=expired',appOrigin()));
}
