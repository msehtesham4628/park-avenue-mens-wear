/**
 * Park Avenue Menswear — Sartorial Title & Naming NLP Generator
 * Generates prestigious, high-converting, luxury fashion product titles
 * from raw input text (client notes, WhatsApp specs, vendor descriptions, PDF extracts).
 */

export interface TitleGenerationOptions {
  rawText: string;
  currentCategory?: string;
  currentFabric?: string;
  currentFit?: string;
}

export interface GeneratedTitleResult {
  title: string;
  variations: {
    label: string;
    title: string;
    style: 'bespoke' | 'editorial' | 'modern' | 'seo';
  }[];
  detectedCategory?: string;
  detectedFabric?: string;
  detectedFit?: string;
  detectedColor?: string;
  detectedFeatures: string[];
  source: 'gemini-ai' | 'sartorial-engine';
}

const LUXURY_PREDICATES = [
  'The Park Avenue',
  'Sovereign',
  'Atelier',
  'Signature',
  'Bespoke Cut',
  'Mayfair',
  'Napoli'
];

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Suits': ['suit', 'tuxedo', 'tux', 'smoking', 'dinner jacket', '3 piece', '3-piece', 'three-piece', 'double breasted suit', 'two-piece', 'tailcoat', 'morning coat'],
  'Blazers & Jackets': ['blazer', 'sports coat', 'sport coat', 'sport jacket', 'smoking jacket', 'dinner coat', 'safari jacket'],
  'Leather jackets': ['leather jacket', 'biker jacket', 'shearling', 'suede jacket', 'bomber leather', 'moto jacket'],
  'Dress shirts': ['dress shirt', 'shirt', 'chemise', 'oxford shirt', 'poplin shirt', 'french cuff', 'spread collar', 'cutaway', 'tuxedo shirt'],
  'Polo shirts': ['polo', 'polo shirt', 'knit polo', 'piqué polo', 'pique'],
  'Pants': ['trousers', 'pants', 'dress pants', 'chinos', 'slacks', 'pleated trousers', 'flannels'],
  'Jeans': ['jeans', 'denim', 'selvedge', 'japanese denim', 'five-pocket'],
  'Outerwear': ['overcoat', 'coat', 'trench', 'peacoat', 'chesterfield', 'topcoat', 'parka', 'car coat'],
  'Coats': ['coat', 'overcoat', 'greatcoat', 'trench coat', 'wool coat'],
  'Sweaters': ['sweater', 'pullover', 'cardigan', 'knitwear', 'turtleneck', 'rollneck', 'crewneck', 'v-neck', 'vest'],
  'Shoe': ['shoe', 'oxford', 'derby', 'derbies', 'monk strap', 'monkstrap', 'dress shoes'],
  'Loofers': ['loafer', 'loafers', 'loofers', 'penny loafer', 'tassel loafer', 'horsebit loafer', 'driving shoes', 'slip on'],
  'Boots': ['boot', 'boots', 'chelsea boot', 'chukka', 'jodhpur', 'dress boot'],
  'Ties': ['tie', 'ties', 'necktie', 'bow tie', 'bowtie', 'cravat', 'grenadine tie'],
  'Shorts': ['shorts', 'bermuda', 'tailored shorts', 'linen shorts']
};

