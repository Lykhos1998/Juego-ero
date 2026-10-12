'use strict';

/* =========================================================
 *  Viste a Luna — juego de vestir e interactuar
 *  Todo se dibuja con SVG en un lienzo de 400 x 700.
 * ========================================================= */

const SAVE_KEY = 'viste-a-luna-v1';

// ---------- Utilidades de color ----------
function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function shade(hex, amt) {
  const [r, g, b] = hexToRgb(hex);
  const t = amt < 0 ? 0 : 255;
  const p = Math.abs(amt);
  const mix = c => Math.round((t - c) * p + c);
  return '#' + [mix(r), mix(g), mix(b)].map(c => c.toString(16).padStart(2, '0')).join('');
}
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ---------- Paletas ----------
const PALETTE = ['#ff7aa8', '#e04f5f', '#ff9f43', '#ffd166', '#7bd389', '#4ecdc4',
  '#4a90e2', '#3b4a8a', '#9b6dd6', '#f5f5f5', '#2d2d34', '#c8a27a'];
const HAIR_COLORS = ['#2b1b14', '#4a2c1a', '#8a5a33', '#d9a55b', '#f2d48a', '#b8432f',
  '#e88fb5', '#7a6ad8', '#5fb3c9', '#e9e9ef'];
const EYE_COLORS = ['#4a7bd0', '#5a3a22', '#3e9a5a', '#8a5ad6', '#6b6b6b', '#d08a2a'];
const LIP_COLORS = ['#d9667a', '#c0394f', '#ef8f9f', '#a8545f', '#d97a5a'];
const SKIN_COLORS = ['#fde3cf', '#f5d0b5', '#e8b48f', '#c98d63', '#a26a45', '#6e452c'];

// ---------- Geometría base ----------
const TORSO = 'M150 210 Q200 200 250 210 L258 260 Q248 300 240 320 Q252 350 256 392 L144 392 Q148 350 160 320 Q152 300 142 260 Z';
const ARM_L = 'M150 218 Q125 300 122 390';
const ARM_R = 'M250 218 Q275 300 278 390';
const SLEEVE_L = 'M150 218 Q125 300 122 382';
const SLEEVE_R = 'M250 218 Q275 300 278 382';

const stroke = (d, c, w, cap = 'round') =>
  `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="${cap}" stroke-linejoin="round"/>`;

// ---------- Catálogo de ropa ----------
// tags: ocasiones en las que la prenda encaja (para los retos de estilo)
const CATEGORIES = [
  { id: 'top', name: 'Arriba', view: '120 195 160 160' },
  { id: 'bottom', name: 'Abajo', view: '100 300 200 340' },
  { id: 'dress', name: 'Vestidos', view: '95 195 210 440' },
  { id: 'shoes', name: 'Zapatos', view: '135 520 130 135' },
  { id: 'hat', name: 'Sombreros', view: '100 15 200 110' },
  { id: 'glasses', name: 'Gafas', view: '145 105 110 60' },
  { id: 'earrings', name: 'Pendientes', view: '135 135 130 40' },
  { id: 'necklace', name: 'Collares', view: '165 190 70 60' },
  { id: 'bag', name: 'Bolsos', view: '200 200 120 230' },
];

