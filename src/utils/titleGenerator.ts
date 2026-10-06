/**
 * Park Avenue Menswear — Sartorial Title & Naming NLP Generator
 * Generates prestigious, high-converting, luxury fashion product titles
 * with category-aware fabric matching and rotating prestige collections.
 */

export interface TitleGenerationOptions {
  rawText?: string;
  currentCategory?: string;
  currentFabric?: string;
  currentFit?: string;
  currentColor?: string;
}

export interface TitleVariation {
  label: string;
  title: string;
  style: 'bespoke' | 'editorial' | 'modern' | 'seo' | 'heritage';
}

export interface GeneratedTitleResult {
  title: string;
  variations: TitleVariation[];
  detectedCategory?: string;
  detectedFabric?: string;
  detectedFit?: string;
  detectedColor?: string;
  detectedFeatures: string[];
  source: 'gemini-ai' | 'sartorial-engine';
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Suits': ['suit', 'tuxedo', 'tux', 'smoking', 'dinner jacket', '3 piece', '3-piece', 'three-piece', 'double breasted suit', 'two-piece'],
  'Blazers & Jackets': ['blazer', 'sports coat', 'sport coat', 'sport jacket', 'smoking jacket', 'dinner coat', 'safari jacket'],
  'Leather jackets': ['leather jacket', 'biker jacket', 'shearling', 'suede jacket', 'bomber leather', 'moto jacket'],
  'Dress shirts': ['dress shirt', 'shirt', 'chemise', 'oxford shirt', 'poplin shirt', 'french cuff', 'spread collar', 'cutaway', 'tuxedo shirt'],
  'Polo shirts': ['polo', 'polo shirt', 'knit polo', 'piqué polo', 'pique'],
  'Pants': ['trousers', 'pants', 'dress pants', 'chinos', 'slacks', 'pleated trousers', 'flannels'],
  'Jeans': ['jeans', 'denim', 'selvedge', 'japanese denim', 'five-pocket'],
  'Outerwear': ['overcoat', 'coat', 'trench', 'peacoat', 'chesterfield', 'topcoat', 'parka', 'car coat'],
  'Sweaters': ['sweater', 'pullover', 'cardigan', 'knitwear', 'turtleneck', 'rollneck', 'crewneck', 'v-neck', 'vest'],
  'Shoe': ['oxford', 'oxfords', 'derby', 'derbies', 'monk strap', 'monkstrap', 'dress shoes', 'wholecut'],
  'Loofers': ['loafer', 'loafers', 'penny loafer', 'tassel loafer', 'horsebit loafer', 'driving shoes', 'belgian loafer'],
  'Boots': ['boot', 'boots', 'chelsea boot', 'chukka', 'jodhpur', 'balmoral boot'],
  'Ties': ['tie', 'ties', 'necktie', 'bow tie', 'bowtie', 'cravat', 'grenadine tie'],
  'Shorts': ['shorts', 'bermuda', 'tailored shorts', 'linen shorts']
};

const CATEGORY_FABRICS: Record<string, string[]> = {
  'suits': ['Super 150s Italian Virgin Wool', 'Super 160s English Worsted Wool', 'Vitale Barberis Worsted Flannel', 'Super 180s Biella Wool'],
  'blazers & jackets': ['Loro Piana Wool-Silk-Linen Blend', 'Vitale Barberis Textured Hopsack', 'Heritage Scottish Tweed'],
  'leather jackets': ['Full-Grain French Plonge Lambskin', 'Tuscan Hand-Burnished Nappa Leather', 'Supple Spanish Suede'],
  'dress shirts': ['140/2 Two-Ply Egyptian Giza 87 Twill', 'West Indian Sea Island Cotton', 'Crisp Italian Royal Oxford', 'Pure Irish Linen'],
  'polo shirts': ['Sea Island Knit Silk-Cotton', 'Mercerized Piqué Cotton', 'Ultra-Fine Silk Knit'],
  'pants': ['Super 130s Wool Flannel', 'High-Twist Tropical Worsted Wool', 'Breathable Pure Irish Linen'],
  'jeans': ['14.5oz Kurabo Japanese Selvedge Denim', 'Kaihara Shuttle-Loomed Denim'],
  'outerwear': ['Double-Faced Pure Mongolian Cashmere', 'Heavy 650g Italian Melton Wool', 'Piacenza Wool-Cashmere'],
  'sweaters': ['Todd & Duncan 4-Ply Scottish Cashmere', 'Superfine 18-Gauge Merino Wool', 'Inner Mongolian Cashmere'],
  'shoe': ['French Box Calf Full-Grain Leather', 'Hand-Burnished French Crust Leather'],
  'loofers': ['Unlined Reversed Italian Suede', 'Glove-Soft Tuscan Calfskin'],
  'boots': ['French Calfskin & English Repello Suede', 'Dainite-Sole Box Calf'],
  'ties': ['Como Silk Grenadine Garza Fina', 'Hand-Rolled 3-Fold Jacquard Silk'],
  'shorts': ['Baird McNutt Tailored Irish Linen', 'Tropical Worsted Wool']
};

