'use strict';

/* =========================================================
 *  Viste a Luna 3D — juego de vestir e interactuar
 *  El personaje se construye con geometría procedural de three.js.
 *  Unidades en metros; los pies están en y = 0.
 * ========================================================= */

const SAVE_KEY = 'viste-a-luna-3d-v1';
const T = THREE;

const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;

// ---------- Paletas ----------
const PALETTE = ['#ff7aa8', '#e04f5f', '#ff9f43', '#ffd166', '#7bd389', '#4ecdc4',
  '#4a90e2', '#3b4a8a', '#9b6dd6', '#f5f5f5', '#2d2d34', '#c8a27a'];
const HAIR_COLORS = ['#2b1b14', '#4a2c1a', '#8a5a33', '#d9a55b', '#f2d48a', '#b8432f',
  '#e88fb5', '#7a6ad8', '#5fb3c9', '#e9e9ef'];
const EYE_COLORS = ['#4a7bd0', '#5a3a22', '#3e9a5a', '#8a5ad6', '#6b6b6b', '#d08a2a'];
const LIP_COLORS = ['#d9667a', '#c0394f', '#ef8f9f', '#a8545f', '#d97a5a'];
const SKIN_COLORS = ['#fde3cf', '#f5d0b5', '#e8b48f', '#c98d63', '#a26a45', '#6e452c'];
const BASE_LAYER = '#ece6f2';

// ---------- Figura (deslizadores) ----------
const BODY_SLIDERS = [
  { id: 'height', name: 'Altura', min: .9, max: 1.1 },
  { id: 'bust', name: 'Busto', min: .6, max: 1.5 },
  { id: 'waist', name: 'Cintura', min: .8, max: 1.2 },
  { id: 'hips', name: 'Caderas', min: .85, max: 1.25 },
  { id: 'glutes', name: 'Glúteos', min: .7, max: 1.4 },
  { id: 'legs', name: 'Piernas', min: .8, max: 1.25 },
  { id: 'shoulders', name: 'Hombros', min: .9, max: 1.12 },
];

// ---------- Catálogo de ropa ----------
// tags: ocasiones en las que encaja la prenda (para los retos de estilo)
const CATEGORIES = [
  { id: 'top', name: 'Arriba' }, { id: 'bottom', name: 'Abajo' }, { id: 'dress', name: 'Vestidos' },
  { id: 'shoes', name: 'Zapatos' }, { id: 'hat', name: 'Sombreros' }, { id: 'glasses', name: 'Gafas' },
  { id: 'earrings', name: 'Pendientes' }, { id: 'necklace', name: 'Collares' }, { id: 'bag', name: 'Bolsos' },
];

const ITEMS = {
  top: {
    tshirt: { name: 'Camiseta', icon: '👕', tags: ['casual', 'parque'], color: '#ff7aa8' },
    sweater: { name: 'Suéter', icon: '🧶', tags: ['invierno', 'oficina', 'casual'], color: '#9b6dd6' },
    blouse: { name: 'Blusa', icon: '👚', tags: ['oficina', 'cita'], color: '#f5f5f5' },
    crop: { name: 'Top corto', icon: '🎽', tags: ['playa', 'fiesta'], color: '#ffd166' },
    jacket: { name: 'Chaqueta', icon: '🧥', tags: ['invierno', 'cita', 'oficina'], color: '#3b4a8a' },
  },
  bottom: {
    jeans: { name: 'Vaqueros', icon: '👖', tags: ['casual', 'parque', 'invierno', 'cita'], color: '#4a90e2' },
    pants: { name: 'Pantalón de vestir', icon: '🤵', tags: ['oficina'], color: '#2d2d34' },
    skirt: { name: 'Falda', icon: '🌸', tags: ['cita', 'oficina', 'parque'], color: '#e04f5f' },
    mini: { name: 'Minifalda', icon: '✨', tags: ['fiesta', 'cita'], color: '#2d2d34' },
    shorts: { name: 'Shorts', icon: '🩳', tags: ['playa', 'parque'], color: '#4ecdc4' },
  },
  dress: {
    sundress: { name: 'Vestido de verano', icon: '👗', tags: ['playa', 'parque', 'cita'], color: '#ffd166' },
    party: { name: 'Vestido de fiesta', icon: '💃', tags: ['fiesta', 'cita'], color: '#e2558f' },
    gown: { name: 'Vestido largo', icon: '👑', tags: ['fiesta', 'cita'], color: '#3b4a8a' },
  },
  shoes: {
    sneakers: { name: 'Zapatillas', icon: '👟', tags: ['casual', 'parque'], color: '#f5f5f5' },
    boots: { name: 'Botas', icon: '🥾', tags: ['invierno', 'cita'], color: '#8a5a33' },
    heels: { name: 'Tacones', icon: '👠', tags: ['fiesta', 'oficina', 'cita'], color: '#e04f5f' },
    sandals: { name: 'Sandalias', icon: '🩴', tags: ['playa'], color: '#c8a27a' },
  },
  hat: {
    sunhat: { name: 'Pamela', icon: '👒', tags: ['playa', 'parque'], color: '#e8c07a' },
    beanie: { name: 'Gorro', icon: '❄️', tags: ['invierno'], color: '#e04f5f' },
    cap: { name: 'Gorra', icon: '🧢', tags: ['parque', 'casual'], color: '#4a90e2' },
    flowers: { name: 'Corona de flores', icon: '🌼', tags: ['cita', 'parque'], color: '#ff7aa8' },
  },
  glasses: {
    round: { name: 'Gafas redondas', icon: '👓', tags: ['oficina', 'casual'], color: '#2d2d34' },
    sun: { name: 'Gafas de sol', icon: '🕶️', tags: ['playa', 'parque'], color: '#2d2d34' },
  },
  earrings: {
    hoops: { name: 'Aros', icon: '⭕', tags: ['fiesta', 'casual'], color: '#ffd166' },
    pearls: { name: 'Perlas', icon: '⚪', tags: ['oficina', 'cita'], color: '#f5f5f5' },
  },
  necklace: {
    chain: { name: 'Colgante', icon: '💖', tags: ['cita', 'casual'], color: '#ffd166' },
    pearls: { name: 'Collar de perlas', icon: '📿', tags: ['oficina', 'fiesta'], color: '#f5f5f5' },
  },
  bag: {
    tote: { name: 'Bolso grande', icon: '👜', tags: ['oficina', 'parque', 'playa'], color: '#c8a27a' },
    clutch: { name: 'Bolso de mano', icon: '👛', tags: ['fiesta', 'cita'], color: '#ffd166' },
  },
};

const HAIR = { long: 'Largo', wavy: 'Ondulado', bob: 'Media melena', ponytail: 'Coleta', buns: 'Moños' };

// ---------- Escenarios ----------
const BACKGROUNDS = {
  room: { name: 'Habitación', emoji: '🛏️', sky: '#ffe4ef', floor: '#d9a77a' },
  beach: { name: 'Playa', emoji: '🏖️', sky: '#8fd8ff', floor: '#f4dca6' },
  park: { name: 'Parque', emoji: '🌳', sky: '#bfe8ff', floor: '#7bd389' },
  city: { name: 'Ciudad de noche', emoji: '🌃', sky: '#1c1e4a', floor: '#3a3460' },
  party: { name: 'Fiesta', emoji: '🎉', sky: '#2b1040', floor: '#1a0a26' },
  office: { name: 'Oficina', emoji: '🏢', sky: '#e6edf5', floor: '#9aa9b8' },
  snow: { name: 'Invierno', emoji: '❄️', sky: '#cfe2f5', floor: '#ffffff' },
};

// ---------- Retos, regalos, niveles y diálogos ----------
const EVENTS = {
  playa: { name: 'un día de playa', emoji: '🏖️', bg: 'beach', bad: ['invierno', 'oficina'] },
  fiesta: { name: 'una fiesta', emoji: '🎉', bg: 'party', bad: ['invierno', 'playa'] },
  oficina: { name: 'su primer día en la oficina', emoji: '💼', bg: 'office', bad: ['playa', 'fiesta'] },
  cita: { name: 'una cena en la ciudad', emoji: '🌃', bg: 'city', bad: ['playa'] },
  invierno: { name: 'un paseo en la nieve', emoji: '❄️', bg: 'snow', bad: ['playa'] },
  parque: { name: 'un picnic en el parque', emoji: '🧺', bg: 'park', bad: ['fiesta'] },
};

const GIFTS = {
  flor: { name: 'Flor', a: 'una flor', other: 'otra flor', emoji: '🌹' },
  cafe: { name: 'Café', a: 'un café', other: 'otro café', emoji: '☕' },
  choco: { name: 'Chocolate', a: 'un chocolate', other: 'otro chocolate', emoji: '🍫' },
  peluche: { name: 'Peluche', a: 'un peluche', other: 'otro peluche', emoji: '🧸' },
  libro: { name: 'Libro', a: 'un libro', other: 'otro libro', emoji: '📚' },
};

const LEVELS = [
  { min: 0, name: 'Desconocidos' }, { min: 15, name: 'Conocidos' }, { min: 35, name: 'Amigos' },
  { min: 60, name: 'Muy cercanos' }, { min: 85, name: 'Enamorados 💕' },
];

