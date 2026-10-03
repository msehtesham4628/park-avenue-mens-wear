/**
 * Park Avenue Menswear — Sartorial Color Utilities
 * Maps luxury garment shade names to precise hex palettes and provides helpers
 * for swatch rendering, contrast detection, and product color extraction.
 */

export interface LuxuryColorPreset {
  name: string;
  hex: string;
  family: 'navy' | 'black' | 'grey' | 'blue' | 'white' | 'earth' | 'green' | 'burgundy';
}

export const LUXURY_COLOR_PALETTES: LuxuryColorPreset[] = [
  { name: 'Midnight Navy', hex: '#1B2A4A', family: 'navy' },
  { name: 'Sovereign Black', hex: '#111827', family: 'black' },
  { name: 'Charcoal Grey', hex: '#374151', family: 'grey' },
  { name: 'Oxford Blue', hex: '#2B4C7E', family: 'blue' },
  { name: 'Ivory White', hex: '#F9F9F8', family: 'white' },
  { name: 'Burgundy Wine', hex: '#722F37', family: 'burgundy' },
  { name: 'Forest Green', hex: '#1E3F20', family: 'green' },
  { name: 'Cognac Camel', hex: '#936B34', family: 'earth' },
  { name: 'Espresso Brown', hex: '#4A2E18', family: 'earth' },
  { name: 'Silver Slate', hex: '#9CA3AF', family: 'grey' },
  { name: 'Olive Drab', hex: '#556B2F', family: 'green' },
  { name: 'Royal Azure', hex: '#1E40AF', family: 'blue' },
  { name: 'Oatmeal Melange', hex: '#E5DCC5', family: 'white' },
  { name: 'Tobacco Suede', hex: '#8B5A2B', family: 'earth' },
  { name: 'Deep Indigo', hex: '#1A237E', family: 'navy' }
];

export function getColorHex(colorName: string): string {
  if (!colorName) return '#1B2A4A';
  const clean = colorName.trim().toLowerCase();

  // If already a valid hex
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(clean)) {
    return clean;
  }

  // Exact matching from presets
  const exact = LUXURY_COLOR_PALETTES.find(p => p.name.toLowerCase() === clean);
  if (exact) return exact.hex;

  // Fuzzy matches
  if (clean.includes('midnight') || clean.includes('navy')) return '#1B2A4A';
  if (clean.includes('black') || clean.includes('obsidian') || clean.includes('noir')) return '#111827';
  if (clean.includes('charcoal') || clean.includes('anthracite') || clean.includes('graphite')) return '#374151';
  if (clean.includes('oxford') || clean.includes('royal blue') || clean.includes('azure') || clean.includes('sky')) return '#2B4C7E';
  if (clean.includes('white') || clean.includes('ivory') || clean.includes('cream') || clean.includes('pearl') || clean.includes('chalk')) return '#F9F9F8';
  if (clean.includes('burgundy') || clean.includes('wine') || clean.includes('bordeaux') || clean.includes('maroon') || clean.includes('plum')) return '#722F37';
  if (clean.includes('forest') || clean.includes('emerald') || clean.includes('hunter') || clean.includes('pine')) return '#1E3F20';
  if (clean.includes('camel') || clean.includes('cognac') || clean.includes('tan') || clean.includes('caramel') || clean.includes('toffee')) return '#936B34';
  if (clean.includes('espresso') || clean.includes('brown') || clean.includes('chocolate') || clean.includes('mocha') || clean.includes('walnut')) return '#4A2E18';
  if (clean.includes('grey') || clean.includes('gray') || clean.includes('silver') || clean.includes('ash') || clean.includes('dove') || clean.includes('slate')) return '#6B7280';
  if (clean.includes('olive') || clean.includes('sage') || clean.includes('khaki') || clean.includes('moss')) return '#556B2F';
  if (clean.includes('blue') || clean.includes('indigo') || clean.includes('cobalt')) return '#1E3A8A';
  if (clean.includes('sand') || clean.includes('oatmeal') || clean.includes('beige')) return '#E5DCC5';
  if (clean.includes('rust') || clean.includes('terracotta') || clean.includes('copper')) return '#B7410E';

  return '#1F2937';
}

export function isLightColor(hex: string): boolean {
  if (!hex || hex[0] !== '#') return false;
  const rgb = hex.length === 4
    ? hex.slice(1).split('').map(c => parseInt(c + c, 16))
    : [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
  
  if (rgb.some(isNaN)) return false;
  // Perceived brightness formula
  const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
  return brightness > 180;
}

export interface ExtractedColor {
  name: string;
  hex: string;
  isLight: boolean;
}

export function extractProductColors(product: { colors?: string[]; variants?: { color?: string; colorHex?: string }[] }): ExtractedColor[] {
  const result: ExtractedColor[] = [];
  const seen = new Set<string>();

  const pushColor = (name: string, customHex?: string) => {
    const trimmed = (name || '').trim();
    if (!trimmed) return;
    const lower = trimmed.toLowerCase();
    if (seen.has(lower)) return;
    seen.add(lower);
    const hex = customHex && customHex.startsWith('#') ? customHex : getColorHex(trimmed);
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
