import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  DoubleSide,
  EdgesGeometry,
  Float32BufferAttribute,
  Group,
  LineSegments,
  Mesh,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  Vector2,
  WebGLRenderer,
} from "three";
import type { NavigationBrand } from "./navigation-brand";

export interface IntroScene {
  render(time: number, exitProgress: number, pointer: { x: number; y: number }): void;
  resize(): void;
  updateBrand(brand: NavigationBrand): void;
  dispose(): void;
}

type IntroOptions = {
  brand: NavigationBrand;
  compact: boolean;
  palette: { ice: string; blue: string; background: string };
};
type Sample = { x: number; y: number };
const clamp = (value: number) => Math.min(1, Math.max(0, value));
const smooth = (from: number, to: number, value: number) => {
  const p = clamp((value - from) / (to - from));
  return p * p * (3 - 2 * p);
};
function randomSequence(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let n = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    n = (n + Math.imul(n ^ (n >>> 7), 61 | n)) ^ n;
    return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
  };
}

// The world and the identity use independent cameras. The environment can travel
// through a hundred units of real depth while the sampled navigation mark locks
// to exactly the same CSS pixel bounds as the live DOM handoff.
const field = /* glsl */ `
  uniform float uTime;
  uniform float uExit;
  uniform float uWordWidth;
  uniform vec2 uView;
  uniform vec2 uPointer;
  uniform float uCenterY;
  uniform float uPixelRatio;
  attribute vec3 aStart;
  attribute vec3 aSeed;
  attribute vec3 aTarget;
  varying float vAlpha;
  varying float vTint;
  float sat(float x) { return clamp(x, 0.0, 1.0); }
  float phase(float a, float b) { return smoothstep(a, b, uTime); }
  float chaos() { return sin(3.14159265 * sat((uTime - 1.79) / 0.66)); }
  float disturbance() { return sin(3.14159265 * sat((uTime - 3.245) / 0.185)); }
  float formation() {
    float f = phase(2.28, 3.245) * 0.99985;
    f -= disturbance() * 0.0011;
    return mix(f, 1.0, phase(3.405, 3.455));
  }
  vec3 destination() { return vec3(aTarget.xy * uWordWidth + vec2(0.0, uCenterY), 0.0); }
  vec3 fieldPosition() {
    float f = formation();
    float c = chaos();
    float depth = max(0.32, (13.0 - aStart.z) / 13.0);
    vec3 p = vec3(aStart.xy * uView * depth, aStart.z);
    p.x += sin(aSeed.x * 22.0 + uTime * 0.4) * (0.12 + c * 0.32);
    p.y += cos(aSeed.y * 18.0 + uTime * 0.5) * 0.2;
    p.z += phase(0.68, 2.36) * (4.0 + aSeed.z * 14.0);
    p.xy += vec2(sin(aSeed.z * 9.0), cos(aSeed.x * 12.0)) * c * 0.45;
    p.xy += uPointer * vec2(0.12, 0.075) * smoothstep(-20.0, 10.0, p.z);
    // Curved, staggered transfer paths collapse into actual glyph samples.
    float arc = sin(f * 3.14159265);
    p = mix(p, destination(), f);
    p.xy += vec2(cos(aSeed.x * 6.283), sin(aSeed.x * 6.283)) * arc * (0.5 + aSeed.y * 2.5);
    p.z += arc * sin(aSeed.y * 9.0) * 7.0;
    float fracture = disturbance() * (1.0 - phase(3.405, 3.455));
    float section = floor((aTarget.x + 0.5) * 14.0);
    p.x += sin(section * 12.9) * fracture * uWordWidth * 0.011;
    p.y += cos(section * 7.3) * fracture * uWordWidth * 0.007;
    p.z += sin(section * 9.1) * fracture * 0.25;
    return p;
  }
  float appearance() {
    float birth = smoothstep(0.32 + aSeed.x * 0.35, 0.7 + aSeed.x * 0.56, uTime);
    return birth * (0.3 + aSeed.z * 0.7) * (1.0 - phase(3.425, 3.49));
  }
`;
const pointVertex = field + /* glsl */ `
  attribute float aSize;
  void main() {
    vec4 mv = modelViewMatrix * vec4(fieldPosition(), 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uPixelRatio * aSize * clamp(13.0 / max(1.3, -mv.z), 0.5, 4.2);
    vAlpha = appearance() * mix(1.0, 1.45, phase(2.8, 3.23)) * smoothstep(0.15, 1.2, -mv.z);
    vTint = aSeed.z;
  }
`;
const pointFragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uIce;
  uniform vec3 uElectric;
  uniform vec3 uViolet;
  varying float vAlpha;
  varying float vTint;
  void main() {
    float edge = 1.0 - smoothstep(0.18, 0.5, length(gl_PointCoord - 0.5));
    vec3 color = mix(uIce, vec3(0.98), 0.62);
    color = mix(color, uElectric, step(0.64, vTint) * 0.84);
    color = mix(color, uViolet, step(0.84, vTint) * 0.86);
    color = mix(color, mix(uIce, vec3(0.98), 0.62), smoothstep(3.08, 3.43, uTime));
    gl_FragColor = vec4(color, vAlpha * edge);
  }
