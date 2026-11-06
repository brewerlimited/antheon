"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { createCityScene } from "../city/city-scene";
import type { createStreetScene, StreetDistrict } from "./street-scene";
import { ventures } from "@/data/site";
import "./city-lab.css";

type Overview = ReturnType<typeof createCityScene>;
type Street = ReturnType<typeof createStreetScene>;
type View = "overview" | "street";
const stories = {
  digital: { number: "01", title: "Distinct by design.", label: "The Digital Studio", colour: "#b9cbff", copy: "Websites, brands and digital experiences. Considered in every detail, made to move a business forward.", href: "/web-design", action: "Explore web design", address: "01 / POSSIBILITY AVENUE" },
  software: { number: "02", title: "Complexity, made useful.", label: "The Software Works", colour: "#88d8ca", copy: "Tools and connected systems built around real business problems. Meet the products taking shape at Anthēon.", href: "/recruitment-os", action: "Explore Recruitment OS", address: "02 / POSSIBILITY AVENUE" },
  ventures: { number: "03", title: "What comes next starts here.", label: "The Venture House", colour: "#edc38d", copy: "Independent businesses, connected by a shared ambition. Discover the ideas becoming part of everyday life.", href: "/#ventures", action: "Meet our ventures", address: "03 / POSSIBILITY AVENUE" },
};
const destinations = Object.keys(stories) as StreetDistrict[];

