import { GoogleGenAI } from '@google/genai';

export interface GenerateTitleParams {
  rawText?: string;
  category?: string;
  fabric?: string;
  fit?: string;
  color?: string;
}

export interface TitleVariation {
  label: string;
  title: string;
  style: 'bespoke' | 'editorial' | 'modern' | 'seo' | 'heritage';
}

export interface GeneratedTitleResponse {
  title: string;
  variations: TitleVariation[];
  detectedCategory?: string;
  detectedFabric?: string;
  detectedFit?: string;
  detectedColor?: string;
  detectedFeatures?: string[];
  source: 'gemini-ai' | 'sartorial-engine';
}

const CATEGORY_MAP: Record<string, string[]> = {
  'Suits': ['suit', 'tuxedo', 'tux', 'smoking', 'dinner jacket', '3 piece', '3-piece', 'three-piece', 'double breasted suit', 'two-piece'],
  'Blazers & Jackets': ['blazer', 'sports coat', 'sport coat', 'sport jacket', 'smoking jacket', 'dinner coat', 'safari jacket'],
  'Leather jackets': ['leather jacket', 'biker jacket', 'shearling', 'suede jacket', 'moto jacket', 'leather bomber'],
  'Dress shirts': ['dress shirt', 'shirt', 'french cuff', 'spread collar', 'cutaway', 'oxford shirt', 'poplin', 'tuxedo shirt'],
  'Polo shirts': ['polo', 'knit polo', 'piqué', 'pique', 'silk polo'],
  'Pants': ['trousers', 'pants', 'dress pants', 'chinos', 'slacks', 'pleated trousers', 'flannels'],
  'Jeans': ['jeans', 'denim', 'selvedge', 'japanese denim'],
  'Outerwear': ['overcoat', 'coat', 'trench', 'peacoat', 'chesterfield', 'topcoat', 'parka', 'car coat'],
  'Sweaters': ['sweater', 'cashmere knit', 'cardigan', 'turtleneck', 'pullover', 'rollneck', 'crewneck', 'v-neck'],
  'Shoe': ['oxford', 'oxfords', 'derby', 'derbies', 'monk strap', 'monkstrap', 'dress shoes', 'wholecut'],
  'Loofers': ['loafer', 'loafers', 'penny loafer', 'tassel loafer', 'horsebit loafer', 'belgian loafer', 'driving shoes'],
  'Boots': ['boot', 'boots', 'chelsea boot', 'chukka', 'balmoral boot', 'jodhpur'],
  'Ties': ['tie', 'ties', 'necktie', 'bow tie', 'bowtie', 'cravat', 'grenadine tie'],
  'Shorts': ['shorts', 'bermuda', 'tailored shorts', 'linen shorts']
};

