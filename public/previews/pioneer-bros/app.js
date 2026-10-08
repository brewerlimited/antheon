import { siteData } from './data.js';
import { buildingSVG, buildingIcon } from './illustrations.js';
import { initQuoteBuilder } from './quote.js';

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
initQuoteBuilder();

// Native dialog and direct contact links remain usable independently of visual motion.
const header = $('.site-header');
const menuButton = $('.menu-toggle');
const menu = $('#mobile-menu');
function closeMenu(){menu.hidden=true;menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Open menu');}
menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';menu.hidden=!open;menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Close menu':'Open menu');});
menu.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){closeMenu();menuButton.focus();}});
document.addEventListener('click',e=>{if(!menu.hidden&&!header.contains(e.target))closeMenu();});
window.matchMedia('(min-width:701px)').addEventListener('change',e=>{if(e.matches)closeMenu();});
document.addEventListener('open-quote',closeMenu);

const hero = $('.hero');
const heroImages = $$('.hero-image');
let heroIndex=0, userPaused=false, heroVisible=true, slideTimer;
function changeHero(index){
 heroIndex=(index+siteData.hero.length)%siteData.hero.length;
 heroImages.forEach((el,i)=>el.classList.toggle('is-active',i===heroIndex));
 $$('[data-hero-slide]').forEach((el,i)=>{el.classList.toggle('is-active',i===heroIndex);el.setAttribute('aria-pressed',String(i===heroIndex));});
 $('#hero-image-caption').textContent=siteData.hero[heroIndex].label;
}
function scheduleHero(){
 clearTimeout(slideTimer);
 if(userPaused||reducedMotion.matches||document.hidden||!heroVisible)return;
 slideTimer=setTimeout(()=>{changeHero(heroIndex+1);scheduleHero();},10500);
}
function updateMotionControl(){
 const paused=userPaused||reducedMotion.matches;
 document.body.classList.toggle('motion-paused',paused);
 $('#motion-toggle').setAttribute('aria-label',paused?'Play animation':'Pause animation');
 $('#motion-toggle').setAttribute('aria-pressed',String(paused));
 $('#motion-toggle').innerHTML=paused?'<svg viewBox="0 0 18 18" aria-hidden="true"><path d="m6 4 8 5-8 5Z" fill="currentColor"/></svg>':'<svg viewBox="0 0 18 18" aria-hidden="true"><path d="M6 4v10M12 4v10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
 if(reducedMotion.matches){$('#motion-toggle').setAttribute('aria-label','Animation disabled by your reduced-motion preference');$('#motion-toggle').disabled=true;}else $('#motion-toggle').disabled=false;
 scheduleHero();
}
$('#motion-toggle').addEventListener('click',()=>{userPaused=!userPaused;updateMotionControl();});
$$('[data-hero-slide]').forEach(el=>el.addEventListener('click',()=>{changeHero(Number(el.dataset.heroSlide));scheduleHero();}));
document.addEventListener('visibilitychange',scheduleHero);
reducedMotion.addEventListener('change',()=>{updateMotionControl();updateScroll();});
if('IntersectionObserver' in window)new IntersectionObserver(([entry])=>{heroVisible=entry.isIntersecting;scheduleHero();},{threshold:0}).observe(hero);
updateMotionControl();

const parallaxImages=$$('[data-parallax]');
let scrollQueued=false;
function updateScroll(){
 const scroll=window.scrollY;
 header.classList.toggle('scrolled',scroll>40);
 if(!reducedMotion.matches){
  const heroHeight=hero.offsetHeight;
  if(scroll<heroHeight+100){hero.style.setProperty('--hero-parallax',`${Math.min(scroll*.17,140)}px`);hero.style.setProperty('--hero-copy-shift',`${Math.min(scroll*.07,60)}px`);hero.style.setProperty('--hero-card-shift',`${Math.max(-scroll*.045,-40)}px`);}
  const positions=parallaxImages.map(el=>({el,rect:el.parentElement.getBoundingClientRect()}));
  positions.forEach(({el,rect})=>{if(rect.bottom>0&&rect.top<window.innerHeight){const delta=(window.innerHeight/2-(rect.top+rect.height/2))*Number(el.dataset.parallax);el.style.setProperty('--image-shift',`${Math.max(-28,Math.min(28,delta))}px`);}});
 }
 scrollQueued=false;
}
window.addEventListener('scroll',()=>{if(!scrollQueued){scrollQueued=true;requestAnimationFrame(updateScroll);}},{passive:true});
window.addEventListener('resize',()=>{if(!scrollQueued){scrollQueued=true;requestAnimationFrame(updateScroll);}},{passive:true});
updateScroll();
if('IntersectionObserver' in window&&!reducedMotion.matches){
 const revealObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');revealObserver.unobserve(e.target);}}),{threshold:.08,rootMargin:'0px 0px -25px 0px'});
 $$('.reveal').forEach(el=>revealObserver.observe(el));document.documentElement.classList.add('js-motion');
}

