import { CanvasTexture, Mesh, NearestFilter, OrthographicCamera, PlaneGeometry, Scene, ShaderMaterial, Vector2, WebGLRenderTarget } from "three";
import type { Camera, WebGLRenderer } from "three";

/** One GPU pass. The same 3D sample supplies both architecture and glyph colour,
 * so changing representation never changes perspective or occlusion. */
export function createAsciiPass() {
  const atlas = document.createElement("canvas");
  atlas.width = 512; atlas.height = 32;
  const ctx = atlas.getContext("2d")!;
  const characters = " .,:;+=oxO0#%@M8";
  ctx.fillStyle = "#000"; ctx.fillRect(0, 0, 512, 32);
  ctx.font = "bold 25px monospace"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff";
  [...characters].forEach((char, i) => ctx.fillText(char, i * 32 + 16, 16));
  const glyphs = new CanvasTexture(atlas);
  glyphs.minFilter = NearestFilter; glyphs.magFilter = NearestFilter; glyphs.generateMipmaps = false;
  const target = new WebGLRenderTarget(1, 1, { depthBuffer: true });
  const size = new Vector2();
  const uniforms = {
    sceneMap: { value: target.texture }, glyphMap: { value: glyphs },
    resolution: { value: new Vector2(1, 1) }, cells: { value: new Vector2(160, 90) },
    materialise: { value: 0 }, exposure: { value: 1.3 },
  };
  const material = new ShaderMaterial({
    uniforms, depthTest: false, depthWrite: false, toneMapped: false,
    vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,
    fragmentShader: `
      uniform sampler2D sceneMap, glyphMap;
      uniform vec2 resolution, cells;
      uniform float materialise, exposure;
      varying vec2 vUv;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      vec3 grade(vec3 c){c*=exposure; c=(c*(2.51*c+.03))/(c*(2.43*c+.59)+.14);return pow(clamp(c,0.,1.),vec3(1./2.2));}
      void main(){
        vec2 cell=floor(vUv*cells), centre=(cell+.5)/cells;
        vec3 raw=texture2D(sceneMap,centre).rgb;
        vec3 colour=grade(raw);
        float lum=dot(colour,vec3(.2126,.7152,.0722));
        vec3 neighbour=grade(texture2D(sceneMap,centre+vec2(1./cells.x,0.)).rgb);
        float edge=length(colour-neighbour);
        float noise=hash(cell);
        float index=floor(clamp(pow(lum,.38)*14.+edge*2.,0.,15.));
        if(lum>.17 && noise>.6) index=mix(8.,10.,step(.82,noise));
        vec2 local=fract(vUv*cells);
        float glyph=texture2D(glyphMap,vec2((index+local.x)/16.,local.y)).r;
        vec3 ascii=pow(colour,vec3(.85))*(glyph*1.7+.085);
        ascii+=colour*max(0.,lum-.55)*.12;
        ascii=mix(vec3(.009,.012,.020),ascii,smoothstep(.022,.11,lum));
        float threshold=vUv.x*.60+vUv.y*.18+noise*.13;
        float reveal=smoothstep(threshold-.10,threshold+.10,materialise*1.24-.12);
        vec3 solid=grade(texture2D(sceneMap,vUv).rgb);
        vec3 result=mix(ascii,solid,reveal);
        float scan=1.-.045*sin(vUv.y*resolution.y*3.14159);
        result*=mix(scan,1.,reveal);
        gl_FragColor=vec4(result,1.);
      }`,
  });
  const geometry = new PlaneGeometry(2, 2);
  const postScene = new Scene(); postScene.add(new Mesh(geometry, material));
  const postCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  let width = 0, height = 0;
  return {
    setMix(value: number) { uniforms.materialise.value = Math.max(0, Math.min(1, value)); },
    render(renderer: WebGLRenderer, scene: Scene, camera: Camera) {
      renderer.getDrawingBufferSize(size);
      if (width !== size.x || height !== size.y) {
        width = size.x; height = size.y; target.setSize(width, height);
        uniforms.resolution.value.copy(size);
        // Character size is specified in CSS pixels, not device pixels.
        const cssWidth = renderer.domElement.clientWidth;
        const charWidth = cssWidth < 600 ? 4 : 5;
        uniforms.cells.value.set(Math.floor(cssWidth / charWidth), Math.floor(renderer.domElement.clientHeight / (charWidth * 1.7)));
      }
      uniforms.exposure.value = renderer.toneMappingExposure * 1.12;
      const previous = renderer.getRenderTarget();
      renderer.setRenderTarget(target); renderer.render(scene, camera);
      renderer.setRenderTarget(previous); renderer.render(postScene, postCamera);
    },
    dispose() { target.dispose(); glyphs.dispose(); geometry.dispose(); material.dispose(); postScene.clear(); },
  };
}
