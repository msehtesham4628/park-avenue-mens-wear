export interface StateTaxInfo {
  code: string;
  name: string;
  rate: number;
  clothingExempt?: boolean;
  clothingThreshold?: number;
  notes?: string;
}

/**
 * State-level US sales/use tax configuration.
 * Local/city/county rates are intentionally not blended into these values.
 * This keeps the calculation deterministic until ZIP-level nexus/rate data is configured.
 */
export const US_STATE_TAX_RATES: Record<string, StateTaxInfo> = {
  AL:{code:'AL',name:'Alabama',rate:0.04}, AK:{code:'AK',name:'Alaska',rate:0},
  AZ:{code:'AZ',name:'Arizona',rate:0.056}, AR:{code:'AR',name:'Arkansas',rate:0.065},
  CA:{code:'CA',name:'California',rate:0.0725}, CO:{code:'CO',name:'Colorado',rate:0.029},
  CT:{code:'CT',name:'Connecticut',rate:0.0635}, DE:{code:'DE',name:'Delaware',rate:0},
  DC:{code:'DC',name:'District of Columbia',rate:0.06}, FL:{code:'FL',name:'Florida',rate:0.06},
  GA:{code:'GA',name:'Georgia',rate:0.04}, HI:{code:'HI',name:'Hawaii',rate:0.04},
  ID:{code:'ID',name:'Idaho',rate:0.06}, IL:{code:'IL',name:'Illinois',rate:0.0625},
  IN:{code:'IN',name:'Indiana',rate:0.07}, IA:{code:'IA',name:'Iowa',rate:0.06},
  KS:{code:'KS',name:'Kansas',rate:0.065}, KY:{code:'KY',name:'Kentucky',rate:0.06},
  LA:{code:'LA',name:'Louisiana',rate:0.0445}, ME:{code:'ME',name:'Maine',rate:0.055},
  MD:{code:'MD',name:'Maryland',rate:0.06}, MA:{code:'MA',name:'Massachusetts',rate:0.0625,clothingThreshold:175},
  MI:{code:'MI',name:'Michigan',rate:0.06}, MN:{code:'MN',name:'Minnesota',rate:0.06875,clothingExempt:true},
  MS:{code:'MS',name:'Mississippi',rate:0.07}, MO:{code:'MO',name:'Missouri',rate:0.04225},
  MT:{code:'MT',name:'Montana',rate:0}, NE:{code:'NE',name:'Nebraska',rate:0.055},
  NV:{code:'NV',name:'Nevada',rate:0.0685}, NH:{code:'NH',name:'New Hampshire',rate:0},
  NJ:{code:'NJ',name:'New Jersey',rate:0.06625,clothingExempt:true}, NM:{code:'NM',name:'New Mexico',rate:0.04875},
  NY:{code:'NY',name:'New York',rate:0.04,clothingExempt:true},
  NC:{code:'NC',name:'North Carolina',rate:0.0475}, ND:{code:'ND',name:'North Dakota',rate:0.05},
  OH:{code:'OH',name:'Ohio',rate:0.0575}, OK:{code:'OK',name:'Oklahoma',rate:0.045},
  OR:{code:'OR',name:'Oregon',rate:0}, PA:{code:'PA',name:'Pennsylvania',rate:0.06,clothingExempt:true},
  RI:{code:'RI',name:'Rhode Island',rate:0.07,clothingThreshold:250}, SC:{code:'SC',name:'South Carolina',rate:0.06},
  SD:{code:'SD',name:'South Dakota',rate:0.042}, TN:{code:'TN',name:'Tennessee',rate:0.07},
  TX:{code:'TX',name:'Texas',rate:0.0625}, UT:{code:'UT',name:'Utah',rate:0.0485},
  VT:{code:'VT',name:'Vermont',rate:0.06,clothingExempt:true}, VA:{code:'VA',name:'Virginia',rate:0.043},
  WA:{code:'WA',name:'Washington',rate:0.065}, WV:{code:'WV',name:'West Virginia',rate:0.06},
  WI:{code:'WI',name:'Wisconsin',rate:0.05}, WY:{code:'WY',name:'Wyoming',rate:0.04}
};

export const taxService = {
  getStateOptions() {
    return Object.values(US_STATE_TAX_RATES).map(s => ({ code:s.code, name:s.name, rate:s.rate }));
  },

  calculateTax(
    stateInput: string | undefined | null,
    items: Array<{ price:number; quantity:number }>,
    subtotal: number,
    shippingAmount = 0
  ) {
    if (!stateInput?.trim()) {
      return { stateCode:'', stateName:'', rate:0, taxAmount:0, taxableAmount:0, notes:'Calculated upon selecting state.', calculationVersion:'state-v2' };
    }
    const clean = stateInput.trim().toUpperCase();
    const state = US_STATE_TAX_RATES[clean] || Object.values(US_STATE_TAX_RATES).find(s => s.name.toUpperCase() === clean);
    if (!state) throw new Error(`Unsupported US state: ${stateInput}`);

    let taxableAmount = 0;
    if (!state.clothingExempt) {
      if (state.clothingThreshold) {
        for (const item of items) {
          const line = item.price * item.quantity;
          taxableAmount += state.code === 'MA'
            ? Math.max(0, item.price - state.clothingThreshold) * item.quantity
            : (item.price > state.clothingThreshold ? line : 0);
        }
      } else {
        taxableAmount = subtotal;
      }
    }

    // Shipping is kept as a separate future extension point. The current state-only
    // configuration taxes merchandise only; ZIP/local rules can add taxable shipping later.
    const taxAmount = Math.round(taxableAmount * state.rate * 100) / 100;
    return {
      stateCode:state.code,
      stateName:state.name,
      rate:state.rate,
      taxAmount,
      taxableAmount,
      notes:state.notes,
      calculationVersion:'state-v2'
    };
  }
};