const PRESTIGE_COLLECTIONS = [
  'The Sovereign',
  'The Carlyle',
  'The Vanderbilt',
  'The Mayfair',
  'The Savoy',
  'The Fifth Avenue',
  'The Madison',
  'The Lexington',
  'The Belgravia',
  'The St. James',
  'The Milano Atelier',
  'The Royal Ascot',
  'The Knightsbridge',
  'The Whitehall'
];

const FABRIC_KEYWORDS: { pattern: RegExp; canonical: string }[] = [
  { pattern: /super\s*180s?/i, canonical: 'Super 180s Italian Virgin Wool' },
  { pattern: /super\s*160s?/i, canonical: 'Super 160s Italian Virgin Wool' },
  { pattern: /super\s*150s?/i, canonical: 'Super 150s Italian Virgin Wool' },
  { pattern: /super\s*140s?/i, canonical: 'Super 140s Pure Wool' },
  { pattern: /super\s*130s?/i, canonical: 'Super 130s Fine Wool' },
  { pattern: /super\s*120s?/i, canonical: 'Super 120s All-Season Wool' },
  { pattern: /cashmere/i, canonical: 'Pure Mongolian Cashmere' },
  { pattern: /giza\s*(?:45|87|cotton)?/i, canonical: 'Egyptian Giza 87 Cotton' },
  { pattern: /egyptian\s*cotton/i, canonical: 'Egyptian Long-Staple Cotton' },
  { pattern: /sea\s*island/i, canonical: 'West Indian Sea Island Cotton' },
  { pattern: /irish\s*linen/i, canonical: 'Baird McNutt Irish Linen' },
  { pattern: /linen/i, canonical: 'Breathable Artisan Linen' },
  { pattern: /silk\s*blend/i, canonical: 'Mulberry Silk Blend' },
  { pattern: /grenadine/i, canonical: 'Como Silk Grenadine' },
  { pattern: /silk/i, canonical: 'Pure Como Silk' },
  { pattern: /flannel/i, canonical: 'Italian Worsted Wool Flannel' },
  { pattern: /tweed|harris/i, canonical: 'Heritage Scottish Tweed' },
  { pattern: /velvet/i, canonical: 'Silk-Cotton Micro Velvet' },
  { pattern: /calfskin|calf\s*leather/i, canonical: 'French Box Calf Full-Grain Leather' },
  { pattern: /suede/i, canonical: 'Tuscan Velour Suede' },
  { pattern: /selvedge|denim/i, canonical: '14.5oz Japanese Selvedge Denim' },
  { pattern: /lambskin|plonge/i, canonical: 'French Plonge Lambskin' }
];

const COLOR_KEYWORDS: { pattern: RegExp; canonical: string }[] = [
  { pattern: /midnight(?:\s*navy)?/i, canonical: 'Midnight Navy' },
  { pattern: /navy(?:\s*blue)?/i, canonical: 'Navy Blue' },
  { pattern: /royal(?:\s*blue)?/i, canonical: 'Royal Blue' },
  { pattern: /oxford(?:\s*blue)?/i, canonical: 'Oxford Blue' },
  { pattern: /charcoal(?:\s*grey)?/i, canonical: 'Charcoal Grey' },
  { pattern: /slate(?:\s*grey)?/i, canonical: 'Slate Grey' },
  { pattern: /heather(?:\s*grey)?/i, canonical: 'Heather Grey' },
  { pattern: /black|noir|onyx/i, canonical: 'Sovereign Black' },
  { pattern: /optic\s*white|crisp\s*white|pure\s*white/i, canonical: 'Crisp White' },
  { pattern: /white|blanc/i, canonical: 'Ivory White' },
  { pattern: /cream|ecru|off-white/i, canonical: 'Champagne Ecru' },
  { pattern: /burgundy|bordeaux|wine|oxblood/i, canonical: 'Burgundy Wine' },
  { pattern: /emerald|forest\s*green/i, canonical: 'Forest Green' },
  { pattern: /olive|sage/i, canonical: 'Olive Drab' },
  { pattern: /camel|tan/i, canonical: 'Classic Camel' },
  { pattern: /cognac/i, canonical: 'Deep Cognac' },
  { pattern: /espresso|chocolate|brown|tobacco/i, canonical: 'Espresso Brown' },
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
  { pattern: /french\s*cuff/i, canonical: 'French Cuff' },
  { pattern: /spread\s*collar/i, canonical: 'Spread Collar' },
  { pattern: /cutaway\s*collar/i, canonical: 'Cutaway Collar' },
  { pattern: /single\s*pleat|pleated/i, canonical: 'Single Pleat' },
  { pattern: /flat\s*front/i, canonical: 'Flat Front' },
  { pattern: /wholecut/i, canonical: 'Wholecut' },
  { pattern: /goodyear/i, canonical: 'Goodyear-Welted' }
];

