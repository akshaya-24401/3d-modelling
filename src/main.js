import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/**
 * TN VILLAGE HOUSE — 3D ARCHITECTURAL MODEL
 * Plan: Option 2 — Unified Front Pavilion & Central Mutram
 * Footprint: 25 ft Wide (X: 0..25, West to East) × 74 ft Deep (Z: 0..74, Rear/North to Front/South)
 * Scale: 1 Three.js unit = 1 Foot
 */

const BLDG_W = 25;
const BLDG_D = 74;
const OX = -BLDG_W / 2; // -12.5
const OZ = -BLDG_D / 2; // -37.0
const PLINTH_H = 1.4;   // Raised village house plinth (1.4 ft above ground)
const FULL_WALL_H = 9.5;
const HALF_WALL_H = 4.2;

// Coordinate helpers from Blueprint (bx in [0..25], by in [0..74]) to World (x, z)
const toX = (bx) => OX + bx;
const toZ = (by) => OZ + by;

// --- Scene, Camera, Renderer ---
const app = document.getElementById('app');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xdbe7dc);
scene.fog = new THREE.FogExp2(0xdbe7dc, 0.0028);

const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.5, 600);
camera.position.set(52, 46, 62);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
app.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 3, 4);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.maxPolarAngle = Math.PI * 0.485;
controls.minDistance = 8;
controls.maxDistance = 190;
controls.update();

// --- Procedural Architectural Textures ---
function createAthangudiTileTexture(baseHex = '#c86d51', accentHex = '#f3e5ab', borderHex = '#4a6b5d') {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d');
  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, 256, 256);

  // Border frame
  ctx.strokeStyle = borderHex;
  ctx.lineWidth = 14;
  ctx.strokeRect(18, 18, 220, 220);

  ctx.strokeStyle = accentHex;
  ctx.lineWidth = 5;
  ctx.strokeRect(32, 32, 192, 192);

  // Corner & center floral motif
  ctx.fillStyle = accentHex;
  ctx.beginPath();
  ctx.arc(128, 128, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.strokeRect(2, 2, 252, 252);

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 6);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createClayRoofTexture(hex = '#b35432') {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d');
  ctx.fillStyle = hex;
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 16; i++) {
    const x = i * 16;
    ctx.fillStyle = 'rgba(0,0,0,0.14)';
    ctx.fillRect(x, 0, 3, 256);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(x + 4, 0, 4, 256);
  }
  for (let j = 0; j < 8; j++) {
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fillRect(0, j * 32, 256, 2);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 8);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createCheckerFloorTexture(c1 = '#efe9dd', c2 = '#dfd5c3', repeatX = 6, repeatY = 6) {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = c1;
  ctx.fillRect(0, 0, 128, 128);
  ctx.fillStyle = c2;
  ctx.fillRect(0, 0, 64, 64);
  ctx.fillRect(64, 64, 64, 64);
  ctx.strokeStyle = 'rgba(0,0,0,0.08)';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// --- Materials ---
const mats = {
  grass: new THREE.MeshStandardMaterial({ color: 0x769e5b, roughness: 0.95 }),
  compound: new THREE.MeshStandardMaterial({ color: 0xe6decb, roughness: 0.85 }),
  plinth: new THREE.MeshStandardMaterial({ color: 0x8c7b6b, roughness: 0.88 }),
  wall: new THREE.MeshStandardMaterial({ color: 0xf6f1e7, roughness: 0.75 }),
  wallCutCap: new THREE.MeshStandardMaterial({ color: 0xd9cbb8, roughness: 0.6 }),
  redOxide: new THREE.MeshStandardMaterial({ color: 0x9e3b2b, roughness: 0.35, metalness: 0.05 }),
  athangudi: new THREE.MeshStandardMaterial({ map: createAthangudiTileTexture(), roughness: 0.4 }),
  bedFloor: new THREE.MeshStandardMaterial({ map: createCheckerFloorTexture('#f3ede2', '#e4d9c5', 5, 6), roughness: 0.5 }),
  bathFloor: new THREE.MeshStandardMaterial({ map: createCheckerFloorTexture('#d8e6e7', '#bcd2d4', 4, 4), roughness: 0.35 }),
  kitchenFloor: new THREE.MeshStandardMaterial({ map: createCheckerFloorTexture('#ece2d0', '#d8c8b0', 5, 5), roughness: 0.45 }),
  storeFloor: new THREE.MeshStandardMaterial({ color: 0xcbbfa8, roughness: 0.7 }),
  parkingFloor: new THREE.MeshStandardMaterial({ map: createCheckerFloorTexture('#94999c', '#7f8588', 4, 6), roughness: 0.85 }),
  mutramWell: new THREE.MeshStandardMaterial({ color: 0xd8cfc0, roughness: 0.8 }),
  teak: new THREE.MeshStandardMaterial({ color: 0x5c361e, roughness: 0.55 }),
  teakLight: new THREE.MeshStandardMaterial({ color: 0x875433, roughness: 0.6 }),
  brass: new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.25, metalness: 0.85 }),
  granite: new THREE.MeshStandardMaterial({ color: 0x24272a, roughness: 0.25, metalness: 0.15 }),
  roof: new THREE.MeshStandardMaterial({ map: createClayRoofTexture('#b35432'), roughness: 0.68, side: THREE.DoubleSide }),
  glass: new THREE.MeshStandardMaterial({ color: 0x9fd4ee, transparent: true, opacity: 0.42, roughness: 0.1, metalness: 0.1 }),
  skylightGlass: new THREE.MeshStandardMaterial({ color: 0xcff0ff, transparent: true, opacity: 0.28, roughness: 0.08 }),
  fabricCream: new THREE.MeshStandardMaterial({ color: 0xf7f3eb, roughness: 0.85 }),
  fabricIndigo: new THREE.MeshStandardMaterial({ color: 0x334e68, roughness: 0.8 }),
  fabricTerracotta: new THREE.MeshStandardMaterial({ color: 0xc05640, roughness: 0.8 }),
  fabricMustard: new THREE.MeshStandardMaterial({ color: 0xd99b26, roughness: 0.8 }),
  foliage: new THREE.MeshStandardMaterial({ color: 0x3b7a3e, roughness: 0.8 }),
  carBody: new THREE.MeshStandardMaterial({ color: 0x2d4a5e, roughness: 0.25, metalness: 0.5 }),
  ceramic: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 }),
  bananaLeaf: new THREE.MeshStandardMaterial({ color: 0x4d9e34, roughness: 0.5 }),
};

// --- Lighting System ---
const hemiLight = new THREE.HemisphereLight(0xfff8eb, 0x627c54, 0.68);
scene.add(hemiLight);

const sunLight = new THREE.DirectionalLight(0xfff2d6, 1.35);
sunLight.position.set(48, 72, 28);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(2048, 2048);
sunLight.shadow.camera.near = 10;
sunLight.shadow.camera.far = 220;
const d = 55;
sunLight.shadow.camera.left = -d;
sunLight.shadow.camera.right = d;
sunLight.shadow.camera.top = d;
sunLight.shadow.camera.bottom = -d;
sunLight.shadow.bias = -0.0005;
scene.add(sunLight);

// Warm interior lantern lights (used especially in Golden Hour & Festival Night)
const interiorLights = [];
function addWarmPointLight(bx, by, y = 7.5, intensity = 0.6, dist = 22) {
  const pl = new THREE.PointLight(0xffb86c, intensity, dist, 1.5);
  pl.position.set(toX(bx), PLINTH_H + y, toZ(by));
  scene.add(pl);
  interiorLights.push(pl);
}
addWarmPointLight(19, 50, 8, 0.9, 28); // Courtyard Mutram
addWarmPointLight(6.5, 50, 8, 0.7, 24); // Front Living
addWarmPointLight(18, 13, 8, 0.7, 24);  // Dining Hall
addWarmPointLight(5.5, 10, 8, 0.6, 20); // Kitchen
addWarmPointLight(22.5, 7, 6, 0.8, 12); // Pooja Lamp
addWarmPointLight(5.5, 35, 8, 0.5, 20); // Bedroom 1
addWarmPointLight(20, 35, 8, 0.5, 20);  // Bedroom 2