// Frases por tramo de afinidad: [baja, media, alta]
const LINES = {
  saludar: [
    ['¡Hola! Soy Luna, encantada. 😊', 'Oh, hola. ¿Nos conocemos?'],
    ['¡Hey! Qué bien verte otra vez.', '¡Hola, hola! ¿Qué tal tu día?'],
    ['¡Por fin llegas! Te estaba esperando. 💖', '¡Hola! Me alegra mucho verte.'],
  ],
  chiste: [
    ['Jaja... ese estuvo bien. 😅', 'Jeje, no está mal.'],
    ['¡JAJAJA! Me encanta tu humor.', 'Jajaja, ese no me lo sabía. ¡Otro!'],
    ['Jajaja, siempre consigues hacerme reír. 💕', '¡Para, que me duele la barriga de reír! 🤣'],
  ],
  bailar: [
    ['¿Bailar? Bueno... solo un poquito. 😳', 'Vale, ¡pero no te rías!'],
    ['¡Me encanta bailar! 🎶', '¡Dale a la música! 💃'],
    ['¡Baila conmigo! 💃🕺', '¡Esta canción es nuestra! 🎶💕'],
  ],
  girar: [
    ['¿Así? 🙂', 'Una vueltecita...'],
    ['¡Tachán! ¿Qué tal por detrás?', '¡Vuelta completa! ✨'],
    ['¿Te gusta cómo me queda? 😊', '¡Tachán! Solo para ti. 💖'],
  ],
  repeat: ['Eso ya me lo has dicho... 🙄', 'Hmm, ¿otra vez lo mismo?', 'Intenta algo distinto, ¿vale? 😒'],
  click: {
    head: ['¡Ey! Me despeinas. 😳', 'Jiji, ¿una caricia en la cabeza? 😊', '¿Tengo algo en el pelo?'],
    hand: ['¡Choca esos cinco! ✋', '¿Me das la mano? 😊', '¡Ups! Qué manos tan frías.'],
    body: ['¿Sí? ¿Necesitas algo?', '¿Qué miras? 😄', 'Oye, sin tocar. 😅'],
  },
};

const FAV_HINTS = {
  top: 'las partes de arriba bonitas', bottom: 'la ropa de abajo cómoda', dress: 'los vestidos',
  shoes: 'los zapatos', hat: 'los sombreros', glasses: 'las gafas', earrings: 'los pendientes',
  necklace: 'los collares', bag: 'los bolsos',
};

// ---------- Estado ----------
function defaultState() {
  const all = [];
  for (const cat in ITEMS) for (const id in ITEMS[cat]) all.push([cat, id]);
  const favs = [];
  while (favs.length < 2) {
    const f = pick(all);
    if (!favs.some(x => x[0] === f[0])) favs.push(f);
  }
  const colors = {};
  for (const c of CATEGORIES) colors[c.id] = Object.values(ITEMS[c.id])[0].color;
  const body = {};
  for (const s of BODY_SLIDERS) body[s.id] = 1;
  return {
    skin: SKIN_COLORS[1], hairStyle: 'long', hairColor: HAIR_COLORS[1],
    eyeColor: EYE_COLORS[0], lip: LIP_COLORS[0], body,
    outfit: { top: 'tshirt', bottom: 'jeans', dress: null, shoes: 'sneakers', hat: null, glasses: null, earrings: null, necklace: null, bag: null },
    colors, bg: 'room', affinity: 0, favs,
    favGift: pick(Object.keys(GIFTS)), giftCounts: {}, challenge: null, clickedItems: [], hintIndex: 0,
  };
}

function loadState() {
  const d = defaultState();
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const s = Object.assign(d, JSON.parse(raw));
      s.body = Object.assign(defaultState().body, s.body);
      return s;
    }
  } catch (e) { /* almacenamiento no disponible */ }
  return d;
}
function saveState() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) { /* ignorar */ }
}

let state = loadState();

/* =========================================================
 *  Motor 3D
 * ========================================================= */

const viewport = document.getElementById('viewport');
const renderer = new T.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = T.SRGBColorSpace;
viewport.appendChild(renderer.domElement);

const scene = new T.Scene();
const camera = new T.PerspectiveCamera(30, 2 / 3, .05, 100);
scene.add(new T.HemisphereLight(0xffffff, 0x8a7a90, 1.6));
const sun = new T.DirectionalLight(0xffffff, 1.6);
sun.position.set(1.5, 3, 2.5);
scene.add(sun);
const fill = new T.DirectionalLight(0xffe0f0, .5);
fill.position.set(-2, 1.5, 1);
scene.add(fill);

// Sombreado tipo "toon" con 3 tonos
const toonRamp = (() => {
  const tex = new T.DataTexture(new Uint8Array([110, 110, 110, 255, 190, 190, 190, 255, 255, 255, 255, 255]), 3, 1);
  tex.minFilter = tex.magFilter = T.NearestFilter;
  tex.needsUpdate = true;
  return tex;
})();
const matCache = new Map();
function mat(color, opts = {}) {
  const key = color + JSON.stringify(opts);
  if (!matCache.has(key)) {
    matCache.set(key, new T.MeshToonMaterial(Object.assign({ color, gradientMap: toonRamp, side: T.DoubleSide }, opts)));
  }
  return matCache.get(key);
}

const world = new T.Group();   // escenario
const root = new T.Group();    // personaje (rota con el ratón)
scene.add(world, root);

// ---------- Geometría auxiliar ----------
// Perfil suave a partir de puntos [radio, coordenada] ordenados por coordenada
function smoothProfile(pts, n = 48) {
  const curve = new T.SplineCurve(pts.map(([r, c]) => new T.Vector2(r, c)));
  return curve.getPoints(n).map(v => [v.x, v.y]);
}
// Recorta un perfil entre dos coordenadas (interpolando los extremos)
function clipProfile(prof, a, b) {
  const out = [];
  const at = c => {
    for (let i = 1; i < prof.length; i++) {
      const [r0, c0] = prof[i - 1], [r1, c1] = prof[i];
      if ((c >= c0 && c <= c1) || (c <= c0 && c >= c1)) return [lerp(r0, r1, (c - c0) / ((c1 - c0) || 1)), c];
    }
    return null;
  };
  const lo = Math.min(a, b), hi = Math.max(a, b);
  const pa = at(lo); if (pa) out.push(pa);
  for (const p of prof) if (p[1] > lo && p[1] < hi) out.push(p);
  const pb = at(hi); if (pb) out.push(pb);
  return out;
}
function lathe(prof, off = 0, phiStart = 0, phiLength = Math.PI * 2) {
  const pts = prof.map(([r, y]) => new T.Vector2(Math.max(.001, r + off), y));
  return new T.LatheGeometry(pts, 40, phiStart, phiLength);
}
function profileRadiusAt(prof, c) {
  const p = clipProfile(prof, c, c)[0];
  return p ? p[0] : 0;
}
function mesh(geo, material, hit, parent) {
  const m = new T.Mesh(geo, material);
  m.userData.hit = hit;
  if (parent) parent.add(m);
  return m;
}
function sphere(r, color, hit, parent, pos, scale) {
  const m = mesh(new T.SphereGeometry(r, 28, 20), mat(color), hit, parent);
  if (pos) m.position.set(...pos);
  if (scale) m.scale.set(...scale);
  return m;
}
function tube(points, radius, color, hit, parent) {
  const curve = new T.CatmullRomCurve3(points.map(p => new T.Vector3(...p)));
  return mesh(new T.TubeGeometry(curve, 20, radius, 8, false), mat(color), hit, parent);
}

// ---------- Medidas del cuerpo según los deslizadores ----------
function bodyMetrics(p) {
  const hipR = .165 * p.hips, waistR = .118 * p.waist, shR = .165 * p.shoulders;
  const torso = smoothProfile([
    [.03, .80], [.10 * p.hips, .815], [hipR * .95, .86], [hipR, .92], [hipR * .96, .98],
    [waistR * 1.08, 1.03], [waistR, 1.08], [.128, 1.15], [.142, 1.23], [.146, 1.30],
    [shR, 1.365], [shR * .75, 1.42], [.05, 1.46],
  ], 60);
  const br = .056 * p.bust;
  const gr = .074 * p.glutes;
  const L = p.legs;
  return {
    torso, zs: .62,
    breast: { r: br, x: .062 + .012 * p.bust, y: 1.262 - .25 * br, z: .088 - .42 * br },
    glute: { r: gr, x: .058 + .006 * p.hips, y: .93, z: -.052 },
    gluteBack: .052 + gr * .9,
    hipR, hipX: .085 * p.hips,
    thigh: smoothProfile([[.088 * L, 0], [.084 * L, .08], [.07 * L, .24], [.053, .4]], 24),
    calf: smoothProfile([[.05, 0], [.054 * Math.sqrt(L), .1], [.044 * Math.sqrt(L), .22], [.033, .37], [.031, .4]], 24),
    upperArm: smoothProfile([[.045, 0], [.042, .08], [.036, .2], [.032, .28]], 16),
    foreArm: smoothProfile([[.032, 0], [.034, .06], [.028, .18], [.024, .25]], 16),
    shoulderX: .168 * p.shoulders,
    armAngle: .1 + .35 * (p.hips - 1) + .12 * (p.legs - 1),
  };
}

