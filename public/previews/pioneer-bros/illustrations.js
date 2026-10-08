/** Architectural diagrams are illustrative only; not scaffold designs or engineering drawings. */
const C={ink:'#7189a6',line:'#91a7c0',fine:'#c2d1e3',paper:'#ffffff',wall:'#ffffff',side:'#edf3fb',roof:'#d7e4f4',roofSide:'#b9cce4',glass:'#e5f0fe',blue:'#0057e1',blueDark:'#003a96'};
const n=v=>Math.round(v*10)/10;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const path=(pts,attrs='')=>`<path d="${pts.map((p,i)=>`${i?'L':'M'}${n(p[0])} ${n(p[1])}`).join(' ')}" ${attrs}/>`;
const poly=(pts,fill,attrs='')=>`<polygon points="${pts.map(p=>p.map(n).join(',')).join(' ')}" fill="${fill}" ${attrs}/>`;
const line=(a,b,attrs='')=>path([a,b],`fill="none" ${attrs}`);
const txt=(x,y,s,attrs='')=>`<text x="${n(x)}" y="${n(y)}" ${attrs}>${esc(s)}</text>`;

export function buildingSVG({kind='house',selected=[],id='building',className='',phase='access',highlight=''}={}){
  kind=String(kind).toLowerCase();
  const variant=['house','commercial','development','industrial','other'].includes(kind)?kind:'house';
  const commercial=variant==='commercial', industrial=variant==='industrial', development=variant==='development';
  const W=industrial?290:commercial?240:250,D=industrial?175:commercial?205:180,H=industrial?117:commercial?200:160;
  const flat=commercial;
  const roofRise=industrial?40:flat?0:62;
  const ox=industrial?316:commercial?343:327, oy=industrial?259:commercial?256:248;
  const P=(u,v,z=0)=>[ox+.8*u-.8*v,oy+.36*u+.36*v-z];
  const selectedSet=new Set((Array.isArray(selected)?selected:[]).map(s=>String(s).toLowerCase()));
  const sides=phase==='before'||phase==='complete'?[]:['rear','left','front','right'].filter(s=>selectedSet.has(s));
  const q=String(id).replace(/[^a-zA-Z0-9_-]/g,'')||'building';
  let ground='',details='',building='',scaffoldsBehind='',scaffoldsFront='',labels='';
  const face=(pts,fill,attrs='')=>poly(pts.map(a=>P(...a)),fill,`${/\bstroke=/.test(attrs)?'':`stroke="${C.ink}"`} ${/\bstroke-width=/.test(attrs)?'':'stroke-width=".95"'} stroke-linejoin="round" ${attrs}`);
  const L=(a,b,attrs='')=>line(P(...a),P(...b),attrs);
  const roofZ=v=>H+roofRise*(1-Math.abs(v-D/2)/(D/2));
  // A quiet floating plinth gives the model depth without a technical drawing grid.
  const groundCenter=P(W/2,D/2,-13);
  ground+=`<ellipse cx="${n(groundCenter[0]+12)}" cy="${n(groundCenter[1]+20)}" rx="245" ry="82" fill="url(#${q}-ground)"/>`;
  ground+=face([[-12,-12,-1],[W+12,-12,-1],[W+12,D+12,-1],[-12,D+12,-1]],'#f7faff','stroke="#dbe6f4" stroke-width=".8"');
  ground+=face([[-12,D+12,-1],[W+12,D+12,-1],[W+12,D+12,-7],[-12,D+12,-7]],'#e5eefb','stroke="#ccdaed" stroke-width=".6"');
  ground+=face([[W+12,-12,-1],[W+12,D+12,-1],[W+12,D+12,-7],[W+12,-12,-7]],'#dce8f8','stroke="#ccdaed" stroke-width=".6"');

  // Two visible elevations, drawn in the same precise axonometric projection.
  building+=face([[0,D,0],[W,D,0],[W,D,H],[0,D,H]],phase==='before'?'#f7faff':C.wall);
  building+=face([[W,0,0],[W,D,0],[W,D,H],[W,0,H]],C.side);
  if(!flat) building+=face([[W,0,H],[W,D,H],[W,D/2,H+roofRise]],C.side);
  if(highlight==='facade'||highlight==='full') building+=face([[0,D,0],[W,D,0],[W,D,H],[0,D,H]],C.blue,'fill-opacity=".075" stroke="#0057e1" stroke-opacity=".32"');
  // Restrained floor reveals keep the white architectural surfaces calm.
  if(!commercial&&!industrial){
    for(let z of [18,87]){
      details+=L([0,D,z],[W,D,z],`stroke="${C.fine}" stroke-width=".5" opacity=".45"`);
      details+=L([W,0,z],[W,D,z],`stroke="${C.fine}" stroke-width=".5" opacity=".35"`);
    }
  }
  // Narrow foundation and lintel lines.
  details+=L([0,D,8],[W,D,8],`stroke="${C.line}" stroke-width=".8"`);
  details+=L([W,0,8],[W,D,8],`stroke="${C.line}" stroke-width=".8"`);
  const windowFront=(u,z,w=42,h=42)=>{
    let s=face([[u,D+.5,z],[u+w,D+.5,z],[u+w,D+.5,z+h],[u,D+.5,z+h]],'#d7e4f5','stroke-width="1"');
    s+=face([[u+3,D+1,z+3],[u+w-3,D+1,z+3],[u+w-3,D+1,z+h-3],[u+3,D+1,z+h-3]],C.glass,'stroke-width=".6"');
    s+=L([u+w/2,D+1,z+3],[u+w/2,D+1,z+h-3],`stroke="${C.ink}" stroke-width="1"`);
    s+=L([u+3,D+1,z+h*.54],[u+w-3,D+1,z+h*.54],`stroke="${C.line}" stroke-width=".7"`);
    s+=L([u+7,D+1,z+h-7],[u+w*.35,D+1,z+h*.5],`stroke="#ffffff" stroke-width="2" opacity=".7"`);
    s+=face([[u-3,D+3,z-2],[u+w+3,D+3,z-2],[u+w+3,D+3,z+1],[u-3,D+3,z+1]],'#ffffff','stroke-width=".65"');
    return s;
  };
  const windowSide=(v,z,w=38,h=42)=>{
    let s=face([[W+.5,v,z],[W+.5,v+w,z],[W+.5,v+w,z+h],[W+.5,v,z+h]],'#bdcee4','stroke-width="1"');
    s+=face([[W+1,v+3,z+3],[W+1,v+w-3,z+3],[W+1,v+w-3,z+h-3],[W+1,v+3,z+h-3]],'#dae8f8','stroke-width=".6"');
    s+=L([W+1,v+w/2,z+3],[W+1,v+w/2,z+h-3],`stroke="${C.ink}" stroke-width="1"`);
    s+=L([W+1,v+3,z+h*.54],[W+1,v+w-3,z+h*.54],`stroke="${C.line}" stroke-width=".65"`);
    s+=L([W+1,v+6,z+h-7],[W+1,v+w*.4,z+h*.5],`stroke="#ffffff" stroke-width="2" opacity=".6"`);
    s+=face([[W+3,v-3,z-2],[W+3,v+w+3,z-2],[W+3,v+w+3,z+1],[W+3,v-3,z+1]],'#f5f9ff','stroke-width=".65"');
    return s;
  };
  if(commercial){
    for(let z of [24,86,148]){for(let u of [18,85,152]) details+=windowFront(u,z,50,39);for(let v of [22,82,142])details+=windowSide(v,z,38,39);}
    for(let z of [75,137,195]){details+=L([0,D+2,z],[W,D+2,z],`stroke="${C.line}" stroke-width="1.7"`);details+=L([W+2,0,z],[W+2,D,z],`stroke="${C.line}" stroke-width="1.7"`);}
  }else if(industrial){
    for(let u=12;u<W-3;u+=15)details+=L([u,D,10],[u,D,H-5],`stroke="${C.fine}" stroke-width=".7"`);
    for(let v=12;v<D;v+=15)details+=L([W,v,10],[W,v,H-4],`stroke="${C.fine}" stroke-width=".7"`);
    for(let u of [32,153]){
      details+=face([[u,D+1,4],[u+83,D+1,4],[u+83,D+1,84],[u,D+1,84]],'#e5edf8','stroke-width="1.2"');
      for(let z=10;z<82;z+=8)details+=L([u,D+2,z],[u+83,D+2,z],`stroke="${C.line}" stroke-width=".7"`);
    }
    details+=windowSide(50,51,80,29);
    details+=face([[W+1,138,0],[W+1,163,0],[W+1,163,52],[W+1,138,52]],'#7397c7','stroke-width="1"');
  }else{
    details+=windowFront(27,27,47,44)+windowFront(174,27,47,44);
    details+=windowFront(27,101,47,42)+windowFront(101,101,42,42)+windowFront(174,101,47,42);
    details+=windowSide(26,29,42,44)+windowSide(112,29,42,44)+windowSide(26,102,42,42)+windowSide(112,102,42,42);
    details+=face([[104,D+2,0],[143,D+2,0],[143,D+2,70],[104,D+2,70]],'#3974be','stroke-width="1.2"');
    details+=face([[111,D+3,34],[136,D+3,34],[136,D+3,62],[111,D+3,62]],'#c8e0fe','stroke-width=".7"');
    details+=face([[111,D+3,8],[136,D+3,8],[136,D+3,25],[111,D+3,25]],'#568bd0','stroke-width=".6"');
    const knob=P(137,D+4,30);details+=`<circle cx="${n(knob[0])}" cy="${n(knob[1])}" r="1.5" fill="${C.ink}" stroke="none"/>`;
    details+=face([[99,D+7,0],[148,D+7,0],[148,D+7,5],[99,D+7,5]],'#d5e2f3','stroke-width=".7"');
    details+=face([[99,D+1,5],[148,D+1,5],[148,D+10,5],[99,D+10,5]],'#f7fbff','stroke-width=".7"');
    details+=L([0,D+1,87],[W,D+1,87],`stroke="${C.fine}" stroke-width=".85"`);
    // Rainwater pipe, with wall stand-offs and a return at the foot.
    details+=L([W-6,D+3,H-2],[W-6,D+3,12],`stroke="${C.line}" stroke-width="1.5"`);
    details+=L([W-6,D+3,12],[W-1,D+6,5],`stroke="${C.line}" stroke-width="1.5"`);
    for(let z of [31,81,131])details+=L([W-8,D+2,z],[W-4,D+4,z],`stroke="${C.ink}" stroke-width=".8"`);
  }
  if(phase==='before'){
    details+=L([76,D+1,88],[82,D+1,79],`stroke="${C.line}" stroke-width=".75"`)+L([82,D+1,79],[78,D+1,73],`stroke="${C.line}" stroke-width=".75"`)+L([78,D+1,73],[86,D+1,63],`stroke="${C.line}" stroke-width=".75"`);
  }
  building+=details;
  if(flat){
    building+=face([[-5,-5,H],[W+5,-5,H],[W+5,D+5,H],[-5,D+5,H]],C.roof);
    building+=face([[0,0,H+9],[W,0,H+9],[W,D,H+9],[0,D,H+9]],'#ecf3fc');
    building+=face([[9,9,H+9],[W-9,9,H+9],[W-9,D-9,H+9],[9,D-9,H+9]],'#cbdbee','stroke-width=".75"');
    building+=face([[0,D,H],[W,D,H],[W,D,H+9],[0,D,H+9]],'#ffffff','stroke-width=".9"');
    building+=face([[W,0,H],[W,D,H],[W,D,H+9],[W,0,H+9]],'#cbdcf2','stroke-width=".9"');
    building+=face([[145,35,H+10],[204,35,H+10],[204,35,H+35],[145,35,H+35]],'#e5effb','stroke-width=".8"');
    building+=face([[204,35,H+10],[204,75,H+10],[204,75,H+35],[204,35,H+35]],'#c3d5ed','stroke-width=".8"');
    building+=face([[145,35,H+35],[204,35,H+35],[204,75,H+35],[145,75,H+35]],'#f5faff','stroke-width=".8"');
    for(let u=150;u<201;u+=8)building+=L([u,36,H+16],[u,36,H+30],`stroke="${C.line}" stroke-width=".7"`);
  }else{
    building+=face([[-7,D+8,H],[W+7,D+8,H],[W+7,D/2,H+roofRise+3],[-7,D/2,H+roofRise+3]],highlight==='roof'?'#c8e0fe':C.roof);
    building+=face([[-7,-8,H],[W+7,-8,H],[W+7,D/2,H+roofRise+3],[-7,D/2,H+roofRise+3]],C.roofSide);
    // Standing courses and staggered slate joints, kept deliberately fine.
    for(let v=D/2+20;v<D+4;v+=20){
      const z=H+(roofRise+3)*(1-(v-D/2)/(D/2+8));
      building+=L([-7,v,z],[W+7,v,z],`stroke="${C.line}" stroke-width=".5" opacity=".48"`);
      if(!industrial)for(let u=(Math.round(v)%2?4:18);u<W;u+=38){const v2=Math.min(v+19,D+8);const z2=H+(roofRise+3)*(1-(v2-D/2)/(D/2+8));building+=L([u,v,z],[u,v2,z2],`stroke="${C.fine}" stroke-width=".5"`);}
    }
    if(industrial)for(let u=1;u<W;u+=22)building+=L([u,D+8,H],[u,D/2,H+roofRise+3],`stroke="${C.line}" stroke-width=".55" opacity=".5"`);
    building+=L([-8,D/2,H+roofRise+4],[W+8,D/2,H+roofRise+4],`stroke="${C.ink}" stroke-width="1.5"`);
    building+=L([-8,D+8,H],[W+8,D+8,H],`stroke="${C.ink}" stroke-width="1.9"`);
    building+=L([W+8,-8,H],[W+8,D/2,H+roofRise+4],`stroke="${C.ink}" stroke-width="1.9"`);
    building+=L([W+8,D/2,H+roofRise+4],[W+8,D+8,H],`stroke="${C.ink}" stroke-width="1.9"`);
    if(!industrial){
      const cu=53,cv=85,cz=H+roofRise+34,base=roofZ(cv+12);
      building+=face([[cu,cv,base],[cu+28,cv,base],[cu+28,cv,cz],[cu,cv,cz]],highlight==='chimney'?'#c8e0fe':'#e9f1fc','stroke-width="1"');
      building+=face([[cu+28,cv,base],[cu+28,cv+24,base],[cu+28,cv+24,cz],[cu+28,cv,cz]],highlight==='chimney'?'#96beef':'#ccddef','stroke-width="1"');
      building+=face([[cu-3,cv-3,cz],[cu+31,cv-3,cz],[cu+31,cv+27,cz],[cu-3,cv+27,cz]],'#ffffff','stroke-width="1"');
      for(let z=base+10;z<cz;z+=9){building+=L([cu,cv,z],[cu+28,cv,z],`stroke="${C.line}" stroke-width=".55"`);building+=L([cu+28,cv,z],[cu+28,cv+24,z],`stroke="${C.line}" stroke-width=".55"`);}
      for(let u of [cu+5,cu+20]){
        building+=face([[u,cv+8,cz],[u+7,cv+8,cz],[u+7,cv+8,cz+13],[u,cv+8,cz+13]],'#9ab5d8','stroke-width=".7"');
        building+=face([[u,cv+8,cz+13],[u+7,cv+8,cz+13],[u+7,cv+15,cz+13],[u,cv+15,cz+13]],'#5c7da8','stroke-width=".7"');
      }
    }
  }

  function scaffold(side){
    const front=side==='front'||side==='rear', hidden=side==='rear'||side==='left';
    const span=front?W:D,bays=Math.ceil(span/62),height=H+20;
    const at=(t,z=0,offset=0)=>front?[t,side==='front'?D+23+offset:-23-offset,z]:[side==='right'?W+23+offset:-23-offset,t,z];
    const sp=(t,z=0,off=0)=>P(...at(t,z,off));
    const st=`stroke="${C.blue}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"`;
    let s=`<g class="scaffold scaffold-${side}" opacity="${hidden?'.45':'1'}" ${hidden?'stroke-dasharray="4 3"':''}>`;
    const deckLevels=[54,108,height-15].filter((v,i,a)=>i===0||v>a[i-1]+10);
    for(let level of deckLevels){
      s+=poly([sp(-10,level,-7),sp(span+10,level,-7),sp(span+10,level,9),sp(-10,level,9)],'#0057e1',`fill-opacity="${hidden?'.04':'.11'}" stroke="${C.blueDark}" stroke-width=".9"`);
      for(let k=0;k<=bays;k++){const t=span*k/bays;s+=line(sp(t,level-2,-8),sp(t,level-2,12),`stroke="${C.blueDark}" stroke-width="1.1"`);}
      for(let z of [level-3,level+20,level+30])s+=line(sp(-11,z,10),sp(span+11,z,10),st);
      s+=line(sp(-10,level-3,-7),sp(span+10,level-3,-7),`stroke="${C.blueDark}" stroke-width="1.2"`);
      if(!hidden)for(let k=0;k<=bays;k++)s+=line(sp(span*k/bays,level-3,-7),sp(span*k/bays,level-3,-24),`stroke="${C.line}" stroke-width=".9"`);
    }
    for(let k=0;k<=bays;k++){
      const t=span*k/bays;
      for(let off of [-7,10]){
        s+=line(sp(t,0,off),sp(t,height+17,off),st);
        s+=poly([sp(t-5,0,off-4),sp(t+5,0,off-4),sp(t+5,0,off+4),sp(t-5,0,off+4)],'#d6e4f7',`stroke="${C.line}" stroke-width=".7"`);
        s+=line(sp(t,1,off),sp(t,9,off),`stroke="${C.ink}" stroke-width="1.1"`);
        for(let z of deckLevels){const p=sp(t,z,off);s+=`<circle cx="${n(p[0])}" cy="${n(p[1])}" r="1.85" fill="${C.blueDark}" stroke="${C.paper}" stroke-width=".4"/>`;}
      }
      if(k<bays){
        const t2=span*(k+1)/bays;
        s+=line(sp(k%2?t2:t,6,10),sp(k%2?t:t2,deckLevels[1]||deckLevels[0],10),`stroke="${C.blue}" stroke-width="1.4"`);
        if(height>145)s+=line(sp(k%2?t:t2,deckLevels[0],10),sp(k%2?t2:t,height-15,10),`stroke="${C.blue}" stroke-width="1.2"`);
      }
    }
    // The access ladder sits within the first bay.
    if(!hidden){
      const t=span/bays*.28,t2=t+14;
      s+=line(sp(t,1,12),sp(t+20,height-15,12),`stroke="${C.ink}" stroke-width="1.45"`);
      s+=line(sp(t2,1,12),sp(t2+20,height-15,12),`stroke="${C.ink}" stroke-width="1.45"`);
      for(let z=8;z<height-16;z+=11){const shift=20*z/(height-16);s+=line(sp(t+shift,z,12),sp(t2+shift,z,12),`stroke="${C.ink}" stroke-width="1.05"`);}
    }
    s+='</g>';
    return s;
  }
  for(let side of sides){if(side==='rear'||side==='left')scaffoldsBehind+=scaffold(side);else scaffoldsFront+=scaffold(side);}
  // Hidden selections retain a clear, quiet label outside the model.
  if(sides.includes('rear')){
    labels+=line([444,66],[508,42],`stroke="${C.blue}" stroke-width=".8" stroke-dasharray="3 4" opacity=".6"`);
    labels+=`<rect x="505" y="25" width="94" height="27" rx="13.5" fill="#ffffff" fill-opacity=".96" stroke="#c8e0fe" stroke-width=".8"/>`;
    labels+=txt(552,42,'Rear access',`fill="${C.blueDark}" font-size="10.5" font-weight="500" text-anchor="middle"`);
  }
  if(sides.includes('left')){
    labels+=line([163,176],[99,151],`stroke="${C.blue}" stroke-width=".8" stroke-dasharray="3 4" opacity=".6"`);
    labels+=`<rect x="39" y="130" width="91" height="27" rx="13.5" fill="#ffffff" fill-opacity=".96" stroke="#c8e0fe" stroke-width=".8"/>`;
    labels+=txt(84.5,147,'Left access',`fill="${C.blueDark}" font-size="10.5" font-weight="500" text-anchor="middle"`);
  }
  if(development){
    ground+=poly([P(W+38,14),P(W+79,14),P(W+79,D-12),P(W+38,D-12)],'#e5f0fe','fill-opacity=".45" stroke="#c2d6f1" stroke-width=".7"');
  }
  if(highlight==='internal'){
    building+=face([[80,D+4,10],[172,D+4,10],[172,D+4,H-12],[80,D+4,H-12]],'#e5f0fe',`fill-opacity=".65" stroke="${C.blue}" stroke-width="1" stroke-dasharray="4 3"`);
    for(let z of [15,78,140])building+=L([85,D+5,z],[167,D+5,z],`stroke="${C.blue}" stroke-width="1.5"`);
    for(let u of [86,126,166])building+=L([u,D+5,13],[u,D+5,H-10],`stroke="${C.blue}" stroke-width="1.3"`);
    building+=L([86,D+5,16],[166,D+5,139],`stroke="${C.blue}" stroke-width="1.1"`);
  }
  const desc=sides.length?`${variant} with ${sides.join(', ')} scaffold access selected`:`${variant} architectural overview`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 500" class="${esc(className)}" role="img" aria-labelledby="${q}-title ${q}-desc" style="width:100%;display:block" fill="none"><title id="${q}-title">${esc(desc)}</title><desc id="${q}-desc">Illustrative access model. Not an engineering drawing or scaffold design.</desc><defs><radialGradient id="${q}-ground"><stop offset="0" stop-color="#9dbde8" stop-opacity=".24"/><stop offset="1" stop-color="#e5f0fe" stop-opacity="0"/></radialGradient></defs><g font-family="Inter,Arial,Helvetica,sans-serif" vector-effect="non-scaling-stroke">${ground}${scaffoldsBehind}${building}${scaffoldsFront}${labels}</g></svg>`;
}