// --- Scene Groups for Interactive Toggling ---
const wallMeshes = []; // Dynamic height scaling
const highWallAssets = []; // Upper lintels/frames hidden in half-wall cutaway
const roofGroup = new THREE.Group();
roofGroup.visible = false; // Default dollhouse view shows interiors clearly
scene.add(roofGroup);

const furnitureGroup = new THREE.Group();
scene.add(furnitureGroup);

const labelsGroup = new THREE.Group();
scene.add(labelsGroup);

const gridGroup = new THREE.Group();
scene.add(gridGroup);

const clickableFloors = [];

// --- Geometry Helper Functions ---
function addBox(w, h, depth, mat, x, y, z, parent = scene, castShadow = true) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, depth), mat);
  m.position.set(x, y, z);
  m.castShadow = castShadow;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

function addCyl(rTop, rBot, h, segs, mat, x, y, z, parent = scene) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, segs), mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

// --- 1. Surroundings, Plot, Plinth & Dimension Grid ---
// Lush village plot (45' × 104' surrounding yard)
addBox(45, 0.3, 104, mats.grass, 0, -0.15, 0, scene, false);

// Paved front road apron
addBox(45, 0.25, 12, mats.parkingFloor, 0, -0.1, toZ(80), scene, false);

// Perimeter compound wall with front gate opening
const cwH = 4.2;
addBox(41, cwH, 0.6, mats.compound, 0, cwH / 2, toZ(-9)); // Rear North compound
addBox(92, cwH, 0.6, mats.compound, toX(-8), cwH / 2, toZ(37)).rotation.y = Math.PI / 2; // West compound
addBox(92, cwH, 0.6, mats.compound, toX(33), cwH / 2, toZ(37)).rotation.y = Math.PI / 2; // East compound
// Front South compound wall with 15' gate opening in front of Parking & Thinnai
addBox(8, cwH, 0.6, mats.compound, toX(-4), cwH / 2, toZ(74.3));
addBox(18, cwH, 0.6, mats.compound, toX(24), cwH / 2, toZ(74.3));
// Gate pillars with brass lanterns
[-0.2, 15.2].forEach((gx) => {
  addBox(1.2, cwH + 1.2, 1.2, mats.plinth, toX(gx), (cwH + 1.2) / 2, toZ(74.3));
  addSphereLamp(toX(gx), cwH + 1.6, toZ(74.3));
});

function addSphereLamp(x, y, z) {
  const m = new THREE.Mesh(
    new THREE.SphereGeometry(0.45, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xfff3c4, emissive: 0xffae42, emissiveIntensity: 0.8 })
  );
  m.position.set(x, y, z);
  scene.add(m);
}

// Coconut / Neem trees in backyard & side yard
function addTree(x, z, h = 16) {
  addCyl(0.35, 0.55, h, 10, mats.teak, x, h / 2, z);
  addCyl(0, 4.2, 5, 12, mats.foliage, x, h + 1, z);
  addCyl(0, 3.2, 4.5, 12, mats.foliage, x, h + 3.2, z);
}
addTree(toX(-4.5), toZ(-4), 15);
addTree(toX(29), toZ(-3), 17);
addTree(toX(29.5), toZ(52), 14);
addTree(toX(-4.5), toZ(66), 13);

// Raised House Plinth (Main house bx: 0..25, by: 0..58, plus Thinnai & Loki Shed)
// Note: Car Parking (bx: 0..11.5, by: 58..74) is at ground + 0.35 ft with a gentle ramp
addBox(25.4, PLINTH_H, 58.4, mats.plinth, toX(12.5), PLINTH_H / 2, toZ(29));
addBox(13.9, PLINTH_H, 16.4, mats.plinth, toX(18.25), PLINTH_H / 2, toZ(66));
// Car parking low slab + ramp
addBox(11.6, 0.35, 16.2, mats.parkingFloor, toX(5.75), 0.18, toZ(66));

// Entrance steps at Thinnai (bx: 11.5..15, by: 73..75.5)
for (let s = 0; s < 3; s++) {
  addBox(4.2, 0.42, 1.1, mats.redOxide, toX(13.25), 0.21 + s * 0.42, toZ(75.2 - s * 0.9));
}
// Rear garden steps from Rear Service Verandah (bx: 11..15, by: -2..0)
for (let s = 0; s < 3; s++) {
  addBox(4.5, 0.42, 1.0, mats.plinth, toX(13), 0.21 + s * 0.42, toZ(-2.0 + s * 0.85));
}

// Architectural Dimension Grid around the 25' × 74' footprint
function buildDimensionGrid() {
  const lineMat = new THREE.LineBasicMaterial({ color: 0x5c6f68, transparent: true, opacity: 0.32 });
  const pts = [];
  for (let x = 0; x <= 25; x += 5) {
    pts.push(new THREE.Vector3(toX(x), 0.05, toZ(0)), new THREE.Vector3(toX(x), 0.05, toZ(74)));
  }
  for (let z = 0; z <= 74; z += 5) {
    pts.push(new THREE.Vector3(toX(0), 0.05, toZ(z)), new THREE.Vector3(toX(25), 0.05, toZ(z)));
  }
  const geom = new THREE.BufferGeometry().setFromPoints(pts);
  gridGroup.add(new THREE.LineSegments(geom, lineMat));
}
buildDimensionGrid();