export function generateSartorialTitleFromText(options: TitleGenerationOptions): GeneratedTitleResult {
  const text = (options.rawText || '').trim();
  
  // 1. Detect Category
  let detectedCategory = options.currentCategory;
  if (!detectedCategory || detectedCategory === 'Suits' || detectedCategory === 'Garment') {
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
  const catLower = detectedCategory.toLowerCase();

  // 2. Detect Fabric
  let detectedFabric = options.currentFabric;
  for (const item of FABRIC_KEYWORDS) {
    if (item.pattern.test(text)) {
      detectedFabric = item.canonical;
      break;
    }
  }

  // If no fabric detected, pick authentic fabric for category
  if (!detectedFabric) {
    let matchedFabrics: string[] = CATEGORY_FABRICS['suits'];
    for (const [k, fabList] of Object.entries(CATEGORY_FABRICS)) {
      if (catLower.includes(k) || k.includes(catLower)) {
        matchedFabrics = fabList;
        break;
      }
    }
    detectedFabric = matchedFabrics[Math.floor(Math.random() * matchedFabrics.length)];
  }

  // 3. Detect Color
  let detectedColor = options.currentColor;
  for (const item of COLOR_KEYWORDS) {
    if (item.pattern.test(text)) {
      detectedColor = item.canonical;
      break;
    }
  }

  // Dynamic rotation if no color is detected
  const fallbackColors = ['Midnight Navy', 'Charcoal Grey', 'Sovereign Black', 'Deep Slate', 'Espresso Brown', 'Classic Camel', 'Crisp White'];
  const finalColor = detectedColor || fallbackColors[Math.floor(Math.random() * fallbackColors.length)];

  // 4. Detect Fit & Silhouette
  let detectedFit = options.currentFit;
  const detectedFeatures: string[] = [];
  for (const item of FIT_KEYWORDS) {
    if (item.pattern.test(text)) {
      if (!detectedFit) detectedFit = item.canonical;
      detectedFeatures.push(item.canonical);
    }
  }

  // Clean singular garment noun
  const catSingular = detectedCategory === 'Dress shirts' ? 'Dress Shirt'
    : detectedCategory === 'Polo shirts' ? 'Polo Shirt'
    : detectedCategory === 'Leather jackets' ? 'Leather Jacket'
    : detectedCategory === 'Dress pants' ? 'Dress Pants'
    : detectedCategory === 'Pants' ? 'Tailored Trousers'
    : detectedCategory === 'Shoe' ? 'Wholecut Oxford Shoe'
    : detectedCategory === 'Loofers' ? 'Belgian Loafers'
    : detectedCategory === 'Boots' ? 'Balmoral Boots'
    : detectedCategory === 'Sweaters' ? 'Cashmere Crewneck'
    : detectedCategory === 'Ties' ? 'Silk Grenadine Tie'
    : detectedCategory.replace(/s$/, '');

  const fabricShort = (detectedFabric || 'Super 150s Wool')
    .replace(/^100%\s+/, '')
    .replace(/^Grade-A\s+/, '')
    .replace(/^Pure\s+/, '')
    .replace(/^Italian\s+/, '');

  // Rotate prestige collections
  const randomCollection1 = PRESTIGE_COLLECTIONS[Math.floor(Math.random() * PRESTIGE_COLLECTIONS.length)];
  let randomCollection2 = PRESTIGE_COLLECTIONS[Math.floor(Math.random() * PRESTIGE_COLLECTIONS.length)];
  if (randomCollection2 === randomCollection1) {
    randomCollection2 = PRESTIGE_COLLECTIONS[(PRESTIGE_COLLECTIONS.indexOf(randomCollection1) + 1) % PRESTIGE_COLLECTIONS.length];
  }

  const featureStr = detectedFeatures.length > 0 ? `${detectedFeatures[0]} ` : '';

  // 5 distinctive variations:
  const bespokeTitle = `${randomCollection1} ${finalColor} ${featureStr}${fabricShort} ${catSingular}`.replace(/\s+/g, ' ').trim();
  const editorialTitle = `Atelier ${featureStr}${catSingular} in ${finalColor} ${fabricShort}`.replace(/\s+/g, ' ').trim();
  const modernTitle = `Park Avenue ${finalColor} ${catSingular} (${fabricShort})`.replace(/\s+/g, ' ').trim();
  const seoTitle = `Men's Luxury ${finalColor} ${catSingular} - ${fabricShort} ${detectedFit || 'Tailored Fit'}`.replace(/\s+/g, ' ').trim();
  const heritageTitle = `${randomCollection2} Signature ${finalColor} ${catSingular}`.replace(/\s+/g, ' ').trim();

  return {
    title: bespokeTitle,
    variations: [
      { label: 'Executive Atelier (Recommended)', title: bespokeTitle, style: 'bespoke' },
      { label: 'Sartorial Editorial', title: editorialTitle, style: 'editorial' },
      { label: 'Modern Minimalist', title: modernTitle, style: 'modern' },
      { label: 'USA E-Commerce SEO', title: seoTitle, style: 'seo' },
      { label: 'Heritage Signature', title: heritageTitle, style: 'heritage' }
    ],
    detectedCategory,
    detectedFabric,
    detectedFit,
    detectedColor: finalColor,
    detectedFeatures,
    source: 'sartorial-engine'
  };
}
