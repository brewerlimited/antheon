const menuButton=document.querySelector('.menu-toggle');
const mobileNav=document.querySelector('#mobile-nav');
function closeMenu(){menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Open navigation');mobileNav.hidden=true;}
menuButton.addEventListener('click',()=>{const opened=menuButton.getAttribute('aria-expanded')==='true';menuButton.setAttribute('aria-expanded',String(!opened));menuButton.setAttribute('aria-label',opened?'Open navigation':'Close navigation');mobileNav.hidden=opened;});
mobileNav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});

const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
const motionButton=document.querySelector('.motion-toggle');
let motionPaused=false;
motionButton.addEventListener('click',()=>{
  motionPaused=!motionPaused;
  document.documentElement.classList.toggle('motion-paused',motionPaused);
  motionButton.setAttribute('aria-pressed',String(motionPaused));
  motionButton.setAttribute('aria-label',motionPaused?'Play animations':'Pause animations');
  motionButton.querySelector('span').textContent=motionPaused?'▶':'Ⅱ';
});
if('IntersectionObserver' in window){
  document.documentElement.classList.add('motion-ready');
  const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('visible');revealObserver.unobserve(entry.target);}
  }),{threshold:.08,rootMargin:'0px 0px -28px 0px'});
  document.querySelectorAll('.reveal').forEach((el,index)=>{
    if(el.classList.contains('product-row'))el.style.setProperty('--delay',`${(index%2)*90}ms`);
    revealObserver.observe(el);
  });
}
const progress=document.querySelector('.reading-progress');
const heroImage=document.querySelector('.hero-image>img');
let scrollPending=false;
function updateScroll(){
  const range=document.documentElement.scrollHeight-window.innerHeight;
  progress.style.transform=`scaleX(${range>0?Math.min(1,window.scrollY/range):0})`;
  if(!motionPaused&&!reducedMotion.matches&&window.scrollY<1400){heroImage.style.transform=`translateY(${Math.min(window.scrollY*.08,40)}px)`;}
  scrollPending=false;
}
window.addEventListener('scroll',()=>{if(!scrollPending){scrollPending=true;requestAnimationFrame(updateScroll);}},{passive:true});
updateScroll();
document.querySelectorAll('.product-row').forEach(row=>row.addEventListener('toggle',()=>{
  if(row.open)document.querySelectorAll('.product-row').forEach(other=>{if(other!==row)other.open=false;});
}));
document.querySelectorAll('[data-product]').forEach(link=>link.addEventListener('click',()=>{
  document.querySelector('[name=flooring]').value=link.dataset.product;
}));

const track=document.querySelector('.project-track');
const cards=Array.from(track.querySelectorAll('.project-card'));
const galleryPrev=document.querySelector('.gallery-prev');
const galleryNext=document.querySelector('.gallery-next');
let galleryIndex=0;
const pad=n=>String(n).padStart(2,'0');
function syncGallery(){
  const stride=cards.length>1?cards[1].offsetLeft-cards[0].offsetLeft:1;
  const maxScroll=track.scrollWidth-track.clientWidth;
  galleryIndex=Math.min(cards.length-1,Math.round(track.scrollLeft/stride));
  const atEnd=track.scrollLeft>=maxScroll-5;
  const visibleIndex=atEnd&&maxScroll>5?cards.length-1:galleryIndex;
  document.querySelector('.gallery-position').textContent=`${pad(visibleIndex+1)} / ${pad(cards.length)}`;
  document.querySelector('.gallery-progress>span').style.transform=`translateX(${maxScroll>0?track.scrollLeft/maxScroll*200:0}%)`;
  galleryPrev.disabled=track.scrollLeft<5;
  galleryNext.disabled=atEnd;
}
function moveGallery(direction){
  const stride=cards.length>1?cards[1].offsetLeft-cards[0].offsetLeft:track.clientWidth;
  track.scrollBy({left:direction*stride,behavior:reducedMotion.matches||motionPaused?'instant':'smooth'});
}
galleryPrev.addEventListener('click',()=>moveGallery(-1));
galleryNext.addEventListener('click',()=>moveGallery(1));
track.addEventListener('scroll',syncGallery,{passive:true});
track.addEventListener('keydown',event=>{
  if(event.target!==track)return;
  if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();moveGallery(event.key==='ArrowRight'?1:-1);}
});
window.addEventListener('resize',syncGallery);syncGallery();

