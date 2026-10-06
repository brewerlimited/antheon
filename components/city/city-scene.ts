import {
  ACESFilmicToneMapping, BoxGeometry, BufferGeometry, CanvasTexture, Color,
  CylinderGeometry, DirectionalLight, EquirectangularReflectionMapping, FogExp2,
  HemisphereLight, IcosahedronGeometry, InstancedBufferAttribute, InstancedMesh,
  MathUtils, Mesh, MeshBasicMaterial, MeshStandardMaterial, Object3D,
  OrthographicCamera, PCFSoftShadowMap, PlaneGeometry, PMREMGenerator, Raycaster,
  Scene, SRGBColorSpace, Vector2, Vector3, WebGLRenderer,
} from "three";
import type { Material, Texture } from "three";
import { createCitySurroundings } from "./city-surroundings";

export type DistrictId = "core" | "digital" | "software" | "ventures";
type Options = {
  onHover: (id: DistrictId | null) => void;
  onSelect: (id: DistrictId) => void;
  onReady: () => void;
  onError: () => void;
  reducedMotion?: boolean;
};
type Style = "stone" | "metal" | "glass" | "dark" | "paving" | "roof";
type Piece = { x: number; y: number; z: number; w: number; h: number; d: number; angle: number; seed: number };
type Batch = { district: DistrictId | null; style: Style; pieces: Piece[] };
type Uniform = { value: number };
const clamp = (v: number) => MathUtils.clamp(v, 0, 1);
const ease = (a: number, b: number, v: number) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const districtIds: DistrictId[] = ["core", "digital", "software", "ventures"];

/** A self-contained architectural world. Every repeated detail is instanced;
 * the city has no network assets, control library, postprocessing or DOM labels. */