// --- 2. Room Floors & Interactive Click Targets ---
const ROOMS = [
  {
    id: 'service',
    name: 'Rear Wet Service & Wash Verandah',
    dim: "25′ × 4.5′",
    bx: 0, by: 0, bw: 25, bh: 4.5,
    mat: mats.storeFloor,
    desc: 'Full-width rear utility verandah with outdoor wash counter, traditional grinding stone, and laundry area for festival cooking prep.'
  },
  {
    id: 'kitchen',
    name: 'Spacious Village Kitchen',
    dim: "11.5′ × 12′",
    bx: 0, by: 4.5, bw: 11.5, bh: 12,
    mat: mats.kitchenFloor,
    desc: 'L-shaped black granite counter, dual sink, 4-burner stove, breakfast pass-through counter, and direct access to both Rear Service and Walk-in Pantry.'
  },
  {
    id: 'pantry',
    name: 'Walk-in Pantry',
    dim: "6′ × 6′",
    bx: 0, by: 16.5, bw: 6, bh: 6,
    mat: mats.kitchenFloor,
    desc: 'Dedicated walk-in dry pantry directly off the Kitchen with multi-tier teakwood shelving for festival groceries, oils, and appliances.'
  },
  {
    id: 'store',
    name: 'Lockable Store Room',
    dim: "5.5′ × 6′",
    bx: 6, by: 16.5, bw: 5.5, bh: 6,
    mat: mats.storeFloor,
    desc: 'Separate lockable store room accessed from the central passage for rice sacks, farm produce, folding chairs, and festival supplies.'
  },
  {
    id: 'pooja',
    name: 'Pooja Room (NE Corner)',
    dim: "4.5′ × 5′",
    bx: 20.5, by: 4.5, bw: 4.5, bh: 5,
    mat: mats.redOxide,
    desc: 'Auspicious North-East corner Pooja room with granite altar, glowing brass Kuthuvilakku lamps, and double carved bell doors.'
  },
  {
    id: 'dining',
    name: 'Festival Dining Hall',
    dim: "13.5′ × 18′",
    bx: 11.5, by: 4.5, bw: 13.5, bh: 18,
    mat: mats.athangudi,
    desc: 'Grand dining hall opposite the Kitchen with an 8-seater teak table set with banana leaves (plus ample floor space for festival panthi).'
  },
  {
    id: 'bath1',
    name: 'Attached Bath 1 (Master)',
    dim: "7.5′ × 5′",
    bx: 0, by: 22.5, bw: 7.5, bh: 5,
    mat: mats.bathFloor,
    desc: 'Attached bathroom for Bedroom 1 with glass shower enclosure, vanity sink, WC, and western ventilation window.'
  },
  {
    id: 'dress1',
    name: 'Dressing Alcove 1',
    dim: "3.5′ × 5′",
    bx: 7.5, by: 22.5, bw: 3.5, bh: 5,
    mat: mats.bedFloor,
    desc: 'Private dressing vestibule connecting Bedroom 1 to Attached Bath 1.'
  },
  {
    id: 'bath2',
    name: 'Common & Attached Bath 2',
    dim: "7′ × 5′",
    bx: 18, by: 22.5, bw: 7, bh: 5,
    mat: mats.bathFloor,
    desc: 'Dual-access bathroom serving both Bedroom 2 and daytime guests via a 3′×5′ buffer lobby.'
  },
  {
    id: 'lobby2',
    name: 'Bath 2 Buffer Lobby',
    dim: "3′ × 5′",
    bx: 15, by: 22.5, bw: 3, bh: 5,
    mat: mats.bedFloor,
    desc: 'Vestibule giving both Bedroom 2 and Dining/Living guests clean access to Bath 2.'
  },
  {
    id: 'room1',
    name: 'Bedroom 1 (West Suite — Sleeps 3)',
    dim: "11′ × 14.5′",
    bx: 0, by: 27.5, bw: 11, bh: 14.5,
    mat: mats.bedFloor,
    desc: 'Spacious primary bedroom fitted with a King teakwood bed + a single daybed/cot (sleeps 3 comfortably) + full wardrobe.'
  },
  {
    id: 'breezeway',
    name: 'Central Breezeway Passage',
    dim: "4′ × 19.5′",
    bx: 11, by: 22.5, bw: 4, bh: 19.5,
    mat: mats.athangudi,
    desc: 'Athangudi-tiled central spine framed by carved wooden arches, channeling breeze from the Front Courtyard straight to the Dining Hall.'
  },
  {
    id: 'room2',
    name: 'Bedroom 2 (East Suite — Sleeps 3)',
    dim: "10′ × 14.5′",
    bx: 15, by: 27.5, bw: 10, bh: 14.5,
    mat: mats.bedFloor,
    desc: 'Widened 10-ft East bedroom with a Queen teak bed + single daybed (sleeps 3) and windows overlooking the Courtyard.'
  },
  {
    id: 'living',
    name: 'Front Grand Living Pavilion',
    dim: "13.5′ × 16′",
    bx: 0, by: 42, bw: 13.5, bh: 16,
    mat: mats.athangudi,
    desc: 'Wide front living hall completely open to the Central Mutram Courtyard on the East — creating a 25-foot-wide social heart for all 6+ family members.'
  },
  {
    id: 'courtyard',
    name: 'Central Courtyard (Nadumuttam) & Oonjal',
    dim: "11.5′ × 24′",
    bx: 13.5, by: 42, bw: 11.5, bh: 24,
    mat: mats.redOxide,
    desc: 'Traditional pillared courtyard with a sunken 6.5′×10′ open-to-sky well, Tulsi Maadam, red-oxide seating ledges, and brass-chain wooden Oonjal (swing).'
  },
  {
    id: 'parking',
    name: 'Covered Car Parking Portico',
    dim: "11.5′ × 16′",
    bx: 0, by: 58, bw: 11.5, bh: 16,
    mat: mats.parkingFloor,
     isGroundLevel: true,
    desc: 'Front-left covered car portico accommodating an SUV + two-wheelers with direct sheltered steps to the Entrance Thinnai.'
  },
  {
    id: 'thinnai',
    name: 'Front Entrance Thinnai & Vassal',
    dim: "3.5′ × 16′",
    bx: 11.5, by: 58, bw: 3.5, bh: 16,
    mat: mats.redOxide,
    desc: 'Traditional village entrance corridor with raised red-oxide Thinnai bench and carved double teakwood main door.'
  },
  {
    id: 'loki',
    name: 'Loki Shed (Front-East)',
    dim: "10′ × 8′",
    bx: 15, by: 66, bw: 10, bh: 8,
    mat: mats.storeFloor,
    desc: 'Dedicated front-right Loki Shed with terracotta jali ventilation blocks and double doors to the front yard.'
  }
];

ROOMS.forEach((r) => {
  const yBase = r.isGroundLevel ? 0.36 : PLINTH_H;
  const floorMesh = addBox(
    r.bw - 0.08,
    0.12,
    r.bh - 0.08,
    r.mat,
    toX(r.bx + r.bw / 2),
    yBase + 0.06,
    toZ(r.by + r.bh / 2)
  );
  floorMesh.userData = { room: r };
  clickableFloors.push(floorMesh);
});

// Sunken Open-to-Sky Courtyard Well (Mutram: bx 15.8..22.8, by 46..56)
addBox(7.0, 0.16, 10.0, mats.mutramWell, toX(19.3), PLINTH_H - 0.12, toZ(51));
// Granite border curb around the sunken well
addBox(7.4, 0.28, 0.35, mats.plinth, toX(19.3), PLINTH_H + 0.14, toZ(45.9));
addBox(7.4, 0.28, 0.35, mats.plinth, toX(19.3), PLINTH_H + 0.14, toZ(56.1));
addBox(0.35, 0.28, 10.4, mats.plinth, toX(15.7), PLINTH_H + 0.14, toZ(51));
addBox(0.35, 0.28, 10.4, mats.plinth, toX(22.9), PLINTH_H + 0.14, toZ(51));

