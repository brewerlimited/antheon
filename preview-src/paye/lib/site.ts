import type { Metadata } from 'next';
export const origin = 'https://paye-stone-and-time.jackanthonybrewer.chatgpt.site';
export const categories = [
 {slug:'20th-century',name:'20th Century'},
 {slug:'castles-monuments',name:'Castles & Monuments'},
 {slug:'ecclesiastic-scholarly',name:'Ecclesiastic & Scholarly'},
 {slug:'commercial-retail-residential',name:'Commercial, Retail & Residential'},
 {slug:'cultural-diplomatic',name:'Cultural & Diplomatic'},
 {slug:'transport-utilities',name:'Transport & Utilities'},
];
export function meta(title:string,description:string,path:string,image='the-national-gallery-2-04'):Metadata {
 return {title,description,alternates:{canonical:path},openGraph:{title:`${title} — PAYE`,description,url:origin+path,images:[{url:`${origin}/images/${image}-1200.webp`,width:1200,height:800}],type:'website'},twitter:{card:'summary_large_image',title,description}};
}
export const organization = {'@type':'Organization','@id':'https://paye.net/#organization',name:'PAYE Stonework & Restoration',url:'https://paye.net',telephone:'+44 20 8857 9111',email:'info@paye.net',address:[{'@type':'PostalAddress',streetAddress:'Stationmasters House, Mottingham Station Approach',addressLocality:'London',postalCode:'SE9 4EL',addressCountry:'GB'},{'@type':'PostalAddress',streetAddress:'The Bonding Warehouse, Terry Avenue',addressLocality:'York',postalCode:'YO1 6FA',addressCountry:'GB'}]};
