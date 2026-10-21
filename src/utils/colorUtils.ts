/**
 * Park Avenue Menswear — Sartorial & Standard Color Utilities
 * Maps luxury garment shade names, standard colors, and CSS color names to precise hex codes.
 * Provides bidirectional lookup, live contrast detection, and browser canvas CSS color parsing.
 */

export interface LuxuryColorPreset {
  name: string;
  hex: string;
  family: 'navy' | 'black' | 'grey' | 'blue' | 'white' | 'earth' | 'green' | 'burgundy' | 'red' | 'yellow' | 'purple' | 'neutral';
}

/**
 * Curated Sartorial & Standard Color Presets with exact hex values
 */
export const LUXURY_COLOR_PALETTES: LuxuryColorPreset[] = [
  // Navy & Blues
  { name: 'Midnight Navy', hex: '#1B2A4A', family: 'navy' },
  { name: 'Navy', hex: '#000080', family: 'navy' },
  { name: 'Dark Navy', hex: '#000055', family: 'navy' },
  { name: 'Oxford Blue', hex: '#2B4C7E', family: 'blue' },
  { name: 'Powder Blue', hex: '#B0E0E6', family: 'blue' },
  { name: 'Sky Blue', hex: '#87CEEB', family: 'blue' },
  { name: 'Royal Blue', hex: '#4169E1', family: 'blue' },
  { name: 'Cobalt Blue', hex: '#0047AB', family: 'blue' },
  { name: 'Deep Indigo', hex: '#1A237E', family: 'navy' },
  { name: 'Steel Blue', hex: '#4682B4', family: 'blue' },
  { name: 'Teal', hex: '#008080', family: 'blue' },
  { name: 'Cyan', hex: '#00FFFF', family: 'blue' },
  { name: 'Blue', hex: '#0000FF', family: 'blue' },

  // Black & Greys
  { name: 'Sovereign Black', hex: '#111827', family: 'black' },
  { name: 'Black', hex: '#000000', family: 'black' },
  { name: 'Charcoal Grey', hex: '#374151', family: 'grey' },
  { name: 'Charcoal', hex: '#36454F', family: 'grey' },
  { name: 'Slate Grey', hex: '#708090', family: 'grey' },
  { name: 'Silver Slate', hex: '#9CA3AF', family: 'grey' },
  { name: 'Silver', hex: '#C0C0C0', family: 'grey' },
  { name: 'Light Grey', hex: '#D3D3D3', family: 'grey' },
  { name: 'Heather Grey', hex: '#9AA2A6', family: 'grey' },
  { name: 'Grey', hex: '#808080', family: 'grey' },
  { name: 'Gray', hex: '#808080', family: 'grey' },

  // Whites & Neutrals
  { name: 'Ivory White', hex: '#FFFFF0', family: 'white' },
  { name: 'Ivory', hex: '#FFFFF0', family: 'white' },
  { name: 'Chalk White', hex: '#F9F9F8', family: 'white' },
  { name: 'White', hex: '#FFFFFF', family: 'white' },
  { name: 'Off White', hex: '#FAF9F6', family: 'white' },
  { name: 'Cream', hex: '#FFFDD0', family: 'white' },
  { name: 'Oatmeal Melange', hex: '#E5DCC5', family: 'neutral' },
  { name: 'Beige', hex: '#F5F5DC', family: 'neutral' },
  { name: 'Sand', hex: '#C2B280', family: 'neutral' },
  { name: 'Khaki', hex: '#C3B091', family: 'neutral' },
  { name: 'Tan', hex: '#D2B48C', family: 'earth' },

  // Earth, Browns & Camels
  { name: 'Cognac Camel', hex: '#936B34', family: 'earth' },
  { name: 'Camel', hex: '#C19A6B', family: 'earth' },
  { name: 'Espresso Brown', hex: '#4A2E18', family: 'earth' },
  { name: 'Dark Brown', hex: '#3D2314', family: 'earth' },
  { name: 'Brown', hex: '#8B4513', family: 'earth' },
  { name: 'Chocolate', hex: '#5C381E', family: 'earth' },
  { name: 'Tobacco Suede', hex: '#8B5A2B', family: 'earth' },
  { name: 'Caramel', hex: '#AF6E4D', family: 'earth' },
  { name: 'Rust', hex: '#B7410E', family: 'earth' },
  { name: 'Terracotta', hex: '#E2725B', family: 'earth' },

  // Burgundy & Reds
  { name: 'Burgundy Wine', hex: '#722F37', family: 'burgundy' },
  { name: 'Burgundy', hex: '#800020', family: 'burgundy' },
  { name: 'Wine', hex: '#722F37', family: 'burgundy' },
  { name: 'Maroon', hex: '#800000', family: 'burgundy' },
  { name: 'Bordeaux', hex: '#5C0120', family: 'burgundy' },
  { name: 'Crimson', hex: '#DC143C', family: 'red' },
  { name: 'Red', hex: '#FF0000', family: 'red' },
  { name: 'Dark Red', hex: '#8B0000', family: 'red' },
  { name: 'Ruby', hex: '#E0115F', family: 'red' },
  { name: 'Rose', hex: '#FF007F', family: 'red' },
  { name: 'Coral', hex: '#FF7F50', family: 'red' },
  { name: 'Pink', hex: '#FFC0CB', family: 'red' },

  // Greens
  { name: 'Forest Green', hex: '#1E3F20', family: 'green' },
  { name: 'Emerald Green', hex: '#50C878', family: 'green' },
  { name: 'Emerald', hex: '#50C878', family: 'green' },
  { name: 'Olive Drab', hex: '#556B2F', family: 'green' },
  { name: 'Olive', hex: '#808000', family: 'green' },
  { name: 'Sage Green', hex: '#9CAF88', family: 'green' },
  { name: 'Sage', hex: '#9CAF88', family: 'green' },
  { name: 'Hunter Green', hex: '#355E3B', family: 'green' },
  { name: 'Pine Green', hex: '#01796F', family: 'green' },
  { name: 'Green', hex: '#008000', family: 'green' },
  { name: 'Dark Green', hex: '#006400', family: 'green' },
  { name: 'Mint Green', hex: '#98FF98', family: 'green' },

  // Yellows & Golds
  { name: 'Gold', hex: '#D4AF37', family: 'yellow' },
  { name: 'Mustard', hex: '#FFDB58', family: 'yellow' },
  { name: 'Yellow', hex: '#FFFF00', family: 'yellow' },
  { name: 'Amber', hex: '#FFBF00', family: 'yellow' },
  { name: 'Bronze', hex: '#CD7F32', family: 'earth' },
  { name: 'Orange', hex: '#FFA500', family: 'earth' },

  // Purples
  { name: 'Purple', hex: '#800080', family: 'purple' },
  { name: 'Plum', hex: '#8E4585', family: 'purple' },
  { name: 'Violet', hex: '#EE82EE', family: 'purple' },
  { name: 'Lavender', hex: '#E6E6FA', family: 'purple' }
];

