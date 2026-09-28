import { GoogleGenAI } from '@google/genai';

export interface GenerateDescriptionParams {
  name: string;
  category: string;
  fabric?: string;
  fit?: string;
  price?: number;
  tone?: 'editorial' | 'ecommerce_seo' | 'bespoke_tailor';
  additionalNotes?: string;
}

export interface GeneratedDescriptionResponse {
  description: string;
  shortDescription: string;
  bulletPoints: string[];
  stylingAdvice: string;
  fabricDetails: string;
  careInstructions: string[];
  seoMetaTitle: string;
  seoMetaDescription: string;
  keywords: string[];
  source: 'gemini-ai' | 'sartorial-engine';
}

const FABRIC_DEFAULTS: Record<string, string> = {
  'suits': 'Super 150s Italian Virgin Wool (Biella, Italy)',
  'blazers & jackets': 'Vitale Barberis Canonico Wool-Silk-Linen Blend',
  'shirts': '140/2 Two-Ply Egyptian Giza Cotton Twill',
  'dress shirts': '140/2 Two-Ply Egyptian Giza Cotton Twill',
  'pants': 'Super 130s Pure Wool Flannel with Natural Mechanical Stretch',
  'outerwear': 'Grade-A Double-Faced Mongolian Cashmere & Melange Wool',
  'sweaters & knitwear': '100% 2-Ply Sustainable Inner Mongolian Cashmere',
  'footwear': 'Full-Grain French Calfskin with Goodyear Welted Oak-Bark Sole',
  'ties': 'Hand-Rolled 3-Fold Como Jacquard Silk Grenadine',
  'accessories': 'Full-Grain Tuscan Vachetta Leather & Solid Brass Hardware',
  'shorts': 'Breathable Sartorial Irish Linen & Tropical Worsted Wool'
};

const FIT_DEFAULTS: Record<string, string> = {
  'suits': 'Modern Tailored Silhouette (Sculpted Chest & Tapered Trousers)',
  'blazers & jackets': 'Neapolitan Soft Shoulder (Spalla Camicia) with Light Canvassing',
  'shirts': 'Contemporary Slim-Tailored Cut with French Front Placket',
  'pants': 'Mid-Rise Tapered Leg with Clean Break & Extended Waistband Tab',
  'outerwear': 'Refined Overcoat Tailoring (Layer-Friendly over Jackets)'
};