export function createCityScene(canvas: HTMLCanvasElement, options: Options) {
  const reduced = !!options.reducedMotion;
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  } catch (error) { options.onError(); throw error; }
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;
  renderer.setClearColor(0x06070b, 1);
  const scene = new Scene();
  scene.background = new Color(0x06070b);
  scene.fog = new FogExp2(0x06070b, 0.0034);
  const camera = new OrthographicCamera(-60, 60, 40, -40, 0.1, 420);
  const geometries = new Set<BufferGeometry>();
  const materials = new Set<Material>();
  const textures = new Set<Texture>();
  const targets: Mesh[] = [];
  const temp = new Object3D();
  const box = new BoxGeometry(1, 1, 1); geometries.add(box);
  const batches = new Map<string, Batch>();
  let seed = 71426;
  const random = () => { seed = (Math.imul(1664525, seed) + 1013904223) | 0; return (seed >>> 0) / 4294967296; };
  const add = (district: DistrictId | null, style: Style, x: number, y: number, z: number, w: number, h: number, d: number, angle = 0) => {
    const key = `${district ?? "world"}:${style}`;
    if (!batches.has(key)) batches.set(key, { district, style, pieces: [] });
    batches.get(key)!.pieces.push({ x, y, z, w, h, d, angle, seed: random() * 97 });
  };
  const slab = (id: DistrictId, x: number, z: number, w: number, d: number, top = 0.18) => add(id, "paving", x, top / 2, z, w, top, d);
  const greenPositions: { x: number; y: number; z: number; scale: number }[] = [];
  const tree = (x: number, z: number, y = 0.2, scale = 1) => greenPositions.push({ x, y, z, scale });

  // Broad matte ground. The different precincts grow from real pedestrian
  // podiums, with ordinary streets between them, rather than a floating board.
  const groundMaterial = new MeshStandardMaterial({ color: 0x09090d, roughness: 0.96, metalness: 0.04 });
  materials.add(groundMaterial);
  const groundGeometry = new PlaneGeometry(600, 600); geometries.add(groundGeometry);
  const ground = new Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2; ground.position.y = -0.06; ground.receiveShadow = true; scene.add(ground);

  // Existing Anthēon sources: intro-scene.ts uViolet and globals.css warm white.
  // Neutral albedo/key light keep the architecture charcoal; violet lives in illumination.
  const brandViolet = new Color("#b184ff");
  const warmWhite = new Color("#f4f2ed");
  const lavender = warmWhite.clone().lerp(brandViolet, 0.68);
  const sky = new HemisphereLight(warmWhite.clone().lerp(brandViolet, 0.18), 0x17161a, 1.1); scene.add(sky);
  const sun = new DirectionalLight(warmWhite, 3.2);
  sun.position.set(-34, 74, 22); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -63; sun.shadow.camera.right = 63;
  sun.shadow.camera.top = 64; sun.shadow.camera.bottom = -64;
  sun.shadow.camera.near = 5; sun.shadow.camera.far = 170;
  sun.shadow.normalBias = 0.045; sun.shadow.bias = -0.00012;
  sun.shadow.radius = 3; scene.add(sun);
  const rim = new DirectionalLight(brandViolet, 2.1); rim.position.set(32, 38, -45); scene.add(rim);
  const fill = new DirectionalLight(warmWhite, 0.25); fill.position.set(18, 14, 36); scene.add(fill);

  // A tiny locally drawn studio environment gives glazing reflected sky and
  // elongated highlights, without a remote HDRI or a large environment asset.
  const environmentCanvas = document.createElement("canvas");
  environmentCanvas.width = 512; environmentCanvas.height = 256;
  const ctx = environmentCanvas.getContext("2d");
  let environmentTarget: ReturnType<PMREMGenerator["fromEquirectangular"]> | null = null;
  if (ctx) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, "#59585b"); gradient.addColorStop(0.42, "#353437");
    gradient.addColorStop(0.55, "#1c1b1e"); gradient.addColorStop(1, "#0d0c0f");
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, 512, 256);
    ctx.fillStyle = "#c4becb"; ctx.fillRect(58, 40, 31, 110);
    ctx.fillStyle = "#8b858f"; ctx.fillRect(322, 24, 62, 116);
    const sourceTexture = new CanvasTexture(environmentCanvas);
    sourceTexture.mapping = EquirectangularReflectionMapping; sourceTexture.colorSpace = SRGBColorSpace;
    const pmrem = new PMREMGenerator(renderer);
    environmentTarget = pmrem.fromEquirectangular(sourceTexture);
    scene.environment = environmentTarget.texture; scene.environmentIntensity = 0.65;
    sourceTexture.dispose(); pmrem.dispose();
  }

  const activation = { value: 0 };
  const highlights = Object.fromEntries(districtIds.map(id => [id, { value: 0 }])) as Record<DistrictId, Uniform>;
  const tintedMaterials: { material: MeshStandardMaterial; base: Color; id: DistrictId }[] = [];
  const palette: Record<Style, number> = {
    stone: 0x454447, metal: 0x656368, glass: 0x29282d,
    dark: 0x222125, paving: 0x222125, roof: 0x37353b,
  };
  function buildingMaterial(style: Style, district: DistrictId | null) {
    const mat = new MeshStandardMaterial({
      color: palette[style], roughness: style === "glass" ? 0.27 : style === "metal" ? 0.38 : 0.79,
      metalness: style === "glass" ? 0.61 : style === "metal" ? 0.64 : 0.12,
      envMapIntensity: style === "glass" ? 0.8 : 0.24,
    });
    materials.add(mat);
    if (district) tintedMaterials.push({ material: mat, base: mat.color.clone(), id: district });
    if (style === "glass") {
      const highlight = district ? highlights[district] : { value: 0 };
      mat.onBeforeCompile = shader => {
        shader.uniforms.cityActivation = activation;
        shader.uniforms.cityHighlight = highlight;
        shader.uniforms.cityWindowLavender = { value: lavender };
        shader.uniforms.cityWarmWhite = { value: warmWhite };
        shader.vertexShader = shader.vertexShader.replace("#include <common>", `#include <common>
          attribute vec3 citySize; attribute float citySeed;
          varying vec2 vCityUv; varying vec2 vCitySize;
          varying float vCitySide; varying float vCitySeed;`)
          .replace("#include <begin_vertex>", `#include <begin_vertex>
          vCityUv = uv; vCitySize = vec2(abs(normal.z) > 0.5 ? citySize.x : citySize.z, citySize.y);
          vCitySide = 1.0 - abs(normal.y); vCitySeed = citySeed;`);
        shader.fragmentShader = shader.fragmentShader.replace("#include <common>", `#include <common>
          uniform float cityActivation; uniform float cityHighlight;
          uniform vec3 cityWindowLavender; uniform vec3 cityWarmWhite;
          varying vec2 vCityUv; varying vec2 vCitySize;
          varying float vCitySide; varying float vCitySeed;
          float cityHash(vec2 p) { return fract(sin(dot(p,vec2(127.1,311.7)) + vCitySeed) * 43758.5453); }`)
          .replace("#include <color_fragment>", `#include <color_fragment>
          vec2 cityGrid = vCityUv * max(vec2(1.0), floor(vCitySize / vec2(0.62,0.76)));
          vec2 cityCell = fract(cityGrid); vec2 cityId = floor(cityGrid);
          vec2 aa = fwidth(cityGrid) * 0.7;
          float pane = smoothstep(0.1-aa.x,0.1+aa.x,cityCell.x) * (1.0-smoothstep(0.85-aa.x,0.85+aa.x,cityCell.x));
          pane *= smoothstep(0.19-aa.y,0.19+aa.y,cityCell.y) * (1.0-smoothstep(0.83-aa.y,0.83+aa.y,cityCell.y));
          pane *= vCitySide;
          diffuseColor.rgb *= mix(0.45,1.0,pane);
          float occupancy = cityHash(cityId);
          float lit = smoothstep(occupancy * 1.25, occupancy * 1.25 + 0.11, cityActivation) * step(0.51,occupancy);
          vec3 officeLight = mix(cityWindowLavender,cityWarmWhite,step(0.8,cityHash(cityId+31.0)));
          officeLight *= mix(0.78,1.35,cityHash(cityId+19.0));
          totalEmissiveRadiance += pane * officeLight * (lit * (0.18 + cityHash(cityId+7.0)*0.48) + cityHighlight*0.035*cityActivation);
          `);
      };
      mat.customProgramCacheKey = () => "antheon-city-facades-v2-lavender";
    }
    return mat;
  }

  // Reusable construction vocabulary: inhabited glazing behind separate
  // structural piers, substantial roof caps, actual setbacks and plant decks.
  function office(id: DistrictId, x: number, z: number, w: number, d: number, h: number, opts: { y?: number; fins?: number; pale?: boolean; cap?: boolean } = {}) {
    const y = opts.y ?? 0.35;
    add(id, "glass", x, y + h / 2, z, w, h, d);
    const structure: Style = opts.pale ? "stone" : "dark";
    const step = opts.fins ?? 1.4;
    for (let a = -w / 2; a <= w / 2 + 0.01; a += step) {
      add(id, structure, x + a, y + h / 2, z + d / 2 + 0.035, 0.12, h + 0.12, 0.14);
      add(id, structure, x + a, y + h / 2, z - d / 2 - 0.035, 0.12, h + 0.12, 0.14);
    }
    for (let a = -d / 2; a <= d / 2 + 0.01; a += step) {
      add(id, structure, x - w / 2 - 0.035, y + h / 2, z + a, 0.14, h + 0.12, 0.12);
      add(id, structure, x + w / 2 + 0.035, y + h / 2, z + a, 0.14, h + 0.12, 0.12);
    }
    for (let level = 1.5; level < h; level += 3.0) add(id, structure, x, y + level, z, w + 0.08, 0.085, d + 0.08);
    if (opts.cap !== false) {
      add(id, "metal", x, y + h + 0.06, z, w + 0.14, 0.12, d + 0.14);
      const plantSide = random() > 0.5 ? 1 : -1;
      add(id, "dark", x + w * 0.19 * plantSide, y + h + 0.26, z - d * 0.13, w * 0.29, 0.34, d * 0.34);
      for (let a = 0; a < 2; a++) add(id, "roof", x - w * 0.24 * plantSide, y + h + 0.22, z - d * 0.19 + a * d * 0.3, w * 0.15, 0.24, d * 0.16);
    }
  }
  function terrace(id: DistrictId, x: number, z: number, w: number, d: number, levels: number, h: number) {
    for (let i = 0; i < levels; i++) {
      const stepW = w - i * 1.5, stepD = d - i * 1.05;
      const yy = 0.35 + i * h;
      office(id, x + i * 0.38, z - i * 0.32, stepW, stepD, h - 0.25, { y: yy, fins: 1.6, pale: true, cap: false });
      add(id, "stone", x + i * 0.38, yy + h - 0.12, z - i * 0.32, stepW + 0.6, 0.25, stepD + 0.6);
      if (i < levels - 1) {
        for (let a = -1; a <= 1; a++) tree(x + a * stepW * 0.25, z + stepD * 0.43 - i * 0.32, yy + h, 0.55);
      }
    }
  }

  // Anthēon: a pair of inhabited, tapering blades with a skyroom across the
  // narrow canyon. The off-centre crown gives the skyline its signature.
  slab("core", 0, -5, 13.6, 18);
  add("core", "stone", 0, 0.65, -5, 12.6, 1.1, 10.2);
  office("core", -2.55, -6.3, 4.35, 6.5, 31.5, { y: 1.2, fins: 0.86, pale: true, cap: false });
  office("core", 2.5, -6.3, 3.75, 6.5, 26.4, { y: 1.2, fins: 0.75, pale: true, cap: false });
  office("core", -2.55, -7.1, 3.25, 4.9, 6.0, { y: 32.7, fins: 0.8, pale: true, cap: false });
  add("core", "metal", -2.55, 38.8, -7.1, 3.5, 0.24, 5.15);
  add("core", "stone", 2.5, 28.1, -6.3, 4.1, 0.9, 6.85);
  office("core", 0.05, -7.5, 2.7, 3.75, 2.2, { y: 24.8, fins: 0.9, cap: false });
  add("core", "metal", 0.05, 27.12, -7.5, 2.9, 0.16, 4.05);
  // A low transparent entrance and sheltered colonnade opens to the plaza.
  office("core", 0, -0.4, 9.6, 3.0, 2.6, { y: 0.3, fins: 1.6, pale: true, cap: false });
  add("core", "stone", 0, 3.02, -0.4, 11.3, 0.3, 4.1);
  for (let x = -5; x <= 5; x += 2.5) add("core", "stone", x, 1.48, 1.35, 0.2, 2.8, 0.2);
  for (const x of [-5.8, 5.8]) for (const z of [-11, -6, -1, 3]) tree(x, z, 0.2, 0.78);
  // Reflecting water is a dark horizontal surface, not a luminous sci-fi ring.
  const waterMaterial = new MeshStandardMaterial({ color: 0x24212e, metalness: 0.8, roughness: 0.2 }); materials.add(waterMaterial);
  const water = new Mesh(box, waterMaterial); water.scale.set(7, 0.07, 2.4); water.position.set(0, 0.23, 3); scene.add(water);
  for (const x of [-5.2, 5.2]) { add("core", "stone", x, 0.42, 3, 1.6, 0.4, 0.45); }

  // Digital: long elevated galleries, generous setbacks and an expressive
  // offset media pavilion. Terraces bring the tall core down to human scale.
  slab("digital", -18.8, 7.8, 19.8, 19.1);
  terrace("digital", -20.4, 5.8, 12.4, 8.4, 4, 2.8);
  terrace("digital", -15.2, 16.3, 9.1, 5.6, 3, 2.4);
  office("digital", -28.1, 10.8, 3.7, 7.8, 14.3, { fins: 0.72, pale: true });
  add("digital", "metal", -22.7, 5.8, 13.1, 7.5, 0.22, 3.25);
  office("digital", -24.2, 13.1, 4.2, 2.7, 3.8, { y: 2.0, fins: 0.84, cap: false });
  for (const x of [-28, -24, -20, -16, -12]) tree(x, -0.6, 0.2, 0.76);
  for (const z of [3.5, 7, 11, 15]) tree(-7.65, z, 0.2, 0.75);

  const mediaCanvas=document.createElement("canvas");mediaCanvas.width=256;mediaCanvas.height=96;
  const mediaContext=mediaCanvas.getContext("2d");
  let mediaMaterial:MeshBasicMaterial|null=null;
  if(mediaContext){
    mediaContext.fillStyle="#1b1724";mediaContext.fillRect(0,0,256,96);
    for(let i=0;i<8;i++){
      mediaContext.fillStyle=["#77658e","#b184ff","#3c344b","#b4a7c4"][i%4];
      mediaContext.fillRect(12+i*30,12+(i%3)*13,19,65-(i%3)*13);
    }
    const texture=new CanvasTexture(mediaCanvas);texture.colorSpace=SRGBColorSpace;textures.add(texture);
    mediaMaterial=new MeshBasicMaterial({map:texture,transparent:true,opacity:0.1,toneMapped:false});materials.add(mediaMaterial);
    const geometry=new PlaneGeometry(5.8,1.8);geometries.add(geometry);
    const panel=new Mesh(geometry,mediaMaterial);panel.position.set(-20.4,1.5,10.08);panel.userData.district="digital";scene.add(panel);targets.push(panel);
  }

  // Software: ordered pairs of narrow, deeply ribbed towers above a shared
  // infrastructure hall. A skybridge is grounded in useful building mass.
  slab("software", 18.2, -14.5, 17.6, 22.4);
  office("software", 13.0, -11.0, 5.2, 6.5, 23.7, { fins: 1.04 });
  office("software", 22.0, -17.8, 5.5, 6.1, 28.2, { fins: 1.1, pale: true });
  office("software", 13.0, -21.1, 5.2, 5.2, 15.9, { fins: 1.04 });
  office("software", 22.0, -7.1, 5.5, 4.2, 13.6, { fins: 1.1 });
  office("software", 18, -14.1, 13.8, 2.6, 2.4, { fins: 1.15, pale: true });
  office("software", 17.5, -17.8, 3.5, 2.0, 1.4, { y: 14.4, fins: 1.1, cap: false });
  for (const z of [-24, -20, -16, -12, -8, -4]) tree(28.4, z, 0.2, 0.9);
  for (const x of [11, 15, 19, 23, 27]) tree(x, -27, 0.2, 0.75);

  // Ventures: a more open campus of young buildings and one exposed structure
  // under construction. No cranes or animated props dominate the city.
  slab("ventures", 15.5, 15.5, 20.2, 17.0);
  terrace("ventures", 11.4, 10.2, 7.2, 5.3, 3, 2.55);
  office("ventures", 21.8, 9.9, 5.6, 6.2, 11.1, { fins: 1.4, pale: true });
  office("ventures", 13.6, 20.2, 8.4, 4.3, 4.5, { fins: 1.4, pale: true });
  office("ventures", 24.5, 19.3, 4.0, 4.5, 7.4, { fins: 1.0 });
  // An exposed stepped structural frame: floor plates, piers, a finished base.
  const buildX = 3.6, buildZ = 17.3;
  office("ventures", buildX, buildZ, 4.3, 4.3, 3.7, { fins: 1.4, pale: true });
  for (let level = 4.4; level <= 12.6; level += 2.05) {
    add("ventures", "roof", buildX, level, buildZ, 4.6, 0.18, 4.6);
    if (level < 12) for (const x of [-1.85, 1.85]) for (const z of [-1.85, 1.85]) add("ventures", "metal", buildX + x, level + 1.05, buildZ + z, 0.17, 2.1, 0.17);
  }
  for (const x of [7, 10.5, 14, 17.5, 21, 24.5]) tree(x, 25, 0.2, 0.86);
  for (const z of [7, 11, 15, 19, 23]) tree(29.4, z, 0.2, 0.9);
  for (const z of [11, 14.5, 18, 21.5]) tree(17.4, z, 0.2, 0.65);

  // A deliberately quiet secondary city supplies scale and a believable skyline.
  const context: [number, number, number, number, number][] = [
    [-25,-13,6,5,8],[-16,-18,7,5,13],[-27,-22,4,4,11],[-5,-22,5,5,18],
    [3,-26,4,6,12],[-5,13,4,4,5],[-4,22,4,4,6],
    [37,-14,4,5,8],[37.3,-5,5,4,5],[36.5,9,4,4,4],
  ];
  for (const [x,z,w,d,h] of context) {
    const id: DistrictId = x < -8 ? "digital" : z < -10 ? "software" : "ventures";
    slab(id, x, z, w + 2, d + 2);
    office(id, x, z, w, d, h, { fins: 1.4, pale: h < 10 });
  }

  // The digital precinct ends in a civic media pavilion: a circular glass
  // drum, delicate radial structure and an offset roof lantern.
  const pavilionX=-26,pavilionZ=21.5;
  for(const [radius,y,h,style] of [[4.7,0.19,0.24,"paving"],[4.3,0.4,0.2,"stone"],[4.05,2.05,3.1,"dark"],[4.35,3.68,0.22,"metal"],[2.5,4.18,0.75,"glass"],[2.7,4.61,0.12,"metal"]] as [number,number,number,Style][]){
    const geo=new CylinderGeometry(radius,radius,h,48);geometries.add(geo);
    const mat=new MeshStandardMaterial({color:palette[style],metalness:style==="glass"?0.62:0.25,roughness:style==="glass"?0.23:0.7,envMapIntensity:0.7});materials.add(mat);
    tintedMaterials.push({material:mat,base:mat.color.clone(),id:"digital"});
    const mesh=new Mesh(geo,mat);mesh.position.set(pavilionX,y,pavilionZ);mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData.district="digital";targets.push(mesh);scene.add(mesh);
  }
  for(let i=0;i<36;i++){const theta=i/36*Math.PI*2;add("digital","stone",pavilionX+Math.cos(theta)*4.08,2.04,pavilionZ+Math.sin(theta)*4.08,0.09,3.25,0.16,Math.PI/2-theta);}

  const roads: { x: number; z: number; w: number; d: number; alongX: boolean }[] = [
    {x:13.2,z:5.45,w:46,d:2.5,alongX:true},
    {x:-21,z:-3.1,w:26,d:2.4,alongX:true},
    {x:8.05,z:-11,w:2.4,d:32,alongX:false},
    {x:-9.5,z:-11,w:2.5,d:34,alongX:false},
    {x:0,z:-29,w:65,d:2.7,alongX:true},
    {x:-3,z:27.7,w:64,d:2.5,alongX:true},
    {x:31.5,z:0,w:2.5,d:55,alongX:false},
    {x:-32.1,z:9,w:2.5,d:36,alongX:false},
  ];
  const roadMaterial = new MeshStandardMaterial({ color: 0x111015, roughness: 0.91 }); materials.add(roadMaterial);
  const roadMesh = new InstancedMesh(box, roadMaterial, roads.length); scene.add(roadMesh);
  roads.forEach((r,i) => { temp.position.set(r.x,0.01,r.z); temp.scale.set(r.w,0.08,r.d); temp.updateMatrix(); roadMesh.setMatrixAt(i,temp.matrix); });
  const routePieces: Piece[] = [];
  roads.forEach(r => {
    const length = r.alongX ? r.w : r.d;
    for (let p = -length / 2 + 1; p < length / 2; p += 3) {
      add(null,"roof",r.x+(r.alongX?p:0),0.067,r.z+(r.alongX?0:p),r.alongX?0.85:0.065,0.015,r.alongX?0.065:0.85);
    }
    // A single embedded route in selected avenues, with generous dark gaps.
    if (r.z === 5.45 || r.x === 8.05 || r.z === -29) {
      for (let p = -length/2 + 0.8; p < length/2; p += 5.4) {
        routePieces.push({x:r.x+(r.alongX?p:0.93),y:0.072,z:r.z+(r.alongX?0.93:p),w:r.alongX?3.9:0.045,h:0.025,d:r.alongX?0.045:3.9,angle:0,seed:0});
      }
    }
  });
  const routeMaterial = new MeshBasicMaterial({color:brandViolet,transparent:true,opacity:0.06,toneMapped:false}); materials.add(routeMaterial);
  const routes = new InstancedMesh(box,routeMaterial,routePieces.length); scene.add(routes);
  routePieces.forEach((p,i)=>{temp.position.set(p.x,p.y,p.z);temp.scale.set(p.w,p.h,p.d);temp.rotation.set(0,0,0);temp.updateMatrix();routes.setMatrixAt(i,temp.matrix);});

  // Small human details read as landscape, never a low-poly toy forest.
  const trunkGeometry = new CylinderGeometry(0.07,0.1,1,5); geometries.add(trunkGeometry);
  const leafGeometry = new IcosahedronGeometry(1,1); geometries.add(leafGeometry);
  const trunkMaterial = new MeshStandardMaterial({color:0x4b443a,roughness:1}); materials.add(trunkMaterial);
  const leafMaterial = new MeshStandardMaterial({color:0x33483d,roughness:0.97,flatShading:true}); materials.add(leafMaterial);
  const trunks = new InstancedMesh(trunkGeometry,trunkMaterial,greenPositions.length);
  const leaves = new InstancedMesh(leafGeometry,leafMaterial,greenPositions.length*2);
  greenPositions.forEach((p,i)=>{
    temp.position.set(p.x,p.y+p.scale*0.6,p.z);temp.scale.set(p.scale,p.scale*1.2,p.scale);temp.rotation.set(0,0,0);temp.updateMatrix();trunks.setMatrixAt(i,temp.matrix);
    for(let j=0;j<2;j++){temp.position.set(p.x+(j?0.2:-0.15)*p.scale,p.y+(1.15+j*0.32)*p.scale,p.z);temp.scale.set(0.5*p.scale,0.75*p.scale,0.5*p.scale);temp.rotation.y=random()*Math.PI;temp.updateMatrix();leaves.setMatrixAt(i*2+j,temp.matrix);leaves.setColorAt(i*2+j,new Color().setHSL(0.29+random()*0.05,0.12,0.14+random()*0.055));}
  });
  leaves.castShadow=true;leaves.receiveShadow=true;trunks.castShadow=true;scene.add(trunks,leaves);

  // Merge each district/material vocabulary into one instanced draw. Attribute
  // dimensions let one facade shader place appropriately scaled windows.
  for (const batch of batches.values()) {
    const geo = box.clone(); geometries.add(geo);
    const mesh = new InstancedMesh(geo,buildingMaterial(batch.style,batch.district),batch.pieces.length);
    const dimensions = new Float32Array(batch.pieces.length*3), seeds = new Float32Array(batch.pieces.length);
    batch.pieces.forEach((p,i)=>{
      temp.position.set(p.x,p.y,p.z);temp.rotation.set(0,p.angle,0);temp.scale.set(p.w,p.h,p.d);temp.updateMatrix();mesh.setMatrixAt(i,temp.matrix);
      dimensions.set([p.w,p.h,p.d],i*3);seeds[i]=p.seed;
    });
    geo.setAttribute("citySize",new InstancedBufferAttribute(dimensions,3));
    geo.setAttribute("citySeed",new InstancedBufferAttribute(seeds,1));
    mesh.castShadow=batch.style!=="paving";mesh.receiveShadow=true;
    mesh.userData.district=batch.district;
    if(batch.district)targets.push(mesh);
    scene.add(mesh);
  }

  // Traffic is a handful of real small cars. Their roof light is quiet; motion
  // follows the street axes and only begins as the city becomes inhabited.
  const cars = Array.from({length:24},(_,i)=>({road:roads[i%roads.length],phase:random(),speed:0.018+random()*0.012,direction:i%2?1:-1}));
  const carMaterial = new MeshStandardMaterial({color:0x77717f,roughness:0.4,metalness:0.55});materials.add(carMaterial);
  const carMesh = new InstancedMesh(box,carMaterial,cars.length);scene.add(carMesh);
  const headMaterial = new MeshBasicMaterial({color:0xf5e5ca,transparent:true,opacity:0,toneMapped:false});materials.add(headMaterial);
  const headMesh = new InstancedMesh(box,headMaterial,cars.length);scene.add(headMesh);
  function updateCars(time:number,active:number){
    cars.forEach((car,i)=>{
      const road=car.road,length=road.alongX?road.w:road.d;
      const t=((car.phase+time*car.speed*0.15*car.direction)%1+1)%1;
      const along=(t-0.5)*length;
      const x=road.x+(road.alongX?along:0.53*car.direction);
      const z=road.z+(road.alongX?0.53*car.direction:along);
      temp.position.set(x,0.15,z);temp.rotation.set(0,road.alongX?Math.PI/2:0,0);temp.scale.set(0.22,0.15,0.55);temp.updateMatrix();carMesh.setMatrixAt(i,temp.matrix);
      temp.position.set(x+(road.alongX?car.direction*0.27:0),0.145,z+(road.alongX?0:car.direction*0.27));temp.scale.set(0.16,0.055,0.075);temp.updateMatrix();headMesh.setMatrixAt(i,temp.matrix);
    });
    carMesh.instanceMatrix.needsUpdate=true;headMesh.instanceMatrix.needsUpdate=true;
    carMesh.visible=active>0.12;headMesh.visible=active>0.12;headMaterial.opacity=active*0.85;
  }
  updateCars(0,0);

  // Added after the original seeded scene: no change to buildings, windows or traffic.
  const surroundings = createCitySurroundings(scene, brandViolet);

  const raycaster = new Raycaster();
  const pointer = new Vector2(10,10);
  const pointerTarget = new Vector2();
  const pointerCurrent = new Vector2();
  const lastRayPointer = new Vector2(99,99);
  let lastRayProgress = -1, lastRayTime = -100;
  const cameraTarget = new Vector3();
  let hovered:DistrictId|null=null, selected:DistrictId|null=null;
  let progressTarget=0,progress=0,raf=0,lastTime=0,time=0;
  let running=true,disposed=false,ready=false,pointerInside=false,dirty=true;
  let width=1,height=1,dpr=1,slowFrames=0,frameCount=0,qualitySampleTime=0;
  const onHover = (id:DistrictId|null) => {if(id!==hovered){hovered=id;options.onHover(id);dirty=true;}};
  const move = (event:PointerEvent) => {
    if(event.pointerType!=="mouse")return;
    const rect=canvas.getBoundingClientRect();
    pointer.set((event.clientX-rect.left)/rect.width*2-1,-((event.clientY-rect.top)/rect.height)*2+1);
    pointerTarget.set(pointer.x,pointer.y);pointerInside=true;dirty=true;schedule();
  };
  const leave=()=>{pointerInside=false;pointerTarget.set(0,0);lastRayPointer.set(99,99);onHover(null);dirty=true;schedule();};
  const click=()=>{if(hovered&&progress>0.42)options.onSelect(hovered);};
  const contextLost=(event:Event)=>{event.preventDefault();running=false;cancelAnimationFrame(raf);raf=0;options.onError();};
  canvas.addEventListener("pointermove",move,{passive:true});
  canvas.addEventListener("pointerleave",leave);
  canvas.addEventListener("click",click);
  canvas.addEventListener("webglcontextlost",contextLost);
  function resize(){
    if(disposed)return;
    const rect=canvas.getBoundingClientRect();width=Math.max(1,rect.width);height=Math.max(1,rect.height);
    dpr=Math.min(window.devicePixelRatio||1,width>1800?1.35:1.65);
    renderer.setPixelRatio(dpr);renderer.setSize(width,height,false);lastRayPointer.set(99,99);dirty=true;schedule();
  }
  function compose(){
    const t=ease(0,0.66,progress);
    const viewHeight=MathUtils.lerp(96,82,t);
    const aspect=width/height;
    const shift=viewHeight*aspect*(aspect>1.35?0.155:0.055);
    camera.left=-viewHeight*aspect/2-shift;camera.right=viewHeight*aspect/2-shift;
    camera.top=viewHeight/2;camera.bottom=-viewHeight/2;
    camera.position.set(MathUtils.lerp(22,68,t),MathUtils.lerp(150,63,t),MathUtils.lerp(30,87,t));
    cameraTarget.set(0,MathUtils.lerp(1.5,9.2,t),0);
    if(!reduced){camera.position.x+=pointerCurrent.x*0.9;camera.position.z-=pointerCurrent.x*0.6;camera.position.y+=pointerCurrent.y*0.5;}
    camera.lookAt(cameraTarget);camera.updateProjectionMatrix();
    const light=ease(0.025,0.58,progress);
    activation.value=light;
    sun.intensity=0.65+light*1.3;sky.intensity=0.24+light*0.4;rim.intensity=0.32+light*0.85;
    surroundings.setActivation(light);
    renderer.toneMappingExposure=0.77+light*0.27;
    routeMaterial.opacity=0.04+light*0.64;
    if(mediaMaterial)mediaMaterial.opacity=0.08+light*0.8;
    for(const id of districtIds){const target=id===(selected??hovered)?1:0;highlights[id].value+= (target-highlights[id].value)*0.1;}
    for(const {material,base,id} of tintedMaterials)material.color.copy(base).lerp(highlightColor,highlights[id].value*0.08);
  }
  const highlightColor=lavender.clone();
  function render(timestamp:number){
    raf=0;if(disposed||!running)return;
    const rawDelta=lastTime?(timestamp-lastTime)/1000:1/60;
    const delta=Math.min(rawDelta,0.08);lastTime=timestamp;
    time+=delta;
    progress+= (progressTarget-progress)*(reduced?1:1-Math.exp(-delta*8));
    if(Math.abs(progressTarget-progress)<0.0001)progress=progressTarget;
    pointerCurrent.lerp(pointerTarget,reduced?1:1-Math.exp(-delta*3.5));
    compose();
    if(pointerInside&&progress>0.42){
      const changed=pointer.distanceToSquared(lastRayPointer)>0.000001||Math.abs(progress-lastRayProgress)>0.002;
      if(changed&&timestamp-lastRayTime>70){
        raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects(targets,false)[0];
        onHover((hit?.object.userData.district as DistrictId|undefined)??null);
        lastRayPointer.copy(pointer);lastRayProgress=progress;lastRayTime=timestamp;
      }
    } else if(hovered)onHover(null);
    updateCars(reduced?0:time,ease(0.15,0.56,progress));
    renderer.render(scene,camera);dirty=false;
    if(!ready){ready=true;options.onReady();}
    // Sustained slow rendering lowers resolution once, without a quality pop
    // caused by a single long task while assets elsewhere on the page load.
    frameCount++;
    if(rawDelta>0.034&&rawDelta<0.25)slowFrames++;
    qualitySampleTime+=Math.min(rawDelta,0.25);
    if(qualitySampleTime>4){
      if(slowFrames/Math.max(1,frameCount)>0.35&&dpr>1.2){dpr=1.2;renderer.setPixelRatio(dpr);renderer.setSize(width,height,false);}
      qualitySampleTime=0;frameCount=0;slowFrames=0;
    }
    const settling=Math.abs(progressTarget-progress)>0.0001||districtIds.some(id=>Math.abs(highlights[id].value-(id===(selected??hovered)?1:0))>0.002);
    if(!reduced||settling||dirty)schedule();
  }
  function schedule(){if(!disposed&&running&&!raf)raf=requestAnimationFrame(render);}
  resize();
  return {
    setProgress(p:number){progressTarget=clamp(Number.isFinite(p)?p:0);dirty=true;schedule();},
    setActiveDistrict(id:DistrictId|null){selected=id;dirty=true;schedule();},
    setRunning(value:boolean){if(disposed)return;running=value;lastTime=0;if(value){dirty=true;schedule();}else{cancelAnimationFrame(raf);raf=0;}},
    resize,
    capture(){if(disposed)return "";compose();renderer.render(scene,camera);return canvas.toDataURL("image/png");},
    getStats(){return {drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures,pixelRatio:dpr,progress,instances:[...batches.values()].reduce((n,b)=>n+b.pieces.length,0),running};},
    dispose(){
      if(disposed)return;disposed=true;running=false;cancelAnimationFrame(raf);
      canvas.removeEventListener("pointermove",move);canvas.removeEventListener("pointerleave",leave);
      canvas.removeEventListener("click",click);canvas.removeEventListener("webglcontextlost",contextLost);
      onHover(null);scene.traverse(object=>{if(object instanceof InstancedMesh)object.dispose();});scene.clear();geometries.forEach(geometry=>geometry.dispose());materials.forEach(material=>material.dispose());textures.forEach(texture=>texture.dispose());
      surroundings.dispose();environmentTarget?.dispose();sun.shadow.dispose();renderer.dispose();
    },
  };
}
