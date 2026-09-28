import { ProductModel } from '../models/Product.js';

const CATEGORY_CODE_MAP: Record<string, string> = {
  'suits': 'SUIT',
  'suit': 'SUIT',
  'blazers & jackets': 'BLAZ',
  'blazers': 'BLAZ',
  'jackets': 'BLAZ',
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
  'sweaters & knitwear': 'SWTR',
  'sweaters': 'SWTR',
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
  { regex: /\b(ecru|cream|off-white|ivory)\b/i, code: 'ECR' },
  { regex: /\b(gold|yellow|amber)\b/i, code: 'GLD' },
  { regex: /\b(pink|rose|blush)\b/i, code: 'PNK' }
];

export const skuService = {
  getCategoryCode(category: string): string {
    const norm = (category || '').toLowerCase().trim();
    if (CATEGORY_CODE_MAP[norm]) return CATEGORY_CODE_MAP[norm];
    for (const [key, code] of Object.entries(CATEGORY_CODE_MAP)) {
      if (norm.includes(key)) return code;
    }
    const cleaned = norm.replace(/[^a-z]/g, '').slice(0, 4).toUpperCase();
    return cleaned || 'GEN';
  },

  detectColorCode(text: string): string {
    const target = (text || '').toLowerCase();
    for (const item of COLOR_PATTERNS) {
      if (item.regex.test(target)) return item.code;
    }
    return 'STD';
  },

  async generateSku(params: {
    name: string;
    category: string;
    fabric?: string;
    color?: string;
  }): Promise<{ sku: string; categoryCode: string; colorCode: string; sequence: string }> {
    const catCode = this.getCategoryCode(params.category);
    const colorCode = this.detectColorCode(`${params.name} ${params.color || ''} ${params.fabric || ''}`);
    const prefix = `PA-${catCode}-${colorCode}-`;

    let nextNum = 1;
    try {
      const existing = await ProductModel.find({
        sku: { $regex: `^${prefix}` }
      }).select('sku').lean();

      for (const p of existing) {
        if (p.sku) {
          const num = parseInt(p.sku.replace(prefix, ''), 10);
          if (!isNaN(num) && num >= nextNum) {
            nextNum = num + 1;
          }
        }
      }
    } catch {
      // In-memory or offline fallback: generate random high number
      nextNum = Math.floor(Math.random() * 800) + 101;
    }

    const sequenceStr = String(nextNum).padStart(3, '0');
    return {
      sku: `${prefix}${sequenceStr}`,
      categoryCode: catCode,
      colorCode,
      sequence: sequenceStr
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
        assigned.push({ id: p.productId || p._id, name: p.name, sku: gen.sku });
      }
    } catch (e) {
      console.warn('[SkuService] Batch assignment note:', e);
    }
    return { updatedCount: assigned.length, assigned };
  }
};