export function CityLab({ embedded = false, initialView = "overview", initialDistrict, onReturn }: { embedded?: boolean; initialView?: View; initialDistrict?: StreetDistrict; onReturn?: () => void } = {}) {
  const [view, setView] = useState<View>(initialView);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [mix, setMix] = useState(0);
  const [paused, setPaused] = useState(false);
  const [selected, setSelected] = useState<StreetDistrict | null>(null);
  const [help, setHelp] = useState(false);
  const [reduced, setReduced] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overviewRef = useRef<Overview | null>(null);
  const streetRef = useRef<Street | null>(null);
  const landmarkRefs = useRef<Partial<Record<StreetDistrict, HTMLButtonElement | null>>>({});
  const mapDotRef = useRef<SVGCircleElement>(null);
  const bearingRef = useRef<HTMLSpanElement>(null);
  const mixRef = useRef(0);
  const pausedRef = useRef(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const destinationRefs = useRef<Partial<Record<StreetDistrict, HTMLButtonElement | null>>>({});

  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();media.addEventListener("change",update);return()=>media.removeEventListener("change",update);
  }, []);

  useEffect(() => {
    const canvas=canvasRef.current;if(!canvas)return;
    let cancelled=false, stop: (()=>void)|undefined, visible=true;
    const setRunning=()=>{
      const running=visible&&!document.hidden;
      overviewRef.current?.setRunning(running);
      streetRef.current?.setRunning(running);
    };
    const error=()=>{if(!cancelled){setStatus("error");overviewRef.current?.setRunning(false);streetRef.current?.setRunning(false);}};
    if(view==="overview") {
      void Promise.all([import("../city/city-scene"),import("./ascii-pass")]).then(([{createCityScene},{createAsciiPass}])=>{
        if(cancelled)return;
        const pass=createAsciiPass();
        try{
          const scene=createCityScene(canvas,{
            onHover:()=>{},onSelect:()=>{},onReady:()=>{if(!cancelled)setStatus("ready");},onError:error,reducedMotion:reduced,
            renderFrame:(renderer,world,camera)=>{pass.setMix(mixRef.current);pass.render(renderer,world,camera);},
          });
          overviewRef.current=scene;scene.setMotionPaused(pausedRef.current);scene.setProgress(.35+mixRef.current*.45);scene.setActiveDistrict(null);
          stop=()=>{scene.dispose();pass.dispose();overviewRef.current=null;};setRunning();
        }catch{pass.dispose();error();}
      }).catch(error);
    }else{
      void import("./street-scene").then(({createStreetScene})=>{
        if(cancelled)return;
        try{
          const scene=createStreetScene(canvas,{
            reducedMotion:reduced,onReady:()=>{if(!cancelled)setStatus("ready");},onError:error,
            onLandmarks:points=>{points.forEach(point=>{const el=landmarkRefs.current[point.id];if(el){el.style.visibility=point.visible?"visible":"hidden";el.style.transform=`translate(${point.x}px,${point.y}px) translate(-50%,-50%)`;}});},
            onPosition:(x,z,heading)=>{
              mapDotRef.current?.setAttribute("cx",String(55+x*1.4));
              mapDotRef.current?.setAttribute("cy",String(25+(z+66)*.9));
              if(bearingRef.current)bearingRef.current.textContent=`${String((Math.round(((-heading*180/Math.PI)%360+360)%360)%360)).padStart(3,"0")}° N`;
              canvas.dataset.position=`${x.toFixed(2)},${z.toFixed(2)}`;
            },
          });
          streetRef.current=scene;scene.setMix(mixRef.current);scene.setPaused(pausedRef.current);
          if(initialDistrict)scene.visit(initialDistrict);
          stop=()=>{scene.dispose();streetRef.current=null;};setRunning();
        }catch{error();}
      }).catch(error);
    }
    const resize=new ResizeObserver(()=>{overviewRef.current?.resize();streetRef.current?.resize();});resize.observe(canvas);
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;setRunning();});observer.observe(canvas);
    document.addEventListener("visibilitychange",setRunning);
    return()=>{cancelled=true;resize.disconnect();observer.disconnect();document.removeEventListener("visibilitychange",setRunning);stop?.();};
  },[view,reduced,initialDistrict]);

  useEffect(()=>{
    if(view!=="overview"||reduced)return;
    let frame=0;
    const update=()=>{
      frame=0;const root=rootRef.current,stage=stageRef.current;if(!root||!stage)return;
      const distance=root.offsetHeight-stage.clientHeight;
      const progress=Math.max(0,Math.min(1,-root.getBoundingClientRect().top/Math.max(1,distance)));
      mixRef.current=progress;setMix(progress);overviewRef.current?.setProgress(.35+progress*.45);
    };
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
    window.addEventListener("scroll",schedule,{passive:true});window.addEventListener("resize",schedule,{passive:true});
    return()=>{cancelAnimationFrame(frame);window.removeEventListener("scroll",schedule);window.removeEventListener("resize",schedule);};
  },[view,reduced]);

  useEffect(()=>{
    if(!selected)return;
    closeRef.current?.focus({preventScroll:true});
    const onEscape=(event:KeyboardEvent)=>{if(event.key==="Escape"){event.preventDefault();event.stopPropagation();setSelected(null);destinationRefs.current[selected]?.focus({preventScroll:true});}};
    window.addEventListener("keydown",onEscape);
    return()=>window.removeEventListener("keydown",onEscape);
  },[selected]);

  function changeView(next:View){
    if(next===view)return;
    const nextMix=0;
    mixRef.current=nextMix;setMix(nextMix);setSelected(null);setStatus("loading");setView(next);
    window.scrollTo({top:0,behavior:"instant"});
  }
  function updateMix(value:number){
    mixRef.current=value;setMix(value);
    if(view==="street")streetRef.current?.setMix(value);
    else{
      overviewRef.current?.setProgress(.35+value*.45);
      if(!reduced&&rootRef.current&&stageRef.current){
        const root=rootRef.current;const top=root.getBoundingClientRect().top+scrollY;
        window.scrollTo({top:top+(root.offsetHeight-stageRef.current.clientHeight)*value,behavior:"instant"});
      }
    }
  }
  function revealWorld(){
    const value=mix>.5?0:1;
    if(reduced||!rootRef.current||!stageRef.current){updateMix(value);return;}
    const root=rootRef.current;
    window.scrollTo({top:root.getBoundingClientRect().top+scrollY+(root.offsetHeight-stageRef.current.clientHeight)*value,behavior:"smooth"});
  }
  function togglePause(){const next=!paused;pausedRef.current=next;setPaused(next);streetRef.current?.setPaused(next);overviewRef.current?.setMotionPaused(next);}
  function visit(id:StreetDistrict){streetRef.current?.visit(id);setSelected(id);}
  function closeStory(){const previous=selected;setSelected(null);if(previous)destinationRefs.current[previous]?.focus({preventScroll:true});}
  const story=selected?stories[selected]:null;

  const Container = embedded ? "div" : "main";
  return <Container className={`city-lab${embedded ? " lab-embedded" : ""}`} data-view={view} data-reduced={reduced}>
    <section className="lab-journey" ref={rootRef} aria-label="The Anthēon city experience">
      <div className="lab-stage" ref={stageRef}>
        <div className="lab-fallback" aria-hidden="true" />
        <canvas key={`${view}-${reduced}`} ref={canvasRef} className="lab-canvas" tabIndex={view==="street"?0:-1} aria-label={view==="street"?"Walk through Possibility Avenue. Use W A S D or arrow keys to move. Drag to look around.":"Anthēon city: ASCII characters resolving into solid architecture"} />
        <div className="lab-shade" aria-hidden="true" />
        <div className="lab-frame" aria-hidden="true"><i/><i/><i/><i/></div>
        {!embedded && <header className="lab-header">
          <Link href="/#top" className="lab-wordmark" aria-label="Anthēon homepage">anthēon<span>INDEPENDENT THINKING.</span></Link>
          <div className="lab-view-switch" role="group" aria-label="Choose city view">
            <button type="button" aria-pressed={view==="overview"} onClick={()=>changeView("overview")}><span>01</span> The overview</button>
            <button type="button" aria-pressed={view==="street"} onClick={()=>changeView("street")}><span>02</span> The avenue</button>
          </div>
          <a className="lab-header-link" href="/contact">Start a conversation <span>↗</span></a>
        </header>}
        {embedded && <button type="button" className="avenue-return" onClick={onReturn}>← Back to the city</button>}

        {!embedded && <div className="lab-coordinate"><span className="lab-live-dot"/> ANTHĒON / WORLD 001 <span className="lab-coordinate-mode">{view==="overview"?"THE ECOSYSTEM":"STREET LEVEL"}</span></div>}
        {view==="overview"?<div className="lab-intro">
          <p className="lab-eyebrow">FROM THE FIRST CHARACTER.</p>
          <h1>A world of<br/><em>possibility.</em></h1>
          <p className="lab-intro-copy">An idea becomes a place.<br/>A place becomes something real.</p>
          <button type="button" className="lab-text-button" onClick={revealWorld}>{mix>.5?"Back to the first character":"Bring the world to life"} <span>{mix>.5?"↑":"↓"}</span></button>
        </div>:<div className="lab-street-heading"><p className="lab-eyebrow">THE ANTHĒON ECOSYSTEM, UP CLOSE.</p><h2>Possibility Avenue<span>.</span></h2>{!embedded && <p>Three addresses. A shared ambition.</p>}</div>}

        <div className="lab-tools">
          <button type="button" aria-label={paused?"Resume atmosphere":"Pause atmosphere"} aria-pressed={paused} onClick={togglePause}>{paused?"▷":"Ⅱ"}</button>
          <button type="button" aria-label="Show controls" aria-expanded={help} onClick={()=>setHelp(!help)}>?</button>
          {view==="street"&&<button type="button" aria-label="Reset street view" onClick={()=>{streetRef.current?.reset();setSelected(null);}}>↺</button>}
        </div>
        {help&&<aside className="lab-help" aria-label="City controls"><strong>Your way through the city</strong><p>{view==="overview"?"Scroll or use the slider to turn the ASCII city into solid architecture. Enter the avenue to explore at street level.":"Click the street, then use W A S D to walk. Arrow keys move and turn. Drag to look up and around. Choose an address below to visit a destination."}</p><button type="button" onClick={()=>setHelp(false)}>Got it ↗</button></aside>}

        {view==="street"&&<>
          <div className="lab-beacons" hidden={!!selected} aria-label="Buildings in view">{destinations.map(id=><button type="button" ref={el=>{landmarkRefs.current[id]=el;}} key={id} className="lab-beacon" style={{visibility:"hidden"}} onClick={()=>visit(id)} aria-label={`Enter ${stories[id].label}`}><i>+</i><span>{stories[id].number} / {id}</span></button>)}</div>
          <div className="lab-map" aria-label="Possibility Avenue map">
            <svg viewBox="0 0 110 130" role="img" aria-label="Your position between Digital, Software and Ventures">
              <path d="M43 15V120M67 15V120M12 47H98M12 86H98" fill="none" stroke="#7b8cac" strokeOpacity=".28"/>
              <path d="M55 20V120" stroke="#b9cbff" strokeOpacity=".18" strokeDasharray="2 4"/>
              <g fill="#b9cbff" fillOpacity=".16" stroke="#b9cbff" strokeWidth=".6"><rect x="19" y="89" width="20" height="25"/><rect x="71" y="89" width="22" height="25"/><rect x="71" y="51" width="22" height="29"/><rect x="19" y="51" width="20" height="29"/><rect x="19" y="18" width="20" height="23"/><rect x="71" y="18" width="22" height="23"/></g>
              <g fill="#b9cbff" fontSize="7" fontFamily="monospace"><text x="24" y="104">01</text><text x="77" y="104">02</text><text x="77" y="69">03</text></g>
              <circle ref={mapDotRef} cx="55" cy="107" r="3" fill="#e8efff"/><circle cx="55" cy="10" r="1.5" fill="#b9cbff"/>
            </svg><span ref={bearingRef}>000° N</span><small>POSSIBILITY AVE.</small>
          </div>
          <div className="lab-walk-controls" role="group" aria-label="Walking controls">
            {([{key:"arrowleft",label:"Turn left",symbol:"↶"},{key:"w",label:"Walk forward",symbol:"↑"},{key:"s",label:"Walk backward",symbol:"↓"},{key:"arrowright",label:"Turn right",symbol:"↷"}]).map(control=><button key={control.key} type="button" aria-label={control.label} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);streetRef.current?.setInput(control.key,true);}} onPointerUp={()=>streetRef.current?.setInput(control.key,false)} onPointerCancel={()=>streetRef.current?.setInput(control.key,false)} onLostPointerCapture={()=>streetRef.current?.setInput(control.key,false)} onKeyDown={e=>{if(e.key===" "||e.key==="Enter"){e.preventDefault();streetRef.current?.setInput(control.key,true);}}} onKeyUp={()=>streetRef.current?.setInput(control.key,false)} onBlur={()=>streetRef.current?.setInput(control.key,false)}>{control.symbol}</button>)}
          </div>
        </>}

        {story&&<aside className="lab-story" role="dialog" aria-modal="false" tabIndex={-1} aria-label={story.label} style={{"--district-accent":story.colour} as React.CSSProperties}>
          <div className="lab-story-top"><span>{story.address}</span><button ref={closeRef} type="button" aria-label="Close destination" onClick={closeStory}>×</button></div>
          <p className="lab-eyebrow">{story.label}</p><h2>{story.title}</h2><p className="lab-story-copy">{story.copy}</p>
          {selected==="software"&&<div className="lab-story-products"><a href="/recruitment-os/demo"><span>RECRUITMENT OS</span>Open the interactive demo ↗</a>{ventures.slice(0,2).map(v=><a href={v.href} key={v.name} target="_blank" rel="noopener noreferrer"><span>{v.category}</span>{v.name} ↗</a>)}</div>}
          {selected==="ventures"&&<div className="lab-story-products">{ventures.filter(v=>v.href).map(v=><a href={v.href} key={v.name} target="_blank" rel="noopener noreferrer"><span>{v.category}</span>{v.name} ↗</a>)}</div>}
          {selected==="digital"&&<div className="lab-story-products"><a href="/web-design"><span>THE WORK</span>Explore website concepts ↗</a><a href="/website-redesign"><span>A NEW PERSPECTIVE</span>Reimagine your website ↗</a></div>}
          <a href={story.href} className="lab-story-cta">{story.action}<span>↗</span></a>
        </aside>}

        <footer className="lab-dock">
          {!embedded && <div className="lab-material"><div><span>{mix<.03?"BUILT FROM CHARACTERS":mix>.97?"IDEAS, MADE REAL":"BECOMING SOMETHING REAL"}</span><output>{String(Math.round(mix*100)).padStart(3,"0")}%</output></div><label className="lab-slider-label"><span>ASCII</span><input aria-label="Materialisation" type="range" min="0" max="100" step="1" value={Math.round(mix*100)} onChange={e=>updateMix(Number(e.target.value)/100)}/><span>SOLID</span></label></div>}
          {view==="overview"?<div className="lab-enter"><span>THERE’S MORE AT STREET LEVEL.</span><button type="button" onClick={()=>changeView("street")}>Enter the avenue <span>↗</span></button></div>:<nav className="lab-addresses" aria-label="Avenue destinations">{destinations.map(id=><button ref={el=>{destinationRefs.current[id]=el;}} type="button" key={id} onClick={()=>visit(id)} aria-pressed={selected===id}><span>{stories[id].number}</span>{id}<i>↗</i></button>)}</nav>}
        </footer>
        <div className="lab-bottom-caption"><span>{view==="overview"?"SCROLL TO MATERIALISE":"DRAG TO LOOK · WASD TO WALK"}</span><span>INDEPENDENT THINKING. CONNECTED AMBITION.</span></div>
        {status==="loading"&&<div className="lab-loading" role="status"><span/>Assembling the world</div>}
        {status==="error"&&<div className="lab-error" role="status"><h2>A different way in.</h2><p>The interactive city couldn’t start on this device. You can still explore Anthēon’s services and ventures.</p><a href="/web-design">Explore web design ↗</a>{embedded && <button type="button" onClick={onReturn}>Back to the city</button>}</div>}
      </div>
    </section>
  </Container>;
}
