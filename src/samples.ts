/**
 * Low-poly NPR bakeoff.
 *
 * One camp vignette, built once, rendered five ways so the shading direction can
 * be chosen by eye rather than by argument. This is a throwaway bench in the
 * spirit of bakeoff.html — it shares nothing with the game renderer and is safe
 * to delete once a style is picked.
 */

import * as THREE from 'three';

type Style =
  | 'engraving'   // flat cel fills + ink hull outline + laid-paper grain
  | 'toon3'       // clean 3-band toon + thin dark outline
  | 'flat'        // faceted low-poly, no outline, soft light
  | 'gouache'     // matte flat colour + rim light, no black outline
  | 'dither';     // Obra-Dinn-style 1-bit ordered dither

interface Sample {
  key: Style;
  title: string;
  note: string;
}

const SAMPLES: Sample[] = [
  { key: 'engraving', title: 'Paper-grain engraving', note: 'flat fills · ink hull outline · laid-paper grain — "the print, in 3D"' },
  { key: 'toon3',     title: 'Clean 3-band toon',     note: 'stepped shading · thin dark outline — the familiar stylised look' },
  { key: 'flat',      title: 'Flat faceted low-poly', note: 'no outline · soft light — Monument-Valley minimal' },
  { key: 'gouache',   title: 'Matte gouache + rim',   note: 'flat colour · rim light · no black line — painterly, warmer' },
  { key: 'dither',    title: '1-bit ordered dither',  note: 'Obra-Dinn halftone — the other "printing process" answer' },
];

// ---- shared palette (period-ish, muted) -----------------------------------
const COL = {
  ground:  0x6f6a45,
  groundE: 0x585438,
  canvas:  0xcabf9f, // tent sailcloth
  canvasE: 0xa89e7f,
  wood:    0x6b4a2c,
  coat:    0x2f3d5a, // continental blue
  buff:    0xb79a63,
  skin:    0xc79a72,
  hat:     0x241c14,
  flame:   0xd7742a,
  fire:    0x39281a,
  paper:   0xe9dcc0,
};

// ---- a gradient ramp for MeshToonMaterial ---------------------------------
function toonGradient(steps: number): THREE.DataTexture {
  const data = new Uint8Array(steps * 4);
  for (let i = 0; i < steps; i++) {
    const v = Math.round((i / (steps - 1)) * 255);
    data.set([v, v, v, 255], i * 4);
  }
  const tex = new THREE.DataTexture(data, steps, 1, THREE.RGBAFormat);
  tex.minFilter = tex.magFilter = THREE.NearestFilter;
  tex.needsUpdate = true;
  return tex;
}
const RAMP2 = toonGradient(2);
const RAMP3 = toonGradient(3);

// ---- geometry helpers -----------------------------------------------------

/** A ridge tent: triangular prism lying on its side, centred on origin. */
function tent(len: number, w: number, h: number): THREE.BufferGeometry {
  // cross-section triangle in X/Y, extruded along Z
  const shape = new THREE.Shape();
  shape.moveTo(-w / 2, 0);
  shape.lineTo(w / 2, 0);
  shape.lineTo(0, h);
  shape.lineTo(-w / 2, 0);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: len, bevelEnabled: false });
  geo.translate(0, 0, -len / 2);
  geo.computeVertexNormals();
  return geo;
}

/** A blocky figure: legs, torso, head, tricorne. Returns a group. */
function figure(): THREE.Group {
  const g = new THREE.Group();
  const mk = (geo: THREE.BufferGeometry, color: number, y: number) => {
    const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color }));
    m.position.y = y;
    m.userData.baseColor = color;
    g.add(m);
    return m;
  };
  mk(new THREE.BoxGeometry(0.5, 0.9, 0.32), COL.buff, 0.45);            // legs/breeches
  mk(new THREE.BoxGeometry(0.62, 0.85, 0.38), COL.coat, 1.28);          // coat
  mk(new THREE.SphereGeometry(0.26, 8, 6), COL.skin, 1.95);            // head
  const hat = mk(new THREE.CylinderGeometry(0.34, 0.34, 0.1, 3), COL.hat, 2.16); // tricorne
  hat.rotation.y = Math.PI / 6;
  return g;
}