const CATEGORY_FABRICS: Record<string, string[]> = {
  'suits': ['Super 150s Italian Virgin Wool', 'Super 160s English Worsted Wool', 'Vitale Barberis Worsted Flannel', 'Super 180s Biella Wool', 'Dormeuil Mohair-Wool'],
  'blazers & jackets': ['Loro Piana Wool-Silk-Linen Blend', 'Vitale Barberis Textured Hopsack', 'Heritage Scottish Tweed', 'Italian Silk-Cotton Velvet'],
  'leather jackets': ['Full-Grain French Plonge Lambskin', 'Tuscan Hand-Burnished Nappa Leather', 'Italian Velour Suede', 'Supple Spanish Lambskin'],
  'dress shirts': ['140/2 Two-Ply Egyptian Giza 87 Twill', 'West Indian Sea Island Cotton', 'Crisp Italian Royal Oxford', 'Pure Irish Linen'],
  'polo shirts': ['Sea Island Knit Silk-Cotton', 'Mercerized Piqué Cotton', 'Ultra-Fine Silk Knit'],
  'pants': ['Super 130s Wool Flannel', 'High-Twist Tropical Worsted Wool', 'Breathable Pure Irish Linen', 'Italian Cotton-Cashmere Chino'],
  'jeans': ['14.5oz Kurabo Japanese Selvedge Denim', 'Kaihara Shuttle-Loomed Denim', 'Stretch Heritage Selvedge'],
  'outerwear': ['Double-Faced Pure Mongolian Cashmere', 'Heavy 650g Italian Melton Wool', 'Water-Repellent Cotton Gabardine', 'Piacenza Wool-Cashmere'],
  'sweaters': ['Todd & Duncan 4-Ply Scottish Cashmere', 'Superfine 18-Gauge Merino Wool', 'Grade-A Inner Mongolian Cashmere', 'Silk-Cashmere Blend'],
  'shoe': ['French Box Calf Full-Grain Leather', 'Hand-Burnished French Crust Leather', 'Closed-Channel French Calfskin'],
  'loofers': ['Unlined Reversed Italian Suede', 'Glove-Soft Tuscan Calfskin', 'Hand-Braided Belgian Suede'],
  'boots': ['French Calfskin & English Repello Suede', 'Dainite-Sole Box Calf', 'Horween Waxed Leather'],
  'ties': ['Como Silk Grenadine Garza Fina', 'Hand-Rolled 3-Fold Jacquard Silk', 'Raw Shantung Silk', 'Untipped Como Macclesfield Silk'],
  'shorts': ['Baird McNutt Tailored Irish Linen', 'Tropical Worsted Wool', 'Italian Stretch Cotton Twill']
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

const LUXURY_COLORS: { pattern: RegExp; canonical: string }[] = [
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
  { pattern: /plum|purple/i, canonical: 'Royal Plum' },
  { pattern: /sky\s*blue|light\s*blue/i, canonical: 'Powder Blue' }
];

const LUXURY_FABRICS: { pattern: RegExp; canonical: string }[] = [
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

const LUXURY_FEATURES: { pattern: RegExp; canonical: string }[] = [
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

export const titleService = {
  async generateProductTitle(params: GenerateTitleParams): Promise<GeneratedTitleResponse> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const aiResponse = await this.generateWithGemini(apiKey, params);
        if (aiResponse && aiResponse.title && Array.isArray(aiResponse.variations) && aiResponse.variations.length > 0) {
          return aiResponse;
        }
      } catch (err) {
        console.warn('[TitleService] Gemini generation fallback to algorithmic engine:', err);
      }
    }

    return this.generateAlgorithmicTitle(params);
  },

  async generateWithGemini(apiKey: string, params: GenerateTitleParams): Promise<GeneratedTitleResponse | null> {
    const ai = new GoogleGenAI({ apiKey });
    const rawText = (params.rawText || '').trim();
    const category = params.category || 'Suits';
    const fabric = params.fabric || '';
    const fit = params.fit || '';
    const color = params.color || '';

    const prompt = `You are the Executive Brand Creative Director and Master Atelier Stylist for Park Avenue Menswear, an ultra-luxurious bespoke menswear house in New York City with worldwide prestige.
Your task is to generate 5 DISTINCT, FRESH, PRESTIGIOUS, LUXURY product titles for a menswear item.

Context:
- User Input Notes: "${rawText || 'Luxury menswear garment'}"
- Garment Category: "${category}"
- Fabric / Material: "${fabric}"
- Fit / Silhouette: "${fit}"
- Color: "${color}"

CRITICAL RULES:
1. NEVER produce boring, generic titles like "The Park Avenue Midnight Navy Italian Wool Suit".
2. Create imaginative, prestigious names using high-fashion heritage phrasing (e.g. "The Sovereign", "The Carlyle", "The Vanderbilt", "Atelier Mayfair", "Savile Row Cut", "Biella Super 160s").
3. Match fabrics naturally to category:
   - Suits/Blazers: Super 150s/160s Virgin Wool, Vitale Barberis Flannel, Mohair
   - Shirts: Egyptian Giza 87 Twill, Sea Island Cotton, Crisp Royal Oxford
   - Footwear: Goodyear-Welted French Box Calf, Tuscan Suede, Wholecut
   - Knitwear: Mongolian Cashmere, Todd & Duncan 4-Ply, Extra-Fine Merino
   - Ties: Como Silk Grenadine, 3-Fold Jacquard Silk
   - Leather: French Plonge Lambskin, Tuscan Nappa Leather
4. Output 5 distinctive naming variations with labels:
   - "Executive Bespoke Atelier" (style: bespoke)
   - "Runway / Editorial" (style: editorial)
   - "Modern Minimalist" (style: modern)
   - "USA E-Commerce High-Intent SEO" (style: seo)
   - "Signature Heritage Edition" (style: heritage)

Return STRICTLY valid JSON with no markdown wrapping:
{
  "title": "Primary recommended title (captivating and prestigious)",
  "variations": [
    { "label": "Executive Bespoke Atelier", "title": "...", "style": "bespoke" },
    { "label": "Runway Editorial", "title": "...", "style": "editorial" },
    { "label": "Modern Minimalist", "title": "...", "style": "modern" },
    { "label": "USA E-Commerce SEO", "title": "...", "style": "seo" },
    { "label": "Signature Heritage", "title": "...", "style": "heritage" }
  ],
  "detectedCategory": "${category}",
  "detectedFabric": "...",
  "detectedFit": "...",
  "detectedColor": "...",
  "detectedFeatures": ["..."]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text?.trim() || '';
    if (!text) return null;

    const parsed = JSON.parse(text);
    return {
      title: parsed.title,
      variations: parsed.variations || [],
      detectedCategory: parsed.detectedCategory || category,
      detectedFabric: parsed.detectedFabric,
      detectedFit: parsed.detectedFit,
      detectedColor: parsed.detectedColor,
      detectedFeatures: parsed.detectedFeatures || [],
      source: 'gemini-ai'
    };
  },

  /**
   * Ultra-luxury, category-smart, dynamic sartorial algorithm
   * Generates diverse, fresh titles every single click.
   */
  generateAlgorithmicTitle(params: GenerateTitleParams): GeneratedTitleResponse {
    const text = (params.rawText || '').trim();

    // 1. Detect category
    let detectedCategory = params.category;
    if (!detectedCategory || detectedCategory === 'Suits' || detectedCategory === 'Garment') {
      for (const [cat, words] of Object.entries(CATEGORY_MAP)) {
        if (words.some(w => new RegExp(`\\b${w.replace(/[-]/g, '[- ]')}\\b`, 'i').test(text))) {
          detectedCategory = cat;
          break;
        }
      }
    }
    detectedCategory = detectedCategory || 'Suits';
    const catLower = detectedCategory.toLowerCase();

    // 2. Detect color
    let detectedColor = params.color;
    if (!detectedColor) {
      for (const item of LUXURY_COLORS) {
        if (item.pattern.test(text)) {
          detectedColor = item.canonical;
          break;
        }
      }
    }

    // Dynamic rotation of colors if none detected so repeated clicks give fresh results
    const fallbackColors = ['Midnight Navy', 'Charcoal Grey', 'Sovereign Black', 'Deep Slate', 'Espresso Brown', 'Classic Camel', 'Crisp White'];
    const randomColor = fallbackColors[Math.floor(Math.random() * fallbackColors.length)];
    const finalColor = detectedColor || randomColor;

    // 3. Detect fabric
    let detectedFabric = params.fabric;
    if (!detectedFabric) {
      for (const item of LUXURY_FABRICS) {
        if (item.pattern.test(text)) {
          detectedFabric = item.canonical;
          break;
        }
      }
    }

    // If still no fabric, pick authentic fabric for this category
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

    // 4. Detect fit & features
    let detectedFit = params.fit;
    const detectedFeatures: string[] = [];
    for (const item of LUXURY_FEATURES) {
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

    // Short fabric descriptor
    const fabricShort = detectedFabric
      .replace(/^100%\s+/, '')
      .replace(/^Grade-A\s+/, '')
      .replace(/^Pure\s+/, '')
      .replace(/^Italian\s+/, '');

    // Pick 2 random distinct prestige collection names
    const randomCollection1 = PRESTIGE_COLLECTIONS[Math.floor(Math.random() * PRESTIGE_COLLECTIONS.length)];
    let randomCollection2 = PRESTIGE_COLLECTIONS[Math.floor(Math.random() * PRESTIGE_COLLECTIONS.length)];
    if (randomCollection2 === randomCollection1) {
      randomCollection2 = PRESTIGE_COLLECTIONS[(PRESTIGE_COLLECTIONS.indexOf(randomCollection1) + 1) % PRESTIGE_COLLECTIONS.length];
    }

    const featureStr = detectedFeatures.length > 0 ? `${detectedFeatures[0]} ` : '';

    // Synthesize 5 rich, high-prestige title variations
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
};