/**
 * Standard CSS named color dictionary for instant exact mapping
 */
const STANDARD_CSS_COLORS: Record<string, string> = {
  black: '#000000',
  white: '#ffffff',
  red: '#ff0000',
  green: '#008000',
  blue: '#0000ff',
  yellow: '#ffff00',
  cyan: '#00ffff',
  magenta: '#ff00ff',
  silver: '#c0c0c0',
  gray: '#808080',
  grey: '#808080',
  maroon: '#800000',
  olive: '#808000',
  purple: '#800080',
  teal: '#008080',
  navy: '#000080',
  orange: '#ffa500',
  pink: '#ffc0cb',
  brown: '#8b4513',
  gold: '#ffd700',
  indigo: '#4b0082',
  violet: '#ee82ee',
  beige: '#f5f5dc',
  ivory: '#fffff0',
  khaki: '#f0e68c',
  coral: '#ff7f50',
  crimson: '#dc143c',
  turquoise: '#40e0d0',
  aqua: '#00ffff',
  lime: '#00ff00',
  tan: '#d2b48c',
  chocolate: '#d2691e',
  plum: '#dda0dd',
  salmon: '#fa8072',
  aquamarine: '#7fffd4',
  azure: '#f0ffff',
  bisque: '#ffe4c4',
  chartreuse: '#7fff00',
  cornflowerblue: '#6495ed',
  darkblue: '#00008b',
  darkcyan: '#008b8b',
  darkgoldenrod: '#b8860b',
  darkgray: '#a9a9a9',
  darkgrey: '#a9a9a9',
  darkgreen: '#006400',
  darkkhaki: '#bdb76b',
  darkmagenta: '#8b008b',
  darkolivegreen: '#556b2f',
  darkorange: '#ff8c00',
  darkorchid: '#9932cc',
  darkred: '#8b0000',
  darksalmon: '#e9967a',
  darkseagreen: '#8fbc8f',
  darkslateblue: '#483d8b',
  darkslategray: '#2f4f4f',
  darkslategrey: '#2f4f4f',
  darkturquoise: '#00ced1',
  darkviolet: '#9400d3',
  deeppink: '#ff1493',
  deepskyblue: '#00bfff',
  dimgray: '#696969',
  dimgrey: '#696969',
  dodgerblue: '#1e90ff',
  firebrick: '#b22222',
  forestgreen: '#228b22',
  fuchsia: '#ff00ff',
  gainsboro: '#dcdcdc',
  ghostwhite: '#f8f8ff',
  goldenrod: '#daa520',
  greenyellow: '#adff2f',
  honeydew: '#f0fff0',
  hotpink: '#ff69b4',
  indianred: '#cd5c5c',
  lavender: '#e6e6fa',
  lavenderblush: '#fff0f5',
  lawngreen: '#7cfc00',
  lemonchiffon: '#fffacd',
  lightblue: '#add8e6',
  lightcoral: '#f08080',
  lightcyan: '#e0ffff',
  lightgoldenrodyellow: '#fafad2',
  lightgray: '#d3d3d3',
  lightgrey: '#d3d3d3',
  lightgreen: '#90ee90',
  lightpink: '#ffb6c1',
  lightsalmon: '#ffa07a',
  lightseagreen: '#20b2aa',
  lightskyblue: '#87cefa',
  lightslategray: '#778899',
  lightslategrey: '#778899',
  lightsteelblue: '#b0c4de',
  lightyellow: '#ffffe0',
  limegreen: '#32cd32',
  linen: '#faf0e6',
  mediumaquamarine: '#66cdaa',
  mediumblue: '#0000cd',
  mediumorchid: '#ba55d3',
  mediumpurple: '#9370db',
  mediumseagreen: '#3cb371',
  mediumslateblue: '#7b68ee',
  mediumspringgreen: '#00fa9a',
  mediumturquoise: '#48d1cc',
  mediumvioletred: '#c71585',
  midnightblue: '#191970',
  mintcream: '#f5fffa',
  mistyrose: '#ffe4e1',
  moccasin: '#ffe4e5',
  navajowhite: '#ffdead',
  oldlace: '#fdf5e6',
  olivedrab: '#6b8e23',
  orangered: '#ff4500',
  orchid: '#da70d6',
  palegoldenrod: '#eee8aa',
  palegreen: '#98fb98',
  paleturquoise: '#afeeee',
  palevioletred: '#db7093',
  papayawhip: '#ffefd5',
  peachpuff: '#ffdab9',
  peru: '#cd853f',
  powderblue: '#b0e0e6',
  rosybrown: '#bc8f8f',
  royalblue: '#4169e1',
  saddlebrown: '#8b4513',
  sandybrown: '#f4a460',
  seagreen: '#2e8b57',
  seashell: '#fff5ee',
  sienna: '#a0522d',
  skyblue: '#87ceeb',
  slateblue: '#6a5acd',
  slategray: '#708090',
  slategrey: '#708090',
  snow: '#fffafa',
  springgreen: '#00ff7f',
  steelblue: '#4682b4',
  thistle: '#d8bfd8',
  tomato: '#ff6347',
  wheat: '#f5deb3',
  whitesmoke: '#f5f5f5',
  yellowgreen: '#9acd32'
};