let serviceId='roof';
const serviceTabs=$$('.service-tabs [data-service]');
function selectService(id,focus=false){
 const service=siteData.capabilities.find(s=>s.id===id);if(!service)return;serviceId=id;
 serviceTabs.forEach(el=>{const active=el.dataset.service===id;el.setAttribute('aria-selected',String(active));el.tabIndex=active?0:-1;});
 if(focus)$(`#service-${id}`).focus();
 $('#service-panel').setAttribute('aria-labelledby',`service-${id}`);
 $('#service-title').textContent=service.title;$('#service-description').textContent=service.description;
 $('#service-items').replaceChildren(...service.items.map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));
 const img=$('#service-photo');img.classList.add('is-changing');img.alt=service.alt;img.style.objectPosition=service.position||'center 46%';
 img.onload=()=>img.classList.remove('is-changing');img.onerror=()=>img.classList.remove('is-changing');img.src=service.image;
 if(img.complete)requestAnimationFrame(()=>img.classList.remove('is-changing'));
}
serviceTabs.forEach(el=>el.addEventListener('click',()=>selectService(el.dataset.service)));
$('.service-tabs').addEventListener('keydown',e=>{const i=serviceTabs.indexOf(e.target);if(i<0)return;let next=i;if(e.key==='ArrowRight')next=(i+1)%serviceTabs.length;else if(e.key==='ArrowLeft')next=(i-1+serviceTabs.length)%serviceTabs.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=serviceTabs.length-1;else return;e.preventDefault();selectService(serviceTabs[next].dataset.service,true);});
$('#service-quote').addEventListener('click',()=>{const s=siteData.capabilities.find(s=>s.id===serviceId);document.dispatchEvent(new CustomEvent('open-quote',{detail:{building:s.building,work:s.work,mode:s.building==='House'?'homeowner':'contractor'}}));});

let building='house',selectedAccess=['Front','Right'];
const homeAccess=['Front','Rear','Left','Right'];
const businessAccess=['Full elevation','Access tower','Temporary roof','Perimeter'];
const industrialAccess=['Full elevation','Internal access','Access tower','Other'];
$$('[data-building-icon]').forEach(el=>el.innerHTML=buildingIcon(el.dataset.buildingIcon));
function drawBuilder(){
 const selected=building==='house'?selectedAccess:selectedAccess.includes('Perimeter')?homeAccess:selectedAccess.length?['Front','Right']:[];
 $('#builder-drawing').innerHTML=buildingSVG({kind:building,selected,id:'pioneer-model',phase:'access'});
 $('#selection-summary').textContent=selectedAccess.length?`${selectedAccess.join(' + ')} selected`:'Choose the access you have in mind';
}
function renderAccess(){
 const options=building==='house'?homeAccess:building==='industrial'?industrialAccess:businessAccess;
 $('.teaser-sides').replaceChildren(...options.map(side=>{
  const button=document.createElement('button');button.type='button';button.dataset.side=side;button.className=selectedAccess.includes(side)?'is-active':'';button.setAttribute('aria-pressed',String(selectedAccess.includes(side)));
  const label=document.createElement('span');label.setAttribute('aria-hidden','true');label.textContent=selectedAccess.includes(side)?'✓':'+';
  button.append(document.createTextNode(side),label);return button;
 }));
 $('#access-help').textContent=building==='house'?'Choose one or more sides of your property.':'Choose the access you have in mind.';
 drawBuilder();
}
$$('[data-building-type]').forEach(el=>el.addEventListener('click',()=>{building=el.dataset.buildingType;selectedAccess=building==='house'?['Front','Right']:['Full elevation'];$$('[data-building-type]').forEach(b=>{const active=b===el;b.classList.toggle('is-active',active);b.setAttribute('aria-pressed',String(active));});renderAccess();}));
$('.teaser-sides').addEventListener('click',e=>{const button=e.target.closest('[data-side]');if(!button)return;const side=button.dataset.side;selectedAccess=selectedAccess.includes(side)?selectedAccess.filter(s=>s!==side):[...selectedAccess,side];renderAccess();$(`[data-side="${side}"]`).focus({preventScroll:true});});
$('#model-reset').addEventListener('click',()=>{selectedAccess=[];renderAccess();});
$('#start-builder').addEventListener('click',()=>document.dispatchEvent(new CustomEvent('open-quote',{detail:{building,access:[...selectedAccess],mode:building==='house'?'homeowner':'contractor'}})));
renderAccess();