// Pieza de torso (y entre a y b) con un desfase de grosor
function torsoPiece(M, a, b, off, color, hit, parent, phi) {
  const g = lathe(clipProfile(M.torso, a, b), off, ...(phi || []));
  const m = mesh(g, mat(color), hit, parent);
  m.scale.z = M.zs;
  return m;
}
// Extremidad colgando hacia -y: perfil [radio, distancia]
function limbPiece(prof, d0, d1, off, color, hit, parent) {
  const pts = clipProfile(prof, d0, d1).map(([r, d]) => [r, -d]).reverse();
  return mesh(lathe(pts, off), mat(color), hit, parent);
}
function breasts(M, off, color, hit, parent) {
  const b = M.breast;
  for (const s of [-1, 1]) sphere(b.r + off, color, hit, parent, [s * b.x, b.y, b.z], [1, .95, .85]);
  // la tela cubre el hueco entre ambos lados
  if (off > 0) sphere(b.r * .85 + off, color, hit, parent, [0, b.y + b.r * .1, b.z - b.r * .12], [b.x / (b.r * .85) + .25, .9, .8]);
}
function glutes(M, off, color, hit, parent) {
  for (const s of [-1, 1]) sphere(M.glute.r + off, color, hit, parent, [s * M.glute.x, M.glute.y, M.glute.z], [1, .95, .9]);
}
// Falda acampanada desde la cintura (yTop) hasta yBottom
function skirt(M, yTop, yBottom, flare, color, hit, parent) {
  const zs = .8;
  const topR = profileRadiusAt(M.torso, yTop) + .016;
  const hipNeed = Math.max(M.hipR + .022, (M.gluteBack + .018) / zs);
  const pts = [];
  const yHip = Math.min(.92, (yTop + yBottom) / 2 + .1);
  pts.push([hipNeed + flare, yBottom]);
  if (yBottom < yHip - .05) pts.push([hipNeed + flare * .35, lerp(yBottom, yHip, .55)]);
  pts.push([hipNeed, yHip]);
  pts.push([topR, yTop]);
  const m = mesh(lathe(smoothProfile(pts, 30)), mat(color), hit, parent);
  m.scale.z = zs;
  return m;
}

// ---------- Construcción del personaje ----------
let rig = null; // referencias para animar

function disposeGroup(g) {
  g.traverse(o => { if (o.geometry) o.geometry.dispose(); });
  g.clear();
}

function buildCharacter() {
  disposeGroup(root);
  const st = state, p = st.body, M = bodyMetrics(p), o = st.outfit, C = st.colors, S = st.skin;
  const body = new T.Group();
  body.scale.setScalar(p.height);
  root.add(body);

  const torsoG = new T.Group();
  body.add(torsoG);

  // Torso y cuello
  torsoPiece(M, .80, 1.46, 0, S, 'body', torsoG);
  breasts(M, 0, S, 'body', torsoG);
  glutes(M, 0, S, 'body', torsoG);
  const neck = mesh(new T.CylinderGeometry(.044, .05, .14, 20), mat(S), 'body', torsoG);
  neck.position.y = 1.5;

  // Ropa básica (siempre puesta)
  torsoPiece(M, 1.0, 1.40, .005, BASE_LAYER, 'body', torsoG);
  breasts(M, .005, BASE_LAYER, 'body', torsoG);
  torsoPiece(M, .80, 1.02, .005, BASE_LAYER, 'body', torsoG);
  glutes(M, .005, BASE_LAYER, 'body', torsoG);

  // Brazos (articulados para animar)
  const arms = {};
  for (const s of [-1, 1]) {
    const sh = new T.Group();
    sh.position.set(s * M.shoulderX, 1.36, 0);
    sh.rotation.z = s * M.armAngle;
    torsoG.add(sh);
    sphere(.045, S, 'body', sh);
    limbPiece(M.upperArm, 0, .28, 0, S, 'body', sh);
    const el = new T.Group();
    el.position.y = -.28;
    sh.add(el);
    sphere(.032, S, 'body', el);
    limbPiece(M.foreArm, 0, .25, 0, S, 'body', el);
    const hand = new T.Group();
    hand.position.y = -.27;
    el.add(hand);
    sphere(.034, S, 'hand', hand, [0, -.01, 0], [.75, 1.2, .5]);
    arms[s] = { sh, el, hand, base: s * M.armAngle };
  }

  // Piernas
  const legs = {};
  for (const s of [-1, 1]) {
    const hip = new T.Group();
    hip.position.set(s * M.hipX, .88, 0);
    hip.rotation.z = s * .025;
    body.add(hip);
    limbPiece(M.thigh, 0, .4, 0, S, 'body', hip);
    const knee = new T.Group();
    knee.position.y = -.4;
    hip.add(knee);
    sphere(.052, S, 'body', knee);
    limbPiece(M.calf, 0, .4, 0, S, 'body', knee);
    const ankle = new T.Group();
    ankle.position.y = -.4;
    knee.add(ankle);
    sphere(.04, S, 'body', ankle, [0, -.035, .04], [.85, .7, 1.9]);
    limbPiece(M.thigh, 0, .07, .005, BASE_LAYER, 'body', hip);
    legs[s] = { hip, knee, ankle };
  }

  // ---- Ropa ----
  const top = o.top, bottom = o.bottom, dress = o.dress;
  const sleeve = (cat, color, upper, fore, off) => {
    for (const s of [-1, 1]) {
      if (upper) limbPiece(M.upperArm, 0, .28 * upper, off, color, cat, arms[s].sh);
      if (upper) sphere(.045 + off, color, cat, arms[s].sh);
      if (fore) limbPiece(M.foreArm, 0, .25 * fore, off, color, cat, arms[s].el);
    }
  };
  const pantsLegs = (cat, color, thighFrac, calfFrac, off) => {
    for (const s of [-1, 1]) {
      limbPiece(M.thigh, 0, .4 * thighFrac, off, color, cat, legs[s].hip);
      if (calfFrac) {
        sphere(.052 + off, color, cat, legs[s].knee);
        limbPiece(M.calf, 0, .4 * calfFrac, off, color, cat, legs[s].knee);
      }
    }
  };

  if (bottom) {
    const c = C.bottom;
    if (bottom === 'jeans' || bottom === 'pants') {
      const off = bottom === 'pants' ? .016 : .011;
      torsoPiece(M, .80, 1.04, off, c, 'bottom', torsoG);
      glutes(M, off, c, 'bottom', torsoG);
      pantsLegs('bottom', c, 1, .96, off);
    } else if (bottom === 'shorts') {
      torsoPiece(M, .80, 1.04, .011, c, 'bottom', torsoG);
      glutes(M, .011, c, 'bottom', torsoG);
      pantsLegs('bottom', c, .32, 0, .013);
    } else if (bottom === 'skirt') {
      skirt(M, 1.04, .5, .1, c, 'bottom', torsoG);
    } else if (bottom === 'mini') {
      skirt(M, 1.04, .7, .03, c, 'bottom', torsoG);
    }
  }

  if (top) {
    const c = C.top;
    if (top === 'tshirt') {
      torsoPiece(M, .97, 1.43, .016, c, 'top', torsoG);
      breasts(M, .016, c, 'top', torsoG);
      sleeve('top', c, .42, 0, .014);
    } else if (top === 'sweater') {
      torsoPiece(M, .9, 1.44, .022, c, 'top', torsoG);
      breasts(M, .022, c, 'top', torsoG);
      sleeve('top', c, 1, .93, .02);
      for (const s of [-1, 1]) {
        const cuff = limbPiece(M.foreArm, .2, .235, .026, shadeHex(c, -.2), 'top', arms[s].el);
        cuff.userData.hit = 'top';
      }
    } else if (top === 'blouse') {
      torsoPiece(M, .97, 1.43, .016, c, 'top', torsoG);
      breasts(M, .016, c, 'top', torsoG);
      for (const s of [-1, 1]) sphere(.062, c, 'top', arms[s].sh, [0, -.04, 0], [1, 1.1, 1]);
      const collar = mesh(new T.TorusGeometry(.062, .012, 8, 24), mat(shadeHex(c, -.1)), 'top', torsoG);
      collar.position.set(0, 1.445, .005);
      collar.rotation.x = Math.PI / 2 - .25;
    } else if (top === 'crop') {
      torsoPiece(M, 1.13, 1.40, .014, c, 'top', torsoG);
      breasts(M, .014, c, 'top', torsoG);
    } else if (top === 'jacket') {
      torsoPiece(M, .9, 1.45, .032, c, 'top', torsoG);
      breasts(M, .03, c, 'top', torsoG);
      sleeve('top', c, 1, .95, .028);
      tube([[0, 1.43, .1], [0, 1.25, .1 + M.breast.r * .9], [0, .95, .115]], .004, shadeHex(c, -.35), 'top', torsoG);
    }
  }

  if (dress) {
    const c = C.dress;
    torsoPiece(M, 1.0, 1.40, .014, c, 'dress', torsoG);
    breasts(M, .014, c, 'dress', torsoG);
    for (const s of [-1, 1]) tube([[s * .07, 1.39, .07], [s * .1, 1.44, .02], [s * .1, 1.40, -.07]], .006, c, 'dress', torsoG);
    if (dress === 'sundress') skirt(M, 1.04, .5, .14, c, 'dress', torsoG);
    if (dress === 'party') skirt(M, 1.04, .7, .05, c, 'dress', torsoG);
    if (dress === 'gown') skirt(M, 1.04, .02, .2, c, 'dress', torsoG);
    const belt = mesh(new T.TorusGeometry(profileRadiusAt(M.torso, 1.04) + .02, .008, 6, 40), mat(shadeHex(c, .35)), 'dress', torsoG);
    belt.position.y = 1.04;
    belt.rotation.x = Math.PI / 2;
    belt.scale.y = M.zs * 1.1;
  }

  if (o.shoes) {
    const c = C.shoes;
    for (const s of [-1, 1]) {
      const a = legs[s].ankle, k = legs[s].knee;
      if (o.shoes === 'sneakers') {
        sphere(.046, c, 'shoes', a, [0, -.035, .04], [.9, .78, 1.95]);
        mesh(new T.BoxGeometry(.085, .018, .19), mat(shadeHex(c, -.3)), 'shoes', a).position.set(0, -.06, .04);
      } else if (o.shoes === 'boots') {
        limbPiece(M.calf, .12, .4, .014, c, 'shoes', k);
        sphere(.046, c, 'shoes', a, [0, -.035, .04], [.9, .78, 1.95]);
      } else if (o.shoes === 'heels') {
        sphere(.043, c, 'shoes', a, [0, -.035, .045], [.88, .72, 1.95]);
        mesh(new T.CylinderGeometry(.007, .004, .05, 8), mat(shadeHex(c, -.3)), 'shoes', a).position.set(0, -.065, -.025);
      } else if (o.shoes === 'sandals') {
        mesh(new T.BoxGeometry(.08, .012, .19), mat(c), 'shoes', a).position.set(0, -.064, .04);
        const strap = mesh(new T.TorusGeometry(.036, .006, 6, 20, Math.PI), mat(c), 'shoes', a);
        strap.position.set(0, -.05, .07);
      }
    }
  }

  if (o.necklace) {
    const c = C.necklace;
    if (o.necklace === 'chain') {
      tube([[-.055, 1.46, .01], [-.04, 1.40, .07], [0, 1.37, .095], [.04, 1.40, .07], [.055, 1.46, .01]], .0025, c, 'necklace', torsoG);
      sphere(.012, '#e2558f', 'necklace', torsoG, [0, 1.355, .1]);
    } else {
      for (let i = 0; i <= 12; i++) {
        const t = i / 12, ang = lerp(-1.2, 1.2, t);
        sphere(.008, c, 'necklace', torsoG, [Math.sin(ang) * .07, 1.44 - Math.cos(ang) * .05, Math.cos(ang) * .085 - .005]);
      }
    }
  }

  if (o.bag) {
    const c = C.bag;
    if (o.bag === 'tote') {
      const b = mesh(new T.BoxGeometry(.2, .18, .07), mat(c), 'bag', arms[1].hand);
      b.position.set(.03, -.16, 0);
      tube([[-.04, -.07, 0], [.03, .02, 0], [.1, -.07, 0]], .006, shadeHex(c, -.2), 'bag', arms[1].hand);
    } else {
      const b = mesh(new T.BoxGeometry(.16, .09, .04), mat(c), 'bag', arms[-1].hand);
      b.position.set(-.02, -.05, .03);
      b.rotation.z = .3;
    }
  }

  // ---- Cabeza ----
  const head = new T.Group();
  head.position.y = 1.66;
  torsoG.add(head);
  sphere(.105, S, 'head', head, [0, 0, 0], [.92, 1.08, 1]);
  for (const s of [-1, 1]) sphere(.02, shadeHex(S, -.06), 'head', head, [s * .097, -.005, -.005], [.6, 1, .8]);
  const face = buildFace(head, st);
  buildHair(head, st);
  buildHeadAccessories(head, st);

  rig = { body, torsoG, head, arms, legs, face };
  applyExpression(expression);
}

