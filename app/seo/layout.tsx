import type { Metadata } from 'next';
import './seo.css';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:{default:'Anthēon — Search & Growth',template:'%s · Anthēon'},robots:{index:false,follow:false},description:'The private Anthēon search management workspace.'};
export default function SeoLayout({children}:{children:React.ReactNode}){return <>{children}</>;}