const ITEMS = {
  top: {
    tshirt: {
      name: 'Camiseta', tags: ['casual', 'parque'], color: '#ff7aa8',
      draw: c => stroke('M152 214 L136 272', c, 30) + stroke('M248 214 L264 272', c, 30) +
        `<path d="M144 210 Q200 226 256 210 L262 262 Q250 300 244 336 L156 336 Q150 300 138 262 Z" fill="${c}"/>` +
        stroke('M182 212 Q200 230 218 212', shade(c, -.25), 3),
    },
    sweater: {
      name: 'Suéter', tags: ['invierno', 'oficina', 'casual'], color: '#9b6dd6',
      draw: c => stroke(SLEEVE_L, c, 28) + stroke(SLEEVE_R, c, 28) +
        stroke('M124 372 L121 384', shade(c, -.2), 30, 'butt') + stroke('M276 372 L279 384', shade(c, -.2), 30, 'butt') +
        `<path d="M144 208 Q200 222 256 208 L264 262 Q252 305 248 348 L152 348 Q148 305 136 262 Z" fill="${c}"/>` +
        `<rect x="151" y="334" width="98" height="14" rx="4" fill="${shade(c, -.2)}"/>` +
        `<path d="M180 208 Q200 228 220 208" fill="none" stroke="${shade(c, -.2)}" stroke-width="7"/>`,
    },
    blouse: {
      name: 'Blusa', tags: ['oficina', 'cita'], color: '#f5f5f5',
      draw: c => `<circle cx="146" cy="226" r="18" fill="${c}"/><circle cx="254" cy="226" r="18" fill="${c}"/>` +
        `<path d="M146 210 Q200 222 254 210 L260 262 Q250 300 244 334 L156 334 Q150 300 140 262 Z" fill="${c}"/>` +
        `<path d="M184 208 L200 230 L190 236 L176 212 Z M216 208 L200 230 L210 236 L224 212 Z" fill="${shade(c, -.12)}"/>` +
        [250, 272, 294, 316].map(y => `<circle cx="200" cy="${y}" r="3" fill="${shade(c, -.35)}"/>`).join(''),
    },
    crop: {
      name: 'Top corto', tags: ['playa', 'fiesta'], color: '#ffd166',
      draw: c => stroke('M165 222 L168 200', c, 5) + stroke('M235 222 L232 200', c, 5) +
        `<path d="M150 222 Q200 236 250 222 L256 262 Q250 285 246 296 L154 296 Q150 285 144 262 Z" fill="${c}"/>` +
        stroke('M154 292 L246 292', shade(c, -.2), 3),
    },
    jacket: {
      name: 'Chaqueta', tags: ['invierno', 'cita', 'oficina'], color: '#3b4a8a',
      draw: c => `<path d="M152 222 Q200 236 248 222 L252 262 Q246 292 242 316 L158 316 Q154 292 148 262 Z" fill="#f5f5f5"/>` +
        stroke(SLEEVE_L, c, 29) + stroke(SLEEVE_R, c, 29) +
        `<path d="M142 208 L186 210 L180 260 L190 352 L150 352 Q146 305 134 262 Z" fill="${c}"/>` +
        `<path d="M258 208 L214 210 L220 260 L210 352 L250 352 Q254 305 266 262 Z" fill="${c}"/>` +
        `<path d="M186 210 L170 238 L182 250 Z M214 210 L230 238 L218 250 Z" fill="${shade(c, -.25)}"/>`,
    },
  },
  bottom: {
    jeans: {
      name: 'Vaqueros', tags: ['casual', 'parque', 'invierno', 'cita'], color: '#4a90e2',
      draw: c => stroke('M177 392 L172 624', c, 38, 'butt') + stroke('M223 392 L228 624', c, 38, 'butt') +
        `<path d="M154 316 L246 316 L254 402 L146 402 Z" fill="${c}"/>` +
        `<rect x="154" y="316" width="92" height="10" fill="${shade(c, -.2)}"/>` +
        stroke('M200 326 L200 370', shade(c, -.25), 2) +
        stroke('M172 560 L172 620 M228 560 L228 620', shade(c, .15), 2),
    },
    pants: {
      name: 'Pantalón de vestir', tags: ['oficina'], color: '#2d2d34',
      draw: c => stroke('M178 392 L170 626', c, 42, 'butt') + stroke('M222 392 L230 626', c, 42, 'butt') +
        `<path d="M154 316 L246 316 L256 404 L144 404 Z" fill="${c}"/>` +
        stroke('M175 400 L171 624 M225 400 L229 624', shade(c, .18), 1.5),
    },
    skirt: {
      name: 'Falda', tags: ['cita', 'oficina', 'parque'], color: '#e04f5f',
      draw: c => `<path d="M156 316 L244 316 L274 456 Q200 470 126 456 Z" fill="${c}"/>` +
        stroke('M178 330 L162 462 M200 330 L200 466 M222 330 L238 462', shade(c, -.18), 2) +
        `<rect x="156" y="314" width="88" height="10" rx="3" fill="${shade(c, -.2)}"/>`,
    },
    mini: {
      name: 'Minifalda', tags: ['fiesta', 'cita'], color: '#2d2d34',
      draw: c => `<path d="M156 316 L244 316 L262 412 Q200 420 138 412 Z" fill="${c}"/>` +
        `<rect x="156" y="314" width="88" height="9" rx="3" fill="${shade(c, .2)}"/>`,
    },
    shorts: {
      name: 'Shorts', tags: ['playa', 'parque'], color: '#4ecdc4',
      draw: c => `<path d="M154 316 L246 316 L258 424 L206 428 L200 394 L194 428 L142 424 Z" fill="${c}"/>` +
        `<rect x="154" y="314" width="92" height="9" fill="${shade(c, -.2)}"/>`,
    },
  },
  dress: {
    sundress: {
      name: 'Vestido de verano', tags: ['playa', 'parque', 'cita'], color: '#ffd166',
      draw: c => stroke('M164 224 L166 204', c, 5) + stroke('M236 224 L234 204', c, 5) +
        `<path d="M150 222 Q200 236 250 222 L252 262 Q246 296 240 318 L284 482 Q200 498 116 482 L160 318 Q154 296 148 262 Z" fill="${c}"/>` +
        [[175, 360], [215, 345], [195, 410], [150, 450], [240, 430], [230, 470], [170, 470], [200, 270], [180, 300], [222, 290]]
          .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#fff" opacity=".8"/>`).join('') +
        stroke('M160 318 L240 318', shade(c, -.25), 4),
    },
    party: {
      name: 'Vestido de fiesta', tags: ['fiesta', 'cita'], color: '#e2558f',
      draw: c => `<path d="M148 218 L250 214 L256 262 Q246 300 240 320 Q256 360 262 432 Q200 444 138 432 Q144 360 160 320 Q154 300 144 262 Z" fill="${c}"/>` +
        stroke('M150 218 L172 200', c, 6) +
        [[180, 250], [222, 280], [190, 360], [230, 400], [168, 410], [205, 320]]
          .map(([x, y]) => `<path d="M${x} ${y - 6} L${x + 2} ${y - 2} L${x + 6} ${y} L${x + 2} ${y + 2} L${x} ${y + 6} L${x - 2} ${y + 2} L${x - 6} ${y} L${x - 2} ${y - 2} Z" fill="#fff" opacity=".85"/>`).join(''),
    },
    gown: {
      name: 'Vestido largo', tags: ['fiesta', 'cita'], color: '#3b4a8a',
      draw: c => stroke('M164 224 L166 204', c, 5) + stroke('M236 224 L234 204', c, 5) +
        `<path d="M150 222 Q200 236 250 222 L254 262 Q246 296 240 320 Q262 420 300 628 Q200 646 100 628 Q138 420 160 320 Q154 296 146 262 Z" fill="${c}"/>` +
        stroke('M158 320 Q200 330 242 320', shade(c, .3), 5) +
        stroke('M190 340 Q180 480 160 628 M215 340 Q228 480 245 628', shade(c, -.2), 2),
    },
  },
  shoes: {
    sneakers: {
      name: 'Zapatillas', tags: ['casual', 'parque'], color: '#f5f5f5',
      draw: c => [166, 234].map(x =>
        `<ellipse cx="${x}" cy="638" rx="21" ry="12" fill="${c}"/>` +
        `<rect x="${x - 21}" y="642" width="42" height="7" rx="3" fill="${shade(c, -.3)}"/>` +
        stroke(`M${x - 8} 630 L${x + 8} 630 M${x - 6} 635 L${x + 6} 635`, shade(c, -.4), 2)).join(''),
    },
    boots: {
      name: 'Botas', tags: ['invierno', 'cita'], color: '#8a5a33',
      draw: c => stroke('M171 540 L170 632', c, 38, 'butt') + stroke('M229 540 L230 632', c, 38, 'butt') +
        [166, 234].map(x => `<ellipse cx="${x}" cy="638" rx="22" ry="12" fill="${c}"/>` +
          `<rect x="${x - 22}" y="644" width="44" height="6" rx="3" fill="${shade(c, -.35)}"/>`).join('') +
        stroke('M152 545 L190 545 M210 545 L248 545', shade(c, -.25), 4),
    },
    heels: {
      name: 'Tacones', tags: ['fiesta', 'oficina', 'cita'], color: '#e04f5f',
      draw: c => [166, 234].map(x =>
        `<path d="M${x - 17} 640 Q${x - 18} 628 ${x} 628 Q${x + 18} 630 ${x + 18} 642 Z" fill="${c}"/>` +
        `<rect x="${x + (x < 200 ? 10 : -14)}" y="640" width="4" height="12" fill="${shade(c, -.3)}"/>`).join(''),
    },
    sandals: {
      name: 'Sandalias', tags: ['playa'], color: '#c8a27a',
      draw: c => [166, 234].map(x =>
        `<ellipse cx="${x}" cy="646" rx="19" ry="5" fill="${shade(c, -.25)}"/>` +
        stroke(`M${x - 13} 638 L${x + 13} 638`, c, 4) + stroke(`M${x - 4} 632 L${x} 642 L${x + 4} 632`, c, 3)).join(''),
    },
  },
  hat: {
    sunhat: {
      name: 'Pamela', tags: ['playa', 'parque'], color: '#e8c07a',
      draw: c => `<ellipse cx="200" cy="80" rx="96" ry="20" fill="${c}"/>` +
        `<path d="M152 80 Q152 30 200 28 Q248 30 248 80 Z" fill="${shade(c, -.06)}"/>` +
        `<path d="M153 66 Q200 74 247 66 L248 78 Q200 86 152 78 Z" fill="#e2558f"/>`,
    },
    beanie: {
      name: 'Gorro', tags: ['invierno'], color: '#e04f5f',
      draw: c => `<path d="M144 104 Q144 38 200 36 Q256 38 256 104 Z" fill="${c}"/>` +
        `<rect x="140" y="90" width="120" height="20" rx="8" fill="${shade(c, -.18)}"/>` +
        `<circle cx="200" cy="34" r="14" fill="${shade(c, .5)}"/>`,
    },
    cap: {
      name: 'Gorra', tags: ['parque', 'casual'], color: '#4a90e2',
      draw: c => `<path d="M146 96 Q148 46 200 44 Q252 46 254 96 Z" fill="${c}"/>` +
        `<path d="M150 94 Q200 84 250 94 Q262 104 248 106 Q200 98 152 106 Q138 104 150 94 Z" fill="${shade(c, -.25)}"/>` +
        `<circle cx="200" cy="46" r="4" fill="${shade(c, -.3)}"/>`,
    },
    flowers: {
      name: 'Corona de flores', tags: ['cita', 'parque'], color: '#ff7aa8',
      draw: c => [[150, 92], [163, 75], [181, 66], [200, 63], [219, 66], [237, 75], [250, 92]]
        .map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="9" fill="${i % 2 ? '#fff' : c}"/>` +
          `<circle cx="${x}" cy="${y}" r="3" fill="#ffd166"/>`).join(''),
    },
  },
  glasses: {
    round: {
      name: 'Gafas redondas', tags: ['oficina', 'casual'], color: '#2d2d34',
      draw: c => `<circle cx="180" cy="136" r="15" fill="rgba(255,255,255,.18)" stroke="${c}" stroke-width="3"/>` +
        `<circle cx="220" cy="136" r="15" fill="rgba(255,255,255,.18)" stroke="${c}" stroke-width="3"/>` +
        stroke('M195 134 Q200 130 205 134 M165 132 L150 128 M235 132 L250 128', c, 3),
    },
    sun: {
      name: 'Gafas de sol', tags: ['playa', 'parque'], color: '#2d2d34',
      draw: c => `<path d="M162 126 L196 126 Q196 150 180 150 Q162 150 162 126 Z" fill="${c}" opacity=".92"/>` +
        `<path d="M204 126 L238 126 Q238 150 220 150 Q204 150 204 126 Z" fill="${c}" opacity=".92"/>` +
        stroke('M162 126 L238 126 M162 128 L149 126 M238 128 L251 126', c, 3) +
        stroke('M168 132 L176 132', '#fff', 2),
    },
  },
  earrings: {
    hoops: {
      name: 'Aros', tags: ['fiesta', 'casual'], color: '#ffd166',
      draw: c => `<circle cx="149" cy="160" r="8" fill="none" stroke="${c}" stroke-width="2.5"/>` +
        `<circle cx="251" cy="160" r="8" fill="none" stroke="${c}" stroke-width="2.5"/>`,
    },
    pearls: {
      name: 'Perlas', tags: ['oficina', 'cita'], color: '#f5f5f5',
      draw: c => `<circle cx="149" cy="154" r="4.5" fill="${c}" stroke="${shade(c, -.2)}"/>` +
        `<circle cx="251" cy="154" r="4.5" fill="${c}" stroke="${shade(c, -.2)}"/>`,
    },
  },
  necklace: {
    chain: {
      name: 'Colgante', tags: ['cita', 'casual'], color: '#ffd166',
      draw: c => stroke('M180 204 Q200 232 220 204', c, 2) +
        `<path d="M200 232 C196 226 190 230 194 235 L200 241 L206 235 C210 230 204 226 200 232 Z" fill="#e2558f" stroke="${c}"/>`,
    },
    pearls: {
      name: 'Collar de perlas', tags: ['oficina', 'fiesta'], color: '#f5f5f5',
      draw: c => Array.from({ length: 11 }, (_, i) => {
        const t = i / 10, x = 178 + 44 * t, y = 204 + 26 * 4 * t * (1 - t);
        return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.4" fill="${c}" stroke="${shade(c, -.25)}" stroke-width=".6"/>`;
      }).join(''),
    },
  },
  bag: {
    tote: {
      name: 'Bolso grande', tags: ['oficina', 'parque', 'playa'], color: '#c8a27a',
      draw: c => stroke('M244 214 L262 336', shade(c, -.2), 5) +
        `<rect x="246" y="330" width="56" height="56" rx="8" fill="${c}"/>` +
        `<rect x="246" y="346" width="56" height="8" fill="${shade(c, -.15)}"/>`,
    },
    clutch: {
      name: 'Bolso de mano', tags: ['fiesta', 'cita'], color: '#ffd166',
      draw: c => `<rect x="262" y="386" width="44" height="26" rx="5" fill="${c}"/>` +
        `<path d="M262 391 L284 402 L306 391" fill="none" stroke="${shade(c, -.25)}" stroke-width="2"/>` +
        `<circle cx="284" cy="402" r="3" fill="${shade(c, -.35)}"/>`,
    },
  },
};