let galleryIndex=0,galleryTrigger;
const gallery=$('#gallery-dialog');
function updateGallery(){
 const item=siteData.gallery[galleryIndex];const img=$('#lightbox-image');img.src=item.image;img.alt=item.alt;
 $('#gallery-dialog-title').textContent=item.title;$('#lightbox-category').textContent=item.category;$('#gallery-count').textContent=`${galleryIndex+1} / ${siteData.gallery.length}`;
}
function openGallery(index=0,trigger=document.activeElement){galleryIndex=index;galleryTrigger=trigger;updateGallery();if(!gallery.open)gallery.showModal();gallery.querySelector('.dialog-close').focus();}
$$('[data-gallery]').forEach(el=>el.addEventListener('click',()=>openGallery(Number(el.dataset.gallery),el)));
$('#open-gallery').addEventListener('click',()=>openGallery(0,$('#open-gallery')));
$('#gallery-previous').addEventListener('click',()=>{galleryIndex=(galleryIndex-1+siteData.gallery.length)%siteData.gallery.length;updateGallery();});
$('#gallery-next').addEventListener('click',()=>{galleryIndex=(galleryIndex+1)%siteData.gallery.length;updateGallery();});
gallery.querySelector('.dialog-close').addEventListener('click',()=>gallery.close());
gallery.addEventListener('close',()=>galleryTrigger?.focus({preventScroll:true}));
gallery.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();galleryIndex=(galleryIndex+(e.key==='ArrowRight'?1:-1)+siteData.gallery.length)%siteData.gallery.length;updateGallery();}});
$('#gallery-quote').addEventListener('click',()=>{const item=siteData.gallery[galleryIndex];gallery.close();document.dispatchEvent(new CustomEvent('open-quote',{detail:{building:item.kind,work:item.work,mode:item.kind==='House'?'homeowner':'contractor'}}));});

const info=$('#info-dialog');
info.querySelector('.dialog-close').addEventListener('click',()=>info.close());
info.addEventListener('click',e=>{if(e.target!==info)return;const r=info.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)info.close();});
$$('[data-legal]').forEach(el=>el.addEventListener('click',()=>{
 const privacy=el.dataset.legal==='privacy';$('#info-title').textContent=privacy?'Your details, handled clearly.':'A fresh view of Pioneer Bros.';
 $('#info-body').innerHTML=privacy?'<p>This design preview keeps form entries and selected files in the memory of your current browser tab. They are not submitted automatically or saved in a website database. Reloading the page clears them.</p><p>Email buttons prepare a draft in your own email application. You choose whether to send it, and you must attach any photos or drawings yourself. Downloaded briefs are created on your device.</p><p>No advertising trackers or analytics have been added. Hosting and Google Fonts may receive normal connection information, such as your IP address.</p><p>For enquiries about information sent to the business, contact <a href="mailto:office@pioneerbrosscaffolding.com">office@pioneerbrosscaffolding.com</a>. The business’s approved privacy notice should be added before a public launch.</p>':'<p>An independent redesign concept for Pioneer Bros Scaffolding Limited, using its existing logo, brand colours, published business information and real project photography.</p><p>The current company website is <a href="https://www.pioneerbrosscaffolding.com/" target="_blank" rel="noopener">pioneerbrosscaffolding.com</a>. Project captions describe the photographs; no client names, locations, dates or project values have been invented.</p><p>The scaffold builder is an enquiry aid. Its drawings are illustrative and do not provide engineering designs, calculations, confirmed pricing or availability.</p>';
 info.showModal();
}));
document.addEventListener('open-contact',()=>parent.postMessage({type:'antheon-preview-link-blocked',slug:'pioneer-bros'},location.origin));