const lightbox=document.querySelector('.lightbox');
const lightboxImage=lightbox.querySelector('.lightbox-stage img');
let photoIndex=0;
function showPhoto(index){
  photoIndex=(index+cards.length)%cards.length;
  const card=cards[photoIndex];
  const originalImage=card.querySelector('img');
  lightboxImage.src=originalImage.src;lightboxImage.alt=originalImage.alt;
  lightbox.querySelector('.lightbox-caption').textContent=card.querySelector('.project-info h3').textContent;
  lightbox.querySelector('.lightbox-count').textContent=`${pad(photoIndex+1)} / ${pad(cards.length)}`;
}
document.querySelectorAll('[data-gallery]').forEach(button=>button.addEventListener('click',()=>{
  showPhoto(Number(button.dataset.gallery));lightbox.showModal();document.body.classList.add('dialog-open');
}));
lightbox.querySelector('.close-lightbox').addEventListener('click',()=>lightbox.close());
lightbox.addEventListener('close',()=>document.body.classList.remove('dialog-open'));
lightbox.querySelector('.lightbox-prev').addEventListener('click',()=>showPhoto(photoIndex-1));
lightbox.querySelector('.lightbox-next').addEventListener('click',()=>showPhoto(photoIndex+1));
lightbox.addEventListener('keydown',event=>{
  if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();showPhoto(photoIndex+(event.key==='ArrowRight'?1:-1));}
});
let touchStartX=0;
lightboxImage.addEventListener('touchstart',event=>{touchStartX=event.changedTouches[0].clientX;},{passive:true});
lightboxImage.addEventListener('touchend',event=>{const distance=event.changedTouches[0].clientX-touchStartX;if(Math.abs(distance)>60)showPhoto(photoIndex+(distance<0?1:-1));},{passive:true});

const form=document.querySelector('.enquiry-form');
const result=document.querySelector('.enquiry-result');
let enquiryText='';
form.addEventListener('submit',event=>{
  event.preventDefault();
  const data=new FormData(form);
  const name=String(data.get('name')).trim();
  const email=String(data.get('email')).trim();
  const message=String(data.get('message')).trim();
  if(!name||!message){const invalid=form.elements[!name?'name':'message'];invalid.setCustomValidity('Please enter your details.');invalid.reportValidity();invalid.addEventListener('input',()=>invalid.setCustomValidity(''),{once:true});return;}
  const flooring=String(data.get('flooring'));
  enquiryText=`Hello Anchor Flooring,\n\n${message}\n\nFlooring: ${flooring}\nName: ${name}\nEmail: ${email}`;
  const subject=`Flooring enquiry — ${flooring}`;
  document.querySelector('.email-draft-link').href=`mailto:anchorflooring@googlemail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(enquiryText)}`;
  result.hidden=false;
  const resultBounds=result.getBoundingClientRect();
  const resultOffset=resultBounds.top<16?resultBounds.top-16:Math.max(0,resultBounds.bottom-innerHeight+16);
  if(resultOffset)window.scrollTo({top:Math.max(0,window.scrollY+resultOffset),behavior:reducedMotion.matches||motionPaused?'instant':'smooth'});
});
form.addEventListener('input',()=>{if(!result.hidden)result.hidden=true;});
document.querySelector('.copy-enquiry').addEventListener('click',async()=>{
  const status=document.querySelector('.copy-status');
  try{await navigator.clipboard.writeText(`To: anchorflooring@googlemail.com\n\n${enquiryText}`);status.textContent='Enquiry copied. Paste it into your preferred email service.';}catch{status.textContent='Copy isn’t available in this browser. Use Open email app, or email the team directly.';}
});
document.querySelector('#year').textContent=new Date().getFullYear();

// Prepare an email draft through the same visible enquiry form.
if(document.modelContext?.registerTool){
  const lifecycle=new AbortController();
  try{
    Promise.resolve(document.modelContext.registerTool({
      name:'prepare_flooring_enquiry',
      title:'Prepare a flooring enquiry',
      description:'Fill the enquiry form and prepare an email draft for Anchor Flooring. This does not send an email. The visitor must open their email app and send it.',
      inputSchema:{type:'object',properties:{name:{type:'string',minLength:1,maxLength:120},email:{type:'string',format:'email',maxLength:254},message:{type:'string',minLength:1,maxLength:4000},flooring:{type:'string',enum:['General flooring enquiry','Carpets & carpet tiles','Luxury vinyl tiles','Commercial & cushion vinyl','Entrances & finishing details','Not sure yet']}},required:['name','email','message'],additionalProperties:false},
      annotations:{readOnlyHint:false,untrustedContentHint:false},
      execute(input){
        if(!input||typeof input!=='object')throw new Error('Enquiry details are required.');
        const {name,email,message,flooring='General flooring enquiry'}=input;
        const validTypes=Array.from(form.elements.flooring.options,o=>o.value);
        if(typeof name!=='string'||!name.trim()||name.length>120||typeof email!=='string'||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254||typeof message!=='string'||!message.trim()||message.length>4000||!validTypes.includes(flooring))throw new Error('Enter a valid name, email, message and flooring type.');
        form.elements.name.value=name.trim();form.elements.email.value=email.trim();form.elements.message.value=message.trim();form.elements.flooring.value=flooring;
        form.requestSubmit();
        return {status:'draft_prepared',sent:false,recipient:'anchorflooring@googlemail.com',next_step:'Open the email app using the visible link, then review and send.'};
      }
    },{signal:lifecycle.signal})).catch(()=>{});
  }catch{}
  window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}