// ---------- Peinados ----------
const HAIR = {
  long: { name: 'Largo' },
  wavy: { name: 'Ondulado' },
  bob: { name: 'Media melena' },
  ponytail: { name: 'Coleta' },
  buns: { name: 'Moños' },
};

function hairBack(style, c) {
  switch (style) {
    case 'long':
      return `<path d="M144 115 Q138 55 200 55 Q262 55 256 115 L270 322 Q236 336 200 330 Q164 336 130 322 Z" fill="${c}"/>`;
    case 'wavy':
      return `<path d="M144 115 Q132 55 200 52 Q268 55 256 115 Q276 160 262 210 Q284 260 266 330 Q232 346 200 336 Q168 346 134 330 Q116 260 138 210 Q124 160 144 115 Z" fill="${c}"/>`;
    case 'bob':
      return `<path d="M142 115 Q138 55 200 55 Q262 55 258 115 L264 196 Q200 214 136 196 Z" fill="${c}"/>`;
    case 'ponytail':
      return `<path d="M236 78 Q312 110 288 270 Q276 214 252 170 Q262 120 236 96 Z" fill="${c}"/>` +
        `<ellipse cx="200" cy="118" rx="58" ry="64" fill="${c}"/>`;
    case 'buns':
      return `<circle cx="152" cy="68" r="26" fill="${c}"/><circle cx="248" cy="68" r="26" fill="${c}"/>` +
        `<ellipse cx="200" cy="118" rx="58" ry="64" fill="${c}"/>`;
  }
  return '';
}