export const descriptionService = {
  async generateProductDescription(params: GenerateDescriptionParams): Promise<GeneratedDescriptionResponse> {
    const categoryKey = (params.category || '').toLowerCase();
    const resolvedFabric = params.fabric?.trim() || FABRIC_DEFAULTS[categoryKey] || 'Premium Handcrafted European Textile';
    const resolvedFit = params.fit?.trim() || FIT_DEFAULTS[categoryKey] || 'Modern Sartorial Tailored Cut';
    const priceStr = params.price ? `$${Number(params.price).toFixed(2)}` : '$850.00';

    // Try Gemini AI first if API key is present
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const systemPrompt = `You are the master creative director and head sartorial copywriter for Park Avenue Menswear, an ultra-luxury bespoke menswear house located in New York City with worldwide express delivery across all 50 US States.
Write compelling, high-converting, Google USA #1 ranking luxury fashion editorial copy for a prestigious menswear garment.

Garment details:
- Title: "${params.name}"
- Category: "${params.category}"
- Fabric: "${resolvedFabric}"
- Fit: "${resolvedFit}"
- Price: "${priceStr}"
- Tone style: "${params.tone || 'editorial'}"
- Extra notes: "${params.additionalNotes || 'Highlight American executive presence, Italian craftsmanship, and bespoke tailoring.'}"

Output MUST be valid JSON with this exact structure:
{
  "description": "Full rich description with 2-3 paragraphs covering fabric provenance, construction details, and boardroom/evening versatility.",
  "shortDescription": "1-2 punchy sentences summarizing the garment for luxury shoppers.",
  "bulletPoints": ["5-6 specific craftsmanship bullet points like canvassing, buttons, seams, lining, origin"],
  "stylingAdvice": "Actionable pairing advice (shoes, ties, occasions, seasons) for the American luxury lifestyle.",
  "fabricDetails": "Detailed fabric specs, weave weight, and tactile drape explanation.",
  "careInstructions": ["3-4 master tailor care rules"],
  "seoMetaTitle": "Under 60 chars. Must include product name, high-intent keywords, and brand (e.g. Napoli Wool Suit | Luxury Menswear USA | Park Avenue)",
  "seoMetaDescription": "Between 120 and 155 chars. Engaging US Google search snippet with value proposition, USA delivery, and call to action.",
  "keywords": ["8-12 high-intent search keywords for US buyers like 'luxury mens suits usa', 'italian wool suits nyc'"]
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: systemPrompt,
          config: {
            responseMimeType: 'application/json'
          }
        });

        const rawText = response.text?.trim() || '';
        if (rawText) {
          const parsed = JSON.parse(rawText);
          return {
            description: parsed.description,
            shortDescription: parsed.shortDescription,
            bulletPoints: parsed.bulletPoints || [],
            stylingAdvice: parsed.stylingAdvice || '',
            fabricDetails: parsed.fabricDetails || resolvedFabric,
            careInstructions: parsed.careInstructions || [],
            seoMetaTitle: parsed.seoMetaTitle || `${params.name} | Luxury Menswear USA | Park Avenue`,
            seoMetaDescription: parsed.seoMetaDescription || `Discover ${params.name} at Park Avenue Menswear. Handcrafted with ${resolvedFabric}. Free express USA shipping over $200.`,
            keywords: parsed.keywords || ['luxury menswear USA', 'bespoke tailoring', 'park avenue menswear'],
            source: 'gemini-ai'
          };
        }
      } catch (geminiErr: any) {
        console.warn('[DescriptionService] Gemini AI generation error, falling back to Sartorial Engine:', geminiErr?.message || geminiErr);
      }
    }

    // Fallback: Sartorial Luxury Menswear Engine
    return this.generateEngineFallback(params, resolvedFabric, resolvedFit, priceStr);
  },

  generateEngineFallback(
    params: GenerateDescriptionParams,
    fabric: string,
    fit: string,
    priceStr: string
  ): GeneratedDescriptionResponse {
    const name = params.name.trim();
    const cat = params.category;
    const catLower = cat.toLowerCase();

    let description = '';
    let shortDescription = '';
    let bulletPoints: string[] = [];
    let stylingAdvice = '';
    let fabricDetails = '';
    let careInstructions: string[] = [];

    if (catLower.includes('suit')) {
      description = `Crafted for discerning gentlemen seeking absolute distinction, ${name} embodies the pinnacle of Park Avenue sartorial excellence. Cut from pristine ${fabric}, each jacket features a full-canvas chest piece that molds naturally to the wearer's anatomy over time, creating a bespoke drape unmatched by ready-to-wear alternatives.\n\nHand-finished with subtle pick-stitching along the lapels, genuine horn buttons, and functional sleeve cuffs, this two-piece ensemble effortlessly commands boardroom presentations, diplomatic galas, and high-stakes social occasions across the United States. The trousers feature a refined mid-rise cut, curtain waistband, and pick-stitched slant pockets for unwavering comfort and structural poise.`;
      shortDescription = `Hand-tailored ${fabric} two-piece suit with full-canvas construction, horn buttons, and bespoke Park Avenue finishing.`;
      bulletPoints = [
        `Milled from pristine ${fabric} with natural wrinkle recovery`,
        'Full floating canvas chest construction for an adaptive, sculpted fit',
        'Hand-finished pick-stitched lapels with functional kissing horn buttons',
        'Signature Bemberg cupro jacquard interior lining with dual sweat guards',
        'Trousers feature split curtain waistband, front coin pocket, and unfinished hem for bespoke tailoring'
      ];
      stylingAdvice = 'Pair with a crisp Egyptian cotton spread-collar shirt, hand-rolled silk grenadine tie, and Goodyear-welted black calfskin Oxfords for timeless New York elegance.';
      fabricDetails = `${fabric} woven with a 280g/m four-season weight, offering fluid drape, natural thermal balance, and resilient shape retention.`;
      careInstructions = [
        'Professional eco-friendly dry clean only (max twice per season)',
        'Steam gently to release wrinkles; never press directly with a hot iron',
        'Store on contoured wide-shoulder cedar hangers between wearings'
      ];
    } else if (catLower.includes('shirt')) {
      description = `An indispensable cornerstone of the luxury wardrobe, ${name} is meticulously woven from ${fabric}. Crafted with single-needle 22-stitches-per-inch precision tailoring, this shirt offers an exquisite hand feel, luminous luster, and exceptional all-day crispness.\n\nThe reinforced spread collar is engineered with removable brass stays to maintain crisp arching beneath jacket lapels, while genuine Australian mother-of-pearl buttons are crow-foot stitched for longevity. Perfect for executive travel from Manhattan to San Francisco.`;
      shortDescription = `Ultra-fine ${fabric} dress shirt tailored with single-needle seams and genuine mother-of-pearl buttons.`;
      bulletPoints = [
        `Woven from ${fabric} with liquid-silk hand feel`,
        'Single-needle 22-stitches-per-inch lockstitch construction',
        'Reinforced spread collar with complimentary engraved brass collar stays',
        'Australian mother-of-pearl shanked buttons with crow-foot stitching',
        'Grounded split-yoke back designed for unrestricted shoulder motion'
      ];
      stylingAdvice = 'Pairs impeccably under navy or charcoal suiting with a four-in-hand silk knot, or wear with tailored trousers and suede loafers for elevated smart-casual style.';
      fabricDetails = `${fabric} featuring two-ply yarns that deliver unrivaled breathability, natural crease resistance, and rich optical brilliance.`;
      careInstructions = [
        'Machine wash cold on gentle cycle or professional laundering with light starch',
        'Hang dry or tumble dry low; iron warm while slightly damp',
        'Remove brass collar stays prior to washing'
      ];
    } else if (catLower.includes('pant') || catLower.includes('trouser')) {
      description = `Engineered for effortless sartorial elegance, ${name} is tailored from ${fabric}. Featuring a clean architectural silhouette, extended buttoned waistband tab, and deep side slant pockets, these trousers provide sublime comfort through long days of executive engagements.\n\nFinished with interior grip curtain waistbands and half-lined fronts, they maintain their sharp crease throughout day-to-night transitions.`;
      shortDescription = `Sartorial ${fabric} trousers tailored with an extended waistband tab, curtain waistband, and precision front crease.`;
      bulletPoints = [
        `Tailored from ${fabric} with built-in natural elasticity`,
        'Extended dress waistband tab with hidden dual-clasp hook closure',
        'Interior shirt-grip rubberized waistband lining keeps dress shirts neatly tucked',
        'Deep pick-stitched front pockets and buttoned rear welt pockets',
        'Unfinished 37-inch inseam ready for complimentary custom cuffing or plain hem'
      ];
      stylingAdvice = 'Complement with a tailored sports jacket, fine-gauge merino knit polo, and burnished leather dress shoes for refined metropolitan sophistication.';
      fabricDetails = `${fabric} calibrated for versatile temperature regulation and sharp drape with enduring crease retention.`;
      careInstructions = [
        'Professional dry clean recommended',
        'Steam vertically or press inside-out with a damp pressing cloth',
        'Hang by the cuffs using felt-lined trouser clamp hangers'
      ];
    } else if (catLower.includes('outerwear') || catLower.includes('coat')) {
      description = `A grand statement of protection and refinement, ${name} shields against the elements with commanding elegance. Cut from luxurious ${fabric}, this coat delivers heavyweight insulation without cumbersome bulk.\n\nFeaturing hand-finished buttonholes, storm flap closure, and velvet-lined handwarmer pockets, it layers gracefully over tailored suits or heavy knitwear through the harsh American winter.`;
      shortDescription = `Luxurious ${fabric} overcoat engineered with thermal wool insulation, storm-grade tailoring, and hand-finished details.`;
      bulletPoints = [
        `Crafted from heavy-gauge ${fabric} with water-resistant treatment`,
        'Thermal interior interlining providing comfortable warmth down to 20°F (-7°C)',
        'Supple velvet-lined slash pockets for effortless hand warming',
        'Horn buttons secured with reinforced backer buttons',
        'Generous back center vent allows fluid stride while keeping out wind drafts'
      ];
      stylingAdvice = 'Drape over a bespoke suit during morning commutes or pair with dark denim and Chelsea boots for weekend country escapes.';
      fabricDetails = `${fabric} providing superior wind resistance, natural water repelling lanolin fibers, and velvety tactile richness.`;
      careInstructions = [
        'Specialist garment dry clean only',
        'Brush regularly with a genuine horsehair garment brush to preserve pile',
        'Store in a breathable canvas garment bag over cedar blocks'
      ];
    } else {
      description = `The ${name} represents Park Avenue's uncompromising commitment to American luxury and sartorial tradition. Rendered in ${fabric}, this piece blends heritage tailoring techniques with contemporary functionality, curated for gentlemen who appreciate nuanced details and enduring quality.\n\nEvery seam, stitch, and finish is inspected by our master artisans to guarantee a flawless finish whether in the salon or on the move.`;
      shortDescription = `Refined ${cat} crafted in ${fabric} with Park Avenue signature artisan craftsmanship.`;
      bulletPoints = [
        `Meticulously crafted from ${fabric}`,
        `Modern sartorial cut (${fit}) designed for effortless movement`,
        'Reinforced stress points and precision-tailored seam allowances',
        'Signature Park Avenue crest hardware and interior branding',
        'Complimentary bespoke alterations available across all US locations'
      ];
      stylingAdvice = 'Designed to coordinate harmoniously with the complete Park Avenue wardrobe collection.';
      fabricDetails = `${fabric} chosen for its exceptional texture, durability, and timeless aesthetic.`;
      careInstructions = [
        'Follow garment label instructions carefully',
        'Store in a climate-controlled wardrobe',
        'Use appropriate garment care tools to prolong lifespan'
      ];
    }

    const seoMetaTitle = `${name} | Luxury ${cat} USA | Park Avenue Menswear`;
    const seoMetaDescription = `Shop ${name} at Park Avenue Menswear. Handcrafted with ${fabric}. Free luxury express shipping across all 50 US states. Tailored to perfection.`;
    const keywords = [
      `luxury ${catLower} usa`,
      `${name.toLowerCase()} park avenue`,
      `mens designer ${catLower}`,
      `bespoke menswear usa`,
      `italian fabric ${catLower}`,
      'hand tailored menswear nyc',
      'park avenue menswear online store',
      `best ${catLower} for men usa`
    ];

    return {
      description,
      shortDescription,
      bulletPoints,
      stylingAdvice,
      fabricDetails,
      careInstructions,
      seoMetaTitle: seoMetaTitle.slice(0, 60),
      seoMetaDescription: seoMetaDescription.slice(0, 155),
      keywords,
      source: 'sartorial-engine'
    };
  }
};