function shadeHex(hex, amt) {
  const c = new T.Color(hex);
  const target = amt < 0 ? new T.Color(0, 0, 0) : new T.Color(1, 1, 1);
  return '#' + c.lerp(target, Math.abs(amt)).getHexString();
}

// ---------- Cara ----------
function buildFace(head, st) {
  const face = { eyes: [], mouths: {}, brows: new T.Group(), blush: [] };
  head.add(face.brows);
  const dark = '#2d2028';
  for (const s of [-1, 1]) {
    const x = s * .037, y = .015;
    const open = new T.Group();
    open.position.set(x, y, .088);
    head.add(open);
    sphere(.02, '#ffffff', 'head', open, [0, 0, 0], [1, 1.12, .5]);
    const iris = new T.Group();
    open.add(iris);
    sphere(.0125, st.eyeColor, 'head', iris, [0, -.001, .008], [1, 1.05, .4]);
    sphere(.0062, '#1a1216', 'head', iris, [0, -.001, .0115], [1, 1, .4]);
    sphere(.003, '#ffffff', 'head', iris, [.004, .004, .0135]);
    tube([[-.021, .012, .006], [0, .025, .008], [.021, .012, .006]], .0028, dark, 'head', open);
    const closed = tube([[x - .02, y + .002, .095], [x, y - .008, .099], [x + .02, y + .002, .095]], .0028, dark, 'head', head);
    const happy = tube([[x - .02, y - .006, .095], [x, y + .008, .099], [x + .02, y - .006, .095]], .0028, dark, 'head', head);
    face.eyes.push({ open, iris, closed, happy });
    const blush = mesh(new T.CircleGeometry(.016, 20), mat('#ff7f99', { transparent: true, opacity: .35 }), 'head', head);
    blush.position.set(s * .058, -.022, .084);
    blush.rotation.y = s * .55;
    blush.scale.y = .6;
    face.blush.push(blush);
  }
  const browC = shadeHex(st.hairColor, -.2);
  for (const s of [-1, 1]) {
    const b = tube([[s * .018, .046, .093], [s * .037, .053, .09], [s * .056, .046, .082]], .0032, browC, 'head', face.brows);
    b.userData.side = s;
  }
  sphere(.008, shadeHex(st.skin, -.08), 'head', head, [0, -.014, .105], [1, 1, .8]);

  const lip = st.lip, z = .097, my = -.046;
  const mk = (name, m) => { face.mouths[name] = m; m.visible = false; };
  mk('smile', tube([[-.022, my + .006, z - .003], [0, my - .006, z + .002], [.022, my + .006, z - .003]], .004, lip, 'head', head));
  mk('small', tube([[-.01, my, z], [0, my - .003, z + .001], [.01, my, z]], .0038, lip, 'head', head));
  mk('sad', tube([[-.018, my - .006, z - .002], [0, my + .002, z + .001], [.018, my - .006, z - .002]], .0038, lip, 'head', head));
  mk('pout', tube([[-.012, my - .001, z], [.012, my + .002, z]], .0045, lip, 'head', head));
  const grin = mesh(new T.CircleGeometry(.021, 20, Math.PI, Math.PI), mat(shadeHex(lip, -.15)), 'head', head);
  grin.position.set(0, my + .006, z + .002);
  mk('grin', grin);
  const o = mesh(new T.TorusGeometry(.008, .0035, 8, 16), mat(lip), 'head', head);
  o.position.set(0, my - .004, z + .001);
  o.scale.y = 1.3;
  mk('o', o);
  return face;
}

const EXPRESSIONS = {
  smile: { eyes: ['open', 'open'], mouth: 'smile', blush: .3, brow: 0 },
  happy: { eyes: ['happy', 'happy'], mouth: 'grin', blush: .5, brow: .006 },
  surprised: { eyes: ['wide', 'wide'], mouth: 'o', blush: .3, brow: .01 },
  shy: { eyes: ['side', 'side'], mouth: 'small', blush: .8, brow: -.002, tilt: .12 },
  wink: { eyes: ['open', 'happy'], mouth: 'grin', blush: .4, brow: 0 },
  sad: { eyes: ['open', 'open'], mouth: 'sad', blush: .15, brow: -.004, browRot: -.25 },
  annoyed: { eyes: ['side', 'side'], mouth: 'pout', blush: .2, brow: -.005, browRot: .3 },
  blink: { eyes: ['closed', 'closed'], mouth: 'smile', blush: .3, brow: 0 },
};

function applyExpression(name) {
  if (!rig) return;
  const e = EXPRESSIONS[name] || EXPRESSIONS.smile, f = rig.face;
  f.eyes.forEach((eye, i) => {
    const mode = e.eyes[i];
    eye.open.visible = ['open', 'wide', 'side'].includes(mode);
    eye.closed.visible = mode === 'closed';
    eye.happy.visible = mode === 'happy';
    eye.open.scale.setScalar(mode === 'wide' ? 1.15 : 1);
    eye.iris.position.x = mode === 'side' ? .005 : 0;
  });
  for (const k in f.mouths) f.mouths[k].visible = k === e.mouth;
  f.blush.forEach(b => { b.material = mat('#ff7f99', { transparent: true, opacity: e.blush }); });
  f.brows.position.y = e.brow;
  f.brows.children.forEach(b => { b.rotation.z = (e.browRot || 0) * b.userData.side * .3; });
  rig.headTilt = e.tilt || 0;
}