const form=$('#quick-enquiry');
const fields={name:$('#enquiry-name'),email:$('#enquiry-email'),message:$('#enquiry-message')};
fields.name.maxLength=120;fields.email.maxLength=180;fields.message.maxLength=2000;
// Mail clients have limited URI lengths. Budget by encoded length and keep
// Unicode code points intact; the text download always includes the full entry.
function encodedExcerpt(value,budget){
 let result='',length=0;
 for(let character of String(value)){
  let encoded;try{encoded=encodeURIComponent(character);}catch{character='\uFFFD';encoded=encodeURIComponent(character);}
  if(length+encoded.length>budget)break;result+=character;length+=encoded.length;
 }
 return result;
}
function quickEnquiryMailto(values){
 const base=`mailto:${encodeURIComponent(siteData.email)}?subject=${encodeURIComponent('Scaffolding enquiry')}&body=`;
 const opening='Hello Pioneer Bros,\n\n';
 const closing=`\n\nName: ${encodedExcerpt(values.name,240)}\nEmail: ${encodedExcerpt(values.email,420)}\n\nPlease attach any photos or drawings before sending. The downloaded enquiry contains the complete message and contact details.`;
 const shortened='\n\n[Shortened for email compatibility. Please attach the downloaded enquiry for the full details.]';
 const budget=Math.max(0,1900-base.length-encodeURIComponent(opening+closing+shortened).length);
 const excerpt=encodedExcerpt(values.message,budget);
 return base+encodeURIComponent(opening+excerpt+(excerpt===values.message?'':shortened)+closing);
}
Object.entries(fields).forEach(([key,field])=>field.addEventListener('input',()=>{field.removeAttribute('aria-invalid');$(`#${key}-error`).textContent='';}));
form.addEventListener('submit',e=>{
 e.preventDefault();const values=Object.fromEntries(Object.entries(fields).map(([key,field])=>[key,field.value.trim()]));
 const errors={};if(values.name.length<2)errors.name='Please add your name.';if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))errors.email='Please add a valid email address.';if(values.message.length<10)errors.message='Tell us a little more about the job.';
 Object.entries(fields).forEach(([key,field])=>{const error=errors[key];$(`#${key}-error`).textContent=error||'';if(error){field.setAttribute('aria-invalid','true');field.setAttribute('aria-describedby',`${key}-error`);}else field.removeAttribute('aria-invalid');});
 if(Object.keys(errors).length){fields[Object.keys(errors)[0]].focus();$('#enquiry-feedback').textContent='Please check the highlighted details.';return;}
 const body=`Hello Pioneer Bros,\n\n${values.message}\n\nName: ${values.name}\nEmail: ${values.email}\n\nI will attach any relevant photographs or drawings before sending.`;
 const mailto=quickEnquiryMailto(values);
 const feedback=$('#enquiry-feedback');feedback.replaceChildren(document.createTextNode('Your draft is ready. Nothing has been sent. '));
 const link=document.createElement('a');link.href=mailto;link.textContent='Open the email draft';feedback.append(link,document.createTextNode(' or '));
 const download=document.createElement('button');download.type='button';download.className='enquiry-download';download.textContent='download your full enquiry';download.style.cssText='padding:0;text-decoration:underline;font:inherit;color:inherit';download.addEventListener('click',()=>{const blob=new Blob([body],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='pioneer-bros-enquiry.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});feedback.append(download,document.createTextNode('. The email draft may be shortened; the download keeps every detail. Attach it with photos or drawings in your email application.'));
 // A deliberate second click opens mailto so browsers without an email handler still have a clear fallback.
 link.focus();
});
// Only enable the HTML submit control after its preventDefault handler exists.
form.querySelector('button[type="submit"]').disabled=false;

// SEO data is grounded in the company's own published contact and services pages.
const structuredData=document.createElement('script');structuredData.type='application/ld+json';structuredData.textContent=JSON.stringify({'@context':'https://schema.org','@type':'HomeAndConstructionBusiness',name:siteData.legalName,url:siteData.sourceWebsite,image:new URL(siteData.hero[0].image,siteData.canonical+'/').href,telephone:'+447494456874',email:siteData.email,address:{'@type':'PostalAddress',...siteData.address},hasOfferCatalog:{'@type':'OfferCatalog',name:'Scaffolding services',itemListElement:siteData.capabilities.map(s=>({'@type':'Offer',itemOffered:{'@type':'Service',name:s.label,description:s.description}}))}});document.head.append(structuredData);
$('#copyright-year').textContent=String(new Date().getFullYear());