function hairFront(style, c) {
  const hl = shade(c, .25);
  const bangs = `<path d="M146 128 Q142 60 200 60 Q258 60 254 128 Q246 100 228 92 Q214 108 196 96 Q176 108 160 98 Q150 108 146 128 Z" fill="${c}"/>` +
    stroke('M170 72 Q186 66 204 68', hl, 3);
  const sides = `<path d="M146 112 Q138 170 146 214 Q156 166 156 118 Z" fill="${c}"/>` +
    `<path d="M254 112 Q262 170 254 214 Q244 166 244 118 Z" fill="${c}"/>`;
  switch (style) {
    case 'long':
    case 'wavy':
      return bangs + sides;
    case 'bob':
      return bangs + `<path d="M146 112 Q140 160 142 192 Q156 160 156 118 Z" fill="${c}"/>` +
        `<path d="M254 112 Q260 160 258 192 Q244 160 244 118 Z" fill="${c}"/>`;
    case 'ponytail':
      return `<path d="M146 126 Q140 60 200 60 Q260 60 254 126 Q236 86 200 84 Q172 90 146 126 Z" fill="${c}"/>` +
        `<circle cx="240" cy="84" r="7" fill="#e2558f"/>` + stroke('M168 74 Q190 64 214 68', hl, 3);
    case 'buns':
      return bangs + stroke('M140 70 Q152 52 166 62', hl, 3) + stroke('M236 62 Q248 52 260 70', hl, 3);
  }
  return '';
}

// ---------- Cara y expresiones ----------
function eye(x, color, mode) {
  if (mode === 'closed') return stroke(`M${x - 10} 137 Q${x} 145 ${x + 10} 137`, '#2d2028', 3);
  if (mode === 'happy') return stroke(`M${x - 10} 140 Q${x} 128 ${x + 10} 140`, '#2d2028', 3);
  const dx = mode === 'side' ? 3 : 0;
  const ry = mode === 'wide' ? 13 : 11;
  return `<ellipse cx="${x}" cy="136" rx="10" ry="${ry}" fill="#fff"/>` +
    `<circle cx="${x + dx}" cy="137" r="7" fill="${color}"/>` +
    `<circle cx="${x + dx}" cy="137" r="3.5" fill="#1a1216"/>` +
    `<circle cx="${x + dx + 2.5}" cy="134" r="2" fill="#fff"/>` +
    stroke(`M${x - 11} ${136 - ry + 3} Q${x} ${136 - ry - 3} ${x + 11} ${136 - ry + 3}`, '#2d2028', 2.5);
}

const EXPRESSIONS = {
  smile: { eyes: ['open', 'open'], mouth: 'smile', blush: .3, brows: 0 },
  happy: { eyes: ['happy', 'happy'], mouth: 'grin', blush: .45, brows: -2 },
  surprised: { eyes: ['wide', 'wide'], mouth: 'o', blush: .3, brows: -5 },
  shy: { eyes: ['side', 'side'], mouth: 'small', blush: .75, brows: 1 },
  wink: { eyes: ['open', 'happy'], mouth: 'grin', blush: .4, brows: 0 },
  sad: { eyes: ['open', 'open'], mouth: 'sad', blush: .15, brows: 3, sadBrows: true },
  annoyed: { eyes: ['side', 'side'], mouth: 'pout', blush: .2, brows: 2, angryBrows: true },
  blink: { eyes: ['closed', 'closed'], mouth: 'smile', blush: .3, brows: 0 },
};

function mouth(type, lip) {
  switch (type) {
    case 'grin': return `<path d="M186 160 Q200 178 214 160 Z" fill="${lip}" stroke="${shade(lip, -.3)}" stroke-width="1.5"/>`;
    case 'o': return `<ellipse cx="200" cy="166" rx="6" ry="8" fill="${shade(lip, -.2)}"/>`;
    case 'small': return stroke('M194 164 Q200 168 206 164', lip, 3);
    case 'sad': return stroke('M189 168 Q200 160 211 168', lip, 3);
    case 'pout': return stroke('M192 166 L208 164', lip, 3);
    default: return stroke('M187 161 Q200 172 213 161', lip, 3.5);
  }
}

