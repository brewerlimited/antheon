import 'server-only';
import { safeFetch } from './seo/crawler';
import { load } from 'cheerio';
export async function runPublicHealthCheck(){
 const origin='https://www.antheon.co.uk';
 const paths=['/','/web-design','/website-redesign','/seo-services','/website-care','/contact','/privacy','/sitemap.xml','/robots.txt'];
 const results=[];
 // No user-controlled origins. DNS, redirect, body and deadline guards apply.
 for(const path of paths){
  try{
   const response=await safeFetch(origin+path,{allowedOrigins:[origin],maxRedirects:2}),$=load(response.body);
   const canonical=$('link[rel=canonical]').attr('href')??null,h1=$('h1').length;
   const noindex=/noindex/i.test(String(response.headers['x-robots-tag']??'')+' '+($('meta[name=robots]').attr('content')??''));
   const title=$('title').text().slice(0,200),issues=[];
   if(response.status!==200)issues.push({severity:'high',message:'Expected HTTP 200; investigate the response and restore the intended route.'});
   if(response.redirects.length)issues.push({severity:'review',message:'The canonical route redirects. Review its destination and internal links.'});
   if(!['/sitemap.xml','/robots.txt'].includes(path)){
    if(noindex)issues.push({severity:'high',message:'This live public route carries noindex. Check production indexing settings.'});
    if(canonical?.replace(/\/$/,'')!==(origin+(path==='/'?'':path)))issues.push({severity:'high',message:'Canonical URL does not match this intended public route.'});
    if(h1!==1)issues.push({severity:'review',message:'Review the primary heading structure.'});
    if(!title)issues.push({severity:'high',message:'Page title is missing.'});
   }
   results.push({path,status:response.status,redirects:response.redirects.length,canonical,h1,noindex,title,issues});
  }catch{results.push({path,status:0,issues:[{severity:'high',message:'Request unavailable or blocked by the safe-fetch limits. Recheck before interpreting this as downtime.'}]});}
 }
 return {origin,checkedAt:new Date().toISOString(),scope:'Point-in-time live HTTP/HTML checks. This does not inspect the local preview or establish uptime, Google indexing or field performance.',results};
}
