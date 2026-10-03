import { GoogleGenAI } from '@google/genai';

export interface GenerateTitleParams {
  rawText?: string;
  category?: string;
  fabric?: string;
  fit?: string;
  provider?: 'gemini' | 'openai' | 'auto';
  imageBase64?: string;
  imageMimeType?: string;
}

export interface GeneratedTitleResponse {
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
  source: 'gemini-ai' | 'openai-ai' | 'sartorial-engine';
}

const CATEGORY_MAP: Record<string, string[]> = {
  'Suits': ['suit', 'tuxedo', 'tux', 'smoking', 'dinner jacket', '3 piece', '3-piece', 'three-piece', 'double breasted suit'],
  'Blazers & Jackets': ['blazer', 'sports coat', 'sport coat', 'sport jacket'],
  'Leather jackets': ['leather jacket', 'biker jacket', 'suede jacket'],
  'Dress shirts': ['dress shirt', 'shirt', 'french cuff', 'spread collar', 'oxford'],
  'Polo shirts': ['polo', 'knit polo', 'piqué'],
  'Pants': ['trousers', 'pants', 'dress pants', 'chinos', 'slacks'],
  'Jeans': ['jeans', 'denim', 'selvedge'],
  'Outerwear': ['overcoat', 'coat', 'trench', 'peacoat', 'chesterfield'],
  'Sweaters': ['sweater', 'cashmere knit', 'cardigan', 'turtleneck', 'pullover'],
  'Shoe': ['oxford shoes', 'derby shoes', 'monkstrap', 'dress shoes'],
  'Loofers': ['loafer', 'loafers', 'penny loafer', 'tassel loafer', 'horsebit'],
  'Boots': ['boot', 'boots', 'chelsea boot', 'chukka'],
  'Ties': ['tie', 'ties', 'bow tie', 'bowtie', 'cravat'],
  'Shorts': ['shorts', 'tailored shorts']
};