// --- 3. Precision Architectural Wall, Door, Window & Arch Builder ---
function addDynamicWallPiece(w, hBottom, hTop, thick, x, z, isVertical) {
  const h = hTop - hBottom;
  if (h <= 0.05 || w <= 0.05) return;
  const geom = new THREE.BoxGeometry(isVertical ? thick : w, h, isVertical ? w : thick);
  const mesh = new THREE.Mesh(geom, mats.wall);
  mesh.position.set(x, PLINTH_H + hBottom + h / 2, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData = { hBottom, hTop };
  scene.add(mesh);
  wallMeshes.push(mesh);
}

/**
 * Builds a clean architectural wall along (bx1, by1) -> (bx2, by2)
 * with true cutouts for doors, arches, and windows.
 * openings: [{ offset, width, type: 'door'|'window'|'arch'|'pass', flipDoor }]
 */
function buildWall(bx1, by1, bx2, by2, openings = [], customThickness = 0.55, maxH = FULL_WALL_H) {
  const isVertical = Math.abs(bx1 - bx2) < 0.01;
  const start = isVertical ? Math.min(by1, by2) : Math.min(bx1, bx2);
  const totalLen = isVertical ? Math.abs(by2 - by1) : Math.abs(bx2 - bx1);
  const fixedCoord = isVertical ? bx1 : by1;

  const sorted = [...openings].sort((a, b) => a.offset - b.offset);
  let cursor = 0;

  const placeSpan = (s0, s1, y0, y1) => {
    const segLen = s1 - s0;
    if (segLen <= 0.02) return;
    const mid = start + (s0 + s1) / 2;
    const wx = isVertical ? toX(fixedCoord) : toX(mid);
    const wz = isVertical ? toZ(mid) : toZ(fixedCoord);
    addDynamicWallPiece(segLen, y0, y1, customThickness, wx, wz, isVertical);
  };

  sorted.forEach((op) => {
    const opStart = op.offset - op.width / 2;
    const opEnd = op.offset + op.width / 2;

    // Solid full-height wall before opening
    if (opStart > cursor) {
      placeSpan(cursor, opStart, 0, maxH);
    }

    const mid = start + op.offset;
    const wx = isVertical ? toX(fixedCoord) : toX(mid);
    const wz = isVertical ? toZ(mid) : toZ(fixedCoord);

    if (op.type === 'door') {
      const doorH = 7.0;
      placeSpan(opStart, opEnd, doorH, maxH); // Lintel wall above door
      buildDoorAssembly(wx, wz, op.width, doorH, isVertical, op.swing || 1);
    } else if (op.type === 'arch') {
      const archH = 7.8;
      placeSpan(opStart, opEnd, archH, maxH);
      buildArchAssembly(wx, wz, op.width, archH, isVertical);
    } else if (op.type === 'window') {
      const sill = op.sill ?? 2.6;
      const top = op.top ?? 6.8;
      placeSpan(opStart, opEnd, 0, sill);
      placeSpan(opStart, opEnd, top, maxH);
      buildWindowAssembly(wx, wz, op.width, sill, top, isVertical);
    } else if (op.type === 'pass') {
      // Kitchen pass-through counter opening
      const sill = 3.0;
      const top = 7.0;
      placeSpan(opStart, opEnd, 0, sill);
      placeSpan(opStart, opEnd, top, maxH);
      // Granite serving ledge on sill
      const gw = isVertical ? 1.1 : op.width + 0.2;
      const gd = isVertical ? op.width + 0.2 : 1.1;
      addBox(gw, 0.18, gd, mats.granite, wx, PLINTH_H + sill + 0.09, wz);
    }

    cursor = opEnd;
  });

  if (cursor < totalLen) {
    placeSpan(cursor, totalLen, 0, maxH);
  }
}

function buildDoorAssembly(wx, wz, width, doorH, isVertical, swingDir = 1) {
  const g = new THREE.Group();
  g.position.set(wx, PLINTH_H, wz);
  if (isVertical) g.rotation.y = Math.PI / 2;

  // Teakwood frame jambs & header
  addBox(0.22, doorH, 0.65, mats.teak, -width / 2 + 0.11, doorH / 2, 0, g);
  addBox(0.22, doorH, 0.65, mats.teak, width / 2 - 0.11, doorH / 2, 0, g);
  const header = addBox(width, 0.25, 0.68, mats.teak, 0, doorH - 0.12, 0, g);
  highWallAssets.push(header);

  // Hinged teakwood door leaf (swung slightly open at 38 degrees for clear readability)
  const leafW = width - 0.44;
  const pivot = new THREE.Group();
  pivot.position.set(-width / 2 + 0.22, 0, 0);
  pivot.rotation.y = swingDir * 0.65;
  const leaf = addBox(leafW, doorH - 0.25, 0.16, mats.teakLight, leafW / 2, (doorH - 0.25) / 2, 0, pivot);
  // Brass handle
  addBox(0.12, 0.5, 0.28, mats.brass, leafW - 0.35, 3.3, 0, pivot);
  g.add(pivot);
  highWallAssets.push(leaf);

  scene.add(g);
}

function buildArchAssembly(wx, wz, width, archH, isVertical) {
  const g = new THREE.Group();
  g.position.set(wx, PLINTH_H, wz);
  if (isVertical) g.rotation.y = Math.PI / 2;

  // Carved wooden side pilasters
  addBox(0.35, archH, 0.72, mats.teak, -width / 2 + 0.18, archH / 2, 0, g);
  addBox(0.35, archH, 0.72, mats.teak, width / 2 - 0.18, archH / 2, 0, g);
  // Decorative top timber beam + corbels
  const beam = addBox(width + 0.3, 0.4, 0.78, mats.teak, 0, archH - 0.2, 0, g);
  const c1 = addBox(0.9, 0.55, 0.68, mats.teakLight, -width / 2 + 0.6, archH - 0.65, 0, g);
  const c2 = addBox(0.9, 0.55, 0.68, mats.teakLight, width / 2 - 0.6, archH - 0.65, 0, g);
  highWallAssets.push(beam, c1, c2);

  scene.add(g);
}

function buildWindowAssembly(wx, wz, width, sill, top, isVertical) {
  const h = top - sill;
  const g = new THREE.Group();
  g.position.set(wx, PLINTH_H + sill, wz);
  if (isVertical) g.rotation.y = Math.PI / 2;

  // Frame
  addBox(width, 0.18, 0.65, mats.teak, 0, 0.09, 0, g);
  const topFrame = addBox(width, 0.2, 0.65, mats.teak, 0, h - 0.1, 0, g);
  addBox(0.18, h, 0.65, mats.teak, -width / 2 + 0.09, h / 2, 0, g);
  addBox(0.18, h, 0.65, mats.teak, width / 2 - 0.09, h / 2, 0, g);
  addBox(0.14, h, 0.6, mats.teak, 0, h / 2, 0, g); // Center mullion

  // Glass pane
  const pane = addBox(width - 0.3, h - 0.3, 0.12, mats.glass, 0, h / 2, 0, g, false);
  highWallAssets.push(topFrame, pane);
  scene.add(g);
}

// Traditional Turned Chettinad Pillar (Stone base + tapered teak shaft + capital)
function addChettinadPillar(bx, by, totalH = FULL_WALL_H) {
  const x = toX(bx);
  const z = toZ(by);
  // Sculpted granite base (Padma base)
  addBox(0.95, 0.5, 0.95, mats.plinth, x, PLINTH_H + 0.25, z);
  addBox(0.75, 0.35, 0.75, mats.redOxide, x, PLINTH_H + 0.65, z);
  // Turned teakwood shaft
  const shaftH = totalH - 1.5;
  const shaft = addCyl(0.28, 0.36, shaftH, 16, mats.teak, x, PLINTH_H + 0.8 + shaftH / 2, z);
  // Brass collar ring
  addCyl(0.34, 0.34, 0.16, 16, mats.brass, x, PLINTH_H + 1.6, z);
  // Wooden bracket capital
  const cap1 = addBox(0.85, 0.3, 0.85, mats.teak, x, PLINTH_H + totalH - 0.55, z);
  const cap2 = addBox(1.6, 0.35, 0.65, mats.teakLight, x, PLINTH_H + totalH - 0.22, z);
  highWallAssets.push(cap1, cap2);
  return shaft;
}

// --- 4. Construct All Walls of Unified Front Pavilion & Central Mutram Plan ---

// A. Rear Service Verandah Low Parapet Wall (by = 0, bx: 0..25)
addDynamicWallPiece(11, 0, 3.2, 0.5, toX(5.5), toZ(0), false);
addDynamicWallPiece(10, 0, 3.2, 0.5, toX(20), toZ(0), false);
// Rear Verandah Pillars
[0.4, 8, 17, 24.6].forEach((px) => addChettinadPillar(px, 0.3));

// B. Rear Main Wall (by = 4.5, bx: 0..25) separating Rear Service from Kitchen, Dining & Pooja
buildWall(0, 4.5, 25, 4.5, [
  { offset: 3.2, width: 3.0, type: 'door', swing: -1 },   // Kitchen to Rear Wet Service door
  { offset: 8.2, width: 3.6, type: 'window' },            // Kitchen sink window
  { offset: 14.5, width: 3.4, type: 'door', swing: -1 },  // Dining to Rear Verandah door
  { offset: 18.2, width: 3.2, type: 'window' }            // Dining north window
]);

// C. Pooja Room Enclosure (bx: 20.5..25, by: 4.5..9.5)
buildWall(20.5, 4.5, 20.5, 9.5, []);
buildWall(20.5, 9.5, 25, 9.5, [
  { offset: 2.25, width: 2.8, type: 'door', swing: 1 }    // Pooja double bell door facing South into Dining
]);

// D. Kitchen / Dining Divider Wall (bx = 11.5, by: 4.5..16.5)
buildWall(11.5, 4.5, 11.5, 16.5, [
  { offset: 4.5, width: 4.2, type: 'pass' },              // Breakfast / serving pass-through counter
  { offset: 9.8, width: 3.4, type: 'arch' }               // Open archway between Kitchen and Dining
]);

// E. Pantry & Store Block (bx: 0..11.5, by: 16.5..22.5)
// Wall at by = 16.5 (between Kitchen and Pantry/Store)
buildWall(0, 16.5, 11.5, 16.5, [
  { offset: 3.2, width: 2.8, type: 'door', swing: 1 }     // Kitchen into Walk-in Pantry door
]);
// Divider between Pantry (0..6) and Store (6..11.5)
buildWall(6, 16.5, 6, 22.5, []);
// Store Room East wall facing Dining/Passage (bx = 11.5, by: 16.5..22.5)
buildWall(11.5, 16.5, 11.5, 22.5, [
  { offset: 3.0, width: 3.0, type: 'door', swing: -1 }    // Store Room lockable door
]);
// South wall of Pantry & Store (by = 22.5, bx: 0..11)
buildWall(0, 22.5, 11, 22.5, []);

// F. Mid-House Bedroom & Bathroom Suites (by: 22.5..42)
// Central Breezeway Entrance Arches (bx: 11..15, at by = 22.5 and by = 42)
buildWall(11, 22.5, 15, 22.5, [{ offset: 2.0, width: 3.6, type: 'arch' }]);
buildWall(11, 42, 15, 42, [{ offset: 2.0, width: 3.6, type: 'arch' }]);

// West Wing: Bath 1 (bx: 0..7.5, by: 22.5..27.5) + Dress 1 (bx: 7.5..11) + Bedroom 1 (bx: 0..11, by: 27.5..42)
buildWall(7.5, 22.5, 7.5, 27.5, [
  { offset: 2.5, width: 2.6, type: 'door', swing: -1 }    // Dress 1 into Bath 1
]);
buildWall(0, 27.5, 11, 27.5, [
  { offset: 9.2, width: 2.8, type: 'door', swing: -1 }    // Bedroom 1 into Dress/Bath 1
]);
buildWall(11, 22.5, 11, 42, [
  { offset: 15.8, width: 3.2, type: 'door', swing: -1 }   // Breezeway into Bedroom 1
]);

// East Wing: Lobby 2 (bx: 15..18, by: 22.5..27.5) + Bath 2 (bx: 18..25, by: 22.5..27.5) + Bedroom 2 (bx: 15..25, by: 27.5..42)
buildWall(15, 22.5, 25, 22.5, [
  { offset: 1.5, width: 2.8, type: 'door', swing: 1 }     // Dining into Bath 2 Buffer Lobby
]);
buildWall(18, 22.5, 18, 27.5, [
  { offset: 2.5, width: 2.6, type: 'door', swing: 1 }     // Lobby into Bath 2
]);
buildWall(15, 27.5, 25, 27.5, [
  { offset: 1.5, width: 2.8, type: 'door', swing: 1 }     // Bedroom 2 into Bath 2 Buffer Lobby
]);
buildWall(15, 22.5, 15, 42, [
  { offset: 15.8, width: 3.2, type: 'door', swing: 1 }    // Breezeway into Bedroom 2
]);

// G. Wall between Bedrooms and Front Pavilion (by = 42)
buildWall(0, 42, 11, 42, []); // Solid wall behind Living sofa/seating
buildWall(15, 42, 25, 42, [
  { offset: 5.0, width: 4.2, type: 'window' }             // Bedroom 2 window looking into the sunlit Courtyard!
]);

// H. Unified Front Pavilion (by: 42..58 for Living, by: 42..66 for Courtyard)
// Notice: NO dividing wall at bx = 13.5 between Living and Courtyard! Instead, 2 Chettinad pillars define the pavilion line:
addChettinadPillar(13.5, 46);
addChettinadPillar(13.5, 54);

// 4 Corner Chettinad Pillars around the Sunken Open-to-Sky Courtyard Well (bx: 15.8..22.8, by: 46..56)
addChettinadPillar(15.8, 46);
addChettinadPillar(22.8, 46);
addChettinadPillar(15.8, 56);
addChettinadPillar(22.8, 56);

// Front Wall of Grand Living Hall (by = 58, bx: 0..15)
buildWall(0, 58, 15, 58, [
  { offset: 5.8, width: 4.8, type: 'window' },            // Wide front window facing Car Portico
  { offset: 13.25, width: 3.4, type: 'door', swing: -1 }  // Grand Teakwood Main Entrance Door (Vassal) from Thinnai!
]);

// Open Pillared Archway between Entrance Thinnai (bx: 11.5..15, by: 58..66) and Courtyard (bx: 15..25)
addChettinadPillar(15, 62);
addChettinadPillar(15, 66);

// I. Loki Shed Enclosure (bx: 15..25, by: 66..74)
buildWall(15, 66, 25, 66, []); // North wall of Loki Shed (backs onto Courtyard sit-out)
buildWall(15, 66, 15, 74, []); // West wall of Loki Shed (borders Entrance Thinnai)
buildWall(15, 74, 25, 74, [
  { offset: 5.0, width: 4.0, type: 'door', swing: 1 }     // Loki Shed front double door
]);

// J. Exterior West & East Perimeter Walls (bx = 0 and bx = 25)
// West Exterior Wall (bx = 0, by: 4.5..58)
buildWall(0, 4.5, 0, 58, [
  { offset: 6.0, width: 3.8, type: 'window' },            // Kitchen west window
  { offset: 20.5, width: 2.2, type: 'window', sill: 4.8, top: 6.8 }, // Bath 1 high ventilator
  { offset: 30.2, width: 4.5, type: 'window' },           // Bedroom 1 west window
  { offset: 45.5, width: 5.0, type: 'window' }            // Front Living west window
]);

// East Exterior Wall (bx = 25, by: 4.5..74)
buildWall(25, 4.5, 25, 74, [
  { offset: 2.5, width: 2.2, type: 'window', sill: 3.5, top: 6.2 },  // Pooja east morning-sun window
  { offset: 10.5, width: 4.5, type: 'window' },           // Dining east window
  { offset: 20.5, width: 2.2, type: 'window', sill: 4.8, top: 6.8 }, // Bath 2 high ventilator
  { offset: 30.2, width: 4.5, type: 'window' },           // Bedroom 2 east window
  { offset: 46.5, width: 5.2, type: 'window' },           // Courtyard east breeze window 1
  { offset: 55.5, width: 4.2, type: 'window' },           // Courtyard east breeze window 2
  { offset: 65.5, width: 3.2, type: 'window', sill: 3.8, top: 6.5 }  // Loki Shed east window
]);

// K. Car Portico & Front Thinnai Pillars + Parapet (by: 58..74)
addChettinadPillar(0.5, 66);
addChettinadPillar(0.5, 73.5);
addChettinadPillar(11.5, 66);
addChettinadPillar(11.5, 73.5);
addChettinadPillar(15, 73.5);
// Raised red-oxide Thinnai bench along the east side of the entrance porch (bx: 13.6..14.8, by: 66.5..73)
addBox(1.3, 1.6, 6.2, mats.redOxide, toX(14.2), PLINTH_H + 0.8, toZ(69.7));

// --- 5. Furniture, Fixtures & Traditional Village Details ---
function buildAllFurniture() {
  const Y = PLINTH_H + 0.12;

  // 1. CENTRAL COURTYARD (MUTRAM): Tulsi Maadam + Hanging Oonjal (Swing) + Bench
  // Sacred Tulsi Maadam in center of sunken well (bx: 19.3, by: 51)
  addBox(1.8, 1.2, 1.8, mats.plinth, toX(19.3), PLINTH_H + 0.4, toZ(51), furnitureGroup);
  addBox(1.3, 1.1, 1.3, mats.wall, toX(19.3), PLINTH_H + 1.45, toZ(51), furnitureGroup);
  addBox(1.55, 0.22, 1.55, mats.redOxide, toX(19.3), PLINTH_H + 2.05, toZ(51), furnitureGroup);
  addCyl(0.55, 0.35, 1.4, 10, mats.foliage, toX(19.3), PLINTH_H + 2.8, toZ(51), furnitureGroup);

  // Traditional Teakwood Oonjal (Swing) with 4 Brass Chains at bx: 19.3, by: 44.2
  addBox(4.8, 0.22, 2.0, mats.teak, toX(19.3), Y + 1.65, toZ(44.2), furnitureGroup);
  addBox(4.4, 0.12, 1.7, mats.fabricMustard, toX(19.3), Y + 1.8, toZ(44.2), furnitureGroup);
  // 4 Brass Chains up to ceiling beam
  [[-2.1, -0.8], [2.1, -0.8], [-2.1, 0.8], [2.1, 0.8]].forEach(([dx, dz]) => {
    addCyl(0.04, 0.04, 7.2, 8, mats.brass, toX(19.3 + dx), Y + 5.3, toZ(44.2 + dz), furnitureGroup);
  });
  const oonjalBeam = addBox(6.8, 0.4, 0.5, mats.teak, toX(19.3), PLINTH_H + FULL_WALL_H - 0.3, toZ(44.2), furnitureGroup);
  highWallAssets.push(oonjalBeam);

  // Built-in Courtyard sit-out bench at south end of Mutram (bx: 19.5, by: 64.5)
  addBox(7.5, 1.4, 2.2, mats.redOxide, toX(19.5), Y + 0.7, toZ(64.5), furnitureGroup);
  addBox(7.2, 0.25, 2.0, mats.fabricTerracotta, toX(19.5), Y + 1.5, toZ(64.5), furnitureGroup);

  // 2. FRONT GRAND LIVING PAVILION (bx: 0..13.5, by: 42..58)
  // Woven Dhurrie Rug
  addBox(8.5, 0.04, 10.5, mats.fabricCream, toX(6.8), Y + 0.02, toZ(49.5), furnitureGroup);
  // L-Shaped Teak & Cane Sofa (along North & East side facing West TV / East Mutram)
  addBox(7.5, 1.3, 2.8, mats.teak, toX(6.5), Y + 0.65, toZ(44.2), furnitureGroup);
  addBox(7.2, 0.45, 2.5, mats.fabricIndigo, toX(6.5), Y + 1.4, toZ(44.3), furnitureGroup);
  addBox(7.5, 2.6, 0.45, mats.teak, toX(6.5), Y + 1.3, toZ(42.9), furnitureGroup); // Backrest
  // Return arm of L-sofa
  addBox(2.8, 1.3, 5.5, mats.teak, toX(9.8), Y + 0.65, toZ(48.2), furnitureGroup);
  addBox(2.5, 0.45, 5.2, mats.fabricIndigo, toX(9.7), Y + 1.4, toZ(48.2), furnitureGroup);
  addBox(0.45, 2.6, 5.5, mats.teak, toX(11.1), Y + 1.3, toZ(48.2), furnitureGroup);
  // 2 Accent Accent Chairs near front window
  addBox(2.4, 1.4, 2.4, mats.teak, toX(4.2), Y + 0.7, toZ(54.2), furnitureGroup);
  addBox(2.1, 0.4, 2.1, mats.fabricTerracotta, toX(4.2), Y + 1.45, toZ(54.2), furnitureGroup);
  addBox(2.4, 1.4, 2.4, mats.teak, toX(7.8), Y + 0.7, toZ(54.2), furnitureGroup);
  addBox(2.1, 0.4, 2.1, mats.fabricTerracotta, toX(7.8), Y + 1.45, toZ(54.2), furnitureGroup);
  // Carved Teak Coffee Table
  addBox(4.2, 1.2, 2.6, mats.teakLight, toX(5.8), Y + 0.6, toZ(49.2), furnitureGroup);
  addCyl(0.6, 0.6, 0.12, 16, mats.brass, toX(5.8), Y + 1.26, toZ(49.2), furnitureGroup);
  // TV & Media Console on West Wall (bx = 0.9, by = 49.5)
  addBox(1.4, 1.8, 6.5, mats.teak, toX(1.0), Y + 0.9, toZ(49.5), furnitureGroup);
  addBox(0.2, 3.0, 5.0, mats.granite, toX(0.5), Y + 3.6, toZ(49.5), furnitureGroup);

  // 3. BEDROOM 1 (WEST SUITE, bx: 0..11, by: 27.5..42) — Sleeps 3
  // King Bed (6' × 6.5') against West wall
  buildBed(3.6, 33.2, 6.5, 6.0, true, mats.fabricTerracotta);
  // 3rd-Person Single Daybed / Cot (6' × 3') along South wall (bx: 4.2, by: 40.0)
  addBox(6.2, 1.3, 3.0, mats.teak, toX(4.2), Y + 0.65, toZ(40.0), furnitureGroup);
  addBox(5.9, 0.45, 2.8, mats.fabricCream, toX(4.2), Y + 1.4, toZ(40.0), furnitureGroup);
  addBox(1.2, 0.35, 2.4, mats.fabricMustard, toX(1.8), Y + 1.75, toZ(40.0), furnitureGroup);
  // Full Wardrobe along North wall (bx: 3.5, by: 28.5)
  addBox(6.2, 7.2, 1.8, mats.teak, toX(3.6), Y + 3.6, toZ(28.6), furnitureGroup);

  // 4. BEDROOM 2 (EAST SUITE, bx: 15..25, by: 27.5..42) — Sleeps 3
  // Queen Bed (6.5' × 5.2') against East wall
  buildBed(21.4, 33.2, 6.5, 5.2, false, mats.fabricIndigo);
  // 3rd-Person Single Daybed / Cot (6' × 3') along South-East corner (bx: 21.2, by: 39.8)
  addBox(6.0, 1.3, 3.0, mats.teak, toX(21.2), Y + 0.65, toZ(39.8), furnitureGroup);
  addBox(5.7, 0.45, 2.8, mats.fabricCream, toX(21.2), Y + 1.4, toZ(39.8), furnitureGroup);
  addBox(1.2, 0.35, 2.4, mats.fabricTerracotta, toX(23.5), Y + 1.75, toZ(39.8), furnitureGroup);
  // Wardrobe along North wall (bx: 21.5, by: 28.5)
  addBox(5.5, 7.2, 1.8, mats.teak, toX(21.5), Y + 3.6, toZ(28.6), furnitureGroup);

  // 5. BATHROOM 1 & BATHROOM 2 FIXTURES
  // Bath 1 (bx: 0..7.5, by: 22.5..27.5)
  addBox(2.8, 6.8, 0.12, mats.glass, toX(2.8), Y + 3.4, toZ(25.0), furnitureGroup, false); // Shower glass
  addBox(1.6, 1.4, 2.0, mats.ceramic, toX(4.2), Y + 0.7, toZ(23.7), furnitureGroup); // WC
  addBox(2.2, 2.6, 1.5, mats.teak, toX(6.1), Y + 1.3, toZ(26.4), furnitureGroup); // Vanity
  addCyl(0.65, 0.5, 0.35, 16, mats.ceramic, toX(6.1), Y + 2.75, toZ(26.4), furnitureGroup);
  // Bath 2 (bx: 18..25, by: 22.5..27.5)
  addBox(2.8, 6.8, 0.12, mats.glass, toX(22.2), Y + 3.4, toZ(25.0), furnitureGroup, false);
  addBox(1.6, 1.4, 2.0, mats.ceramic, toX(20.6), Y + 0.7, toZ(23.7), furnitureGroup);
  addBox(2.2, 2.6, 1.5, mats.teak, toX(19.2), Y + 1.3, toZ(26.4), furnitureGroup);
  addCyl(0.65, 0.5, 0.35, 16, mats.ceramic, toX(19.2), Y + 2.75, toZ(26.4), furnitureGroup);

  // 6. FESTIVAL DINING HALL (bx: 11.5..25, by: 4.5..22.5)
  // 8-Seater Solid Teak Dining Table (3.8' × 8.5') centered at bx: 18.2, by: 14.2
  addBox(3.8, 2.5, 8.5, mats.teak, toX(18.2), Y + 1.25, toZ(14.2), furnitureGroup);
  // 8 Dining Chairs + 8 Green Banana Leaves (Vazhai Ilai) on table!
  [-3.0, -1.0, 1.0, 3.0].forEach((dz) => {
    // Left chairs & banana leaves
    addBox(1.6, 1.6, 1.6, mats.teakLight, toX(15.6), Y + 0.8, toZ(14.2 + dz), furnitureGroup);
    addBox(1.1, 0.03, 1.4, mats.bananaLeaf, toX(17.1), Y + 2.52, toZ(14.2 + dz), furnitureGroup);
    // Right chairs & banana leaves
    addBox(1.6, 1.6, 1.6, mats.teakLight, toX(20.8), Y + 0.8, toZ(14.2 + dz), furnitureGroup);
    addBox(1.1, 0.03, 1.4, mats.bananaLeaf, toX(19.3), Y + 2.52, toZ(14.2 + dz), furnitureGroup);
  });

  // 7. POOJA ROOM (bx: 20.5..25, by: 4.5..9.5)
  // Raised Granite Peedam + Brass Kuthuvilakku Lamps
  addBox(3.8, 1.2, 1.8, mats.plinth, toX(22.75), Y + 0.6, toZ(5.7), furnitureGroup);
  addCyl(0.18, 0.35, 2.2, 12, mats.brass, toX(21.6), Y + 2.3, toZ(5.8), furnitureGroup);
  addCyl(0.18, 0.35, 2.2, 12, mats.brass, toX(23.9), Y + 2.3, toZ(5.8), furnitureGroup);

  // 8. KITCHEN (bx: 0..11.5, by: 4.5..16.5), PANTRY (bx: 0..6, by: 16.5..22.5) & STORE (bx: 6..11.5, by: 16.5..22.5)
  // L-Shaped Base Cabinets + Black Granite Countertop
  addBox(2.2, 2.7, 11.4, mats.teakLight, toX(1.4), Y + 1.35, toZ(10.5), furnitureGroup);
  addBox(2.4, 0.18, 11.5, mats.granite, toX(1.45), Y + 2.78, toZ(10.5), furnitureGroup);
  addBox(8.6, 2.7, 2.2, mats.teakLight, toX(6.8), Y + 1.35, toZ(5.9), furnitureGroup);
  addBox(8.8, 0.18, 2.4, mats.granite, toX(6.8), Y + 2.78, toZ(5.95), furnitureGroup);
  // Stove & Brass Vessels on West Counter
  addBox(1.6, 0.15, 2.8, mats.ceramic, toX(1.4), Y + 2.92, toZ(11.0), furnitureGroup);
  addCyl(0.45, 0.38, 0.55, 14, mats.brass, toX(1.4), Y + 3.25, toZ(10.3), furnitureGroup);
  addCyl(0.4, 0.35, 0.45, 14, mats.brass, toX(1.4), Y + 3.2, toZ(11.7), furnitureGroup);
  // Dual Sink on North Counter under Window
  addBox(2.8, 0.12, 1.6, mats.ceramic, toX(8.2), Y + 2.88, toZ(5.9), furnitureGroup);
  // Refrigerator in SE corner of Kitchen (bx: 10.0, by: 15.0)
  addBox(2.4, 5.8, 2.4, mats.ceramic, toX(9.9), Y + 2.9, toZ(15.0), furnitureGroup);

  // Walk-in Pantry L-Shelves (bx: 0..6, by: 16.5..22.5)
  [1.2, 2.8, 4.4, 6.0].forEach((sh) => {
    addBox(1.2, 0.12, 5.4, mats.teakLight, toX(0.9), Y + sh, toZ(19.5), furnitureGroup);
    addBox(4.8, 0.12, 1.2, mats.teakLight, toX(3.3), Y + sh, toZ(21.6), furnitureGroup);
  });
  // Store Room Shelves & Grain Sacks (bx: 6..11.5, by: 16.5..22.5)
  [1.2, 3.0, 4.8].forEach((sh) => {
    addBox(1.3, 0.14, 5.4, mats.teak, toX(6.9), Y + sh, toZ(19.5), furnitureGroup);
  });
  // Stacked rice sacks
  addBox(1.8, 0.9, 2.4, mats.fabricCream, toX(9.2), Y + 0.45, toZ(18.0), furnitureGroup);
  addBox(1.7, 0.85, 2.2, mats.fabricMustard, toX(9.2), Y + 1.3, toZ(18.0), furnitureGroup);

  // 9. REAR WET SERVICE VERANDAH (bx: 0..25, by: 0..4.5)
  // Outdoor Heavy Vessel Wash Counter & Traditional Grinding Stone (Attukal)
  addBox(5.5, 2.4, 2.0, mats.plinth, toX(4.5), Y + 1.2, toZ(1.3), furnitureGroup);
  addCyl(0.85, 0.9, 1.6, 16, mats.plinth, toX(9.2), Y + 0.8, toZ(1.4), furnitureGroup);

  // 10. CAR PARKING PORTICO (bx: 0..11.5, by: 58..74): Sleek 3D SUV
  const carG = new THREE.Group();
  carG.position.set(toX(5.8), 0.36, toZ(66.2));
  addBox(6.0, 2.2, 13.2, mats.carBody, 0, 1.6, 0, carG); // Lower body
  addBox(5.2, 1.8, 7.6, mats.carBody, 0, 3.5, -0.6, carG); // Cabin
  addBox(5.3, 1.5, 7.2, mats.glass, 0, 3.5, -0.6, carG, false); // Windows
  // 4 Wheels
  [[-2.9, -4.2], [2.9, -4.2], [-2.9, 4.2], [2.9, 4.2]].forEach(([wx, wz]) => {
    const wheel = addCyl(1.1, 1.1, 0.8, 16, mats.granite, wx, 1.1, wz, carG);
    wheel.rotation.z = Math.PI / 2;
  });
  furnitureGroup.add(carG);
}

function buildBed(bx, by, lenX, widZ, headOnWest, blanketMat) {
  const Y = PLINTH_H + 0.12;
  const x = toX(bx);
  const z = toZ(by);
  // Teak frame & mattress
  addBox(lenX, 1.3, widZ, mats.teak, x, Y + 0.65, z, furnitureGroup);
  addBox(lenX - 0.3, 0.6, widZ - 0.3, mats.fabricCream, x, Y + 1.5, z, furnitureGroup);
  // Headboard
  const hbX = headOnWest ? x - lenX / 2 + 0.2 : x + lenX / 2 - 0.2;
  addBox(0.35, 3.8, widZ, mats.teak, hbX, Y + 1.9, z, furnitureGroup);
  // Blanket throw
  const blX = headOnWest ? x + lenX * 0.18 : x - lenX * 0.18;
  addBox(lenX * 0.52, 0.66, widZ - 0.24, blanketMat, blX, Y + 1.52, z, furnitureGroup);
  // 2 Pillows
  const pX = headOnWest ? x - lenX / 2 + 1.1 : x + lenX / 2 - 1.1;
  addBox(1.3, 0.35, widZ * 0.36, mats.fabricMustard, pX, Y + 1.95, z - widZ * 0.24, furnitureGroup);
  addBox(1.3, 0.35, widZ * 0.36, mats.fabricMustard, pX, Y + 1.95, z + widZ * 0.24, furnitureGroup);
}

buildAllFurniture();

// --- 6. Traditional Pitched Mangalore Tile Roof with Open Courtyard Cutout ---
function buildRoof() {
  const roofY = PLINTH_H + FULL_WALL_H;

  // Rear & Mid House Terrace Slab + Sloped Clay Tile Eaves (by: 0..42, bx: 0..25)
  addBox(26.2, 0.5, 42.5, mats.compound, toX(12.5), roofY + 0.25, toZ(21.25), roofGroup);
  // Terrace parapet walls
  addBox(26.2, 2.4, 0.45, mats.wall, toX(12.5), roofY + 1.45, toZ(0), roofGroup);
  addBox(0.45, 2.4, 42.5, mats.wall, toX(0), roofY + 1.45, toZ(21.25), roofGroup);
  addBox(0.45, 2.4, 42.5, mats.wall, toX(25), roofY + 1.45, toZ(21.25), roofGroup);

  // Sloped Mangalore Tile Pavilion Roof over Front Living, Mutram, Parking & Loki Shed (by: 42..74)
  // Left (West) Pavilion Pitched Roof (bx: -1..15.8, by: 42..74.5)
  const westSlope = addBox(17.2, 0.4, 33.0, mats.roof, toX(7.4), roofY + 2.6, toZ(58.2), roofGroup);
  westSlope.rotation.z = 0.24;

  // Front & Back Courtyard Roof Wings around the Open-to-Sky Mutram Cutout (bx: 15.8..22.8, by: 46..56)
  addBox(10.5, 0.4, 4.5, mats.roof, toX(20.2), roofY + 1.4, toZ(43.8), roofGroup); // North of Mutram well
  addBox(10.5, 0.4, 18.8, mats.roof, toX(20.2), roofY + 1.4, toZ(65.2), roofGroup); // South of Mutram well (over south court & Loki shed)
  addBox(2.8, 0.4, 10.2, mats.roof, toX(24.1), roofY + 1.4, toZ(51.0), roofGroup); // East eave of Mutram well

  // Terracotta coping frame around the Open-to-Sky Mutram Skylight Aperture
  addBox(7.6, 0.8, 0.45, mats.redOxide, toX(19.3), roofY + 1.5, toZ(45.8), roofGroup);
  addBox(7.6, 0.8, 0.45, mats.redOxide, toX(19.3), roofY + 1.5, toZ(56.2), roofGroup);
  addBox(0.45, 0.8, 10.8, mats.redOxide, toX(15.6), roofY + 1.5, toZ(51.0), roofGroup);
  addBox(0.45, 0.8, 10.8, mats.redOxide, toX(23.0), roofY + 1.5, toZ(51.0), roofGroup);
}
buildRoof();

// --- 7. Floating Architectural Room Labels (Sprites) ---
function makeRoomBadge(title, subtitle, accentColor = '#8c3b2b') {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 148;
  const ctx = c.getContext('2d');

  // Pill background
  ctx.fillStyle = 'rgba(255, 252, 245, 0.94)';
  ctx.beginPath();
  ctx.roundRect(12, 12, 488, 124, 24);
  ctx.fill();

  ctx.lineWidth = 5;
  ctx.strokeStyle = accentColor;
  ctx.stroke();

  ctx.fillStyle = '#1f1a15';
  ctx.font = 'bold 34px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, 256, 66);

  ctx.fillStyle = accentColor;
  ctx.font = 'bold 27px monospace';
  ctx.fillText(subtitle, 256, 108);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
  spr.scale.set(7.5, 2.15, 1);
  return spr;
}

const labelSpecs = [
  ['FRONT LIVING', "13.5′ × 16′", 6.5, 50, '#b45309'],
  ['CENTRAL MUTRAM', "11.5′ × 24′ (Open Sky)", 19.3, 51, '#0284c7'],
  ['BEDROOM 1 (3 Pax)', "11′ × 14.5′", 5.5, 35, '#7e22ce'],
  ['BEDROOM 2 (3 Pax)', "10′ × 14.5′", 20.0, 35, '#7e22ce'],
  ['BATH 1', "7.5′ × 5′", 3.8, 25, '#a21caf'],
  ['BATH 2', "7′ × 5′", 21.5, 25, '#a21caf'],
  ['KITCHEN', "11.5′ × 12′", 5.8, 10.5, '#c2410c'],
  ['PANTRY', "6′ × 6′", 3.0, 19.5, '#c2410c'],
  ['STORE', "5.5′ × 6′", 8.8, 19.5, '#15803d'],
  ['DINING HALL', "13.5′ × 18′", 18.0, 14.0, '#c2410c'],
  ['POOJA', "4.5′ × 5′", 22.8, 7.0, '#15803d'],
  ['REAR SERVICE', "25′ × 4.5′", 12.5, 2.2, '#475569'],
  ['CAR PARKING', "11.5′ × 16′", 5.8, 66.0, '#475569'],
  ['THINNAI ENTRY', "3.5′ × 16′", 13.2, 63.0, '#b45309'],
  ['LOKI SHED', "10′ × 8′", 20.0, 70.0, '#475569'],
];

labelSpecs.forEach(([title, sub, bx, by, col]) => {
  const spr = makeRoomBadge(title, sub, col);
  spr.position.set(toX(bx), PLINTH_H + 5.8, toZ(by));
  labelsGroup.add(spr);
});

// Compass Direction Markers on Ground
const northBadge = makeRoomBadge('▲ REAR / BACKYARD', '25′ Width (0′ Line)', '#15803d');
northBadge.scale.set(11, 3.1, 1);
northBadge.position.set(0, 2.2, toZ(-5.5));
scene.add(northBadge);

const southBadge = makeRoomBadge('▼ FRONT ENTRANCE / ROAD', '25′ Width (74′ Line)', '#b91c1c');
southBadge.scale.set(12, 3.3, 1);
southBadge.position.set(0, 2.2, toZ(79.5));
scene.add(southBadge);

// --- 8. Interactive UI Controls, Camera Presets & Raycasting ---
function setWallMode(mode) {
  const targetH = mode === 'half' ? HALF_WALL_H : FULL_WALL_H;
  roofGroup.visible = mode === 'rooftop';

  wallMeshes.forEach((m) => {
    const { hBottom, hTop } = m.userData;
    const origH = hTop - hBottom;
    if (hBottom >= targetH) {
      m.visible = false;
    } else {
      m.visible = true;
      const clampedTop = Math.min(hTop, targetH);
      const newH = clampedTop - hBottom;
      m.scale.y = newH / origH;
      m.position.y = PLINTH_H + hBottom + newH / 2;
    }
  });

  highWallAssets.forEach((a) => {
    a.visible = mode !== 'half';
  });
}

// Camera Presets with Smooth Interpolation
let camAnim = null;
const CAM_PRESETS = {
  iso:      { pos: new THREE.Vector3(52, 46, 62), target: new THREE.Vector3(0, 3, 4) },
  top:      { pos: new THREE.Vector3(0, 96, 4),   target: new THREE.Vector3(0, 0, 0) },
  pavilion: { pos: new THREE.Vector3(24, 22, 42), target: new THREE.Vector3(1, 3, 14) },
  walk:     { pos: new THREE.Vector3(0.5, 6.6, 26), target: new THREE.Vector3(2.5, 5.2, 8) },
  kitchen:  { pos: new THREE.Vector3(-24, 24, -34), target: new THREE.Vector3(0, 3, -22) }
};

function flyToPreset(key) {
  const p = CAM_PRESETS[key];
  if (!p) return;
  camAnim = {
    startPos: camera.position.clone(),
    endPos: p.pos.clone(),
    startTarget: controls.target.clone(),
    endTarget: p.target.clone(),
    t: 0
  };
}

document.querySelectorAll('[data-cam]').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-cam]').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    flyToPreset(btn.dataset.cam);
  });
});