const FABRIC_KEYWORDS: { pattern: RegExp; canonical: string }[] = [
  { pattern: /super\s*180s?/i, canonical: 'Super 180s Italian Virgin Wool' },
  { pattern: /super\s*160s?/i, canonical: 'Super 160s Italian Virgin Wool' },
  { pattern: /super\s*150s?/i, canonical: 'Super 150s Italian Virgin Wool' },
  { pattern: /super\s*140s?/i, canonical: 'Super 140s Pure Wool' },
  { pattern: /super\s*130s?/i, canonical: 'Super 130s Fine Wool' },
  { pattern: /super\s*120s?/i, canonical: 'Super 120s All-Season Wool' },
  { pattern: /cashmere/i, canonical: 'Pure Mongolian Cashmere' },
  { pattern: /giza\s*(?:45|87|cotton)?/i, canonical: 'Egyptian Giza Cotton' },
  { pattern: /egyptian\s*cotton/i, canonical: 'Egyptian Long-Staple Cotton' },
  { pattern: /sea\s*island/i, canonical: 'West Indian Sea Island Cotton' },
  { pattern: /irish\s*linen/i, canonical: 'Pure Irish Linen' },
  { pattern: /linen/i, canonical: 'Breathable Artisan Linen' },
  { pattern: /silk\s*blend/i, canonical: 'Mulberry Silk Blend' },
  { pattern: /silk/i, canonical: 'Pure Como Silk' },
  { pattern: /vicuña|vicuna/i, canonical: 'Peruvian Royal Vicuña' },
  { pattern: /flannel/i, canonical: 'Italian Worsted Wool Flannel' },
  { pattern: /tweed|harris/i, canonical: 'Heritage Scottish Tweed' },
  { pattern: /velvet/i, canonical: 'Silk-Cotton Micro Velvet' },
  { pattern: /calfskin|calf\s*leather/i, canonical: 'Full-Grain French Calfskin' },
  { pattern: /suede/i, canonical: 'Tuscan Velour Suede' },
  { pattern: /seersucker/i, canonical: 'Italian Cotton Seersucker' },
  { pattern: /worsted/i, canonical: 'Worsted Wool Crepe' }
];

const COLOR_KEYWORDS: { pattern: RegExp; canonical: string }[] = [
  { pattern: /midnight(?:\s*navy)?/i, canonical: 'Midnight Navy' },
  { pattern: /navy(?:\s*blue)?/i, canonical: 'Navy Blue' },
  { pattern: /royal(?:\s*blue)?/i, canonical: 'Royal Blue' },
  { pattern: /oxford(?:\s*blue)?/i, canonical: 'Oxford Blue' },
  { pattern: /charcoal(?:\s*grey)?/i, canonical: 'Charcoal Grey' },
  { pattern: /slate(?:\s*grey)?/i, canonical: 'Slate Grey' },
  { pattern: /heather(?:\s*grey)?/i, canonical: 'Heather Grey' },
  { pattern: /black|noir/i, canonical: 'Sovereign Black' },
  { pattern: /optic\s*white|crisp\s*white|pure\s*white/i, canonical: 'Crisp White' },
  { pattern: /white|blanc/i, canonical: 'Ivory White' },
  { pattern: /burgundy|bordeaux|wine/i, canonical: 'Burgundy' },
  { pattern: /emerald|forest\s*green/i, canonical: 'Forest Green' },
  { pattern: /olive|sage/i, canonical: 'Olive Drab' },
  { pattern: /camel|tan|cognac/i, canonical: 'Cognac Camel' },
  { pattern: /chocolate|tobacco|brown/i, canonical: 'Espresso Brown' },
  { pattern: /champagne|cream|ecru/i, canonical: 'Champagne Ecru' },
  { pattern: /plum|purple/i, canonical: 'Royal Plum' }
];

const FIT_KEYWORDS: { pattern: RegExp; canonical: string }[] = [
  { pattern: /double\s*breasted|db/i, canonical: 'Double-Breasted' },
  { pattern: /single\s*breasted|sb/i, canonical: 'Single-Breasted' },
  { pattern: /three\s*piece|3\s*piece|vested/i, canonical: 'Three-Piece' },
  { pattern: /two\s*piece|2\s*piece/i, canonical: 'Two-Piece' },
  { pattern: /peak\s*lapel/i, canonical: 'Peak Lapel' },
  { pattern: /notch\s*lapel/i, canonical: 'Notch Lapel' },
  { pattern: /shawl\s*lapel|shawl\s*collar/i, canonical: 'Shawl Collar' },
  { pattern: /slim\s*fit/i, canonical: 'Slim Tailored Fit' },
  { pattern: /modern\s*fit/i, canonical: 'Modern Fit' },
  { pattern: /classic\s*fit|traditional/i, canonical: 'Classic English Cut' },
  { pattern: /french\s*cuff/i, canonical: 'French Cuff' },
  { pattern: /spread\s*collar/i, canonical: 'Spread Collar' },
  { pattern: /pleated/i, canonical: 'Single Pleat' },
  { pattern: /flat\s*front/i, canonical: 'Flat Front' }
];