/** Build the vignette scene. Materials are swapped later per style. */
function buildScene(): { scene: THREE.Scene; meshes: THREE.Mesh[] } {
  const scene = new THREE.Scene();
  const meshes: THREE.Mesh[] = [];
  const add = (geo: THREE.BufferGeometry, color: number, pos: [number, number, number], rot?: [number, number, number]) => {
    const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color }));
    m.position.set(...pos);
    if (rot) m.rotation.set(...rot);
    m.userData.baseColor = color;
    scene.add(m);
    meshes.push(m);
    return m;
  };

  // ground
  add(new THREE.PlaneGeometry(60, 60), COL.ground, [0, 0, 0], [-Math.PI / 2, 0, 0]);

  // three tents receding
  add(tent(5, 3.4, 2.4), COL.canvas, [-4.5, 0, -2], [0, 0.3, 0]);
  add(tent(4.5, 3.0, 2.2), COL.canvas, [4.2, 0, -6], [0, -0.4, 0]);
  add(tent(4, 2.7, 2.0), COL.canvas, [0, 0, -12], [0, 0.1, 0]);

  // barrels
  add(new THREE.CylinderGeometry(0.5, 0.5, 1.1, 10), COL.wood, [-1.6, 0.55, 1.2]);
  add(new THREE.CylinderGeometry(0.5, 0.5, 1.1, 10), COL.wood, [-0.7, 0.55, 1.6]);

  // campfire: ring of logs + a flame
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const log = add(new THREE.CylinderGeometry(0.12, 0.12, 1.0, 6), COL.wood,
      [2.4 + Math.cos(a) * 0.4, 0.12, 2.2 + Math.sin(a) * 0.4],
      [Math.PI / 2 - 0.5, a, 0]);
    log.userData.baseColor = COL.fire;
    (log.material as THREE.MeshStandardMaterial).color.setHex(COL.fire);
  }
  const flame = add(new THREE.OctahedronGeometry(0.4), COL.flame, [2.4, 0.55, 2.2]);
  (flame.material as THREE.MeshStandardMaterial).emissive = new THREE.Color(COL.flame);
  (flame.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.6;

  // a figure by the fire
  const fig = figure();
  fig.position.set(0.4, 0, 2.6);
  fig.rotation.y = -0.5;
  scene.add(fig);
  fig.traverse((o) => { if ((o as THREE.Mesh).isMesh) meshes.push(o as THREE.Mesh); });

  return { scene, meshes };
}

// ---- inverted-hull outline ------------------------------------------------
function addOutlines(meshes: THREE.Mesh[], scene: THREE.Scene, thickness: number, color: number) {
  const outMat = new THREE.MeshBasicMaterial({ color, side: THREE.BackSide });
  for (const m of meshes) {
    if (m.geometry instanceof THREE.PlaneGeometry) continue; // no outline on ground
    const shell = new THREE.Mesh(m.geometry, outMat);
    m.getWorldPosition(shell.position);
    m.getWorldQuaternion(shell.quaternion);
    const s = m.getWorldScale(new THREE.Vector3());
    shell.scale.copy(s).multiplyScalar(1 + thickness);
    scene.add(shell);
  }
}

// ---- lighting per style ---------------------------------------------------
function light(scene: THREE.Scene, style: Style) {
  const key = new THREE.DirectionalLight(0xfff2d8, style === 'flat' ? 1.0 : 1.3);
  key.position.set(4, 8, 5);
  scene.add(key);
  const amb = style === 'flat' || style === 'gouache' ? 0.65 : 0.45;
  scene.add(new THREE.HemisphereLight(0xbfd0e0, 0x4a4230, amb));
}

// ---- apply a style to a fresh scene ---------------------------------------
function applyStyle(scene: THREE.Scene, meshes: THREE.Mesh[], style: Style) {
  for (const m of meshes) {
    const base = (m.userData.baseColor as number) ?? 0x888888;
    let mat: THREE.Material;
    switch (style) {
      case 'engraving':
        mat = new THREE.MeshToonMaterial({ color: base, gradientMap: RAMP2 });
        break;
      case 'toon3':
        mat = new THREE.MeshToonMaterial({ color: base, gradientMap: RAMP3 });
        break;
      case 'flat':
        mat = new THREE.MeshStandardMaterial({ color: base, flatShading: true, roughness: 0.9, metalness: 0 });
        break;
      case 'gouache':
        mat = new THREE.MeshStandardMaterial({ color: base, flatShading: false, roughness: 1.0, metalness: 0 });
        break;
      case 'dither':
        mat = new THREE.MeshToonMaterial({ color: base, gradientMap: RAMP3 });
        break;
    }
    // preserve fire glow
    if ((m.material as THREE.MeshStandardMaterial).emissiveIntensity) {
      (mat as THREE.MeshStandardMaterial).emissive = new THREE.Color(COL.flame);
      (mat as any).emissiveIntensity = 0.6;
    }
    m.material = mat;
  }
  light(scene, style);
  if (style === 'engraving') addOutlines(meshes, scene, 0.03, 0x241c14);
  if (style === 'toon3') addOutlines(meshes, scene, 0.02, 0x1a1510);
}