// ---------- Pelo ----------
function buildHair(head, st) {
  const c = st.hairColor, style = st.hairStyle;
  const g = new T.Group();
  head.add(g);
  const capScale = [.97, 1.1, 1.05];
  const cap = mesh(new T.SphereGeometry(.112, 32, 16, 0, Math.PI * 2, 0, Math.PI * .3), mat(c), 'head', g);
  cap.scale.set(...capScale);
  const back = mesh(new T.SphereGeometry(.113, 32, 16, Math.PI, Math.PI, 0, Math.PI * .8), mat(c), 'head', g);
  back.scale.set(...capScale);
  if (style !== 'ponytail') {
    const bangs = mesh(new T.SphereGeometry(.116, 32, 10, 0, Math.PI, 0, Math.PI * .36), mat(c), 'head', g);
    bangs.scale.set(...capScale);
  } else {
    const swept = mesh(new T.SphereGeometry(.115, 32, 10, 0, Math.PI, 0, Math.PI * .3), mat(c), 'head', g);
    swept.scale.set(...capScale);
  }

  const hang = (len, rTop, rBot, wavy) => {
    const geo = new T.CylinderGeometry(rTop, rBot, len, 40, 12, true, Math.PI / 2 - .55, Math.PI + 1.1);
    if (wavy) {
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
        const k = 1 + .07 * Math.sin(Math.atan2(x, z) * 9 + y * 25) * (.5 - y / len);
        pos.setXYZ(i, x * k, y, z * k);
      }
      geo.computeVertexNormals();
    }
    const m = mesh(geo, mat(c), 'head', g);
    m.position.set(0, -len / 2, -.02);
    m.scale.z = .85;
    return m;
  };
  const locks = len => {
    for (const s of [-1, 1]) {
      const l = mesh(new T.CapsuleGeometry(.024, len, 6, 12), mat(c), 'head', g);
      l.position.set(s * .098, -len / 2 + .01, .03);
      l.rotation.z = s * .08;
      l.scale.z = .7;
    }
  };

  if (style === 'long') { hang(.5, .118, .16); locks(.2); }
  if (style === 'wavy') { hang(.52, .12, .17, true); locks(.22); }
  if (style === 'bob') { hang(.15, .118, .13); locks(.1); }
  if (style === 'ponytail') {
    const tie = mesh(new T.TorusGeometry(.022, .008, 8, 16), mat('#e2558f'), 'head', g);
    tie.position.set(0, .07, -.105);
    tie.rotation.x = .9;
    const tail = mesh(new T.CapsuleGeometry(.038, .26, 8, 16), mat(c), 'head', g);
    tail.position.set(0, -.08, -.15);
    tail.rotation.x = .35;
  }
  if (style === 'buns') {
    for (const s of [-1, 1]) sphere(.05, c, 'head', g, [s * .075, .1, -.03]);
  }
}

// ---------- Accesorios de cabeza ----------
function buildHeadAccessories(head, st) {
  const o = st.outfit, C = st.colors;
  if (o.hat) {
    const c = C.hat;
    const g = new T.Group();
    head.add(g);
    if (o.hat === 'sunhat') {
      mesh(new T.CylinderGeometry(.26, .26, .008, 40), mat(c), 'hat', g).position.y = .085;
      mesh(new T.CylinderGeometry(.105, .12, .09, 32), mat(shadeHex(c, -.06)), 'hat', g).position.y = .13;
      mesh(new T.CylinderGeometry(.121, .121, .022, 32, 1, true), mat('#e2558f'), 'hat', g).position.y = .1;
      g.rotation.x = -.12;
    } else if (o.hat === 'beanie') {
      const cap = mesh(new T.SphereGeometry(.124, 32, 16, 0, Math.PI * 2, 0, Math.PI * .5), mat(c), 'hat', g);
      cap.position.y = .025; cap.scale.set(.98, 1.05, 1.06);
      const band = mesh(new T.TorusGeometry(.12, .018, 8, 32), mat(shadeHex(c, -.18)), 'hat', g);
      band.position.y = .03; band.rotation.x = Math.PI / 2;
      sphere(.03, shadeHex(c, .5), 'hat', g, [0, .16, 0]);
    } else if (o.hat === 'cap') {
      const cap = mesh(new T.SphereGeometry(.12, 32, 16, 0, Math.PI * 2, 0, Math.PI * .5), mat(c), 'hat', g);
      cap.position.y = .03; cap.scale.set(.98, .95, 1.05);
      const visor = mesh(new T.CylinderGeometry(.09, .09, .006, 24, 1, false, -Math.PI / 2, Math.PI), mat(shadeHex(c, -.25)), 'hat', g);
      visor.position.set(0, .035, .1); visor.rotation.x = .12;
      visor.scale.z = .9;
    } else if (o.hat === 'flowers') {
      for (let i = 0; i < 14; i++) {
        const a = i / 14 * Math.PI * 2;
        sphere(.018, i % 2 ? '#ffffff' : c, 'hat', g, [Math.sin(a) * .112, .07, Math.cos(a) * .118]);
        sphere(.007, '#ffd166', 'hat', g, [Math.sin(a) * .128, .072, Math.cos(a) * .134]);
      }
    }
  }
  if (o.glasses) {
    const c = C.glasses;
    for (const s of [-1, 1]) {
      const ring = mesh(new T.TorusGeometry(.024, .0028, 8, 24), mat(c), 'glasses', head);
      ring.position.set(s * .037, .013, .106);
      if (o.glasses === 'sun') {
        const lens = mesh(new T.CircleGeometry(.024, 24), mat('#222', { transparent: true, opacity: .85 }), 'glasses', head);
        lens.position.set(s * .037, .013, .107);
      }
      tube([[s * .06, .015, .098], [s * .095, .018, .04], [s * .1, .012, -.02]], .0022, c, 'glasses', head);
    }
    tube([[-.014, .017, .108], [0, .021, .11], [.014, .017, .108]], .0022, c, 'glasses', head);
  }
  if (o.earrings) {
    const c = C.earrings;
    for (const s of [-1, 1]) {
      if (o.earrings === 'hoops') {
        const h = mesh(new T.TorusGeometry(.016, .0025, 8, 20), mat(c), 'earrings', head);
        h.position.set(s * .1, -.04, .0);
        h.rotation.y = Math.PI / 2;
      } else sphere(.0075, c, 'earrings', head, [s * .1, -.028, .005]);
    }
  }
}