export function generateSartorialTitleFromText(options: TitleGenerationOptions): GeneratedTitleResult {
  const text = (options.rawText || '').trim();
  
  // 1. Detect Category
  let detectedCategory = options.currentCategory;
  if (!detectedCategory || detectedCategory === 'Suits') {
    for (const [cat, words] of Object.entries(CATEGORY_KEYWORDS)) {
      for (const w of words) {
        const regex = new RegExp(`\\b${w.replace(/[-]/g, '[- ]')}\\b`, 'i');
        if (regex.test(text)) {
          detectedCategory = cat;
          break;
        }
      }
      if (detectedCategory && detectedCategory !== options.currentCategory) break;
    }
  }
  if (!detectedCategory) detectedCategory = 'Suits';

  // 2. Detect Fabric
  let detectedFabric = options.currentFabric;
  for (const item of FABRIC_KEYWORDS) {
    if (item.pattern.test(text)) {
      detectedFabric = item.canonical;
      break;
    }
  }

  // 3. Detect Color
  let detectedColor: string | undefined;
  for (const item of COLOR_KEYWORDS) {
    if (item.pattern.test(text)) {
      detectedColor = item.canonical;
      break;
    }
  }

  // 4. Detect Fit & Silhouette
  let detectedFit = options.currentFit;
  const detectedFeatures: string[] = [];
  for (const item of FIT_KEYWORDS) {
    if (item.pattern.test(text)) {
      if (!detectedFit) detectedFit = item.canonical;
      detectedFeatures.push(item.canonical);
    }
  }

  // Fallbacks if nothing detected
  const colorStr = detectedColor || 'Midnight Navy';
  const fabricShort = detectedFabric ? detectedFabric.replace(/^Pure\s+|^Italian\s+/, '') : 'Italian Wool';
  const categorySingular = detectedCategory === 'Dress shirts' ? 'Dress Shirt'
    : detectedCategory === 'Polo shirts' ? 'Polo Shirt'
    : detectedCategory === 'Leather jackets' ? 'Leather Jacket'
    : detectedCategory === 'Dress pants' ? 'Dress Pants'
    : detectedCategory.replace(/s$/, '');

  const featureStr = detectedFeatures.length > 0 ? detectedFeatures[0] : '';

  // Generate 4 distinctive variations:
  // 1. Bespoke Atelier Edition
  const bespokeTitle = `The Park Avenue ${colorStr} ${featureStr ? featureStr + ' ' : ''}${fabricShort} ${categorySingular}`
    .replace(/\s+/g, ' ')
    .trim();

  // 2. Editorial Signature Edition
  const editorialTitle = `Atelier ${featureStr ? featureStr + ' ' : ''}${categorySingular} in ${colorStr} ${fabricShort}`
    .replace(/\s+/g, ' ')
    .trim();

  // 3. Modern Luxury Minimalist
  const modernTitle = `Park Avenue ${colorStr} ${categorySingular} (${fabricShort})`
    .replace(/\s+/g, ' ')
    .trim();

  // 4. US E-Commerce SEO High-Intent Title
  const seoTitle = `Men's Luxury ${colorStr} ${categorySingular} - ${fabricShort} ${detectedFit || 'Tailored Fit'}`
    .replace(/\s+/g, ' ')
    .trim();

  // Pick primary recommendation:
  const primaryTitle = bespokeTitle;

  return {
    title: primaryTitle,
    variations: [
      { label: 'Executive Atelier (Recommended)', title: bespokeTitle, style: 'bespoke' },
      { label: 'Sartorial Editorial', title: editorialTitle, style: 'editorial' },
      { label: 'Modern Minimalist', title: modernTitle, style: 'modern' },
      { label: 'USA E-Commerce SEO', title: seoTitle, style: 'seo' }
    ],
    detectedCategory,
    detectedFabric,
    detectedFit,
    detectedColor,
    detectedFeatures,
    source: 'sartorial-engine'
  };
}