/**
 * Cache for dynamically parsed browser CSS color strings
 */
const dynamicColorCache = new Map<string, string>();

/**
 * Dynamically resolves any CSS color name or expression to a 6-digit hex code
 */
function parseCssColorToHex(colorName: string): string | null {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return null;
  }
  const cached = dynamicColorCache.get(colorName);
  if (cached) return cached;

  try {
    const d = document.createElement('div');
    d.style.color = colorName;
    document.body.appendChild(d);
    const computed = window.getComputedStyle(d).color;
    document.body.removeChild(d);

    const rgbMatch = computed.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1], 10).toString(16).padStart(2, '0');
      const g = parseInt(rgbMatch[2], 10).toString(16).padStart(2, '0');
      const b = parseInt(rgbMatch[3], 10).toString(16).padStart(2, '0');
      const hex = `#${r}${g}${b}`.toUpperCase();
      dynamicColorCache.set(colorName, hex);
      return hex;
    }
  } catch (_) {}

  return null;
}

/**
 * Resolves any color string (name, hex, preset, or CSS color) to its exact hex code.
 */
export function getColorHex(colorName: string): string {
  if (!colorName) return '#1B2A4A';
  const clean = colorName.trim();
  const lower = clean.toLowerCase();

  // 1. If already a valid hex code, normalize and return
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(lower)) {
    if (lower.length === 4) {
      return `#${lower[1]}${lower[1]}${lower[2]}${lower[2]}${lower[3]}${lower[3]}`.toUpperCase();
    }
    return lower.toUpperCase();
  }

  // 2. Exact match from luxury presets
  const preset = LUXURY_COLOR_PALETTES.find(p => p.name.toLowerCase() === lower);
  if (preset) return preset.hex.toUpperCase();

  // 3. Exact match from standard CSS colors
  const normalizedKey = lower.replace(/[\s_-]+/g, '');
  if (STANDARD_CSS_COLORS[normalizedKey]) {
    return STANDARD_CSS_COLORS[normalizedKey].toUpperCase();
  }
  if (STANDARD_CSS_COLORS[lower]) {
    return STANDARD_CSS_COLORS[lower].toUpperCase();
  }

  // 4. Try browser-native CSS color parsing for any standard or extended CSS color
  const parsedHex = parseCssColorToHex(lower);
  if (parsedHex) return parsedHex;

  // 5. Intelligent Sartorial & Semantic Fuzzy Matching
  if (lower.includes('midnight') || lower.includes('navy')) return '#1B2A4A';
  if (lower.includes('powder blue') || lower.includes('baby blue')) return '#B0E0E6';
  if (lower.includes('sky blue')) return '#87CEEB';
  if (lower.includes('royal blue')) return '#4169E1';
  if (lower.includes('cobalt')) return '#0047AB';
  if (lower.includes('indigo')) return '#1A237E';
  if (lower.includes('teal')) return '#008080';
  if (lower.includes('cyan')) return '#00FFFF';
  if (lower.includes('blue')) return '#2B4C7E';

  if (lower.includes('charcoal') || lower.includes('anthracite') || lower.includes('graphite')) return '#374151';
  if (lower.includes('black') || lower.includes('obsidian') || lower.includes('noir') || lower.includes('onyx')) return '#111827';
  if (lower.includes('silver') || lower.includes('ash') || lower.includes('slate')) return '#9CA3AF';
  if (lower.includes('grey') || lower.includes('gray')) return '#6B7280';

  if (lower.includes('ivory')) return '#FFFFF0';
  if (lower.includes('chalk') || lower.includes('off white') || lower.includes('off-white')) return '#FAF9F6';
  if (lower.includes('cream')) return '#FFFDD0';
  if (lower.includes('white') || lower.includes('pearl')) return '#FFFFFF';
  if (lower.includes('beige') || lower.includes('oatmeal') || lower.includes('sand')) return '#E5DCC5';
  if (lower.includes('khaki')) return '#C3B091';
  if (lower.includes('tan')) return '#D2B48C';

  if (lower.includes('burgundy') || lower.includes('bordeaux')) return '#800020';
  if (lower.includes('wine') || lower.includes('maroon') || lower.includes('plum')) return '#722F37';
  if (lower.includes('crimson') || lower.includes('scarlet')) return '#DC143C';
  if (lower.includes('ruby')) return '#E0115F';
  if (lower.includes('coral') || lower.includes('salmon')) return '#FF7F50';
  if (lower.includes('pink') || lower.includes('rose')) return '#FFC0CB';
  if (lower.includes('red')) return '#FF0000';

  if (lower.includes('emerald')) return '#50C878';
  if (lower.includes('forest') || lower.includes('hunter') || lower.includes('pine')) return '#1E3F20';
  if (lower.includes('olive') || lower.includes('sage') || lower.includes('moss')) return '#556B2F';
  if (lower.includes('green') || lower.includes('mint')) return '#008000';

  if (lower.includes('camel') || lower.includes('cognac') || lower.includes('caramel')) return '#936B34';
  if (lower.includes('espresso') || lower.includes('chocolate') || lower.includes('mocha') || lower.includes('walnut')) return '#4A2E18';
  if (lower.includes('brown')) return '#8B4513';
  if (lower.includes('rust') || lower.includes('terracotta') || lower.includes('copper')) return '#B7410E';

  if (lower.includes('gold')) return '#D4AF37';
  if (lower.includes('mustard')) return '#FFDB58';
  if (lower.includes('amber')) return '#FFBF00';
  if (lower.includes('yellow')) return '#FFFF00';
  if (lower.includes('orange')) return '#FFA500';

  if (lower.includes('purple')) return '#800080';
  if (lower.includes('violet') || lower.includes('lavender')) return '#EE82EE';

  return '#1B2A4A';
}