function drawFace(st, exprName) {
  const e = EXPRESSIONS[exprName] || EXPRESSIONS.smile;
  const browC = shade(st.hairColor, -.2);
  const b = e.brows;
  let brows;
  if (e.sadBrows) brows = stroke(`M168 ${116 + b} L190 ${112 + b} M210 ${112 + b} L232 ${116 + b}`, browC, 3);
  else if (e.angryBrows) brows = stroke(`M168 ${110 + b} L190 ${116 + b} M210 ${116 + b} L232 ${110 + b}`, browC, 3);
  else brows = stroke(`M168 ${116 + b} Q180 ${110 + b} 192 ${116 + b} M208 ${116 + b} Q220 ${110 + b} 232 ${116 + b}`, browC, 3);
  return `<g>` +
    `<ellipse cx="170" cy="155" rx="10" ry="6" fill="#ff7f99" opacity="${e.blush}"/>` +
    `<ellipse cx="230" cy="155" rx="10" ry="6" fill="#ff7f99" opacity="${e.blush}"/>` +
    brows + eye(180, st.eyeColor, e.eyes[0]) + eye(220, st.eyeColor, e.eyes[1]) +
    stroke('M200 142 Q197 151 202 153', shade(st.skin, -.25), 2) +
    mouth(e.mouth, st.lip) + `</g>`;
}

// ---------- Personaje completo ----------
function drawCharacter(st, expr) {
  const s = st.skin;
  const o = st.outfit;
  const item = cat => o[cat] ? `<g data-hit="${cat}">${ITEMS[cat][o[cat]].draw(st.colors[cat])}</g>` : '';
  const base = '#ece6f2';

  return `<g class="breathe">` +
    hairBack(st.hairStyle, st.hairColor) +
    // cuerpo
    `<g data-hit="body">` +
      stroke('M176 385 L171 632', s, 32) + stroke('M224 385 L229 632', s, 32) +
      `<ellipse cx="166" cy="640" rx="15" ry="8" fill="${s}"/><ellipse cx="234" cy="640" rx="15" ry="8" fill="${s}"/>` +
      stroke(ARM_L, s, 20) + stroke(ARM_R, s, 20) +
      `<rect x="188" y="168" width="24" height="48" rx="8" fill="${s}"/>` +
      `<path d="${TORSO}" fill="${s}"/>` +
      // ropa básica (siempre puesta)
      `<path d="M152 222 Q200 236 248 222 L252 262 Q246 296 242 322 L158 322 Q154 296 148 262 Z" fill="${base}"/>` +
      (o.top || o.dress ? '' : stroke('M165 222 L168 204 M235 222 L232 204', base, 5)) +
      `<path d="M155 316 L245 316 L254 402 L206 406 L200 376 L194 406 L146 402 Z" fill="${base}"/>` +
    `</g>` +
    `<g data-hit="hand"><circle cx="122" cy="397" r="12" fill="${s}"/><circle cx="278" cy="397" r="12" fill="${s}"/></g>` +
    item('shoes') + item('bottom') + item('dress') + item('top') + item('necklace') + item('bag') +
    // cabeza
    `<g data-hit="head">` +
      `<ellipse cx="148" cy="140" rx="8" ry="13" fill="${shade(s, -.05)}"/><ellipse cx="252" cy="140" rx="8" ry="13" fill="${shade(s, -.05)}"/>` +
      `<ellipse cx="200" cy="130" rx="52" ry="60" fill="${s}"/>` +
      drawFace(st, expr) +
      hairFront(st.hairStyle, st.hairColor) +
    `</g>` +
    item('earrings') + item('glasses') + item('hat') +
  `</g>`;
}

