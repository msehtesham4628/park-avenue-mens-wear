export interface StateTaxInfo {
  code: string;
  name: string;
  rate: number;
  clothingThreshold?: number;
  notes?: string;
  isNomadState?: boolean;
}

export const US_STATE_TAX_RATES: Record<string, StateTaxInfo> = {
  AL: { code: 'AL', name: 'Alabama', rate: 0.0924, notes: 'State rate 4% + avg local 5.24%' },
  AK: { code: 'AK', name: 'Alaska', rate: 0.0182, isNomadState: true, notes: '0% State base; avg municipal 1.82%' },
  AZ: { code: 'AZ', name: 'Arizona', rate: 0.0837, notes: 'State rate 5.6% + avg local 2.77%' },
  AR: { code: 'AR', name: 'Arkansas', rate: 0.0947, notes: 'State rate 6.5% + avg local 2.97%' },
  CA: { code: 'CA', name: 'California', rate: 0.0885, notes: 'State base 7.25% + avg district 1.6%' },
  CO: { code: 'CO', name: 'Colorado', rate: 0.0781, notes: 'State rate 2.9% + avg local 4.91%' },
  CT: { code: 'CT', name: 'Connecticut', rate: 0.0635, notes: 'Standard 6.35%; luxury garments >$1,000 may incur 7.75%' },
  DE: { code: 'DE', name: 'Delaware', rate: 0.0000, isNomadState: true, notes: 'No state or local sales tax' },
  DC: { code: 'DC', name: 'District of Columbia', rate: 0.0600, notes: 'District sales tax 6.0%' },
  FL: { code: 'FL', name: 'Florida', rate: 0.0702, notes: 'State rate 6% + avg county surtax 1.02%' },
  GA: { code: 'GA', name: 'Georgia', rate: 0.0741, notes: 'State rate 4% + avg local 3.41%' },
  HI: { code: 'HI', name: 'Hawaii', rate: 0.0450, notes: 'General Excise Tax (GET) ~4.5%' },
  ID: { code: 'ID', name: 'Idaho', rate: 0.0603, notes: 'State rate 6% + avg local 0.03%' },
  IL: { code: 'IL', name: 'Illinois', rate: 0.0886, notes: 'State rate 6.25% + Chicago / local avg 2.61%' },
  IN: { code: 'IN', name: 'Indiana', rate: 0.0700, notes: 'Uniform state rate 7.0%' },
  IA: { code: 'IA', name: 'Iowa', rate: 0.0694, notes: 'State rate 6% + avg local 0.94%' },
  KS: { code: 'KS', name: 'Kansas', rate: 0.0870, notes: 'State rate 6.5% + avg local 2.2%' },
  KY: { code: 'KY', name: 'Kentucky', rate: 0.0600, notes: 'Uniform state rate 6.0%' },
  LA: { code: 'LA', name: 'Louisiana', rate: 0.0955, notes: 'State rate 4.45% + avg local 5.1%' },
  ME: { code: 'ME', name: 'Maine', rate: 0.0550, notes: 'Uniform state rate 5.5%' },
  MD: { code: 'MD', name: 'Maryland', rate: 0.0600, notes: 'Uniform state rate 6.0%' },
  MA: { code: 'MA', name: 'Massachusetts', rate: 0.0625, clothingThreshold: 175, notes: 'Clothing items <=$175 exempt; portion over $175 taxed at 6.25%' },
  MI: { code: 'MI', name: 'Michigan', rate: 0.0600, notes: 'Uniform state rate 6.0%' },
  MN: { code: 'MN', name: 'Minnesota', rate: 0.0000, notes: 'General apparel exempt from sales tax' },
  MS: { code: 'MS', name: 'Mississippi', rate: 0.0707, notes: 'State rate 7% + local avg 0.07%' },
  MO: { code: 'MO', name: 'Missouri', rate: 0.0839, notes: 'State rate 4.225% + avg local 4.165%' },
  MT: { code: 'MT', name: 'Montana', rate: 0.0000, isNomadState: true, notes: 'No state or local sales tax' },
  NE: { code: 'NE', name: 'Nebraska', rate: 0.0697, notes: 'State rate 5.5% + avg local 1.47%' },
  NV: { code: 'NV', name: 'Nevada', rate: 0.0823, notes: 'State base 6.85% + Clark/Washoe avg 1.38%' },
  NH: { code: 'NH', name: 'New Hampshire', rate: 0.0000, isNomadState: true, notes: 'No state or local sales tax' },
  NJ: { code: 'NJ', name: 'New Jersey', rate: 0.0000, notes: 'Everyday clothing and footwear exempt from sales tax' },
  NM: { code: 'NM', name: 'New Mexico', rate: 0.0772, notes: 'Gross Receipts Tax (GRT) ~7.72%' },
  NY: { code: 'NY', name: 'New York', rate: 0.08875, clothingThreshold: 110, notes: 'Clothing items >$110 subject to standard 8.875% in NYC/state' },
  NC: { code: 'NC', name: 'North Carolina', rate: 0.0700, notes: 'State rate 4.75% + avg local 2.25%' },
  ND: { code: 'ND', name: 'North Dakota', rate: 0.0696, notes: 'State rate 5% + avg local 1.96%' },
  OH: { code: 'OH', name: 'Ohio', rate: 0.0724, notes: 'State rate 5.75% + avg local 1.49%' },
  OK: { code: 'OK', name: 'Oklahoma', rate: 0.0898, notes: 'State rate 4.5% + avg local 4.48%' },
  OR: { code: 'OR', name: 'Oregon', rate: 0.0000, isNomadState: true, notes: 'No state or local sales tax' },
  PA: { code: 'PA', name: 'Pennsylvania', rate: 0.0000, notes: 'Apparel exempt from PA state sales tax' },
  RI: { code: 'RI', name: 'Rhode Island', rate: 0.0700, clothingThreshold: 250, notes: 'Clothing <=$250 exempt; portion over $250 taxed at 7%' },
  SC: { code: 'SC', name: 'South Carolina', rate: 0.0744, notes: 'State rate 6% + avg local 1.44%' },
  SD: { code: 'SD', name: 'South Dakota', rate: 0.0611, notes: 'State rate 4.2% + avg local 1.91%' },
  TN: { code: 'TN', name: 'Tennessee', rate: 0.0955, notes: 'State rate 7% + avg local 2.55%' },
  TX: { code: 'TX', name: 'Texas', rate: 0.0825, notes: 'State rate 6.25% + local max 2.0%' },
  UT: { code: 'UT', name: 'Utah', rate: 0.0725, notes: 'State base 6.1% + avg local 1.15%' },
  VT: { code: 'VT', name: 'Vermont', rate: 0.0000, notes: 'General apparel exempt from VT sales tax' },
  VA: { code: 'VA', name: 'Virginia', rate: 0.0575, notes: 'State rate 4.3% + local 1.0% + regional 0.45%' },
  WA: { code: 'WA', name: 'Washington', rate: 0.0929, notes: 'State rate 6.5% + avg local 2.79%' },
  WV: { code: 'WV', name: 'West Virginia', rate: 0.0655, notes: 'State rate 6% + avg local 0.55%' },
  WI: { code: 'WI', name: 'Wisconsin', rate: 0.0543, notes: 'State rate 5% + avg local 0.43%' },
  WY: { code: 'WY', name: 'Wyoming', rate: 0.0536, notes: 'State rate 4% + avg local 1.36%' },
  PR: { code: 'PR', name: 'Puerto Rico', rate: 0.1150, notes: 'State rate 10.5% + municipal 1.0%' }
};