/**
 * Given a hex code, returns the exact or closest friendly color name
 */
export function getColorName(hex: string): string {
  if (!hex) return 'Midnight Navy';
  const cleanHex = hex.trim().toUpperCase();

  // Match from luxury palettes first
  const preset = LUXURY_COLOR_PALETTES.find(p => p.hex.toUpperCase() === cleanHex);
  if (preset) return preset.name;

  // Match from standard colors
  for (const [name, colorHex] of Object.entries(STANDARD_CSS_COLORS)) {
    if (colorHex.toUpperCase() === cleanHex) {
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
  }

  return cleanHex;
}

/**
 * Determines whether a color is light or dark for high-contrast border and icon rendering
 */
export function isLightColor(hex: string): boolean {
  if (!hex || hex[0] !== '#') return false;
  const clean = hex.trim();
  const rgb = clean.length === 4
    ? clean.slice(1).split('').map(c => parseInt(c + c, 16))
    : [parseInt(clean.slice(1, 3), 16), parseInt(clean.slice(3, 5), 16), parseInt(clean.slice(5, 7), 16)];
  
  if (rgb.some(isNaN)) return false;
  // Perceived brightness formula (ITU-R BT.601)
  const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
  return brightness > 185;
}

export interface ExtractedColor {
  name: string;
  hex: string;
  isLight: boolean;
}

/**
 * Extracts distinct color variations from a product with accurate hex codes and brightness detection
 */
export function extractProductColors(product: { colors?: string[]; variants?: { color?: string; colorHex?: string }[] }): ExtractedColor[] {
  const result: ExtractedColor[] = [];
  const seen = new Set<string>();

  const pushColor = (name: string, customHex?: string) => {
    const trimmed = (name || '').trim();
    if (!trimmed) return;
    const lower = trimmed.toLowerCase();
    if (seen.has(lower)) return;
    seen.add(lower);
    const hex = customHex && customHex.startsWith('#') ? customHex.toUpperCase() : getColorHex(trimmed);
    result.push({
      name: trimmed,
      hex,
      isLight: isLightColor(hex)
    });
  };

  if (Array.isArray(product.colors)) {
    product.colors.forEach(c => pushColor(c));
  }

  if (Array.isArray(product.variants)) {
    product.variants.forEach(v => {
      if (v.color) pushColor(v.color, v.colorHex);
    });
  }

  if (result.length === 0) {
    pushColor('Midnight Navy', '#1B2A4A');
  }

  return result;
}