// ---------- Escenarios ----------
const BACKGROUNDS = {
  room: {
    name: 'Habitación', emoji: '🛏️',
    draw: () => grad('gRoom', '#ffe4ef', '#fbd0e2') +
      `<rect width="400" height="700" fill="url(#gRoom)"/>` +
      `<rect x="250" y="60" width="120" height="150" rx="6" fill="#bfe6ff" stroke="#fff" stroke-width="8"/>` +
      stroke('M310 60 L310 210 M250 135 L370 135', '#fff', 5) +
      `<rect x="20" y="420" width="90" height="140" rx="8" fill="#f6b6cf"/><rect x="30" y="440" width="70" height="40" rx="4" fill="#fde1ee"/>` +
      `<rect y="560" width="400" height="140" fill="#d9a77a"/>` +
      stroke('M0 600 L400 600 M0 650 L400 650', '#c89366', 2) +
      `<ellipse cx="200" cy="648" rx="120" ry="18" fill="#f1a5c3" opacity=".7"/>`,
  },
  beach: {
    name: 'Playa', emoji: '🏖️',
    draw: () => grad('gBeach', '#7fd3ff', '#d9f3ff') +
      `<rect width="400" height="700" fill="url(#gBeach)"/>` +
      `<circle cx="320" cy="90" r="40" fill="#ffe27a"/>` +
      `<rect y="380" width="400" height="140" fill="#3fb0d9"/>` +
      stroke('M0 410 Q50 400 100 410 T200 410 T300 410 T400 410', '#fff', 3) +
      `<path d="M0 500 Q200 470 400 500 L400 700 L0 700 Z" fill="#f4dca6"/>` +
      `<path d="M40 520 L60 380 L64 380 L48 520 Z" fill="#8a5a33"/>` +
      `<path d="M62 380 Q20 360 0 390 M62 380 Q100 350 120 380 M62 380 Q40 340 60 330 M62 380 Q90 360 110 340" stroke="#3e9a5a" stroke-width="10" fill="none" stroke-linecap="round"/>`,
  },
  park: {
    name: 'Parque', emoji: '🌳',
    draw: () => grad('gPark', '#a8e0ff', '#e8f8ff') +
      `<rect width="400" height="700" fill="url(#gPark)"/>` +
      `<circle cx="80" cy="80" r="30" fill="#fff" opacity=".8"/><circle cx="110" cy="80" r="24" fill="#fff" opacity=".8"/>` +
      `<rect x="40" y="300" width="20" height="200" fill="#8a5a33"/><circle cx="50" cy="290" r="60" fill="#5cb85c"/>` +
      `<rect x="340" y="320" width="18" height="180" fill="#8a5a33"/><circle cx="349" cy="300" r="52" fill="#4cae4c"/>` +
      `<rect y="480" width="400" height="220" fill="#7bd389"/>` +
      [[60, 560], [320, 600], [110, 650], [280, 540]].map(([x, y]) =>
        `<circle cx="${x}" cy="${y}" r="5" fill="#ff7aa8"/><circle cx="${x}" cy="${y}" r="2" fill="#ffd166"/>`).join(''),
  },
  city: {
    name: 'Ciudad de noche', emoji: '🌃',
    draw: () => grad('gCity', '#1c1e4a', '#5a3c7a') +
      `<rect width="400" height="700" fill="url(#gCity)"/>` +
      `<circle cx="330" cy="80" r="28" fill="#fff6c8"/>` +
      [[0, 300, 70], [70, 240, 60], [130, 330, 80], [210, 260, 70], [280, 310, 50], [330, 220, 70]].map(([x, y, w]) =>
        `<rect x="${x}" y="${y}" width="${w}" height="${700 - y}" fill="#2a2550"/>` +
        Array.from({ length: 12 }, (_, i) => `<rect x="${x + 10 + (i % 3) * (w / 3.4)}" y="${y + 18 + Math.floor(i / 3) * 34}" width="8" height="12" fill="#ffd166" opacity="${(i * 7) % 3 ? .9 : .25}"/>`).join('')).join('') +
      `<rect y="560" width="400" height="140" fill="#3a3460"/>`,
  },
  party: {
    name: 'Fiesta', emoji: '🎉',
    draw: () => grad('gParty', '#2b1040', '#6a1e6e') +
      `<rect width="400" height="700" fill="url(#gParty)"/>` +
      `<circle cx="200" cy="40" r="26" fill="#ccc"/>` + stroke('M200 0 L200 14', '#999', 3) +
      [['#ff7aa8', 60], ['#4ecdc4', 200], ['#ffd166', 340]].map(([c, x]) =>
        `<path d="M200 40 L${x - 50} 700 L${x + 50} 700 Z" fill="${c}" opacity=".12"/>`).join('') +
      Array.from({ length: 30 }, (_, i) =>
        `<rect x="${(i * 53) % 400}" y="${(i * 97) % 520}" width="6" height="10" transform="rotate(${i * 37} ${(i * 53) % 400} ${(i * 97) % 520})" fill="${PALETTE[i % 9]}"/>`).join('') +
      `<rect y="580" width="400" height="120" fill="#1a0a26"/>`,
  },
  office: {
    name: 'Oficina', emoji: '🏢',
    draw: () => grad('gOffice', '#e6edf5', '#cfdae6') +
      `<rect width="400" height="700" fill="url(#gOffice)"/>` +
      `<rect x="30" y="60" width="140" height="180" fill="#bfe6ff" stroke="#9aa9b8" stroke-width="6"/>` +
      Array.from({ length: 8 }, (_, i) => stroke(`M30 ${80 + i * 20} L170 ${80 + i * 20}`, '#dfe8f0', 4)).join('') +
      `<rect x="300" y="380" width="70" height="120" rx="6" fill="#7bd389"/><rect x="315" y="480" width="40" height="40" fill="#8a5a33"/>` +
      `<rect y="560" width="400" height="140" fill="#9aa9b8"/>`,
  },
  snow: {
    name: 'Invierno', emoji: '❄️',
    draw: () => grad('gSnow', '#b9d4ee', '#eef5fc') +
      `<rect width="400" height="700" fill="url(#gSnow)"/>` +
      `<path d="M0 360 L80 220 L160 360 Z M120 360 L220 180 L320 360 Z M260 360 L340 240 L420 360 Z" fill="#dbe7f3"/>` +
      `<path d="M60 254 L80 220 L100 254 Z M196 222 L220 180 L244 222 Z" fill="#fff"/>` +
      `<path d="M0 520 Q200 480 400 520 L400 700 L0 700 Z" fill="#fff"/>` +
      Array.from({ length: 40 }, (_, i) => `<circle cx="${(i * 71) % 400}" cy="${(i * 113) % 600}" r="${2 + (i % 3)}" fill="#fff" opacity=".9"/>`).join(''),
  },
};