// ---------- Escenarios 3D ----------
function buildWorld() {
  disposeGroup(world);
  world.userData.snow = null;
  const bg = BACKGROUNDS[state.bg];
  scene.background = new T.Color(bg.sky);
  scene.fog = new T.Fog(bg.sky, 6, 16);
  const floor = mesh(new T.CircleGeometry(30, 48), mat(bg.floor), null, world);
  floor.rotation.x = -Math.PI / 2;
  const shadow = mesh(new T.CircleGeometry(.32, 32), new T.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .18 }), null, world);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = .002;
  const box = (w, h, d, c, x, y, z) => { const m = mesh(new T.BoxGeometry(w, h, d), mat(c), null, world); m.position.set(x, y, z); return m; };
  const ball = (r, c, x, y, z, opts) => { const m = mesh(new T.SphereGeometry(r, 20, 14), mat(c, opts), null, world); m.position.set(x, y, z); return m; };
  const tree = (x, z, s = 1) => {
    box(.12 * s, .9 * s, .12 * s, '#8a5a33', x, .45 * s, z);
    ball(.45 * s, '#5cb85c', x, 1.1 * s, z);
  };
  const pine = (x, z, s = 1) => {
    box(.1 * s, .4 * s, .1 * s, '#6b4a2b', x, .2 * s, z);
    for (let i = 0; i < 3; i++) {
      const m = mesh(new T.ConeGeometry((.5 - i * .12) * s, .6 * s, 12), mat('#3e7a5a'), null, world);
      m.position.set(x, (.6 + i * .32) * s, z);
    }
  };

  switch (state.bg) {
    case 'room':
      box(8, 4, .1, '#ffd6e7', 0, 2, -2.2);
      box(1.1, 1.3, .05, '#bfe6ff', 1.3, 1.9, -2.12);
      box(1.1, .05, .06, '#ffffff', 1.3, 1.9, -2.1); box(.05, 1.3, .06, '#ffffff', 1.3, 1.9, -2.1);
      box(1.6, .45, 1, '#f6b6cf', -1.6, .22, -1.4); box(1.6, .15, .3, '#ffffff', -1.6, .5, -1.75);
      box(.5, 1, .4, '#fde1ee', 1.8, .5, -1.8);
      { const rug = mesh(new T.CircleGeometry(.8, 32), mat('#f1a5c3'), null, world); rug.rotation.x = -Math.PI / 2; rug.position.y = .001; }
      break;
    case 'beach': {
      const sea = mesh(new T.PlaneGeometry(60, 20), mat('#3fb0d9'), null, world);
      sea.rotation.x = -Math.PI / 2; sea.position.set(0, .01, -13);
      ball(.8, '#ffe27a', 4, 6, -14, { emissive: '#ffe27a' });
      box(.12, 2.6, .12, '#8a5a33', -1.8, 1.3, -1.6).rotation.z = .12;
      for (let i = 0; i < 5; i++) {
        const leaf = mesh(new T.ConeGeometry(.12, 1.1, 6), mat('#3e9a5a'), null, world);
        leaf.position.set(-1.65, 2.55, -1.6);
        leaf.rotation.set(Math.PI / 2 + .5, i / 5 * Math.PI * 2, 0, 'YXZ');
      }
      const umb = mesh(new T.ConeGeometry(.8, .3, 12), mat('#ff7aa8'), null, world);
      umb.position.set(1.7, 1.7, -1.5);
      box(.04, 1.6, .04, '#ffffff', 1.7, .8, -1.5);
      break;
    }
    case 'park':
      tree(-1.8, -1.5, 1.2); tree(1.9, -2.2, 1.4); tree(-3, -4, 1.5); tree(3, -5, 1.6);
      box(1.2, .06, .4, '#a0703f', 1.4, .42, -1); box(.06, .42, .4, '#6b4a2b', .85, .21, -1); box(.06, .42, .4, '#6b4a2b', 1.95, .21, -1);
      for (let i = 0; i < 25; i++) ball(.025, i % 2 ? '#ff7aa8' : '#ffd166', Math.sin(i * 7) * 2.5, .02, -Math.abs(Math.cos(i * 3)) * 2.5 + .5);
      break;
    case 'city':
      for (let i = 0; i < 9; i++) {
        const h = 2 + (i * 37 % 5), x = -6 + i * 1.5;
        box(1.2, h, 1, i % 2 ? '#2a2550' : '#352f63', x, h / 2, -5 - (i % 3));
        for (let w = 0; w < h * 2; w++) if ((w * 7 + i) % 3) box(.16, .2, .02, '#ffd166', x - .3 + (w % 3) * .3, .5 + Math.floor(w / 3) * .55, -4.48 - (i % 3)).material = mat('#ffd166', { emissive: '#ffb030' });
      }
      ball(.5, '#fff6c8', 3, 6, -12, { emissive: '#fff6c8' });
      for (const x of [-1.6, 1.6]) { box(.05, 2.4, .05, '#555', x, 1.2, -1.2); ball(.12, '#ffe7a0', x, 2.45, -1.2, { emissive: '#ffd166' }); }
      break;
    case 'party': {
      ball(.3, '#dddddd', 0, 3.2, -1, { emissive: '#555' });
      const cols = ['#ff7aa8', '#4ecdc4', '#ffd166', '#9b6dd6'];
      for (let i = 0; i < 60; i++) box(.04, .06, .005, cols[i % 4], Math.sin(i * 12.9) * 3, Math.abs(Math.cos(i * 7.3)) * 3, -1 - Math.abs(Math.sin(i * 3.1)) * 3).rotation.set(i, i * 2, 0);
      for (let i = 0; i < 4; i++) {
        const cone = mesh(new T.ConeGeometry(.9, 3.2, 20, 1, true), new T.MeshBasicMaterial({ color: cols[i], transparent: true, opacity: .12, side: T.DoubleSide, depthWrite: false }), null, world);
        cone.position.set(-2.4 + i * 1.6, 1.6, -2); cone.rotation.z = (i - 1.5) * .2;
      }
      break;
    }
    case 'office':
      box(8, 4, .1, '#dfe8f0', 0, 2, -2.2);
      box(1.4, 1.2, .05, '#bfe6ff', -1.3, 2, -2.12);
      box(1.6, .06, .8, '#c8a27a', 1.5, .75, -1.4); box(.06, .75, .7, '#a07850', .75, .37, -1.4); box(.06, .75, .7, '#a07850', 2.25, .37, -1.4);
      box(.5, .35, .03, '#2d2d34', 1.5, 1.0, -1.6);
      box(.3, .4, .3, '#8a5a33', -2, .2, -1.6); ball(.35, '#7bd389', -2, .7, -1.6);
      break;
    case 'snow': {
      pine(-1.8, -1.8, 1.3); pine(2, -2.5, 1.6); pine(-3.2, -4, 1.8); pine(3.5, -5, 2);
      const n = 300, pos = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) { pos[i * 3] = (Math.random() - .5) * 8; pos[i * 3 + 1] = Math.random() * 4; pos[i * 3 + 2] = (Math.random() - .5) * 6 - 1; }
      const geo = new T.BufferGeometry();
      geo.setAttribute('position', new T.BufferAttribute(pos, 3));
      const pts = new T.Points(geo, new T.PointsMaterial({ color: 0xffffff, size: .035 }));
      world.add(pts);
      world.userData.snow = pts;
      break;
    }
  }
}

// ---------- Cámara y controles ----------
const cam = { yaw: 0, targetYaw: 0, dist: 4.3, targetDist: 4.3, lookY: .95, targetLookY: .95, autoSpin: false };
function setCamPreset(preset) {
  const h = state.body.height;
  if (preset === 'face') { cam.targetDist = 1.1; cam.targetLookY = 1.62 * h; }
  else { cam.targetDist = 4.3; cam.targetLookY = .92 * h; }
  document.getElementById('camFace').classList.toggle('active', preset === 'face');
  document.getElementById('camBody').classList.toggle('active', preset !== 'face');
}

let drag = null;
viewport.addEventListener('pointerdown', e => {
  drag = { x: e.clientX, y: e.clientY, yaw: cam.targetYaw, moved: 0 };
  viewport.setPointerCapture(e.pointerId);
});
viewport.addEventListener('pointermove', e => {
  if (!drag) return;
  const dx = e.clientX - drag.x;
  drag.moved = Math.max(drag.moved, Math.abs(dx) + Math.abs(e.clientY - drag.y));
  cam.targetYaw = drag.yaw + dx * .012;
});
viewport.addEventListener('pointerup', e => {
  if (drag && drag.moved < 6) onCharClick(e);
  drag = null;
});
viewport.addEventListener('wheel', e => {
  e.preventDefault();
  cam.targetDist = clamp(cam.targetDist * (1 + Math.sign(e.deltaY) * .1), .9, 6);
  const t = clamp((4.3 - cam.targetDist) / 3.4, 0, 1);
  cam.targetLookY = lerp(.92, 1.6, t) * state.body.height;
}, { passive: false });

const raycaster = new T.Raycaster();
function onCharClick(e) {
  const r = renderer.domElement.getBoundingClientRect();
  const v = new T.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  raycaster.setFromCamera(v, camera);
  const hit = raycaster.intersectObjects(root.children, true).find(h => h.object.userData.hit);
  if (hit) reactToPart(hit.object.userData.hit);
}

function resize() {
  const w = viewport.clientWidth, h = viewport.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(viewport);

// ---------- Animación ----------
let gesture = null; // { type, t0, dur }
function playGesture(type, dur) { gesture = { type, t0: performance.now() / 1000, dur }; }

let expression = 'smile';
let nextBlink = 2;
const clock = new T.Clock();

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();
  if (cam.autoSpin && !drag) cam.targetYaw += .006;
  cam.yaw = lerp(cam.yaw, cam.targetYaw, .15);
  cam.dist = lerp(cam.dist, cam.targetDist, .1);
  cam.lookY = lerp(cam.lookY, cam.targetLookY, .1);
  camera.position.set(0, cam.lookY + .15 * (cam.dist / 4.3), cam.dist);
  camera.lookAt(0, cam.lookY, 0);

  if (rig) {
    const g = gesture ? (t - gesture.t0) / gesture.dur : 1;
    if (gesture && g >= 1) gesture = null;
    const a = rig.arms, s = Math.sin;
    // reposo
    root.rotation.y = cam.yaw;
    root.position.y = 0;
    rig.torsoG.scale.set(1, 1 + s(t * 2) * .004, 1);
    rig.torsoG.rotation.z = s(t * .8) * .012;
    rig.head.rotation.set(s(t * .7) * .02, s(t * .5) * .05, rig.headTilt || 0);
    for (const k of [-1, 1]) {
      a[k].sh.rotation.set(0, 0, a[k].base + k * s(t * 2) * .01);
      a[k].el.rotation.set(-.12, 0, 0);
    }
    for (const k of [-1, 1]) rig.legs[k].hip.rotation.x = 0, rig.legs[k].knee.rotation.x = 0;

    if (gesture) {
      const env = s(Math.PI * g); // sube y baja
      switch (gesture.type) {
        case 'wave':
          a[1].sh.rotation.z = lerp(a[1].base, 2.7, env);
          a[1].el.rotation.z = env * s(t * 14) * .5;
          a[1].el.rotation.x = 0;
          break;
        case 'bounce':
          root.position.y = Math.abs(s(g * Math.PI * 2)) * .06 * (1 - g);
          break;
        case 'spin':
          root.rotation.y = cam.yaw + g * Math.PI * 2;
          break;
        case 'nod':
          rig.head.rotation.x = s(g * Math.PI * 4) * .15;
          break;
        case 'dance':
          root.position.y = Math.abs(s(t * 8)) * .04;
          rig.torsoG.rotation.z = s(t * 4) * .1;
          root.rotation.y = cam.yaw + s(t * 2) * .5 * env;
          for (const k of [-1, 1]) {
            a[k].sh.rotation.z = lerp(a[k].base, k * (1.6 + s(t * 8 + k) * .6), env);
            a[k].el.rotation.x = -.8 * env;
          }
          for (const k of [-1, 1]) {
            const ph = s(t * 8 + (k > 0 ? Math.PI : 0));
            rig.legs[k].hip.rotation.x = -Math.max(0, ph) * .12 * env;
            rig.legs[k].knee.rotation.x = Math.max(0, ph) * .25 * env;
          }
          break;
        case 'shy':
          for (const k of [-1, 1]) {
            a[k].sh.rotation.z = lerp(a[k].base, k * .05, env);
            a[k].sh.rotation.x = -.35 * env;
            a[k].el.rotation.x = -1.2 * env;
          }
          break;
      }
    }

    // parpadeo
    if (t > nextBlink) {
      if (expression === 'smile') {
        applyExpression('blink');
        setTimeout(() => { if (expression === 'smile') applyExpression('smile'); }, 130);
      }
      nextBlink = t + 2.5 + Math.random() * 3;
    }
  }
  const snow = world.userData.snow;
  if (snow) {
    const p = snow.geometry.attributes.position;
    for (let i = 0; i < p.count; i++) {
      let y = p.getY(i) - .006;
      if (y < 0) y = 4;
      p.setY(i, y);
    }
    p.needsUpdate = true;
  }
  renderer.render(scene, camera);
}