document.querySelectorAll('#wallModeGroup .seg-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#wallModeGroup .seg-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    setWallMode(btn.dataset.mode);
  });
});

document.querySelectorAll('#lightModeGroup .seg-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#lightModeGroup .seg-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    const mode = btn.dataset.light;
    if (mode === 'morning') {
      scene.background.setHex(0xdbe7dc);
      scene.fog.color.setHex(0xdbe7dc);
      hemiLight.intensity = 0.68;
      sunLight.intensity = 1.35;
      sunLight.color.setHex(0xfff2d6);
      sunLight.position.set(48, 72, 28);
      interiorLights.forEach((l) => (l.intensity = 0.4));
    } else if (mode === 'golden') {
      scene.background.setHex(0xf3d5b5);
      scene.fog.color.setHex(0xf3d5b5);
      hemiLight.intensity = 0.48;
      sunLight.intensity = 1.45;
      sunLight.color.setHex(0xffb066);
      sunLight.position.set(-60, 28, 35);
      interiorLights.forEach((l) => (l.intensity = 1.1));
    } else if (mode === 'evening') {
      scene.background.setHex(0x16202a);
      scene.fog.color.setHex(0x16202a);
      hemiLight.intensity = 0.22;
      sunLight.intensity = 0.25;
      sunLight.color.setHex(0x6b8cff);
      sunLight.position.set(20, 60, -20);
      interiorLights.forEach((l) => (l.intensity = 2.2));
    }
  });
});