function grad(id, a, b) {
  return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>`;
}

// ---------- Retos de estilo ----------
const EVENTS = {
  playa: { name: 'un día de playa', emoji: '🏖️', bg: 'beach', bad: ['invierno', 'oficina'] },
  fiesta: { name: 'una fiesta', emoji: '🎉', bg: 'party', bad: ['invierno', 'playa'] },
  oficina: { name: 'su primer día en la oficina', emoji: '💼', bg: 'office', bad: ['playa', 'fiesta'] },
  cita: { name: 'una cena en la ciudad', emoji: '🌃', bg: 'city', bad: ['playa'] },
  invierno: { name: 'un paseo en la nieve', emoji: '❄️', bg: 'snow', bad: ['playa'] },
  parque: { name: 'un picnic en el parque', emoji: '🧺', bg: 'park', bad: ['fiesta'] },
};

// ---------- Regalos ----------
const GIFTS = {
  flor: { name: 'Flor', a: 'una flor', other: 'otra flor', emoji: '🌹' },
  cafe: { name: 'Café', a: 'un café', other: 'otro café', emoji: '☕' },
  choco: { name: 'Chocolate', a: 'un chocolate', other: 'otro chocolate', emoji: '🍫' },
  peluche: { name: 'Peluche', a: 'un peluche', other: 'otro peluche', emoji: '🧸' },
  libro: { name: 'Libro', a: 'un libro', other: 'otro libro', emoji: '📚' },
};

// ---------- Niveles de afinidad ----------
const LEVELS = [
  { min: 0, name: 'Desconocidos' },
  { min: 15, name: 'Conocidos' },
  { min: 35, name: 'Amigos' },
  { min: 60, name: 'Muy cercanos' },
  { min: 85, name: 'Enamorados 💕' },
];

// ---------- Diálogos ----------
// Cada acción tiene frases por tramo de afinidad: [baja, media, alta]
const LINES = {
  saludar: [
    ['¡Hola! Soy Luna, encantada. 😊', 'Oh, hola. ¿Nos conocemos?'],
    ['¡Hey! Qué bien verte otra vez.', '¡Hola, hola! ¿Qué tal tu día?'],
    ['¡Por fin llegas! Te estaba esperando. 💖', '¡Hola! Me alegra mucho verte.'],
  ],
  chiste: [
    ['Jaja... ese estuvo bien. 😅', '¿Por qué el libro de mates estaba triste? ¿Tenía muchos problemas? Ah, ese lo contabas tú. 😆'],
    ['¡JAJAJA! Me encanta tu humor.', 'Jajaja, ese no me lo sabía. ¡Otro!'],
    ['Jajaja, siempre consigues hacerme reír. 💕', '¡Para, que me duele la barriga de reír! 🤣'],
  ],
  repeat: ['Eso ya me lo has dicho... 🙄', 'Hmm, ¿otra vez lo mismo?', 'Intenta algo distinto, ¿vale? 😒'],
  click: {
    head: ['¡Ey! Me despeinas. 😳', 'Jiji, ¿una caricia en la cabeza? 😊', '¿Tengo algo en el pelo?'],
    hand: ['¡Choca esos cinco! ✋', '¿Me das la mano? 😊', '¡Ups! Qué manos tan frías.'],
    body: ['¿Sí? ¿Necesitas algo?', '¿Qué miras? 😄'],
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
  return {
    skin: SKIN_COLORS[1], hairStyle: 'long', hairColor: HAIR_COLORS[1],
    eyeColor: EYE_COLORS[0], lip: LIP_COLORS[0],
    outfit: { top: 'tshirt', bottom: 'jeans', dress: null, shoes: 'sneakers', hat: null, glasses: null, earrings: null, necklace: null, bag: null },
    colors,
    bg: 'room',
    affinity: 0,
    favs,
    favGift: pick(Object.keys(GIFTS)),
    giftCounts: {},
    challenge: null,
    clickedItems: [],
    hintIndex: 0,
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) return Object.assign(defaultState(), JSON.parse(raw));
  } catch (e) { /* almacenamiento no disponible */ }
  return defaultState();
}
function saveState() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) { /* ignorar */ }
}

let state = loadState();
let currentCat = 'top';
let expression = 'smile';
let exprTimer = null;
let bubbleTimer = null;
let lastAction = null;
let bounce = false;

// ---------- Render ----------
const $ = sel => document.querySelector(sel);
const charEl = $('#char');
const bgEl = $('#bg');

function renderScene() {
  bgEl.innerHTML = BACKGROUNDS[state.bg].draw();
  charEl.innerHTML = drawCharacter(state, expression);
  if (bounce) {
    charEl.firstElementChild.classList.add('bounce');
    bounce = false;
  }
}

function renderAffinity() {
  const a = state.affinity;
  $('#affinityFill').style.width = a + '%';
  $('#affinityValue').textContent = a;
  $('#levelName').textContent = levelOf(a).name;
}
const levelOf = a => [...LEVELS].reverse().find(l => a >= l.min);
const tier = () => state.affinity < 35 ? 0 : state.affinity < 70 ? 1 : 2;

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
  const cat = CATEGORIES.find(c => c.id === currentCat);
  const color = state.colors[currentCat];

  const none = document.createElement('button');
  none.innerHTML = '<div class="none">🚫</div>Nada';
  if (!state.outfit[currentCat]) none.classList.add('active');
  none.onclick = () => wear(currentCat, null);
  grid.appendChild(none);

  for (const [id, it] of Object.entries(ITEMS[currentCat])) {
    const b = document.createElement('button');
    b.innerHTML = `<svg viewBox="${cat.view}">${it.draw(color)}</svg>${it.name}`;
    if (state.outfit[currentCat] === id) b.classList.add('active');
    b.onclick = () => wear(currentCat, id);
    grid.appendChild(b);
  }

  swatchRow($('#itemColors'), PALETTE, color, c => {
    state.colors[currentCat] = c;
    update();
  });
}

function renderStyle() {
  const grid = $('#hairGrid');
  grid.innerHTML = '';
  for (const [id, h] of Object.entries(HAIR)) {
    const b = document.createElement('button');
    b.innerHTML = `<svg viewBox="110 20 180 240">${hairBack(id, state.hairColor)}` +
      `<ellipse cx="200" cy="130" rx="52" ry="60" fill="${state.skin}"/>${hairFront(id, state.hairColor)}</svg>${h.name}`;
    if (state.hairStyle === id) b.classList.add('active');
    b.onclick = () => { state.hairStyle = id; update(); };
    grid.appendChild(b);
  }
  swatchRow($('#hairColors'), HAIR_COLORS, state.hairColor, c => { state.hairColor = c; update(); });
  swatchRow($('#eyeColors'), EYE_COLORS, state.eyeColor, c => { state.eyeColor = c; update(); });
  swatchRow($('#lipColors'), LIP_COLORS, state.lip, c => { state.lip = c; update(); });
  swatchRow($('#skinColors'), SKIN_COLORS, state.skin, c => { state.skin = c; update(); });
}

function renderBackgrounds() {
  const grid = $('#bgGrid');
  grid.innerHTML = '';
  for (const [id, bg] of Object.entries(BACKGROUNDS)) {
    const b = document.createElement('button');
    b.innerHTML = `<svg viewBox="0 0 400 700" preserveAspectRatio="xMidYMid slice">${bg.draw()}</svg>${bg.emoji} ${bg.name}`;
    if (state.bg === id) b.classList.add('active');
    b.onclick = () => { state.bg = id; update(); };
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
    box.innerHTML = `Luna te pide ayuda para elegir su ropa para una ocasión especial.` +
      `<div class="row"><button id="btnNewChallenge">🎯 Nuevo reto</button></div>`;
    $('#btnNewChallenge').onclick = newChallenge;
    badge.classList.add('hidden');
    return;
  }
  const ev = EVENTS[ch];
  box.innerHTML = `${ev.emoji} <b>Reto:</b> vístela para <b>${ev.name}</b>. Elige también el lugar adecuado.` +
    `<div class="row"><button id="btnJudge">✅ ¡Lista!</button><button id="btnSkip" class="ghost">Saltar</button></div>`;
  $('#btnJudge').onclick = judgeChallenge;
  $('#btnSkip').onclick = () => { state.challenge = null; update(); say('Vale, otro día será. 🙂'); };
  badge.textContent = `${ev.emoji} Reto: ${ev.name}`;
  badge.classList.remove('hidden');
}

function update() {
  renderScene();
  renderWardrobe();
  renderStyle();
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
  if (id) {
    bounce = true;
    if (state.favs.some(([c, i]) => c === cat && i === id)) {
      setExpression('happy', 2200);
      say(pick(['¡Oh! ¡Me encanta esto! 😍', '¡Es justo mi estilo! 💖']));
    } else if (Math.random() < .3) {
      setExpression(pick(['smile', 'wink', 'happy']), 1500);
    }
  }
  update();
}

function setExpression(name, ms) {
  expression = name;
  renderScene();
  clearTimeout(exprTimer);
  if (ms) exprTimer = setTimeout(() => { expression = 'smile'; renderScene(); }, ms);
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

function outfitIsComplete() {
  const o = state.outfit;
  return (o.dress || (o.top && o.bottom)) && o.shoes;
}

function act(name) {
  if (name !== 'halagar' && isRepeat(name)) return;
  switch (name) {
    case 'saludar':
      setExpression('happy', 1800);
      say(pick(LINES.saludar[tier()]));
      addAffinity(1);
      break;
    case 'chiste':
      if (Math.random() < .25) {
        setExpression('sad', 1800);
        say('Hmm... no lo pillo. 😐');
        addAffinity(0);
      } else {
        setExpression(pick(['happy', 'wink']), 2000);
        say(pick(LINES.chiste[tier()]));
        addAffinity(2);
      }
      break;
    case 'charlar':
      chat();
      break;
    case 'halagar':
      compliment();
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
    say('¿De verdad? ¡Es mi ropa favorita! Gracias... 😳💕');
  } else if (accessories >= 2) {
    setExpression('happy', 2000);
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
  if (count >= 3) {
    setExpression('annoyed', 2000);
    say(`¿${g.other[0].toUpperCase() + g.other.slice(1)}? Ya tengo muchos... 😅`);
    addAffinity(0);
    return;
  }
  if (id === state.favGift) {
    setExpression('happy', 2500);
    say(`¡${g.emoji}! ¿¡Cómo sabías que es mi favorito!? 😍`);
    addAffinity(8);
  } else {
    setExpression('smile', 2000);
    say(`¡${g.a[0].toUpperCase() + g.a.slice(1)} ${g.emoji}! Muchas gracias.`);
    addAffinity(3);
  }
}

function onCharClick(e) {
  const hit = e.target.closest('[data-hit]');
  if (!hit) return;
  const part = hit.dataset.hit;
  bounce = true;
  if (LINES.click[part]) {
    setExpression(part === 'head' ? 'shy' : part === 'hand' ? 'happy' : 'surprised', 1600);
    say(pick(LINES.click[part]));
    if (part === 'hand' && lastAction !== 'hand') addAffinity(1);
    lastAction = part;
    return;
  }
  const id = state.outfit[part];
  if (!id) return;
  const name = ITEMS[part][id].name.toLowerCase();
  setExpression('smile', 1600);
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
  update();
}

function judgeChallenge() {
  const key = state.challenge;
  const ev = EVENTS[key];
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
  const starStr = '★'.repeat(stars) + '☆'.repeat(5 - stars);
  const msgs = {
    1: '¿Esto para ' + ev.name + '? Mejor lo intentamos otra vez... 😬',
    2: 'Hmm, no termina de convencerme.',
    3: 'Está bien, ¡me gusta!',
    4: '¡Me encanta! Voy a causar sensación. ✨',
    5: '¡PERFECTO! ¡Eres un genio de la moda! 😍',
  };
  setExpression(stars >= 4 ? 'happy' : stars === 3 ? 'smile' : 'sad', 3000);
  say(`${starStr} ${msgs[stars]}`, 5000);
  addAffinity(stars >= 3 ? (stars - 2) * 3 : -1);
  state.challenge = null;
  update();
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
  bounce = true;
  setExpression('surprised', 1200);
  update();
}

function takePhoto() {
  const svg = $('#scene').cloneNode(true);
  svg.setAttribute('width', '800');
  svg.setAttribute('height', '1400');
  const data = new XMLSerializer().serializeToString(svg);
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1400;
    canvas.getContext('2d').drawImage(img, 0, 0, 800, 1400);
    const a = document.createElement('a');
    a.download = 'luna.png';
    a.href = canvas.toDataURL('image/png');
    a.click();
  };
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(data);
  setExpression('wink', 1500);
  say('¡Patata! 📸');
}

function resetGame() {
  if (!confirm('¿Reiniciar el juego? Se perderá la afinidad con Luna.')) return;
  state = defaultState();
  expression = 'smile';
  lastAction = null;
  update();
  say('¡Hola! Soy Luna. ¿Me ayudas a elegir qué ponerme? 😊');
}

// ---------- Parpadeo ----------
function scheduleBlink() {
  setTimeout(() => {
    if (expression === 'smile') {
      expression = 'blink';
      renderScene();
      setTimeout(() => { if (expression === 'blink') { expression = 'smile'; renderScene(); } }, 140);
    }
    scheduleBlink();
  }, 2500 + Math.random() * 3000);
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
  charEl.addEventListener('click', onCharClick);
  $('#btnRandom').onclick = randomOutfit;
  $('#btnPhoto').onclick = takePhoto;
  $('#btnReset').onclick = resetGame;

  renderGifts();
  update();
  scheduleBlink();
  say(state.affinity > 0 ? pick(LINES.saludar[tier()]) : '¡Hola! Soy Luna. ¿Me ayudas a elegir qué ponerme? 😊');
}

init();
