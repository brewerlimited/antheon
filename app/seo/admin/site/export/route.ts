import { NextRequest, NextResponse } from 'next/server';
import { requireIdentity } from '@/lib/seo/db';
export async function GET(request:NextRequest){
 const user=await requireIdentity(true),now=new Date();const fallback=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth()-1,1)).toISOString().slice(0,7),month=request.nextUrl.searchParams.get('month')??fallback;
 if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(month))return NextResponse.json({error:'Invalid month'},{status:400});
 const end=new Date(Date.UTC(Number(month.slice(0,4)),Number(month.slice(5)),1)).toISOString();
 const {data,error}=await user.db.from('site_change_log').select('created_at,action,detail').gte('created_at',month+'-01').lt('created_at',end).order('created_at').limit(5000);
 if(error)return NextResponse.json({error:'Export unavailable'},{status:503});if(data.length===5000)return NextResponse.json({error:'Month exceeds export limit. Request a database export.'},{status:422});
 const cell=(v:string)=>'"'+(/^[=+@-]/.test(v)?"'"+v:v).replaceAll('"','""')+'"';
 const csv=['Date,Action,Evidence and next review',...data.map(r=>[r.created_at,r.action,r.detail].map(cell).join(','))].join('\r\n');
 return new NextResponse(csv,{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':`attachment; filename="antheon-actions-${month}.csv"`,'Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow'}});
}