`;
const transferVertex = field + /* glsl */ `
  attribute float aTail;
  attribute float aKind;
  void main() {
    vec3 p = fieldPosition();
    float f = formation();
    p.z -= aTail * aKind * (0.28 + chaos() * 4.6 + sin(f * 3.14159265) * 2.8);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float guides = phase(2.1, 2.65) * (1.0 - phase(3.40, 3.46));
    float flow = (0.06 + chaos() * 0.34 + sin(f * 3.14159265) * 0.3);
    vAlpha = appearance() * mix(guides * 0.64, flow, aKind) * (1.0 - aTail * aKind * 0.85);
    vAlpha *= smoothstep(0.15, 1.2, -mv.z);
    vTint = aSeed.z;
  }
`;
const lineFragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uIce;
  uniform vec3 uElectric;
  uniform vec3 uViolet;
  varying float vAlpha;
  varying float vTint;
  void main() {
    vec3 color = mix(uIce, uElectric, step(0.45, vTint) * 0.86);
    color = mix(color, uViolet, step(0.75, vTint) * 0.90);
    color = mix(color, uIce, smoothstep(3.08, 3.43, uTime) * 0.65);
    gl_FragColor = vec4(color, vAlpha);
  }
`;
const worldCommon = /* glsl */ `
  uniform float uTime;
  uniform float uExit;
  uniform float uWorld;
  uniform float uChaos;
  uniform float uQuiet;
  uniform vec3 uIce;
  uniform vec3 uBlue;
  uniform vec3 uElectric;
  uniform vec3 uViolet;
  vec3 reflectedAccent(vec3 p) {
    float hue = 0.5 + 0.5 * sin(p.x * 0.12 + p.z * 0.055 - uTime * 0.42);
    return mix(uElectric, uViolet, smoothstep(0.22, 0.78, hue));
  }
  float scanAt(vec3 p) {
    float sweep = mod(uTime * 20.0 + 12.0, 65.0) - 24.0;
    return exp(-abs(p.y * 0.65 + p.x * 0.42 - p.z * 0.17 - sweep) * 0.42);
  }
`;
const structureVertex = /* glsl */ `
  varying vec3 vWorld;
  varying vec3 vNormal;
  varying vec2 vUv;
  void main() {
    vec4 p = modelMatrix * vec4(position, 1.0);
    vWorld = p.xyz;
    vNormal = normalize(mat3(modelMatrix) * normal);
    vUv = uv;
    gl_Position = projectionMatrix * viewMatrix * p;
  }
`;
const structureFragment = worldCommon + /* glsl */ `
  varying vec3 vWorld;
  varying vec3 vNormal;
  varying vec2 vUv;
  void main() {
    float light = max(0.0, dot(normalize(vNormal), normalize(vec3(-0.45, 0.3, 0.85))));
    float scan = max(scanAt(vWorld), uChaos * exp(-abs(vWorld.y * 0.55 + vWorld.x * 0.4 - vWorld.z * 0.1 - (uTime - 1.8) * 75.0 + 9.0) * 0.45));
    float grain = fract(sin(dot(floor(vWorld.xy * 37.0), vec2(12.9898, 78.233))) * 43758.5453);
    float seams = pow(abs(sin(vUv.y * 150.0)), 54.0) * 0.10;
    vec3 accent = reflectedAccent(vWorld);
    vec3 steel = mix(vec3(0.035, 0.058, 0.094), mix(uIce, accent, 0.65) * 0.44, light * 0.65 + scan * 0.38);
    steel *= 0.70 + grain * 0.26 + seams;
    steel += accent * (scan * 0.38 + uChaos * light * 0.075) + uIce * scan * 0.07 + uBlue * light * 0.035;
    float distanceFade = mix(0.36, 1.0, smoothstep(-95.0, -5.0, vWorld.z));
    float alpha = (0.46 + light * 0.23 + scan * 0.25) * distanceFade;
    alpha *= uWorld * mix(1.0, 0.19, uQuiet) * (1.0 - smoothstep(0.30, 0.82, uExit));
    gl_FragColor = vec4(steel, alpha);
  }
`;
const edgeVertex = /* glsl */ `
  varying vec3 vWorld;
  void main(){vec4 p=modelMatrix*vec4(position,1.0);vWorld=p.xyz;gl_Position=projectionMatrix*viewMatrix*p;}
`;
const edgeFragment = worldCommon + /* glsl */ `
  varying vec3 vWorld;
  void main(){
    float scan=scanAt(vWorld);
    float alpha=(0.12 + scan*0.46 + uChaos*0.20)*uWorld;
    alpha*=mix(1.0,0.12,uQuiet)*(1.0-smoothstep(0.12,0.75,uExit));
    alpha*=mix(0.36,1.0,smoothstep(-95.0,0.0,vWorld.z));
    vec3 color=mix(uIce,reflectedAccent(vWorld),0.72);
    gl_FragColor=vec4(mix(color,vec3(0.94),scan*0.32),alpha);
  }
`;
const worldLineVertex = worldCommon + /* glsl */ `
  attribute float aKind;
  attribute float aSeed;
  varying float vAlpha;
  varying float vTint;
  void main(){
    vec3 p=position;
    float node=step(2.5,aKind)*step(aKind,3.5);
    p.x+=node*sin(uTime*0.42+aSeed*9.0)*0.36;
    p.y+=node*cos(uTime*0.37+aSeed*13.0)*0.28;
    p.z+=node*uTime*0.48;
    vec4 mv=modelViewMatrix*vec4(p,1.0);
    gl_Position=projectionMatrix*mv;
    float distant=mix(0.34,1.0,smoothstep(-90.0,5.0,p.z));
    float rhythm=0.46+0.54*smoothstep(-0.5,0.8,sin(uTime*1.3+aSeed*12.0));
    float opacity=mix(0.12,0.31,step(0.5,aKind));
    opacity*=mix(1.0,rhythm,node);
    vAlpha=opacity*distant*uWorld*(1.0+uChaos*0.95)*mix(1.0,0.12,uQuiet);
    vAlpha*=(1.0-smoothstep(0.18,0.75,uExit))*smoothstep(0.25,3.0,-mv.z);
    vTint=aSeed;
  }
`;
const dustVertex = worldCommon + /* glsl */ `
  uniform float uPixelRatio;
  attribute vec3 aSeed;
  varying float vAlpha;
  varying float vTint;
  void main(){
    vec3 p=position;
    p.z+=uTime*(0.12+aSeed.x*0.32);
    p.x+=sin(uTime*0.18+aSeed.y*9.0)*0.25;
    vec4 mv=modelViewMatrix*vec4(p,1.0);
    gl_Position=projectionMatrix*mv;
    gl_PointSize=uPixelRatio*(0.7+aSeed.z*1.6)*clamp(18.0/max(1.0,-mv.z),0.45,8.0);
    vAlpha=(0.17+aSeed.y*0.32)*uWorld*mix(1.0,0.24,uQuiet)*(1.0-smoothstep(0.45,0.92,uExit));
    vAlpha*=smoothstep(0.2,2.0,-mv.z);
    vTint=aSeed.z;
  }
`;
const rushingVertex = worldCommon + /* glsl */ `
  uniform float uPixelRatio;
  attribute vec3 aSeed;
  attribute float aTail;
  varying float vAlpha;
  varying float vTint;
  void main(){
    vec3 p=position;
    float rush=pow(uExit,1.55);
    p.z+=uTime*(0.25+aSeed.x*0.3)+rush*(18.0+aSeed.y*35.0);
    p.z-=aTail*(uChaos*3.0+uExit*18.0+0.02);
    vec4 mv=modelViewMatrix*vec4(p,1.0);
    gl_Position=projectionMatrix*mv;
    vAlpha=(uChaos*0.34+smoothstep(0.0,0.16,uExit)*0.6)*(1.0-smoothstep(0.38,0.90,uExit));
    vAlpha*=(1.0-aTail*0.86)*smoothstep(0.3,2.0,-mv.z);
    vTint=aSeed.z;
  }
`;
const shardVertex = worldCommon + /* glsl */ `
  attribute vec3 aSeed;
  attribute vec2 aCorner;
  varying float vAlpha;
  varying float vTint;
  void main(){
    vec3 p=position;
    float passage=smoothstep(1.64,2.47,uTime);
    p.z+=passage*(9.0+aSeed.y*15.0)+pow(uExit,1.5)*38.0;
    p.x+=sin(uTime*0.5+aSeed.x*6.0)*0.4;
    float angle=aSeed.x*6.28+uTime*0.18;
    float w=0.4+aSeed.y*2.8;
    float h=0.025+aSeed.z*0.22;
    p+=vec3(aCorner.x*w*cos(angle)-aCorner.y*h*sin(angle),aCorner.x*w*sin(angle)+aCorner.y*h*cos(angle),aCorner.x*w*0.7);
    vec4 mv=modelViewMatrix*vec4(p,1.0);
    gl_Position=projectionMatrix*mv;
    vAlpha=uWorld*(0.09+uChaos*0.23)*mix(1.0,0.04,uQuiet)*(1.0-smoothstep(0.25,0.84,uExit));
    vAlpha*=smoothstep(0.12,1.4,-mv.z);
    vTint=aSeed.z;
  }
`;