export const titleService = {
  async generateProductTitle(params: GenerateTitleParams): Promise<GeneratedTitleResponse> {
    const rawText = (params.rawText || '').trim();
    const provider = params.provider || 'auto';
    const geminiKey = process.env.GEMINI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    const hasImage = Boolean(params.imageBase64 && params.imageBase64.length > 50);

    const systemPrompt = `You are the master branding director and head sartorial copywriter for Park Avenue Menswear, an ultra-luxury bespoke menswear house in New York City.
Given raw text or uploaded garment image describing a menswear garment (e.g. client notes, fabric descriptions, supplier specs, garment photo, or rough bullet points):
"${rawText || 'Luxury menswear garment photo uploaded'}"

Optional context:
- Hinted Category: "${params.category || ''}"
- Hinted Fabric: "${params.fabric || ''}"

Generate a prestigious, high-end, luxury garment product title and 4 variations.
Titles should be evocative, elegant, clear, and reflect ultra-luxury craftsmanship (e.g., "The Park Avenue Sovereign Navy Double-Breasted Wool Suit", "Atelier Como Silk Grenadine Tie", "Mayfair Super 150s Pure Wool Blazer").

Output MUST be valid JSON with this exact structure:
{
  "title": "Primary recommended luxury title (under 60 characters)",
  "variations": [
    { "label": "Executive Atelier (Recommended)", "title": "Bespoke full title", "style": "bespoke" },
    { "label": "Sartorial Editorial", "title": "Editorial magazine style title", "style": "editorial" },
    { "label": "Modern Minimalist", "title": "Concise modern luxury title", "style": "modern" },
    { "label": "USA E-Commerce SEO", "title": "Search-optimized high-intent title", "style": "seo" }
  ],
  "detectedCategory": "Suits | Blazers & Jackets | Dress shirts | Pants | Footwear | Outerwear | Ties | Sweaters",
  "detectedFabric": "Identified fabric or null",
  "detectedFit": "Identified fit or null",
  "detectedColor": "Identified primary color or null"
}`;

    // 1. Try OpenAI if explicitly chosen or auto-selected
    if ((provider === 'openai' || (provider === 'auto' && openaiKey && !geminiKey)) && (rawText.length > 2 || hasImage)) {
      if (openaiKey) {
        try {
          const userContent: any[] = [];
          if (hasImage && params.imageBase64) {
            const dataUrl = params.imageBase64.startsWith('data:') 
              ? params.imageBase64 
              : `data:${params.imageMimeType || 'image/jpeg'};base64,${params.imageBase64}`;
            userContent.push({
              type: 'image_url',
              image_url: { url: dataUrl }
            });
          }
          userContent.push({
            type: 'text',
            text: `Generate prestigious luxury title for this garment. ${rawText ? 'Details: ' + rawText : 'Inspect the garment cut, color, lapel and fabric.'}`
          });

          const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${openaiKey}`
            },
            body: JSON.stringify({
              model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userContent }
              ],
              response_format: { type: 'json_object' },
              temperature: 0.7
            })
          });

          if (res.ok) {
            const data: any = await res.json();
            const content = data.choices?.[0]?.message?.content;
            if (content) {
              const parsed = JSON.parse(content);
              if (parsed && parsed.title) {
                return {
                  title: parsed.title,
                  variations: Array.isArray(parsed.variations) && parsed.variations.length > 0
                    ? parsed.variations
                    : [{ label: 'Executive Atelier (Recommended)', title: parsed.title, style: 'bespoke' }],
                  detectedCategory: parsed.detectedCategory || params.category,
                  detectedFabric: parsed.detectedFabric || params.fabric,
                  detectedFit: parsed.detectedFit,
                  detectedColor: parsed.detectedColor,
                  source: 'openai-ai'
                };
              }
            }
          }
        } catch (err: any) {
          console.warn('[titleService] OpenAI title generation failed, falling back:', err?.message);
        }
      }
    }

    // 2. Try Gemini AI if chosen or default
    if ((provider === 'gemini' || provider === 'auto' || !openaiKey) && geminiKey && (rawText.length > 2 || hasImage)) {
      try {
        const ai = new GoogleGenAI({
          apiKey: geminiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build'
            }
          }
        });

        let contentsPayload: any;
        if (hasImage && params.imageBase64) {
          const cleanBase64 = params.imageBase64.replace(/^data:image\/[a-zA-Z0-9+]+;base64,/, '');
          contentsPayload = {
            parts: [
              {
                inlineData: {
                  mimeType: params.imageMimeType || 'image/jpeg',
                  data: cleanBase64
                }
              },
              {
                text: `${systemPrompt}\n\nGarment specifications / client notes: "${rawText || 'Analyze the garment cut, lapels, fabric and style in this photo'}"`
              }
            ]
          };
        } else {
          contentsPayload = systemPrompt;
        }

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: contentsPayload,
          config: {
            responseMimeType: 'application/json'
          }
        });

        const text = response.text?.trim() || '';
        if (text) {
          const parsed = JSON.parse(text);
          if (parsed && parsed.title) {
            return {
              title: parsed.title,
              variations: Array.isArray(parsed.variations) && parsed.variations.length > 0 
                ? parsed.variations 
                : [
                    { label: 'Executive Atelier (Recommended)', title: parsed.title, style: 'bespoke' }
                  ],
              detectedCategory: parsed.detectedCategory || params.category,
              detectedFabric: parsed.detectedFabric || params.fabric,
              detectedFit: parsed.detectedFit,
              detectedColor: parsed.detectedColor,
              source: 'gemini-ai'
            };
          }
        }
      } catch (err: any) {
        console.warn('[titleService] Gemini AI title generation failed, falling back to algorithmic engine:', err?.message);
      }
    }

    // 3. High-performance Sartorial Algorithmic Fallback Engine
    return titleService.generateAlgorithmicTitle(params);
  },

  generateAlgorithmicTitle(params: GenerateTitleParams): GeneratedTitleResponse {
    const text = (params.rawText || '').trim();

    // Detect category
    let detectedCategory = params.category;
    if (!detectedCategory || detectedCategory === 'Suits') {
      for (const [cat, words] of Object.entries(CATEGORY_MAP)) {
        if (words.some(w => new RegExp(`\\b${w}\\b`, 'i').test(text))) {
          detectedCategory = cat;
          break;
        }
      }
    }
    detectedCategory = detectedCategory || 'Suits';

    // Detect color
    let detectedColor = 'Midnight Navy';
    const colorMatches: [RegExp, string][] = [
      [/midnight(?:\s*navy)?/i, 'Midnight Navy'],
      [/navy(?:\s*blue)?/i, 'Navy Blue'],
      [/royal(?:\s*blue)?/i, 'Royal Blue'],
      [/charcoal(?:\s*grey)?/i, 'Charcoal Grey'],
      [/slate(?:\s*grey)?/i, 'Slate Grey'],
      [/black|noir/i, 'Sovereign Black'],
      [/white|ivory/i, 'Ivory White'],
      [/burgundy|wine|bordeaux/i, 'Burgundy'],
      [/forest\s*green|emerald/i, 'Forest Green'],
      [/camel|cognac/i, 'Cognac Camel'],
      [/brown|espresso|chocolate/i, 'Espresso Brown']
    ];
    for (const [pattern, canonical] of colorMatches) {
      if (pattern.test(text)) {
        detectedColor = canonical;
        break;
      }
    }

    // Detect fabric
    let detectedFabric = params.fabric;
    const fabricMatches: [RegExp, string][] = [
      [/super\s*180s?/i, 'Super 180s Italian Virgin Wool'],
      [/super\s*160s?/i, 'Super 160s Italian Virgin Wool'],
      [/super\s*150s?/i, 'Super 150s Italian Virgin Wool'],
      [/super\s*140s?/i, 'Super 140s Pure Wool'],
      [/super\s*130s?/i, 'Super 130s Pure Wool'],
      [/super\s*120s?/i, 'Super 120s Wool'],
      [/cashmere/i, 'Pure Mongolian Cashmere'],
      [/giza|egyptian\s*cotton/i, 'Egyptian Giza Cotton'],
      [/linen/i, 'Pure Irish Linen'],
      [/silk/i, 'Pure Como Silk'],
      [/flannel/i, 'Worsted Wool Flannel'],
      [/calfskin|calf/i, 'French Calfskin Leather']
    ];
    for (const [pattern, canonical] of fabricMatches) {
      if (pattern.test(text)) {
        detectedFabric = canonical;
        break;
      }
    }

    // Detect silhouette/features
    let feature = '';
    if (/double\s*breasted|db/i.test(text)) feature = 'Double-Breasted';
    else if (/three\s*piece|3\s*piece/i.test(text)) feature = 'Three-Piece';
    else if (/peak\s*lapel/i.test(text)) feature = 'Peak Lapel';
    else if (/french\s*cuff/i.test(text)) feature = 'French Cuff';
    else if (/spread\s*collar/i.test(text)) feature = 'Spread Collar';

    const fabricShort = (detectedFabric || 'Italian Wool').replace(/^Pure\s+|^Italian\s+/, '');
    const catSingular = detectedCategory === 'Dress shirts' ? 'Dress Shirt'
      : detectedCategory === 'Polo shirts' ? 'Polo Shirt'
      : detectedCategory === 'Leather jackets' ? 'Leather Jacket'
      : detectedCategory === 'Dress pants' ? 'Dress Pants'
      : detectedCategory.replace(/s$/, '');

    const bespokeTitle = `The Park Avenue ${detectedColor} ${feature ? feature + ' ' : ''}${fabricShort} ${catSingular}`.replace(/\s+/g, ' ').trim();
    const editorialTitle = `Atelier ${feature ? feature + ' ' : ''}${catSingular} in ${detectedColor} ${fabricShort}`.replace(/\s+/g, ' ').trim();
    const modernTitle = `Park Avenue ${detectedColor} ${catSingular} (${fabricShort})`.replace(/\s+/g, ' ').trim();
    const seoTitle = `Men's Luxury ${detectedColor} ${catSingular} - ${fabricShort} Tailored Fit`.replace(/\s+/g, ' ').trim();

    return {
      title: bespokeTitle,
      variations: [
        { label: 'Executive Atelier (Recommended)', title: bespokeTitle, style: 'bespoke' },
        { label: 'Sartorial Editorial', title: editorialTitle, style: 'editorial' },
        { label: 'Modern Minimalist', title: modernTitle, style: 'modern' },
        { label: 'USA E-Commerce SEO', title: seoTitle, style: 'seo' }
      ],
      detectedCategory,
      detectedFabric,
      detectedColor,
      source: 'sartorial-engine'
    };
  }
};