document.getElementById('toggleLabels')?.addEventListener('change', (e) => {
  labelsGroup.visible = e.target.checked;
});
document.getElementById('toggleFurniture')?.addEventListener('change', (e) => {
  furnitureGroup.visible = e.target.checked;
});
document.getElementById('toggleGrid')?.addEventListener('change', (e) => {
  gridGroup.visible = e.target.checked;
});

document.getElementById('wallColor')?.addEventListener('input', (e) => {
  mats.wall.color.set(e.target.value);
});
document.getElementById('roofColor')?.addEventListener('input', (e) => {
  mats.roof.map = createClayRoofTexture(e.target.value);
  mats.roof.needsUpdate = true;
});
document.getElementById('oxideColor')?.addEventListener('input', (e) => {
  mats.redOxide.color.set(e.target.value);
});

// Raycasting to click and inspect rooms
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let downPos = { x: 0, y: 0 };

renderer.domElement.addEventListener('pointerdown', (e) => {
  downPos = { x: e.clientX, y: e.clientY };
});

renderer.domElement.addEventListener('pointerup', (e) => {
  if (Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y) > 5) return;
  pointer.x = (e.clientX / innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(clickableFloors);
  if (hits.length > 0) {
    const r = hits[0].object.userData.room;
    if (r) {
      document.getElementById('infoDim').textContent = r.dim;
      document.getElementById('infoName').textContent = r.name;
      document.getElementById('infoDesc').textContent = r.desc;
    }
  }
});

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  if (camAnim) {
    camAnim.t += 0.045;
    const ease = 1 - Math.pow(1 - Math.min(camAnim.t, 1), 3);
    camera.position.lerpVectors(camAnim.startPos, camAnim.endPos, ease);
    controls.target.lerpVectors(camAnim.startTarget, camAnim.endTarget, ease);
    if (camAnim.t >= 1) camAnim = null;
  }
  controls.update();
  renderer.render(scene, camera);
}
animate();