export async function createIntroScene(canvas: HTMLCanvasElement, options: IntroOptions): Promise<IntroScene> {
  const { brand, compact, palette } = options;
  const random = randomSequence(41023);
  const count = compact ? 6200 : 13800;
  const scene = new Scene();
  const identityScene = new Scene();
  const camera = new PerspectiveCamera(compact ? 48 : 42, 1, 0.12, 240);
  const identityCamera = new PerspectiveCamera(40, 1, 0.08, 150);
  camera.position.z = 14;
  identityCamera.position.z = 13;
  const architecture = new Group();
  scene.add(architecture);
  const geometries: BufferGeometry[] = [];
  const materials: ShaderMaterial[] = [];
  const textures: CanvasTexture[] = [];
  let renderer: WebGLRenderer | undefined;
  let disposed = false;
  try {
    renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "high-performance" });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, compact ? 1.25 : 1.5));
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.autoClear = false;
    renderer.info.autoReset = false;
    renderer.debug.onShaderError = () => { throw new Error("The Anthēon intro shader failed to compile."); };
    const uniforms = {
      uTime: { value: 0 }, uExit: { value: 0 },
      uWordWidth: { value: 10 }, uView: { value: new Vector2(16, 10) },
      uPointer: { value: new Vector2() }, uCenterY: { value: 0.4 },
      uPixelRatio: { value: renderer.getPixelRatio() },
      uWorld: { value: 0 }, uChaos: { value: 0 }, uQuiet: { value: 0 },
      uIce: { value: new Color(palette.ice) }, uBlue: { value: new Color(palette.blue) },
      uElectric: { value: new Color("#579dff") }, uViolet: { value: new Color("#b184ff") },
    };
    function material(vertexShader: string, fragmentShader: string, extra: Record<string, { value: unknown }> = {}) {
      const value = new ShaderMaterial({
        uniforms: { ...uniforms, ...extra }, vertexShader, fragmentShader,
        transparent: true, depthWrite: false, depthTest: false, toneMapped: false, side: DoubleSide,
      });
      materials.push(value);
      return value;
    }
    function geometry(attributes: Record<string, { data: number[] | Float32Array; size: number }>) {
      const value = new BufferGeometry();
      for (const [key, { data, size }] of Object.entries(attributes))
        value.setAttribute(key, data instanceof Float32Array ? new BufferAttribute(data, size) : new Float32BufferAttribute(data, size));
      geometries.push(value);
      return value;
    }
    function startPosition(index: number): [number, number, number] {
      const slab = index % 7;
      const angle = random() * Math.PI * 2;
      let x = (random() - 0.5) * 1.65;
      let y = (random() - 0.5) * 1.4;
      if (slab < 2) { x = Math.cos(angle) * (0.27 + random() * 0.13); y = Math.sin(angle) * 0.36; }
      if (slab === 2) { x = (random() > 0.5 ? 0.30 : -0.3) + y * 0.23; }
      if (slab === 3) y = -0.25 + random() * 0.04;
      return [x, y, -70 + random() * 89];
    }
    const sampleAt = () => brand.samples[Math.floor(random() * brand.samples.length)];
    const starts = new Float32Array(count * 3), targets = new Float32Array(count * 3), seeds = new Float32Array(count * 3), sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const sample = sampleAt();
      starts.set(startPosition(i), i * 3);
      targets.set([sample.x, sample.y, 0], i * 3);
      seeds.set([random(), random(), random()], i * 3);
      sizes[i] = 0.7 + Math.pow(random(), 2) * 1.1;
    }
    const particles = new Points(geometry({
      position: { data: targets, size: 3 }, aStart: { data: starts, size: 3 },
      aTarget: { data: targets, size: 3 }, aSeed: { data: seeds, size: 3 }, aSize: { data: sizes, size: 1 },
    }), material(pointVertex, pointFragment));
    particles.frustumCulled = false;
    identityScene.add(particles);

    // Actual glyph cross-sections, guide rails and transfers share the glyph field.
    const lineStart: number[] = [], lineTarget: number[] = [], lineSeed: number[] = [], lineTail: number[] = [], lineKind: number[] = [];
    function segment(startA: number[], startB: number[], targetA: Sample, targetB: Sample, kind: number) {
      const seed = [random(), random(), random()];
      lineStart.push(...startA, ...startB);
      lineTarget.push(targetA.x, targetA.y, 0, targetB.x, targetB.y, 0);
      lineSeed.push(...seed, ...seed); lineTail.push(0, 1); lineKind.push(kind, kind);
    }
    brand.strokes.forEach(([a, b], index) => {
      if (compact && index % 2) return;
      const start = startPosition(index), end = [...start];
      end[2] -= 4;
      segment(start, end, a, b, 0);
    });
    const sampledStrokeCount = lineTarget.length / 6;
    for (let i = 0; i < (compact ? 220 : 650); i++) {
      const start = startPosition(i), target = sampleAt();
      segment(start, start, target, target, 1);
    }
    const transferEnd = lineTarget.length / 3;
    const guideY = [brand.height / brand.width * 0.46, -brand.height / brand.width * 0.46, 0];
    guideY.forEach((y, i) => {
      segment([-0.65, y, -15], [0.65, y, -15], { x: -0.54, y }, { x: 0.54, y }, 0);
      for (let j = 0; j <= 7; j++) {
        const x = -0.5 + j / 7;
        segment([x, y - 0.06, -18], [x, y + 0.06, -18], { x, y: y - (i === 2 ? 0.008 : 0.015) }, { x, y: y + (i === 2 ? 0.008 : 0.015) }, 0);
      }
    });
    const transfers = new LineSegments(geometry({
      position: { data: lineTarget, size: 3 }, aStart: { data: lineStart, size: 3 },
      aTarget: { data: lineTarget, size: 3 }, aSeed: { data: lineSeed, size: 3 },
      aTail: { data: lineTail, size: 1 }, aKind: { data: lineKind, size: 1 },
    }), material(transferVertex, lineFragment));
    transfers.frustumCulled = false;
    identityScene.add(transfers);

    // Cropped, impossible structural planes: never a neatly framed floating logo.
    const solidMaterial = material(structureVertex, structureFragment);
    const edgeMaterial = material(edgeVertex, edgeFragment);
    function beam(x: number, y: number, z: number, w: number, h: number, d: number, angle: number) {
      const shape = new BoxGeometry(w, h, d);
      geometries.push(shape);
      const mesh = new Mesh(shape, solidMaterial);
      mesh.position.set(x, y, z); mesh.rotation.set(0.05, -0.19, angle);
      mesh.renderOrder = 1;
      architecture.add(mesh);
      const outline = new EdgesGeometry(shape, 20); geometries.push(outline);
      const edges = new LineSegments(outline, edgeMaterial);
      mesh.add(edges);
      return mesh;
    }
    const side = compact ? 0.65 : 1;
    beam(12 * side, 4, -27, 5.5, 78, 7.5, 0.29);
    beam(-8 * side, 6, -36, 3.8, 86, 6, -0.30);
    beam(25 * side, 13, -70, 9, 142, 11, 0.30);
    beam(-29 * side, -4, -78, 7, 154, 13, -0.34);
    beam(0, -12, -42, 80, 1.3, 12, 0.015);
    if (!compact) {
      beam(18, 17, -11, 1.8, 57, 4, 0.41);
      beam(-17, -15, -3, 1.0, 48, 3, -0.28);
    }
    // One off-axis plane becomes the natural architectural wipe during exit.
    const passingPlane = beam(14 * side, 5, -10, 4.6, 55, 3, -0.33);

    const worldPositions: number[] = [], kinds: number[] = [], worldSeeds: number[] = [];
    function worldLine(a: number[], b: number[], kind: number, seed = random()) {
      worldPositions.push(...a, ...b); kinds.push(kind, kind); worldSeeds.push(seed, seed);
    }
    // A ground datum stretches beyond the far architecture; a second vertical grid
    // intersects it so parallax reads as a volume rather than a flat HUD.
    for (let x = -65; x <= 65; x += compact ? 6 : 4) worldLine([x, -9, 6], [x, -9, -145], 0);
    for (let z = 4; z >= -145; z -= compact ? 8 : 5) worldLine([-65, -9, z], [65, -9, z], 0);
    for (let y = -28; y <= 48; y += 5) worldLine([-38, y, -120], [-38, y, 0], 0);
    for (let z = -120; z <= 0; z += 12) worldLine([-38, -28, z], [-38, 48, z], 0);
    // Broken ellipses trace a huge orbital construction. They intentionally extend
    // beyond the frame, and each belongs to a different physical depth plane.
    for (let ring = 0; ring < (compact ? 3 : 5); ring++) {
      const radius = 9 + ring * 8, z = -12 - ring * 14;
      const segments = compact ? 64 : 100;
      for (let i = 0; i < segments; i++) {
        if (i % 21 > 15) continue;
        const a = i / segments * Math.PI * 2 + ring * 0.5, b = (i + 1) / segments * Math.PI * 2 + ring * 0.5;
        worldLine([Math.cos(a) * radius + 5, Math.sin(a) * radius * 0.66 + 1, z + Math.sin(a) * radius * 0.4], [Math.cos(b) * radius + 5, Math.sin(b) * radius * 0.66 + 1, z + Math.sin(b) * radius * 0.4], 1);
      }
    }
    // Sparse topographic ribbons bend along the lower and upper world boundaries.
    for (let ribbon = 0; ribbon < (compact ? 6 : 11); ribbon++) {
      const z = -8 - ribbon * 7;
      for (let i = 0; i < 36; i++) {
        const x1 = -28 + i * 1.7, x2 = x1 + 1.7;
        const y = (x: number) => -5.8 + Math.sin(x * 0.13 + ribbon * 0.31) * (1.8 + ribbon * 0.07);
        worldLine([x1, y(x1), z], [x2, y(x2), z], 2);
      }
    }
    for (let cluster = 0; cluster < (compact ? 10 : 24); cluster++) {
      const seed = random(), cx = (random() - 0.5) * 65, cy = (random() - 0.5) * 40, cz = -8 - random() * 78;
      const nodes = Array.from({ length: 7 }, () => [cx + (random() - 0.5) * 7, cy + (random() - 0.5) * 5, cz + (random() - 0.5) * 5]);
      for (let i = 1; i < nodes.length; i++) {
        worldLine(nodes[i - 1], nodes[i], 3, seed);
        if (i % 2 === 0) worldLine(nodes[i - 2], nodes[i], 3, seed);
        const [x, y, z] = nodes[i];
        worldLine([x - 0.09, y, z], [x + 0.09, y, z], 4, seed);
        worldLine([x, y - 0.09, z], [x, y + 0.09, z], 4, seed);
      }
    }
    const worldLines = new LineSegments(geometry({ position: { data: worldPositions, size: 3 }, aKind: { data: kinds, size: 1 }, aSeed: { data: worldSeeds, size: 1 } }), material(worldLineVertex, lineFragment));
    worldLines.frustumCulled = false;
    scene.add(worldLines);

    const dustPositions: number[] = [], dustSeeds: number[] = [];
    const rushPositions: number[] = [], rushSeeds: number[] = [], rushTails: number[] = [];
    for (let i = 0; i < (compact ? 550 : 1500); i++) {
      const z = -108 + random() * 119;
      const depth = (14 - z) / 14;
      const x = (random() - 0.5) * (compact ? 14 : 33) * depth, y = (random() - 0.5) * 20 * depth;
      dustPositions.push(x, y, z); dustSeeds.push(random(), random(), random());
      if (i % 3 === 0) {
        const seed = [random(), random(), random()];
        rushPositions.push(x, y, z, x, y, z); rushSeeds.push(...seed, ...seed); rushTails.push(0, 1);
      }
    }
    const dust = new Points(geometry({ position: { data: dustPositions, size: 3 }, aSeed: { data: dustSeeds, size: 3 } }), material(dustVertex, pointFragment));
    dust.frustumCulled = false; scene.add(dust);
    const rush = new LineSegments(geometry({ position: { data: rushPositions, size: 3 }, aSeed: { data: rushSeeds, size: 3 }, aTail: { data: rushTails, size: 1 } }), material(rushingVertex, lineFragment));
    rush.frustumCulled = false; scene.add(rush);
    const shardPositions: number[] = [], shardSeeds: number[] = [], shardCorners: number[] = [];
    const corners = [[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5]];
    for (let i = 0; i < (compact ? 20 : 54); i++) {
      const p = [(random() - 0.5) * (compact ? 18 : 37), (random() - 0.5) * 21, -45 + random() * 48];
      const seed = [random(), random(), random()];
      for (const corner of corners) { shardPositions.push(...p); shardSeeds.push(...seed); shardCorners.push(...corner); }
    }
    const shards = new Mesh(geometry({ position: { data: shardPositions, size: 3 }, aSeed: { data: shardSeeds, size: 3 }, aCorner: { data: shardCorners, size: 2 } }), material(shardVertex, lineFragment));
    shards.frustumCulled = false; scene.add(shards);

    // One tiny atlas, batched into eight perspective annotations, not UI headings.
    const atlas = document.createElement("canvas"); atlas.width = 512; atlas.height = 256;
    const context = atlas.getContext("2d");
    if (context) {
      context.fillStyle = "#b9cbff"; context.font = "18px monospace";
      ["ANTHĒON / ENVIRONMENT 01", "FORM / 001    XYZ 08.24.16", "STRUCTURE ACTIVE / 024", "VECTOR FIELD    52.08 / N"].forEach((text, i) => context.fillText(text, 5, i * 64 + 34));
      const texture = new CanvasTexture(atlas); texture.colorSpace = SRGBColorSpace; textures.push(texture);
      const positions: number[] = [], uv: number[] = [];
      for (let i = 0; i < (compact ? 4 : 8); i++) {
        const x = (i % 2 ? 1 : -1) * (5 + (i % 3) * 5), y = (i % 2 ? -1 : 1) * (3 + i * 1.1), z = -10 - i * 7;
        for (const [a, b] of corners) { positions.push(x + a * 5, y + b * 0.62, z); uv.push(a + 0.5, 1 - ((i % 4) + (0.5 - b)) / 4); }
      }
      const annotations = new Mesh(geometry({ position: { data: positions, size: 3 }, uv: { data: uv, size: 2 } }), material(
        "varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
        worldCommon + "uniform sampler2D uAtlas; varying vec2 vUv; void main(){vec4 c=texture2D(uAtlas,vUv);gl_FragColor=vec4(uIce,c.a*uWorld*0.36*mix(1.0,0.08,uQuiet)*(1.0-smoothstep(0.0,0.4,uExit)));}",
        { uAtlas: { value: texture } },
      ));
      scene.add(annotations);
    }
    const signalUniforms = { uOpacity: { value: 0 }, uSize: { value: renderer.getPixelRatio() * 3.1 } };
    const signal = new Points(geometry({ position: { data: [0, 0.4, 0], size: 3 } }), material(
      "uniform float uSize;void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);gl_PointSize=uSize;}",
      "uniform float uOpacity;uniform vec3 uIce;void main(){float a=1.0-smoothstep(0.12,0.5,length(gl_PointCoord-0.5));gl_FragColor=vec4(uIce,a*uOpacity);}", signalUniforms,
    ));
    identityScene.add(signal);

    let width = 0, height = 0;
    function resize() {
      if (disposed || !renderer) return;
      const bounds = canvas.getBoundingClientRect();
      const nextWidth = Math.max(1, Math.round(bounds.width || window.innerWidth));
      const nextHeight = Math.max(1, Math.round(bounds.height || window.innerHeight));
      if (nextWidth === width && nextHeight === height) return;
      width = nextWidth; height = nextHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height; camera.fov = width < 700 ? 48 : 42; camera.updateProjectionMatrix();
      identityCamera.aspect = width / height; identityCamera.updateProjectionMatrix();
      const viewHeight = 2 * Math.tan(identityCamera.fov * Math.PI / 360) * 13;
      const viewWidth = viewHeight * identityCamera.aspect;
      const cssWordWidth = width < 700 ? width * 0.82 : Math.min(width * 0.64, 900);
      uniforms.uView.value.set(viewWidth, viewHeight);
      uniforms.uWordWidth.value = viewWidth * cssWordWidth / width;
      uniforms.uCenterY.value = viewHeight * 0.04;
      signal.position.y = uniforms.uCenterY.value - 0.4;
    }
    function render(time: number, exitProgress: number, pointer: { x: number; y: number }) {
      if (disposed || !renderer) return;
      const exit = clamp(exitProgress), t = Math.max(0, time);
      const quiet = smooth(3.39, 3.46, t);
      const chaos = Math.sin(Math.PI * clamp((t - 1.79) / 0.66));
      uniforms.uTime.value = t; uniforms.uExit.value = exit;
      uniforms.uWorld.value = smooth(0.22, 0.91, t);
      uniforms.uChaos.value = chaos; uniforms.uQuiet.value = quiet;
      uniforms.uPointer.value.set(compact ? 0 : Math.max(-1, Math.min(1, pointer.x)), compact ? 0 : Math.max(-1, Math.min(1, pointer.y)));
      const still = 1 - quiet * 0.96;
      const travel = smooth(0.68, 2.46, t);
      camera.position.z = 14 - travel * 6.4 - Math.pow(exit, 1.65) * 40;
      camera.position.x = (Math.sin(t * 0.7) * 0.65 + uniforms.uPointer.value.x * 0.24) * still + exit * 2.1;
      camera.position.y = (Math.sin(t * 0.47) * 0.31 + uniforms.uPointer.value.y * 0.15) * still + exit * 0.7;
      camera.rotation.set(-0.012 * still, Math.sin(t * 0.5) * 0.017 * still, Math.sin(t * 0.61) * 0.012 * still);
      architecture.rotation.y = Math.sin(t * 0.14) * 0.012;
      passingPlane.position.x = 14 * side - smooth(0.05, 0.65, exit) * 13;
      passingPlane.position.z = -10 + Math.pow(exit, 1.1) * 26;
      passingPlane.rotation.y = -0.19 + uniforms.uPointer.value.x * 0.015;
      signalUniforms.uOpacity.value = smooth(0.07, 0.15, t) * (1 - smooth(0.41, 0.70, t));
      renderer.info.reset();
      renderer.clear();
      renderer.render(scene, camera);
      renderer.clearDepth();
      renderer.render(identityScene, identityCamera);
      canvas.dataset.introPhase = exit > 0 ? "enter" : t >= 3.455 ? "lock" : t >= 3.405 ? "snap" : t >= 3.245 ? "disrupt" : t >= 2.4 ? "form" : t >= 1.79 ? "pressure" : t >= 0.35 ? "awaken" : "point";
      canvas.dataset.introDrawCalls = String(renderer.info.render.calls);
    }
    function updateBrand(next: NavigationBrand) {
      if (disposed || !next.samples.length) return;
      // Resize is infrequent: resample on the CPU once, never inside the RAF.
      for (let index = 0; index < count; index++) {
        const sample = next.samples[Math.floor((index * 0.61803398875 % 1) * next.samples.length)];
        targets[index * 3] = sample.x; targets[index * 3 + 1] = sample.y;
      }
      (particles.geometry.getAttribute("aTarget") as BufferAttribute).needsUpdate = true;
      const transferTargets = transfers.geometry.getAttribute("aTarget") as BufferAttribute;
      const attribute = transferTargets.array;
      for (let index = 0; index < sampledStrokeCount; index++) {
        const stroke = next.strokes[Math.min(next.strokes.length - 1, Math.floor(index / sampledStrokeCount * next.strokes.length))];
        if (!stroke) continue;
        attribute[index * 6] = stroke[0].x; attribute[index * 6 + 1] = stroke[0].y;
        attribute[index * 6 + 3] = stroke[1].x; attribute[index * 6 + 4] = stroke[1].y;
      }
      for (let index = sampledStrokeCount * 2; index < transferEnd; index += 2) {
        const sample = next.samples[Math.floor((index * 0.61803398875 % 1) * next.samples.length)];
        attribute[index * 3] = sample.x; attribute[index * 3 + 1] = sample.y;
        attribute[(index + 1) * 3] = sample.x; attribute[(index + 1) * 3 + 1] = sample.y;
      }
      const ratio = (next.height / next.width) / (brand.height / brand.width);
      for (let index = transferEnd; index < transferTargets.count; index++) attribute[index * 3 + 1] = lineTarget[index * 3 + 1] * ratio;
      transferTargets.needsUpdate = true;
    }
    function dispose() {
      if (disposed) return;
      disposed = true;
      geometries.forEach((value) => value.dispose()); materials.forEach((value) => value.dispose()); textures.forEach((value) => value.dispose());
      renderer?.dispose(); scene.clear(); identityScene.clear();
      delete canvas.dataset.introPhase; delete canvas.dataset.introParticles; delete canvas.dataset.introDrawCalls;
    }
    canvas.dataset.introParticles = String(count);
    resize(); renderer.compile(scene, camera); renderer.compile(identityScene, identityCamera); render(0, 0, { x: 0, y: 0 });
    return { render, resize, updateBrand, dispose };
  } catch (error) {
    geometries.forEach((value) => value.dispose()); materials.forEach((value) => value.dispose()); textures.forEach((value) => value.dispose()); renderer?.dispose();
    throw error;
  }
}
