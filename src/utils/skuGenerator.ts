/**
 * Park Avenue Menswear — Sartorial Auto SKU Generator
 * 
 * Formats: PA-[CATEGORY]-[COLOR/PATTERN]-[SEQ]
 * Examples:
 *   - The Park Avenue Midnight Navy Super 150s Suit -> PA-SUIT-NVY-101
 *   - Egyptian Cotton White Dress Shirt -> PA-SHRT-WHT-042
 *   - Handcrafted Silk Grenadine Tie -> PA-TIES-BUR-019
 */

export interface SkuOptions {
  name: string;
  category: string;
  fabric?: string;
  color?: string;
  existingSkus?: string[];
  customSequence?: number | string;
}

export interface GeneratedSkuResult {
  sku: string;
  categoryCode: string;
  colorCode: string;
  sequence: string;
  breakdown: string;
}

const CATEGORY_CODE_MAP: Record<string, string> = {
  'suits': 'SUIT',
  'suit': 'SUIT',
  'blazers & jackets': 'BLAZ',
  'blazers': 'BLAZ',
  'jackets': 'BLAZ',
  'sport coats': 'BLAZ',
  'leather jackets': 'LTHR',
  'shirts': 'SHRT',
  'dress shirts': 'SHRT',
  'polo shirts': 'POLO',
  'pants': 'PANT',
  'dress pants': 'PANT',
  'trousers': 'PANT',
  'jeans': 'JEAN',
  'outerwear': 'OUTR',
  'coats': 'COAT',
  'overcoats': 'COAT',
  'trench': 'TRNCH',
  'sweaters & knitwear': 'SWTR',
  'sweaters': 'SWTR',
  'knitwear': 'SWTR',
  'cashmere': 'CASH',
  'footwear': 'SHOE',
  'shoes': 'SHOE',
  'shoe': 'SHOE',
  'boots': 'BOOT',
  'loafers': 'LOAF',
  'loofers': 'LOAF',
  'ties': 'TIES',
  'accessories': 'ACCS',
  'shorts': 'SHRT'
};

const COLOR_PATTERNS: { regex: RegExp; code: string }[] = [
  { regex: /\b(midnight|navy|blue|azure|sapphire|indigo|cobalt)\b/i, code: 'NVY' },
  { regex: /\b(black|noir|onyx|jet)\b/i, code: 'BLK' },
  { regex: /\b(charcoal|anthracite|slate)\b/i, code: 'CHR' },
  { regex: /\b(grey|gray|silver|ash|heather)\b/i, code: 'GRY' },
  { regex: /\b(white|chalk|snow|optic)\b/i, code: 'WHT' },
  { regex: /\b(brown|espresso|cognac|chocolate|walnut|mocha)\b/i, code: 'BRN' },
  { regex: /\b(camel|tan|beige|khaki|sand|wheat|taupe)\b/i, code: 'CAM' },
  { regex: /\b(olive|green|forest|emerald|sage|moss)\b/i, code: 'OLV' },
  { regex: /\b(burgundy|wine|bordeaux|oxblood|maroon|plum)\b/i, code: 'BUR' },
  { regex: /\b(red|crimson|ruby)\b/i, code: 'RED' },
  { regex: /\b(sky blue|powder blue|light blue)\b/i, code: 'LBL' },
  { regex: /\b(ecru|cream|off-white|ivory|vanilla)\b/i, code: 'ECR' },
  { regex: /\b(gold|yellow|amber|honey)\b/i, code: 'GLD' },
  { regex: /\b(pink|rose|blush)\b/i, code: 'PNK' }
];

export function getCategoryCode(category: string): string {
  const norm = (category || '').toLowerCase().trim();
  if (CATEGORY_CODE_MAP[norm]) return CATEGORY_CODE_MAP[norm];
  
  for (const [key, code] of Object.entries(CATEGORY_CODE_MAP)) {
    if (norm.includes(key)) return code;
  }
  
  // Clean fallback: 3-4 uppercase letters
  const cleaned = norm.replace(/[^a-z]/g, '').slice(0, 4).toUpperCase();
  return cleaned || 'GEN';
}

export function detectColorCode(text: string): string {
  const target = (text || '').toLowerCase();
  for (const item of COLOR_PATTERNS) {
    if (item.regex.test(target)) {
      return item.code;
    }
  }
  return 'STD';
}

export function generateAutoSku(options: SkuOptions): GeneratedSkuResult {
  const categoryCode = getCategoryCode(options.category);
  const colorSource = `${options.name} ${options.color || ''} ${options.fabric || ''}`;
  const colorCode = detectColorCode(colorSource);

  const existing = new Set((options.existingSkus || []).map(s => s.toUpperCase().trim()));

  let sequenceStr = '';
  if (options.customSequence !== undefined && options.customSequence !== '') {
    sequenceStr = String(options.customSequence).padStart(3, '0');
  } else {
    // Generate deterministic or collision-free sequence number
    let nextNum = 1;
    // Inspect existing SKUs matching prefix
    const prefix = `PA-${categoryCode}-${colorCode}-`;
    for (const sku of existing) {
      if (sku.startsWith(prefix)) {
        const numPart = parseInt(sku.replace(prefix, ''), 10);
        if (!isNaN(numPart) && numPart >= nextNum) {
          nextNum = numPart + 1;
        }
      }
    }
    sequenceStr = String(nextNum).padStart(3, '0');
  }

  let finalSku = `PA-${categoryCode}-${colorCode}-${sequenceStr}`;
  let attempt = 1;
  while (existing.has(finalSku)) {
    const num = parseInt(sequenceStr, 10) + attempt;
    finalSku = `PA-${categoryCode}-${colorCode}-${String(num).padStart(3, '0')}`;
    attempt++;
  }

  return {
    sku: finalSku,
    categoryCode,
    colorCode,
    sequence: sequenceStr,
    breakdown: `Brand: Park Avenue (PA) · Category: ${categoryCode} · Color: ${colorCode} · Sequence: #${sequenceStr}`
  };
}