export function capabilitySVG(active='roof'){
  const label=String(active).toLowerCase();
  const key=label.includes('chimney')?'chimney':label.includes('internal')?'internal':label.includes('industrial')?'industrial':label.includes('facade')||label.includes('façade')?'facade':label.includes('full')?'full':'roof';
  const selected=key==='internal'?[]:key==='chimney'?['Right']:key==='facade'?['Front']:key==='full'?['Front','Right','Rear','Left']:['Front','Right'];
  return buildingSVG({kind:key==='industrial'?'industrial':'house',selected,id:`capability-${key}`,highlight:key,className:'capability-building'});
}

export function buildingIcon(kind='house'){
  const common='fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"';
  const paths={
    house:'<path d="M7 23 24 10 41 23M11 20v21h26V20M20 41V28h8v13M29 13V7h6v11"/><path d="M15 25h3m13 0h3M15 31h3m13 0h3"/>',
    commercial:'<path d="M11 41V8h26v33M7 41h34M21 41v-8h6v8"/><path d="M17 15h3m8 0h3M17 22h3m8 0h3M17 29h3m8 0h3"/>',
    development:'<path d="M3 25 14 16l11 9M6 23v18h16V23M25 18 35 10l10 8M28 16v25h14V16M12 41v-9h5v9M33 22h4m-4 7h4M24 41h21"/>',
    industrial:'<path d="M6 41V21l12-7v7l12-7v7l12-7v27H6ZM33 18V6h6v10M12 41V29h12v12M30 29h6v6h-6"/>',
    other:'<path d="m7 18 17-9 17 9v20l-17 9-17-9V18Zm0 0 17 9 17-9M24 27v20M16 13l17 9v8"/>'
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" aria-hidden="true" ${common}>${paths[String(kind).toLowerCase()]||paths.other}</svg>`;
}