export const taxService = {
  calculateTax(
    stateInput: string | undefined | null,
    items: Array<{ price: number; quantity: number }>,
    subtotal: number
  ): {
    stateCode: string;
    stateName: string;
    rate: number;
    taxAmount: number;
    notes?: string;
  } {
    if (!stateInput || !stateInput.trim()) {
      return {
        stateCode: 'UNKNOWN',
        stateName: 'Unknown',
        rate: 0.0825,
        taxAmount: Math.round(subtotal * 0.0825 * 100) / 100,
        notes: 'Standard estimated rate'
      };
    }

    const clean = stateInput.trim().toUpperCase();
    let foundState = US_STATE_TAX_RATES[clean];
    if (!foundState) {
      foundState = Object.values(US_STATE_TAX_RATES).find(
        s => s.name.toUpperCase() === clean || s.name.toUpperCase().startsWith(clean)
      ) as StateTaxInfo;
    }

    if (!foundState) {
      return {
        stateCode: clean,
        stateName: stateInput,
        rate: 0.0825,
        taxAmount: Math.round(subtotal * 0.0825 * 100) / 100,
        notes: 'Default national estimated rate'
      };
    }

    if (foundState.rate === 0) {
      return {
        stateCode: foundState.code,
        stateName: foundState.name,
        rate: 0,
        taxAmount: 0,
        notes: foundState.notes
      };
    }

    let taxableSubtotal = 0;
    if (foundState.clothingThreshold) {
      const threshold = foundState.clothingThreshold;
      for (const item of items) {
        if (item.price > threshold) {
          if (foundState.code === 'MA') {
            taxableSubtotal += Math.max(0, (item.price - threshold) * item.quantity);
          } else {
            taxableSubtotal += item.price * item.quantity;
          }
        }
      }
    } else {
      taxableSubtotal = subtotal;
    }

    const taxAmount = Math.round(taxableSubtotal * foundState.rate * 100) / 100;

    return {
      stateCode: foundState.code,
      stateName: foundState.name,
      rate: foundState.rate,
      taxAmount,
      notes: foundState.notes
    };
  }
};
