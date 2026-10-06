import {
  BoxGeometry, BufferGeometry, CanvasTexture, Color, Float32BufferAttribute,
  InstancedMesh, LineSegments, Mesh, MeshBasicMaterial, MeshStandardMaterial,
  Object3D, PlaneGeometry, ShaderMaterial, SRGBColorSpace,
} from "three";
import type { Scene } from "three";

/** Quiet scenery outside the original precincts. No raycast targets, shadow
 * casters, random-sequence consumption or extra animation/render loop. */
export function createCitySurroundings(scene: Scene, violet: Color) {
  const activation = { value: 0 };
  const positions: number[] = [];
  const strengths: number[] = [];
  const line = (x1: number, z1: number, x2: number, z2: number, strength = 1) => {
    positions.push(x1, -0.015, z1, x2, -0.015, z2);
    strengths.push(strength, strength);
  };
  // Continue a handful of actual street axes, interrupted before they reach
  // the darkness. These are surveying/kerb traces, never an infinite grid.
  for (const [x, z, length, alongX] of [
    [48, -29, 29, 1], [52, 27.7, 27, 1], [-47, -3.1, 24, 1],
    [8.05, -47, 32, 0], [31.5, -45, 27, 0], [-32.1, 42, 22, 0],
    [31.5, 45, 29, 0], [-9.5, -49, 30, 0],
  ]) {
    for (const side of [-1.2, 1.2]) {
      const start = -length / 2, stop = length / 2;
      if (alongX) { line(x + start, z + side, x - 2, z + side, .68); line(x + 3, z + side, x + stop, z + side, .44); }
      else { line(x + side, z + start, x + side, z - 2, .54); line(x + side, z + 3, x + side, z + stop, .72); }
    }
  }
  // Partial plots, a few building setbacks and restrained corner marks.
  for (const [x, z, w, d] of [
    [47, -13, 10, 15], [52, 7, 13, 11], [47, 42, 10, 12],
    [17, -42, 10, 9], [-2, -43, 9, 12], [-22, -41, 10, 8],
    [-45, 11, 10, 12], [-22, 40, 11, 8], [2, 40, 12, 9],
  ]) {
    const l = x - w / 2, r = x + w / 2, n = z - d / 2, s = z + d / 2;
    line(l, n, r, n, .64); line(r, n, r, s - 2, .52);
    line(l, n, l, n + d * .45, .45); line(l + w * .32, s, r, s, .4);
    line(l - 1, n - 1, l + 1, n - 1, .75); line(l - 1, n - 1, l - 1, n + 1, .75);
    line(l + 2, n + 2, r - 2, n + 2, .24);
  }
  const traceGeometry = new BufferGeometry();
  traceGeometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  traceGeometry.setAttribute("traceStrength", new Float32BufferAttribute(strengths, 1));
  const traceMaterial = new ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { activation, ink: { value: new Color("#8a8493").lerp(violet, .18) } },
    vertexShader: `attribute float traceStrength; varying float vStrength; varying vec2 vPosition;
      void main(){vStrength=traceStrength;vPosition=position.xz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader: `uniform float activation; uniform vec3 ink; varying float vStrength; varying vec2 vPosition;
      void main(){float edge=1.0-smoothstep(38.0,78.0,length(vPosition*vec2(.92,1.0)));
        gl_FragColor=vec4(ink,edge*vStrength*(.018+activation*.19));
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const traces = new LineSegments(traceGeometry, traceMaterial); scene.add(traces);

  // Light lies on the same ground as the architecture, so its foreshortening
  // follows the camera. Small overlapping pools leave most of the plane dark.
  const lightCanvas = document.createElement("canvas");
  lightCanvas.width = lightCanvas.height = 512;
  const ctx = lightCanvas.getContext("2d");
  if (ctx) {
    const pool = (x: number, z: number, w: number, d: number, alpha: number) => {
      ctx.save(); ctx.translate((x / 160 + .5) * 512, (z / 160 + .5) * 512);
      ctx.scale(w / 160 * 512, d / 160 * 512);
      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
      glow.addColorStop(0, `rgba(177,132,255,${alpha})`);
      glow.addColorStop(.32, `rgba(177,132,255,${alpha * .43})`);
      glow.addColorStop(1, "rgba(177,132,255,0)");
      ctx.fillStyle = glow; ctx.fillRect(-1, -1, 2, 2); ctx.restore();
    };
    pool(-32, -12, 21, 12, .35); pool(-38, -5, 13, 9, .17);
    pool(31, -22, 19, 17, .42); pool(43, -15, 15, 8, .18);
    pool(23, 26, 23, 13, .28); pool(15, 31, 12, 8, .13);
  }
  const lightTexture = new CanvasTexture(lightCanvas); lightTexture.colorSpace = SRGBColorSpace;
  const lightGeometry = new PlaneGeometry(160, 160);
  const lightMaterial = new MeshBasicMaterial({ map: lightTexture, transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
  const reflectedLight = new Mesh(lightGeometry, lightMaterial);
  reflectedLight.rotation.x = -Math.PI / 2; reflectedLight.position.y = -.035; scene.add(reflectedLight);

  // A few unlit, distant masses suggest continuation; they cannot be selected.
  const contextGeometry = new BoxGeometry(1, 1, 1);
  const contextMaterial = new MeshStandardMaterial({ color: 0x17151c, roughness: 1, metalness: 0, envMapIntensity: .08, transparent: true, opacity: 0, depthWrite: false });
  const distant = [[48,-14,5,8,6],[56,8,6,5,3],[16,-44,5,5,7],[-22,-43,6,4,5],[-45,14,4,6,4],[46,44,6,5,3]];
  const silhouettes = new InstancedMesh(contextGeometry, contextMaterial, distant.length);
  const transform = new Object3D();
  distant.forEach(([x,z,w,d,h],i)=>{transform.position.set(x,h/2-.04,z);transform.scale.set(w,h,d);transform.updateMatrix();silhouettes.setMatrixAt(i,transform.matrix);});
  scene.add(silhouettes);
  return {
    setActivation(value: number) { activation.value = value; lightMaterial.opacity = .035 + value * .25; contextMaterial.opacity = .12 + value * .33; },
    dispose() {
      // The parent owns/disposes InstancedMesh GPU buffers during scene teardown.
      traceGeometry.dispose(); traceMaterial.dispose(); lightTexture.dispose(); lightGeometry.dispose(); lightMaterial.dispose();
      contextGeometry.dispose(); contextMaterial.dispose();
    },
  };
}