/* =========================================================
 *  Interfaz y lógica del juego
 * ========================================================= */

let currentCat = 'top';
let exprTimer = null;
let bubbleTimer = null;
let lastAction = null;
const $ = sel => document.querySelector(sel);

const levelOf = a => [...LEVELS].reverse().find(l => a >= l.min);
const tier = () => state.affinity < 35 ? 0 : state.affinity < 70 ? 1 : 2;

function renderAffinity() {
  const a = state.affinity;
  $('#affinityFill').style.width = a + '%';
  $('#affinityValue').textContent = a;
  $('#levelName').textContent = levelOf(a).name;
}

function swatchRow(el, colors, current, onPick) {
  el.innerHTML = '';
  for (const c of colors) {
    const b = document.createElement('button');
    b.style.background = c;
    b.title = c;
    if (c === current) b.classList.add('active');
    b.onclick = () => onPick(c);
    el.appendChild(b);
  }
}

function renderWardrobe() {
  const chips = $('#catChips');
  chips.innerHTML = '';
  for (const cat of CATEGORIES) {
    const b = document.createElement('button');
    b.textContent = cat.name;
    if (cat.id === currentCat) b.classList.add('active');
    b.onclick = () => { currentCat = cat.id; renderWardrobe(); };
    chips.appendChild(b);
  }
  const grid = $('#itemGrid');
  grid.innerHTML = '';
  const none = document.createElement('button');
  none.innerHTML = '<div class="icon">🚫</div>Nada';
  if (!state.outfit[currentCat]) none.classList.add('active');
  none.onclick = () => wear(currentCat, null);
  grid.appendChild(none);
  for (const [id, it] of Object.entries(ITEMS[currentCat])) {
    const b = document.createElement('button');
    b.innerHTML = `<div class="icon">${it.icon}</div>${it.name}`;
    if (state.outfit[currentCat] === id) b.classList.add('active');
    b.onclick = () => wear(currentCat, id);
    grid.appendChild(b);
  }
  swatchRow($('#itemColors'), PALETTE, state.colors[currentCat], c => { state.colors[currentCat] = c; update(); });
}

function renderBodyTab() {
  const box = $('#sliders');
  if (!box.childElementCount) {
    for (const s of BODY_SLIDERS) {
      const row = document.createElement('label');
      row.className = 'slider-row';
      row.innerHTML = `<span>${s.name}</span><input type="range" min="${s.min}" max="${s.max}" step="0.01" data-id="${s.id}"><output></output>`;
      const input = row.querySelector('input');
      input.addEventListener('input', () => {
        state.body[s.id] = parseFloat(input.value);
        row.querySelector('output').textContent = Math.round(state.body[s.id] * 100) + '%';
        buildCharacter();
        if (s.id === 'height') setCamPreset(cam.targetDist < 2 ? 'face' : 'body');
      });
      input.addEventListener('change', saveState);
      box.appendChild(row);
    }
  }
  box.querySelectorAll('input').forEach(input => {
    input.value = state.body[input.dataset.id];
    input.nextElementSibling.textContent = Math.round(state.body[input.dataset.id] * 100) + '%';
  });

  const hair = $('#hairGrid');
  hair.innerHTML = '';
  for (const [id, name] of Object.entries(HAIR)) {
    const b = document.createElement('button');
    b.textContent = name;
    if (state.hairStyle === id) b.classList.add('active');
    b.onclick = () => { state.hairStyle = id; update(); };
    hair.appendChild(b);
  }
  swatchRow($('#hairColors'), HAIR_COLORS, state.hairColor, c => { state.hairColor = c; update(); });
  swatchRow($('#eyeColors'), EYE_COLORS, state.eyeColor, c => { state.eyeColor = c; update(); setCamPreset('face'); });
  swatchRow($('#lipColors'), LIP_COLORS, state.lip, c => { state.lip = c; update(); setCamPreset('face'); });
  swatchRow($('#skinColors'), SKIN_COLORS, state.skin, c => { state.skin = c; update(); });
}

function renderBackgrounds() {
  const grid = $('#bgGrid');
  grid.innerHTML = '';
  for (const [id, bg] of Object.entries(BACKGROUNDS)) {
    const b = document.createElement('button');
    b.innerHTML = `<div class="scene-chip" style="background:linear-gradient(${bg.sky} 60%, ${bg.floor} 60%)">${bg.emoji}</div>${bg.name}`;
    if (state.bg === id) b.classList.add('active');
    b.onclick = () => { state.bg = id; buildWorld(); update(false); };
    grid.appendChild(b);
  }
}

function renderGifts() {
  const box = $('#gifts');
  box.innerHTML = '';
  for (const [id, g] of Object.entries(GIFTS)) {
    const b = document.createElement('button');
    b.textContent = `${g.emoji} ${g.name}`;
    b.onclick = () => giveGift(id);
    box.appendChild(b);
  }
}

function renderChallenge() {
  const box = $('#challengeBox');
  const badge = $('#challengeBadge');
  const ch = state.challenge;
  if (!ch) {
    box.innerHTML = 'Luna te pide ayuda para elegir su ropa para una ocasión especial.' +
      '<div class="row"><button id="btnNewChallenge">🎯 Nuevo reto</button></div>';
    $('#btnNewChallenge').onclick = newChallenge;
    badge.classList.add('hidden');
    return;
  }
  const ev = EVENTS[ch];
  box.innerHTML = `${ev.emoji} <b>Reto:</b> vístela para <b>${ev.name}</b>. Elige también el lugar adecuado.` +
    '<div class="row"><button id="btnJudge">✅ ¡Lista!</button><button id="btnSkip" class="ghost">Saltar</button></div>';
  $('#btnJudge').onclick = judgeChallenge;
  $('#btnSkip').onclick = () => { state.challenge = null; update(false); say('Vale, otro día será. 🙂'); };
  badge.textContent = `${ev.emoji} Reto: ${ev.name}`;
  badge.classList.remove('hidden');
}

function update(rebuild = true) {
  if (rebuild) buildCharacter();
  renderWardrobe();
  renderBodyTab();
  renderBackgrounds();
  renderChallenge();
  renderAffinity();
  saveState();
}

// ---------- Acciones ----------
function wear(cat, id) {
  state.outfit[cat] = id;
  if (id && cat === 'dress') { state.outfit.top = null; state.outfit.bottom = null; }
  if (id && (cat === 'top' || cat === 'bottom')) state.outfit.dress = null;
  update();
  if (id) {
    if (state.favs.some(([c, i]) => c === cat && i === id)) {
      setExpression('happy', 2200);
      playGesture('bounce', .8);
      say(pick(['¡Oh! ¡Me encanta esto! 😍', '¡Es justo mi estilo! 💖']));
    } else {
      playGesture(pick(['bounce', 'nod']), .7);
      if (Math.random() < .3) setExpression(pick(['smile', 'wink', 'happy']), 1500);
    }
  }
}

function setExpression(name, ms) {
  expression = name;
  applyExpression(name);
  clearTimeout(exprTimer);
  if (ms) exprTimer = setTimeout(() => { expression = 'smile'; applyExpression('smile'); }, ms);
}

function say(text, ms = 3500) {
  const b = $('#bubble');
  b.textContent = text;
  b.classList.remove('hidden');
  clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(() => b.classList.add('hidden'), ms);
}

function addAffinity(n) {
  const before = levelOf(state.affinity);
  state.affinity = clamp(state.affinity + n, 0, 100);
  if (n > 0) floatHearts(Math.min(5, Math.ceil(n / 2)));
  if (n < 0) floatHearts(1, '💢');
  const after = levelOf(state.affinity);
  renderAffinity();
  saveState();
  if (after !== before && n > 0) {
    setTimeout(() => {
      setExpression('shy', 3000);
      playGesture('shy', 2.5);
      say(`✨ ¡Nuevo nivel: ${after.name}! ✨`, 3000);
    }, 1600);
  }
}

function floatHearts(n, emoji = '💖') {
  const box = $('#hearts');
  for (let i = 0; i < n; i++) {
    const h = document.createElement('span');
    h.className = 'float-heart';
    h.textContent = emoji;
    h.style.left = (35 + Math.random() * 30) + '%';
    h.style.top = (20 + Math.random() * 20) + '%';
    h.style.animationDelay = (i * .15) + 's';
    box.appendChild(h);
    setTimeout(() => h.remove(), 1800 + i * 150);
  }
}

function isRepeat(act) {
  const rep = lastAction === act;
  lastAction = act;
  if (rep) {
    setExpression('annoyed', 1800);
    say(pick(LINES.repeat));
    addAffinity(-1);
  }
  return rep;
}

const outfitIsComplete = () => {
  const o = state.outfit;
  return (o.dress || (o.top && o.bottom)) && o.shoes;
};

