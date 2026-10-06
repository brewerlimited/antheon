import { redirect } from 'next/navigation';
import { identity } from '@/lib/seo/db';
export default async function SeoHome(){const user=await identity();redirect(!user?'/seo/login':user.role==='client'?'/seo/portal':'/seo/admin');}
