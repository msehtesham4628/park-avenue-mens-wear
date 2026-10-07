/**
 * Park Avenue Menswear — Sartorial Auto SKU Generator
 * 
 * Formats: PA-[CATEGORY]-[COLOR/PATTERN]-[SEQ]
 * Examples:
 *   - The Park Avenue Midnight Navy Super 150s Suit -> PA-SUIT-NVY-001, PA-SUIT-CHR-002
 *   - Egyptian Cotton White Dress Shirt -> PA-SHRT-WHT-001, PA-SHRT-BLU-002
 *   - Handcrafted Silk Grenadine Tie -> PA-TIES-BUR-001
 */

export interface SkuOptions {
  name: string;
  category: string;
  fabric?: string;
  color?: string;
  existingSkus?: string[];
  currentSku?: string;
  categoryCount?: number;
  totalCatalogCount?: number;
  customSequence?: number | string;
}

export interface GeneratedSkuResult {
  sku: string;
  categoryCode: string;
  colorCode: string;
  sequence: string;
  breakdown: string;
  nextAvailableSequence: number;
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
  'slacks': 'PANT',
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

const CATEGORY_ALIASES: Record<string, string[]> = {
  'SUIT': ['PA-SUIT', 'PA-ST', 'PA-BLAZER'],
  'BLAZ': ['PA-BLAZ', 'PA-BLAZER', 'PA-ST'],
  'SHRT': ['PA-SHRT', 'PA-SH', 'PA-POLO'],
  'POLO': ['PA-POLO', 'PA-PO', 'PA-SHRT'],
  'PANT': ['PA-PANT', 'PA-TR', 'PA-JN'],
  'JEAN': ['PA-JEAN', 'PA-JN'],
  'OUTR': ['PA-OUTR', 'PA-CT', 'PA-LJ'],
  'COAT': ['PA-COAT', 'PA-CT', 'PA-OUTR'],
  'SWTR': ['PA-SWTR', 'PA-SW', 'PA-CASH'],
  'SHOE': ['PA-SHOE', 'PA-SH', 'PA-BT', 'PA-LF'],
  'BOOT': ['PA-BOOT', 'PA-BT'],
  'LOAF': ['PA-LOAF', 'PA-LF'],
  'TIES': ['PA-TIES', 'PA-TI'],
  'ACCS': ['PA-ACCS', 'PA-ACC'],
  'LTHR': ['PA-LTHR', 'PA-LJ']
};

const COLOR_PATTERNS: { regex: RegExp; code: string }[] = [
  { regex: /\b(midnight|navy|blue|azure|sapphire|indigo|cobalt)\b/i, code: 'NVY' },
  { regex: /\b(black|noir|onyx|jet|obsidian)\b/i, code: 'BLK' },
  { regex: /\b(charcoal|anthracite|slate)\b/i, code: 'CHR' },
  { regex: /\b(grey|gray|silver|ash|heather)\b/i, code: 'GRY' },
  { regex: /\b(white|chalk|snow|optic|ivory|ecru|cream|pearl)\b/i, code: 'WHT' },
  { regex: /\b(brown|espresso|cognac|chocolate|walnut|mocha|tobacco)\b/i, code: 'BRN' },
  { regex: /\b(camel|tan|beige|khaki|sand|wheat|taupe)\b/i, code: 'CAM' },
  { regex: /\b(olive|green|forest|emerald|sage|moss)\b/i, code: 'OLV' },
  { regex: /\b(burgundy|wine|bordeaux|oxblood|maroon|plum|ruby)\b/i, code: 'BUR' },
  { regex: /\b(red|crimson)\b/i, code: 'RED' },
  { regex: /\b(sky blue|powder blue|light blue|baby blue)\b/i, code: 'LBL' },
  { regex: /\b(gold|yellow|amber|honey)\b/i, code: 'GLD' },
  { regex: /\b(pink|rose|blush)\b/i, code: 'PNK' },
  { regex: /\b(purple|violet|lavender)\b/i, code: 'PLM' }
];

export function getCategoryCode(category: string): string {
  const norm = (category || '').toLowerCase().trim();
  if (CATEGORY_CODE_MAP[norm]) return CATEGORY_CODE_MAP[norm];
  
  for (const [key, code] of Object.entries(CATEGORY_CODE_MAP)) {
    if (norm.includes(key)) return code;
  }
  
  const cleaned = norm.replace(/[^a-z]/g, '').slice(0, 4).toUpperCase();
  return cleaned || 'SUIT';
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
  const colorSource = `${options.name || ''} ${options.color || ''} ${options.fabric || ''}`;
  const colorCode = detectColorCode(colorSource);

  const fullPrefix = `PA-${categoryCode}-${colorCode}-`;
  const aliases = CATEGORY_ALIASES[categoryCode] || [`PA-${categoryCode}`];

  const existingSet = new Set<string>();
  const categoryNumbers: number[] = [];

  const inspectSku = (s: string) => {
    if (!s || typeof s !== 'string') return;
    const clean = s.trim().toUpperCase();
    existingSet.add(clean);

    // Check if SKU matches this category prefix or any of its historical aliases
    const matchesCategory = aliases.some(alias => clean.startsWith(alias.toUpperCase())) || clean.includes(categoryCode);
    if (matchesCategory) {
      const match = clean.match(/[-_](\d{1,4})(?:$|[-_])/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num >= 1 && num <= 9999) {
          categoryNumbers.push(num);
        }
      }
    }
  };

  (options.existingSkus || []).forEach(inspectSku);

  // Check currentSku in form if provided
  let currentNum = 0;
  if (options.currentSku) {
    const match = options.currentSku.match(/[-_](\d{1,4})(?:$|[-_])/);
    if (match) {
      const parsed = parseInt(match[1], 10);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 9999) {
        currentNum = parsed;
        categoryNumbers.push(parsed);
      }
    }
  }

  // Determine highest existing sequence number in this category
  let maxFound = categoryNumbers.length > 0 ? Math.max(...categoryNumbers) : 0;

  // If client provided a category count or total catalog count, ensure sequence exceeds it
  if (typeof options.categoryCount === 'number' && options.categoryCount > maxFound) {
    maxFound = options.categoryCount;
  }
  if (maxFound === 0 && typeof options.totalCatalogCount === 'number' && options.totalCatalogCount > 0) {
    maxFound = options.totalCatalogCount;
  }

  let nextNum: number;
  if (options.customSequence !== undefined && options.customSequence !== '') {
    const parsed = parseInt(String(options.customSequence), 10);
    nextNum = !isNaN(parsed) && parsed >= 1 ? parsed : 1;
  } else {
    // Increment past highest recorded sequence number
    nextNum = maxFound > 0 ? maxFound + 1 : 1;

    // If current SKU in input had a number, ensure we advance to next
    if (currentNum > 0 && nextNum <= currentNum) {
      nextNum = currentNum + 1;
    }
  }

  let sequenceStr = String(nextNum).padStart(3, '0');
  let finalSku = `${fullPrefix}${sequenceStr}`;

  let safety = 0;
  while (existingSet.has(finalSku.toUpperCase()) && safety < 1000) {
    nextNum++;
    sequenceStr = String(nextNum).padStart(3, '0');
    finalSku = `${fullPrefix}${sequenceStr}`;
    safety++;
  }

  return {
    sku: finalSku,
    categoryCode,
    colorCode,
    sequence: sequenceStr,
    nextAvailableSequence: nextNum,
    breakdown: `Brand: Park Avenue (PA) · Category: ${categoryCode} · Color: ${colorCode} · Sequence: #${sequenceStr}`
  };
}