function act(name) {
  if (name !== 'halagar' && isRepeat(name)) return;
  switch (name) {
    case 'saludar':
      setExpression('happy', 1800);
      playGesture('wave', 1.6);
      say(pick(LINES.saludar[tier()]));
      addAffinity(1);
      break;
    case 'chiste':
      if (Math.random() < .25) {
        setExpression('sad', 1800);
        say('Hmm... no lo pillo. 😐');
      } else {
        setExpression(pick(['happy', 'wink']), 2000);
        playGesture('bounce', .8);
        say(pick(LINES.chiste[tier()]));
        addAffinity(2);
      }
      break;
    case 'charlar': chat(); break;
    case 'halagar': compliment(); break;
    case 'bailar':
      setExpression('happy', 4000);
      playGesture('dance', 4);
      say(pick(LINES.bailar[tier()]), 4000);
      addAffinity(tier() === 0 ? 1 : 2);
      break;
    case 'girar':
      setExpression('wink', 1500);
      playGesture('spin', 1.2);
      say(pick(LINES.girar[tier()]));
      addAffinity(1);
      break;
  }
}

function chat() {
  const topics = [
    () => {
      const [cat, id] = state.favs[state.hintIndex % 2];
      state.hintIndex++;
      return tier() === 0
        ? `Me gustan mucho ${FAV_HINTS[cat]}...`
        : `¿Un secreto? Mi favorito es ${ITEMS[cat][id].name.toLowerCase()}. 🤫`;
    },
    () => tier() === 0
      ? 'Me encantan los regalos pequeños, ¿sabes?'
      : `Si algún día me regalas ${GIFTS[state.favGift].a} ${GIFTS[state.favGift].emoji}, me harías muy feliz.`,
    () => pick(['Trabajo como diseñadora gráfica. ¡Por eso me encanta la moda!',
      'El fin de semana quiero ir a la playa. 🌊', 'Me encanta el chocolate caliente en invierno.',
      'Tengo 24 años y aún no sé cocinar bien. 😅']),
    () => tier() === 2 ? 'Me gusta mucho pasar tiempo contigo. 💕' : '¿Y tú qué haces en tu tiempo libre?',
  ];
  setExpression(tier() === 2 ? 'shy' : 'smile', 2500);
  playGesture('nod', 1);
  say(pick(topics)(), 4500);
  addAffinity(2);
}

function compliment() {
  if (lastAction === 'halagar') { isRepeat('halagar'); return; }
  lastAction = 'halagar';
  if (!outfitIsComplete()) {
    setExpression('sad', 2000);
    say('¿En serio? Si aún no he terminado de vestirme... 😅');
    return;
  }
  const o = state.outfit;
  const favWorn = state.favs.filter(([c, i]) => o[c] === i).length;
  const accessories = ['hat', 'glasses', 'earrings', 'necklace', 'bag'].filter(c => o[c]).length;
  let pts = 1 + accessories + favWorn * 3;
  if (favWorn) {
    setExpression('shy', 2500);
    playGesture('shy', 2);
    say('¿De verdad? ¡Es mi ropa favorita! Gracias... 😳💕');
  } else if (accessories >= 2) {
    setExpression('happy', 2000);
    playGesture('spin', 1.2);
    say('¡Gracias! Me ha costado conjuntar los accesorios. ✨');
  } else {
    setExpression('smile', 2000);
    say(pick(['Gracias, eres muy amable. 😊', '¿Tú crees? ¡Gracias!']));
    pts = 1;
  }
  addAffinity(pts);
}

function giveGift(id) {
  const g = GIFTS[id];
  const count = state.giftCounts[id] || 0;
  state.giftCounts[id] = count + 1;
  lastAction = 'gift';
  const cap = s => s[0].toUpperCase() + s.slice(1);
  if (count >= 3) {
    setExpression('annoyed', 2000);
    say(`¿${cap(g.other)}? Ya tengo muchos... 😅`);
    return;
  }
  if (id === state.favGift) {
    setExpression('happy', 2500);
    playGesture('bounce', 1);
    say(`¡${g.emoji}! ¿¡Cómo sabías que es mi favorito!? 😍`);
    addAffinity(8);
  } else {
    setExpression('smile', 2000);
    playGesture('nod', 1);
    say(`¡${cap(g.a)} ${g.emoji}! Muchas gracias.`);
    addAffinity(3);
  }
}

function reactToPart(part) {
  if (LINES.click[part]) {
    setExpression(part === 'head' ? 'shy' : part === 'hand' ? 'happy' : 'surprised', 1600);
    playGesture(part === 'hand' ? 'wave' : 'nod', 1.2);
    say(pick(LINES.click[part]));
    if (part === 'hand' && lastAction !== 'hand') addAffinity(1);
    lastAction = part;
    return;
  }
  const id = state.outfit[part];
  if (!id) return;
  const name = ITEMS[part][id].name.toLowerCase();
  setExpression('smile', 1600);
  playGesture('spin', 1.2);
  say(pick([`¿Te gusta mi ${name}?`, `¿A que mola mi ${name}? 😊`, '¡Lo estrené ayer!', '¿Qué tal me queda?']));
  const key = part + ':' + id;
  if (!state.clickedItems.includes(key)) {
    state.clickedItems.push(key);
    addAffinity(1);
  }
}

// ---------- Retos ----------
function newChallenge() {
  const keys = Object.keys(EVENTS).filter(k => k !== state.challenge);
  state.challenge = pick(keys);
  const ev = EVENTS[state.challenge];
  say(`¡Ayúdame! Tengo ${ev.name} ${ev.emoji}. ¿Qué me pongo?`, 4500);
  setExpression('surprised', 1500);
  update(false);
}

function judgeChallenge() {
  const key = state.challenge, ev = EVENTS[key];
  if (!outfitIsComplete()) {
    setExpression('sad', 2000);
    say('¡Aún me falta ropa! Necesito parte de arriba y de abajo (o un vestido) y zapatos.');
    return;
  }
  let score = 0;
  for (const cat in state.outfit) {
    const id = state.outfit[cat];
    if (!id) continue;
    const tags = ITEMS[cat][id].tags;
    if (tags.includes(key)) score += 2;
    else if (tags.some(t => ev.bad.includes(t))) score -= 1;
  }
  if (state.bg === ev.bg) score += 2;
  const stars = clamp(Math.round(score / 2), 1, 5);
  const msgs = {
    1: `¿Esto para ${ev.name}? Mejor lo intentamos otra vez... 😬`,
    2: 'Hmm, no termina de convencerme.',
    3: 'Está bien, ¡me gusta!',
    4: '¡Me encanta! Voy a causar sensación. ✨',
    5: '¡PERFECTO! ¡Eres un genio de la moda! 😍',
  };
  setExpression(stars >= 4 ? 'happy' : stars === 3 ? 'smile' : 'sad', 3000);
  if (stars >= 4) playGesture('dance', 2.5);
  say(`${'★'.repeat(stars)}${'☆'.repeat(5 - stars)} ${msgs[stars]}`, 5000);
  addAffinity(stars >= 3 ? (stars - 2) * 3 : -1);
  state.challenge = null;
  update(false);
}

// ---------- Botones generales ----------
function randomOutfit() {
  const o = state.outfit;
  for (const k in o) o[k] = null;
  if (Math.random() < .35) o.dress = pick(Object.keys(ITEMS.dress));
  else { o.top = pick(Object.keys(ITEMS.top)); o.bottom = pick(Object.keys(ITEMS.bottom)); }
  o.shoes = pick(Object.keys(ITEMS.shoes));
  for (const c of ['hat', 'glasses', 'earrings', 'necklace', 'bag'])
    if (Math.random() < .4) o[c] = pick(Object.keys(ITEMS[c]));
  for (const c in state.colors) state.colors[c] = pick(PALETTE);
  state.hairStyle = pick(Object.keys(HAIR));
  state.hairColor = pick(HAIR_COLORS);
  update();
  setExpression('surprised', 1200);
  playGesture('spin', 1.2);
}

function takePhoto() {
  renderer.render(scene, camera);
  const a = document.createElement('a');
  a.download = 'luna.png';
  a.href = renderer.domElement.toDataURL('image/png');
  a.click();
  setExpression('wink', 1500);
  say('¡Patata! 📸');
}

function resetGame() {
  if (!confirm('¿Reiniciar el juego? Se perderá la afinidad con Luna.')) return;
  state = defaultState();
  expression = 'smile';
  lastAction = null;
  buildWorld();
  update();
  setCamPreset('body');
  say('¡Hola! Soy Luna. ¿Me ayudas a elegir qué ponerme? 😊');
}

// ---------- Inicio ----------
function init() {
  document.querySelectorAll('.tabs button').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.tabs button').forEach(b => b.classList.toggle('active', b === btn));
      document.querySelectorAll('.tab').forEach(t => t.classList.toggle('hidden', t.id !== 'tab-' + btn.dataset.tab));
    };
  });
  document.querySelectorAll('[data-act]').forEach(btn => { btn.onclick = () => act(btn.dataset.act); });
  $('#btnRandom').onclick = randomOutfit;
  $('#btnPhoto').onclick = takePhoto;
  $('#btnReset').onclick = resetGame;
  $('#camFace').onclick = () => setCamPreset('face');
  $('#camBody').onclick = () => setCamPreset('body');
  $('#camSpin').onclick = () => {
    cam.autoSpin = !cam.autoSpin;
    $('#camSpin').classList.toggle('active', cam.autoSpin);
  };

  renderGifts();
  buildWorld();
  update();
  setCamPreset('body');
  resize();
  animate();
  playGesture('wave', 1.6);
  say(state.affinity > 0 ? pick(LINES.saludar[tier()]) : '¡Hola! Soy Luna. ¿Me ayudas a elegir qué ponerme? 😊');
}

init();