// ---- post pass (paper grain / dither) -------------------------------------
const POST_FRAG = /* glsl */`
  precision highp float;
  uniform sampler2D uScene;
  uniform vec2 uRes;
  uniform int uMode; // 0 none, 1 paper, 2 dither
  varying vec2 vUv;

  float hash(vec2 p){ return fract(sin(dot(p, vec2(41.3,289.1)))*43758.5453); }

  // 4x4 Bayer
  float bayer(vec2 p){
    int x = int(mod(p.x,4.0)); int y = int(mod(p.y,4.0));
    int i = y*4+x;
    float m[16];
    m[0]=0.0; m[1]=8.0; m[2]=2.0; m[3]=10.0;
    m[4]=12.0; m[5]=4.0; m[6]=14.0; m[7]=6.0;
    m[8]=3.0; m[9]=11.0; m[10]=1.0; m[11]=9.0;
    m[12]=15.0; m[13]=7.0; m[14]=13.0; m[15]=5.0;
    float v=0.0;
    for(int k=0;k<16;k++){ if(k==i) v=m[k]; }
    return (v+0.5)/16.0;
  }

  void main(){
    vec3 c = texture2D(uScene, vUv).rgb;
    if(uMode==1){
      // laid paper: fibre noise + faint horizontal laid lines, multiply
      float n = hash(floor(vUv*uRes*0.5));
      float laid = 0.97 + 0.03*sin(vUv.y*uRes.y*0.8);
      float grain = mix(0.9,1.0,n);
      c *= grain*laid;
      c = mix(c, c*vec3(1.03,1.0,0.94), 0.5); // warm the paper
      // vignette
      float d = distance(vUv, vec2(0.5));
      c *= 1.0 - d*d*0.35;
    } else if(uMode==2){
      float lum = dot(c, vec3(0.299,0.587,0.114));
      float t = bayer(gl_FragCoord.xy);
      float bw = lum > t ? 1.0 : 0.0;
      // ink on cream, not pure b/w
      vec3 ink = vec3(0.13,0.10,0.07);
      vec3 pap = vec3(0.91,0.86,0.74);
      c = mix(ink, pap, bw);
    }
    gl_FragColor = vec4(c,1.0);
  }
`;

const POST_VERT = /* glsl */`
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = vec4(position,1.0); }
`;

function makeCell(sample: Sample) {
  const cell = document.createElement('div');
  cell.className = 'cell';
  const canvas = document.createElement('canvas');
  cell.appendChild(canvas);
  const cap = document.createElement('div');
  cap.className = 'cap';
  cap.innerHTML = `<b>${sample.title}</b> &nbsp; <span>${sample.note}</span>`;
  cell.appendChild(cap);
  document.getElementById('grid')!.appendChild(cell);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  const W = 640, H = 260;
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
  renderer.setSize(W, H, false);

  const { scene, meshes } = buildScene();
  scene.background = new THREE.Color(
    sample.key === 'engraving' ? COL.paper :
    sample.key === 'dither' ? 0x8a8272 :
    sample.key === 'flat' ? 0x8fa0ab :
    sample.key === 'gouache' ? 0xa9b0a2 : 0x20242b,
  );
  applyStyle(scene, meshes, sample.key);

  const cam = new THREE.PerspectiveCamera(42, W / H, 0.1, 200);
  cam.position.set(0.2, 1.7, 8.5);   // roughly eye height — first-person hint
  cam.lookAt(0, 1.2, -3);

  // post
  const needsPost = sample.key === 'engraving' || sample.key === 'dither';
  let rt: THREE.WebGLRenderTarget | null = null;
  let postScene: THREE.Scene | null = null;
  let postCam: THREE.OrthographicCamera | null = null;
  let postMat: THREE.ShaderMaterial | null = null;
  if (needsPost) {
    rt = new THREE.WebGLRenderTarget(W, H);
    postScene = new THREE.Scene();
    postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    postMat = new THREE.ShaderMaterial({
      vertexShader: POST_VERT, fragmentShader: POST_FRAG,
      uniforms: {
        uScene: { value: rt.texture },
        uRes: { value: new THREE.Vector2(W, H) },
        uMode: { value: sample.key === 'engraving' ? 1 : 2 },
      },
    });
    postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), postMat));
  }

  function frame() {
    if (needsPost && rt && postScene && postCam) {
      renderer.setRenderTarget(rt);
      renderer.render(scene, cam);
      renderer.setRenderTarget(null);
      renderer.render(postScene, postCam);
    } else {
      renderer.render(scene, cam);
    }
  }
  frame();
  // one gentle re-render after a tick in case fonts/layout shift sizes
  requestAnimationFrame(frame);
}

for (const s of SAMPLES) makeCell(s);
