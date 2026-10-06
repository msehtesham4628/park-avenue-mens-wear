import { ProductModel } from '../models/Product.js';

export interface GenerateSkuOptions {
  name?: string;
  category: string;
  fabric?: string;
  color?: string;
  existingSkus?: string[];
  currentSku?: string;
  customSequence?: number | string;
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
  'oxfords': 'SHOE',
  'boots': 'BOOT',
  'loafers': 'LOAF',
  'loofers': 'LOAF',
  'ties': 'TIES',
  'accessories': 'ACCS',
  'shorts': 'SHRT'
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
  { regex: /\b(gold|yellow|amber|honey|mustard)\b/i, code: 'GLD' },
  { regex: /\b(pink|rose|blush)\b/i, code: 'PNK' },
  { regex: /\b(purple|violet|lavender)\b/i, code: 'PLM' }
];

export const skuService = {
  getCategoryCode(category: string): string {
    const norm = (category || '').toLowerCase().trim();
    if (CATEGORY_CODE_MAP[norm]) return CATEGORY_CODE_MAP[norm];
    for (const [key, code] of Object.entries(CATEGORY_CODE_MAP)) {
      if (norm.includes(key)) return code;
    }
    const cleaned = norm.replace(/[^a-z]/g, '').slice(0, 4).toUpperCase();
    return cleaned || 'SUIT';
  },

  detectColorCode(text: string): string {
    const target = (text || '').toLowerCase();
    for (const item of COLOR_PATTERNS) {
      if (item.regex.test(target)) return item.code;
    }
    return 'STD';
  },

  /**
   * Generates a collision-proof, sequentially advancing luxury SKU
   * across the category and catalog (e.g. PA-SUIT-NVY-001, PA-SUIT-CHR-002, etc.)
   */
  async generateSku(params: GenerateSkuOptions): Promise<{
    sku: string;
    categoryCode: string;
    colorCode: string;
    sequence: string;
    nextAvailableSequence: number;
  }> {
    const catCode = this.getCategoryCode(params.category);
    const colorCode = this.detectColorCode(`${params.name || ''} ${params.color || ''} ${params.fabric || ''}`);
    const prefix = `PA-${catCode}-${colorCode}-`;
    const catPrefix = `PA-${catCode}-`;

    const allExistingSkusSet = new Set<string>();
    const categorySequenceNumbers: number[] = [];

    // Helper to register SKU string and extract sequence
    const registerSku = (skuStr: string, belongsToCategory: boolean) => {
      if (!skuStr || typeof skuStr !== 'string') return;
      const clean = skuStr.trim().toUpperCase();
      allExistingSkusSet.add(clean);

      // If SKU belongs to this category or matches PA-{CAT}-
      if (belongsToCategory || clean.startsWith(catPrefix)) {
        // Extract sequence number: e.g. PA-SUIT-NVY-002 -> 2, PA-SUIT-005 -> 5
        const match = clean.match(/[-_](\d{1,4})(?:$|[-_])/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num >= 1 && num <= 9999) {
            categorySequenceNumbers.push(num);
          }
        }
      }
    };

    // 1. Scan existing SKUs passed from frontend state
    if (Array.isArray(params.existingSkus)) {
      for (const s of params.existingSkus) {
        registerSku(s, s.toUpperCase().includes(catCode));
      }
    }

    // 2. Query MongoDB for existing products in this category and with matching category prefixes
    let catProductCount = 0;
    try {
      const catRegex = new RegExp(`^${(params.category || 'suit').replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}`, 'i');
      const catProducts = await ProductModel.find({
        $or: [
          { category: catRegex },
          { sku: { $regex: `^PA-${catCode}`, $options: 'i' } }
        ]
      }).select('sku variants category').lean();

      catProductCount = catProducts.length;

      for (const p of catProducts) {
        if (p.sku) registerSku(p.sku, true);
        if (Array.isArray(p.variants)) {
          for (const v of p.variants) {
            if (v.sku) registerSku(v.sku, true);
          }
        }
      }

      // Also grab all other SKUs across catalog to prevent any global collisions
      const otherProducts = await ProductModel.find({}).select('sku').limit(300).lean();
      for (const op of otherProducts) {
        if (op.sku) allExistingSkusSet.add(op.sku.trim().toUpperCase());
      }
    } catch (dbErr) {
      console.warn('[SkuService] DB query fallback:', dbErr);
    }

    // 3. Inspect currentSku if provided (e.g. user already has PA-SUIT-NVY-001 in the box)
    let currentSequenceNumber = 0;
    if (params.currentSku && typeof params.currentSku === 'string') {
      const match = params.currentSku.match(/[-_](\d{1,4})(?:$|[-_])/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num >= 1 && num <= 9999) {
          currentSequenceNumber = num;
          categorySequenceNumbers.push(num);
        }
      }
    }

    // 4. Calculate highest sequence number in this category
    let maxFound = 0;
    if (categorySequenceNumbers.length > 0) {
      maxFound = Math.max(...categorySequenceNumbers);
    }

    // If there are existing products in this category, ensure sequence is at least past the count
    if (catProductCount > maxFound) {
      maxFound = Math.max(maxFound, catProductCount);
    }

    // 5. Determine starting sequence number
    let nextNum: number;
    if (params.customSequence !== undefined && params.customSequence !== '') {
      const customNum = parseInt(String(params.customSequence), 10);
      nextNum = !isNaN(customNum) && customNum >= 1 ? customNum : 1;
    } else {
      // Start strictly past the highest recorded sequence number
      nextNum = maxFound > 0 ? maxFound + 1 : 1;

      // If user already had a SKU in the box and requested a new/auto SKU, ensure it advances
      if (currentSequenceNumber > 0 && nextNum <= currentSequenceNumber) {
        nextNum = currentSequenceNumber + 1;
      }
    }

    // 6. Guarantee collision-free sequence (loop until unused SKU is found)
    let sequenceStr = String(nextNum).padStart(3, '0');
    let candidateSku = `${prefix}${sequenceStr}`;

    let safetyAttempts = 0;
    while (allExistingSkusSet.has(candidateSku.toUpperCase()) && safetyAttempts < 1000) {
      nextNum++;
      sequenceStr = String(nextNum).padStart(3, '0');
      candidateSku = `${prefix}${sequenceStr}`;
      safetyAttempts++;
    }

    return {
      sku: candidateSku,
      categoryCode: catCode,
      colorCode,
      sequence: sequenceStr,
      nextAvailableSequence: nextNum
    };
  },

  async batchAssignMissingSkus(): Promise<{ updatedCount: number; assigned: { id: string; name: string; sku: string }[] }> {
    const assigned: { id: string; name: string; sku: string }[] = [];
    try {
      const products = await ProductModel.find({
        $or: [
          { sku: { $exists: false } },
          { sku: '' },
          { sku: { $regex: /^temp|^sku-|^000/i } }
        ]
      });

      for (const p of products) {
        const gen = await this.generateSku({
          name: p.name,
          category: p.category,
          fabric: p.fabric
        });
        p.sku = gen.sku;
        await p.save();
        assigned.push({ id: p.productId || p._id.toString(), name: p.name, sku: gen.sku });
      }
    } catch (e) {
      console.warn('[SkuService] Batch assignment note:', e);
    }
    return { updatedCount: assigned.length, assigned };
  }
};
