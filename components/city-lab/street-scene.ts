import {
  ACESFilmicToneMapping, AdditiveBlending, BoxGeometry, BufferAttribute, BufferGeometry,
  CanvasTexture, Color, CylinderGeometry, DirectionalLight, DoubleSide, FogExp2,
  Group, HemisphereLight, InstancedMesh, Mesh, MeshBasicMaterial, MeshStandardMaterial,
  Line, LineBasicMaterial, Object3D, PerspectiveCamera, PlaneGeometry, Points, PointsMaterial, Scene,
  SRGBColorSpace, Vector3, WebGLRenderer,
} from "three";
import type { Material, Texture } from "three";
import { createAsciiPass } from "./ascii-pass";

export type StreetDistrict = "digital" | "software" | "ventures";
export type StreetOptions = {
  onReady: () => void; onError: () => void;
  onPosition: (x: number, z: number, heading: number) => void;
  onLandmarks: (points: { id: StreetDistrict; x: number; y: number; visible: boolean }[]) => void;
  reducedMotion: boolean;
};
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

export function createStreetScene(canvas: HTMLCanvasElement, options: StreetOptions) {
  const renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x03050c);
  const scene = new Scene(); scene.background = new Color(0x03050c); scene.fog = new FogExp2(0x060b18, .011);
  const camera = new PerspectiveCamera(67, 1, .1, 350);
  camera.rotation.order = "YXZ";
  const pass = createAsciiPass();
  const geometrySet = new Set<BufferGeometry>();
  const materialSet = new Set<Material>();
  const textureSet = new Set<Texture>();
  const box = new BoxGeometry(1, 1, 1); geometrySet.add(box);
  const dummy = new Object3D();
  const batches = new Map<string, { material: Material; pieces: { x: number; y: number; z: number; w: number; h: number; d: number; colour?: Color }[] }>();
  let seed = 77341;
  const random = () => { seed = (Math.imul(1664525, seed) + 1013904223) | 0; return (seed >>> 0) / 4294967296; };
  const solid = (colour: string, metalness = .25) => {
    const m = new MeshStandardMaterial({ color: colour, roughness: .62, metalness }); materialSet.add(m); return m;
  };
  const light = (colour: string, opacity = 1) => {
    const m = new MeshBasicMaterial({ color: colour, transparent: opacity < 1, opacity, toneMapped: false }); materialSet.add(m); return m;
  };
  const dark = solid("#243049", .65), stone = solid("#3e4555"), trim = solid("#566174", .65);
  const glass = solid("#22354c", .7), asphalt = solid("#101724", .3), paving = solid("#242a37");
  const blue = light("#b9cbff"), teal = light("#74cbbd"), amber = light("#edc38d"), dim = light("#53657c");
  const solidLeaf = solid("#3c635c", 0);
  const windows = light("#ffffff"), warm = new Color("#e7b97c"), cool = new Color("#93b1eb");
  function add(m: Material, x: number, y: number, z: number, w: number, h: number, d: number, colour?: Color) {
    if (!batches.has(m.uuid)) batches.set(m.uuid, { material: m, pieces: [] });
    batches.get(m.uuid)!.pieces.push({ x, y, z, w, h, d, colour });
  }
  scene.add(new HemisphereLight(0x93a9dd, 0x0f1020, 1.2));
  const moon = new DirectionalLight(0x9ab8ff, 2); moon.position.set(-30, 55, 20); scene.add(moon);
  const rim = new DirectionalLight(0xd5b9dc, .75); rim.position.set(15, 30, -70); scene.add(rim);

  add(asphalt, 0, -.18, -30, 190, .3, 240);
  for (const side of [-1, 1]) {
    add(paving, side * 9.2, -.01, -20, 5, .24, 105);
    add(trim, side * 6.7, .07, -20, .13, .25, 105);
    add(dim, side * 6.65, .201, -20, .045, .016, 103);
    for (let z = -69; z < 33; z += 1.35) add(dark, side * 9.1, .12, z, 4.7, .015, .024);
    for (let z = -65; z < 33; z += 4.5) add(amber, side * .24, .005, z, .045, .016, 2.1);
    for (let z = -60; z < 30; z += 9) {
      // Drain covers and tactile paving retain detail down at walking height.
      for (let q = 0; q < 8; q++) add(dark, side * 6.48, .025, z + q * .07, .25, .04, .03);
      add(trim, side * 7.6, .65, z, .09, 1.2, .09);
      add(blue, side * 7.6, 1.1, z, .12, .08, .12);
    }
  }
  for (let x = -5.9; x < 6; x += 1.2) add(stone, x, .021, 7.3, .65, .022, 3.1);

  function tower(x: number, z: number, w: number, d: number, h: number, accent: Material, signature = false) {
    add(dark, x, h / 2, z, w, h, d);
    add(glass, x, h / 2 + .1, z + .03, w + .025, h - .5, d + .02);
    // Front and inward facades: lit rooms, mullions, cornices, real setbacks.
    for (let yy = 2.3; yy < h - 1; yy += 2.1) {
      add(trim, x, yy + .8, z, w + .10, .09, d + .11);
      for (let xx = -w / 2 + .65; xx < w / 2; xx += 1.2) {
        const c = (random() > .62 ? warm : cool).clone().multiplyScalar(random() > .28 ? .20 + random() * .8 : .035);
        add(windows, x + xx, yy, z + d / 2 + .035, .68, 1.02, .018, c);
      }
      const inward = x > 0 ? -1 : 1;
      for (let zz = -d / 2 + .65; zz < d / 2; zz += 1.2) {
        const c = (random() > .6 ? warm : cool).clone().multiplyScalar(random() > .32 ? .18 + random() * .72 : .03);
        add(windows, x + inward * (w / 2 + .035), yy, z + zz, .018, 1.02, .65, c);
      }
    }
    for (let xx = -w / 2; xx <= w / 2; xx += 1.2) add(stone, x + xx, h / 2, z + d / 2 + .1, .105, h, .14);
    const inward = x > 0 ? -1 : 1;
    for (let zz = -d / 2; zz <= d / 2; zz += 1.2) add(stone, x + inward * (w / 2 + .08), h / 2, z + zz, .13, h, .09);
    add(stone, x, h + .08, z, w + .38, .32, d + .4);
    add(accent, x, h + .30, z + d / 2 + .22, w + .35, .065, .08);
    add(dark, x + .7, h + 1, z - 1, w * .5, 1.7, d * .55);
    for (let i = 0; i < 3; i++) add(trim, x - w * .25, h + .6, z + i - 1, 1, .8, .7);
    if (signature) {
      add(accent, x + inward * (w / 2 + .1), h / 2, z + d / 2, .12, h, .12);
      add(stone, x, 3.2, z + d / 2 + .6, w + 1.2, .25, 1.5);
      for (let xx = -w / 2 + .3; xx < w / 2; xx += 2.7) add(amber, x + xx, 2.85, z + d / 2 + .25, 1.5, .08, .6);
    }
  }
  // The first block is deliberately composed as a street, with a clear vanishing
  // point and three destinations. Seeded detail does not change on revisits.
  tower(-13.5, 8, 10, 12, 37, blue, true);
  tower(14, 5, 11, 14, 43, teal, true);
  tower(-14, -11, 11, 13, 29, blue, true);
  tower(14, -16, 11, 15, 32, amber, true);
  tower(-14, -34, 11, 18, 48, teal);
  tower(14, -40, 11, 15, 40, blue);
  tower(-15, -57, 14, 14, 29, blue);
  tower(15, -60, 14, 14, 51, amber);
  for (let i = 0; i < 28; i++) {
    const side = i % 2 ? -1 : 1;
    tower(side * (25 + random() * 35), -15 - random() * 118, 6 + random() * 9, 7 + random() * 9, 18 + random() * 52, dim);
  }
  // Anthēon's twin blades and connecting skyroom anchor the end of the avenue.
  tower(-3.5, -88, 6, 10, 67, blue, true);
  tower(4, -90, 5, 10, 55, amber, true);
  add(glass, 0, 44, -89, 12, 3, 7); add(blue, 0, 45.5, -85.45, 12, .12, .12);
  add(blue, -3.5, 70, -88, .07, 6, .07);

  function sign(text: string, sub: string, x: number, y: number, z: number, w: number, h: number, tint: string, yaw = 0) {
    const c = document.createElement("canvas"); c.width = 1024; c.height = 256;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#0a101b"; ctx.fillRect(0, 0, 1024, 256);
    ctx.strokeStyle = tint; ctx.lineWidth = 3; ctx.strokeRect(12, 12, 1000, 232);
    ctx.fillStyle = tint; ctx.font = "500 82px monospace"; ctx.fillText(text, 40, 118);
    ctx.globalAlpha = .7; ctx.font = "23px monospace"; ctx.fillText(sub, 44, 192);
    const texture = new CanvasTexture(c); texture.colorSpace = SRGBColorSpace; textureSet.add(texture);
    const m = new MeshBasicMaterial({ map: texture, side: DoubleSide }); materialSet.add(m);
    const g = new PlaneGeometry(w, h); geometrySet.add(g);
    const mesh = new Mesh(g, m); mesh.position.set(x, y, z); mesh.rotation.y = yaw; scene.add(mesh);
  }
  sign("DIGITAL", "01 / DISTINCT BY DESIGN", -13.5, 6.1, 14.25, 9, 2.25, "#b9cbff");
  sign("THE STUDIO", "WEBSITES / BRANDS / EXPERIENCES", -8.35, 4.8, -9, 9, 2.25, "#b9cbff", Math.PI / 2);
  sign("SOFTWARE", "02 / COMPLEXITY, MADE USEFUL", 14, 6, 12.25, 9.5, 2.37, "#88d8ca");
  sign("VENTURES", "03 / WHAT COMES NEXT", 14, 7.2, -8.25, 9.5, 2.37, "#edc38d");
  sign("ANTHEON", "INDEPENDENT THINKING. SHARED AMBITION.", 0, 21, -82.9, 16, 4, "#b9cbff");
  sign("MADE DISTINCT.", "AN ANTHEON ORIGINAL", -14, 18, -4.4, 10, 2.5, "#b9cbff");
  sign("DIGITAL", "WEBSITES / BRANDS", -8.35, 7.2, 8, 6, 1.7, "#b9cbff", Math.PI / 2);
  sign("BUILD WHAT'S NEXT", "ANTHEON / POSSIBILITY AVENUE", 0, 13.3, -30.8, 12, 2.4, "#b9cbff");
  // An inhabited skybridge creates a second scale and a recognisable threshold.
  add(dark,0,12,-32,18,1,3);
  add(glass,0,13.6,-32.2,18,2.2,2.5);
  add(stone,0,14.9,-32.2,18,.22,3);
  add(blue,0,11.55,-30.48,17,.08,.08);
  for(let xx=-8;xx<9;xx+=1.3)add(trim,xx,13.6,-30.8,.07,2.2,.08);
  // Overhead service wires, a small kiosk and parked electric cars.
  const wireMaterial=new LineBasicMaterial({color:0x53657f,transparent:true,opacity:.6});materialSet.add(wireMaterial);
  for(const zz of [3,-19]){
    const points=Array.from({length:25},(_,i)=>new Vector3(-8+i*16/24,8.6-Math.sin(i/24*Math.PI)*.65,zz));
    const geo=new BufferGeometry().setFromPoints(points);geometrySet.add(geo);scene.add(new Line(geo,wireMaterial));
  }
  add(dark,-7.8,1.6,6,1.1,3.2,.9);add(blue,-7.8,3.21,6,1.12,.06,.92);
  sign("HELLO.", "LET'S TALK", -7.8,2.35,6.47,.95,.6,"#b9cbff");
  for(const car of [{x:-5.4,z:-1,c:teal},{x:5.4,z:-20,c:blue}]){
    add(dark,car.x,.45,car.z,1.6,.55,3.5);add(glass,car.x,.94,car.z-.25,1.35,.53,1.8);
    add(car.c,car.x,.61,car.z,1.65,.045,3.4);
    for(const side of [-1,1]){
      add(amber,car.x+side*.59,.52,car.z+1.78,.28,.1,.05);
      for(const zz of [-1.05,1.05])add(dark,car.x+side*.82,.28,car.z+zz,.16,.5,.5);
    }
  }
  // Blade signs and the entrance colonnades add a human scale below the towers.
  for (const side of [-1, 1]) {
    for (const z of [12, -8, -30, -52]) {
      add(dark, side * 8.25, 5, z, .3, 3.8, 1.5);
      add(side < 0 ? blue : amber, side * 8.04, 5, z, .035, 3.4, .09);
      for (let yy = 3.7; yy < 6.5; yy += .43) add(side < 0 ? blue : teal, side * 8.24, yy, z + .76, .19, .2, .025);
      add(stone, side * 8.8, 1.6, z, .26, 3.1, .26);
    }
  }
  // Lamps, benches, planters, cycles and a quiet street-level gallery.
  const glowCanvas = document.createElement("canvas"); glowCanvas.width = glowCanvas.height = 128;
  const gc = glowCanvas.getContext("2d")!;
  const grad = gc.createRadialGradient(64,64,0,64,64,64); grad.addColorStop(0,"#ffffff"); grad.addColorStop(.2,"#ffffff55"); grad.addColorStop(1,"#ffffff00"); gc.fillStyle = grad; gc.fillRect(0,0,128,128);
  const glowTexture = new CanvasTexture(glowCanvas); textureSet.add(glowTexture);
  const glowGeo = new PlaneGeometry(1,1); geometrySet.add(glowGeo);
  for (const side of [-1, 1]) for (let z = 22; z > -70; z -= 13) {
    add(trim, side * 7.1, 2.65, z, .11, 5.3, .11);
    add(trim, side * 6.7, 5.2, z, .8, .12, .12);
    add(amber, side * 6.65, 5.15, z, .55, .06, .2);
    const glowMat = new MeshBasicMaterial({ map: glowTexture, color: 0xf3c78d, transparent: true, opacity: .17, depthWrite: false, blending: AdditiveBlending }); materialSet.add(glowMat);
    const glow = new Mesh(glowGeo, glowMat); glow.rotation.x = -Math.PI / 2; glow.position.set(side * 6.2,.04,z); glow.scale.set(8,12,1); scene.add(glow);
    const benchZ = z - 4;
    add(stone, side * 8.1, .43, benchZ, .8, .13, 2.1);
    add(trim, side * 8.1, .22, benchZ - .7, .5, .4, .1); add(trim, side * 8.1, .22, benchZ + .7, .5, .4, .1);
    add(dark, side * 8.2, .5, z - 7, 1, .9, 1.5);
    for (let k = 0; k < 12; k++) add(solidLeaf, side * 8.2 + (random() - .5) * .8, .95 + random() * .55, z - 7 + (random() - .5) * 1.1, .12, .65, .12);
  }
  // Broken pools of reflected signage sit flush with the road, between paving.
  const reflectionMaterials = [blue, teal, amber].map(m=>{const copy=m.clone();copy.transparent=true;copy.opacity=.07;materialSet.add(copy);return copy;});
  for (let i = 0; i < 290; i++) {
    const reflectionMat = reflectionMaterials[i % 3];
    // Group reflection colours to keep the final draw-call count bounded.
    const key = `reflection-${i % 3}`;
    if (!batches.has(key)) batches.set(key, { material: reflectionMat, pieces: [] });
    batches.get(key)!.pieces.push({ x: (random()-.5)*12, y: .015, z: random()*70-50, w: .025+random()*.12, h: .012, d: .15+random()*2.8 });
  }
  // Shared instanced geometry keeps several thousand windows inexpensive.
  for (const batch of batches.values()) {
    const mesh = new InstancedMesh(box, batch.material, batch.pieces.length);
    batch.pieces.forEach((p,i) => {
      dummy.position.set(p.x,p.y,p.z); dummy.rotation.set(0,0,0); dummy.scale.set(p.w,p.h,p.d); dummy.updateMatrix(); mesh.setMatrixAt(i,dummy.matrix);
      if (p.colour) mesh.setColorAt(i,p.colour);
    });
    scene.add(mesh);
  }
  // A handful of silhouettes cross the far pavement, at human scale.
  const people: { group: Group; start: number; z: number; speed: number }[] = [];
  const bodyGeometry = new CylinderGeometry(.16,.21,1.05,5); geometrySet.add(bodyGeometry);
  const headGeometry = new BoxGeometry(.22,.24,.23); geometrySet.add(headGeometry);
  for (let i=0;i<8;i++) {
    const group = new Group(); const torso = new Mesh(bodyGeometry,dark); torso.position.y=.95;
    const head = new Mesh(headGeometry,stone); head.position.y=1.61; group.add(torso,head);
    for (const leg of [-1,1]) {const m = new Mesh(box,dark);m.position.set(leg*.1,.28,0);m.scale.set(.12,.55,.12);group.add(m);}
    const z=-24-i*5; group.position.set(i%2?-7.1:7.1,0,z); scene.add(group); people.push({group,start:random()*20,z,speed:.2+random()*.25});
  }
  const rainGeometry = new BufferGeometry(); geometrySet.add(rainGeometry);
  const rain = new Float32Array(300*3);
  for(let i=0;i<300;i++) { rain[i*3]=(random()-.5)*28;rain[i*3+1]=random()*36;rain[i*3+2]=random()*100-65; }
  rainGeometry.setAttribute("position",new BufferAttribute(rain,3));
  const rainMaterial = new PointsMaterial({color:0xa5b7d8,size:.025,transparent:true,opacity:.22,depthWrite:false});materialSet.add(rainMaterial);
  const rainPoints = new Points(rainGeometry,rainMaterial);scene.add(rainPoints);

  const landmarks: {id:StreetDistrict;point:Vector3}[] = [
    {id:"digital",point:new Vector3(-8.25,4.5,10)},
    {id:"software",point:new Vector3(8.25,4.5,8)},
    {id:"ventures",point:new Vector3(8.25,4.9,-13)},
  ];
  const projected = new Vector3();
  let x=0, z=25, yaw=0, pitch=.14, mix=0, mixTarget=0;
  let raf=0, running=true, paused=false, disposed=false, last=0, elapsed=0, report=0, ready=false;
  let dragging=false, pointerId=-1, previousX=0, previousY=0;
  let travel: { x: number; z: number; yaw: number; pitch: number } | null = null;
  const keys = new Set<string>();
  const legalKeys = new Set(["w","a","s","d","arrowup","arrowdown","arrowleft","arrowright","shift"]);
  const down = (e: KeyboardEvent) => {
    if(!legalKeys.has(e.key.toLowerCase())) return;
    e.preventDefault();keys.add(e.key.toLowerCase());travel=null;schedule();
  };
  const up=(e:KeyboardEvent)=>keys.delete(e.key.toLowerCase());
  const clear=()=>{keys.clear();dragging=false;};
  const pointerDown=(e:PointerEvent)=>{canvas.focus({preventScroll:true});dragging=true;pointerId=e.pointerId;previousX=e.clientX;previousY=e.clientY;canvas.setPointerCapture(e.pointerId);travel=null;};
  const pointerMove=(e:PointerEvent)=>{if(!dragging)return;yaw-=(e.clientX-previousX)*.003;pitch=clamp(pitch-(e.clientY-previousY)*.0025,-.45,.75);previousX=e.clientX;previousY=e.clientY;schedule();};
  const pointerUp=()=>{dragging=false;if(pointerId>=0&&canvas.hasPointerCapture(pointerId))canvas.releasePointerCapture(pointerId);pointerId=-1;};
  const contextLost=(e:Event)=>{e.preventDefault();running=false;cancelAnimationFrame(raf);raf=0;options.onError();};
  canvas.addEventListener("keydown",down);window.addEventListener("keyup",up);window.addEventListener("blur",clear);
  canvas.addEventListener("pointerdown",pointerDown);canvas.addEventListener("pointermove",pointerMove);
  canvas.addEventListener("pointerup",pointerUp);canvas.addEventListener("pointercancel",pointerUp);canvas.addEventListener("lostpointercapture",clear);
  canvas.addEventListener("blur",clear);canvas.addEventListener("webglcontextlost",contextLost);
  function resize(){const r=canvas.getBoundingClientRect();renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(Math.max(1,r.width),Math.max(1,r.height),false);camera.fov=r.width<600?86:67;camera.aspect=r.width/Math.max(1,r.height);camera.updateProjectionMatrix();schedule();}
  function frame(timestamp:number){
    raf=0;if(disposed||!running)return;
    const dt=Math.min(last?(timestamp-last)/1000:1/60,.05);last=timestamp;
    if(!paused&&!options.reducedMotion)elapsed+=dt;
    const ease=options.reducedMotion?1:1-Math.exp(-dt*3.2);
    if(travel){x+=(travel.x-x)*ease;z+=(travel.z-z)*ease;yaw+=(travel.yaw-yaw)*ease;pitch+=(travel.pitch-pitch)*ease;if(Math.abs(z-travel.z)+Math.abs(x-travel.x)<.025)travel=null;}
    let forward=Number(keys.has("w")||keys.has("arrowup"))-Number(keys.has("s")||keys.has("arrowdown"));
    let side=Number(keys.has("d"))-Number(keys.has("a"));
    const moving=!!(forward||side);
    if(forward&&side){forward*=Math.SQRT1_2;side*=Math.SQRT1_2;}
    const speed=(keys.has("shift")?8:4.4)*dt;
    yaw+=(Number(keys.has("arrowleft"))-Number(keys.has("arrowright")))*dt*1.1;
    x=clamp(x+(-Math.sin(yaw)*forward+Math.cos(yaw)*side)*speed,-4.35,4.35);
    z=clamp(z+(-Math.cos(yaw)*forward-Math.sin(yaw)*side)*speed,-66,30);
    camera.position.set(x,2.05+(moving&&!options.reducedMotion?Math.sin(elapsed*9)*.025:0),z);
    camera.rotation.set(pitch,yaw,0,"YXZ");
    mix+=(mixTarget-mix)*(options.reducedMotion?1:1-Math.exp(-dt*5));if(Math.abs(mixTarget-mix)<.001)mix=mixTarget;
    pass.setMix(mix);
    if(!paused&&!options.reducedMotion){
      people.forEach(p=>{p.group.position.z=p.z+Math.sin(elapsed*p.speed+p.start)*4;});
      rainPoints.position.y=-(elapsed*2%12);
    }
    pass.render(renderer,scene,camera);
    options.onLandmarks(landmarks.map(({id,point})=>{
      projected.copy(point).project(camera);
      return {id,x:(projected.x*.5+.5)*canvas.clientWidth,y:(-.5*projected.y+.5)*canvas.clientHeight,visible:projected.z>-1&&projected.z<1&&Math.abs(projected.x)<.84&&projected.y<.52&&projected.y>-.45&&point.distanceTo(camera.position)<42};
    }));
    if(!ready){ready=true;options.onReady();}
    if(timestamp-report>150){options.onPosition(x,z,yaw);report=timestamp;}
    if((!paused&&!options.reducedMotion)||moving||travel||keys.size||mix!==mixTarget)schedule();
  }
  function schedule(){if(running&&!disposed&&!raf)raf=requestAnimationFrame(frame);}
  resize();
  return {
    resize,
    setMix(value:number){mixTarget=clamp(value,0,1);schedule();},
    setPaused(value:boolean){paused=value;schedule();},
    setRunning(value:boolean){running=value;last=0;if(value)schedule();else{cancelAnimationFrame(raf);raf=0;clear();}},
    setInput(key:string,pressed:boolean){if(pressed){keys.add(key);travel=null;schedule();}else keys.delete(key);},
    visit(id:StreetDistrict){
      const poses={ digital:{x:2,z:23,yaw:.70,pitch:.13}, software:{x:-2,z:22,yaw:-.73,pitch:.13}, ventures:{x:-1,z:3,yaw:-.88,pitch:.19} };
      travel=poses[id];schedule();
    },
    reset(){travel={x:0,z:25,yaw:0,pitch:.14};keys.clear();schedule();},
    dispose(){
      disposed=true;cancelAnimationFrame(raf);clear();
      canvas.removeEventListener("keydown",down);window.removeEventListener("keyup",up);window.removeEventListener("blur",clear);canvas.removeEventListener("blur",clear);
      canvas.removeEventListener("pointerdown",pointerDown);canvas.removeEventListener("pointermove",pointerMove);canvas.removeEventListener("pointerup",pointerUp);canvas.removeEventListener("pointercancel",pointerUp);canvas.removeEventListener("lostpointercapture",clear);canvas.removeEventListener("webglcontextlost",contextLost);
      scene.traverse(object=>{if(object instanceof InstancedMesh)object.dispose();});scene.clear();
      geometrySet.forEach(g=>g.dispose());materialSet.forEach(m=>m.dispose());textureSet.forEach(t=>t.dispose());pass.dispose();renderer.dispose();
    },
  };
}
