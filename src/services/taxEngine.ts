export interface StateTaxInfo {
  code: string;
  name: string;
  rate: number; // Decimal (e.g. 0.08875 = 8.875%)
  clothingThreshold?: number; // E.g. $110 in NY, $175 in MA
  notes?: string;
  isNomadState?: boolean; // 0% state sales tax (AK, DE, MT, NH, OR)
  standardShippingRate?: number;
  expressShippingRate?: number;
}

export const DEFAULT_US_STATE_TAX_RATES: Record<string, StateTaxInfo> = {
  AL: { code: 'AL', name: 'Alabama', rate: 0.0924, standardShippingRate: 15, expressShippingRate: 25, notes: 'State rate 4% + avg local 5.24%' },
  AK: { code: 'AK', name: 'Alaska', rate: 0.0182, standardShippingRate: 35, expressShippingRate: 65, isNomadState: true, notes: '0% State base; avg municipal 1.82%' },
  AZ: { code: 'AZ', name: 'Arizona', rate: 0.0837, standardShippingRate: 15, expressShippingRate: 25, notes: 'State rate 5.6% + avg local 2.77%' },
  AR: { code: 'AR', name: 'Arkansas', rate: 0.0947, standardShippingRate: 15, expressShippingRate: 25, notes: 'State rate 6.5% + avg local 2.97%' },
  CA: { code: 'CA', name: 'California', rate: 0.0885, standardShippingRate: 15, expressShippingRate: 25, notes: 'State base 7.25% + avg district 1.6%' },
  CO: { code: 'CO', name: 'Colorado', rate: 0.0781, standardShippingRate: 15, expressShippingRate: 25, notes: 'State rate 2.9% + avg local 4.91%' },
  CT: { code: 'CT', name: 'Connecticut', rate: 0.0635, standardShippingRate: 15, expressShippingRate: 25, notes: 'Standard 6.35%; luxury garments >$1,000 may incur 7.75%' },
  DE: { code: 'DE', name: 'Delaware', rate: 0.0000, standardShippingRate: 15, expressShippingRate: 25, isNomadState: true, notes: 'No state or local sales tax' },
  DC: { code: 'DC', name: 'District of Columbia', rate: 0.0600, standardShippingRate: 15, expressShippingRate: 25, notes: 'District sales tax 6.0%' },
  FL: { code: 'FL', name: 'Florida', rate: 0.0702, standardShippingRate: 15, expressShippingRate: 25, notes: 'State rate 6% + avg county surtax 1.02%' },
  GA: { code: 'GA', name: 'Georgia', rate: 0.0741, standardShippingRate: 15, expressShippingRate: 25, notes: 'State rate 4% + avg local 3.41%' },
  HI: { code: 'HI', name: 'Hawaii', rate: 0.0450, standardShippingRate: 35, expressShippingRate: 65, notes: 'General Excise Tax (GET) ~4.5%' },
  ID: { code: 'ID', name: 'Idaho', rate: 0.0603, standardShippingRate: 15, expressShippingRate: 25, notes: 'State rate 6% + avg local 0.03%' },
  IL: { code: 'IL', name: 'Illinois', rate: 0.0886, standardShippingRate: 15, expressShippingRate: 25, notes: 'State rate 6.25% + Chicago / local avg 2.61%' },
  IN: { code: 'IN', name: 'Indiana', rate: 0.0700, standardShippingRate: 15, expressShippingRate: 25, notes: 'Uniform state rate 7.0%' },
  IA: { code: 'IA', name: 'Iowa', rate: 0.0694, standardShippingRate: 15, expressShippingRate: 25, notes: 'State rate 6% + avg local 0.94%' },
  KS: { code: 'KS', name: 'Kansas', rate: 0.0870, standardShippingRate: 15, expressShippingRate: 25, notes: 'State rate 6.5% + avg local 2.2%' },
  KY: { code: 'KY', name: 'Kentucky', rate: 0.0600, standardShippingRate: 15, expressShippingRate: 25, notes: 'Uniform state rate 6.0%' },
  LA: { code: 'LA', name: 'Louisiana', rate: 0.0955, standardShippingRate: 15, expressShippingRate: 25, notes: 'State rate 4.45% + avg local 5.1%' },
  ME: { code: 'ME', name: 'Maine', rate: 0.0550, standardShippingRate: 15, expressShippingRate: 25, notes: 'Uniform state rate 5.5%' },
  MD: { code: 'MD', name: 'Maryland', rate: 0.0600, standardShippingRate: 15, expressShippingRate: 25, notes: 'Uniform state rate 6.0%' },
  MA: { code: 'MA', name: 'Massachusetts', rate: 0.0625, standardShippingRate: 15, expressShippingRate: 25, clothingThreshold: 175, notes: 'Clothing items <=$175 exempt; portion over $175 taxed at 6.25%' },
  MI: { code: 'MI', name: 'Michigan', rate: 0.0600, standardShippingRate: 15, expressShippingRate: 25, notes: 'Uniform state rate 6.0%' },
  MN: { code: 'MN', name: 'Minnesota', rate: 0.0000, standardShippingRate: 15, expressShippingRate: 25, notes: 'General apparel exempt from sales tax' },
  MS: { code: 'MS', name: 'Mississippi', rate: 0.0707, standardShippingRate: 15, expressShippingRate: 25, notes: 'State rate 7% + local avg 0.07%' },
  MO: { code: 'MO', name: 'Missouri', rate: 0.0839, standardShippingRate: 15, expressShippingRate: 25, notes: 'State rate 4.225% + avg local 4.165%' },
  MT: { code: 'MT', name: 'Montana', rate: 0.0000, standardShippingRate: 15, expressShippingRate: 25, isNomadState: true, notes: 'No state or local sales tax' },
  NE: { code: 'NE', name: 'Nebraska', rate: 0.0697, standardShippingRate: 15, expressShippingRate: 25, notes: 'State rate 5.5% + avg local 1.47%' },
  NV: { code: 'NV', name: 'Nevada', rate: 0.0823, standardShippingRate: 15, expressShippingRate: 25, notes: 'State base 6.85% + Clark/Washoe avg 1.38%' },
  NH: { code: 'NH', name: 'New Hampshire', rate: 0.0000, standardShippingRate: 15, expressShippingRate: 25, isNomadState: true, notes: 'No state or local sales tax' },
  NJ: { code: 'NJ', name: 'New Jersey', rate: 0.0000, standardShippingRate: 15, expressShippingRate: 25, notes: 'Everyday clothing and footwear exempt from sales tax' },
  NM: { code: 'NM', name: 'New Mexico', rate: 0.0772, standardShippingRate: 15, expressShippingRate: 25, notes: 'Gross Receipts Tax (GRT) ~7.72%' },
  NY: { code: 'NY', name: 'New York', rate: 0.08875, standardShippingRate: 15, expressShippingRate: 25, clothingThreshold: 110, notes: 'Clothing items >$110 subject to standard 8.875% in NYC/state' },
  NC: { code: 'NC', name: 'North Carolina', rate: 0.0700, standardShippingRate: 15, expressShippingRate: 25, notes: 'State rate 4.75% + avg local 2.25%' },
  ND: { code: 'ND', name: 'North Dakota', rate: 0.0696, standardShippingRate: 15, expressShippingRate: 25, notes: 'State rate 5% + avg local 1.96%' },
  OH: { code: 'OH', name: 'Ohio', rate: 0.0724, standardShippingRate: 15, expressShippingRate: 25, notes: 'State rate 5.75% + avg local 1.49%' },
  OK: { code: 'OK', name: 'Oklahoma', rate: 0.0898, standardShippingRate: 15, expressShippingRate: 25, notes: 'State rate 4.5% + avg local 4.48%' },
  OR: { code: 'OR', name: 'Oregon', rate: 0.0000, standardShippingRate: 15, expressShippingRate: 25, isNomadState: true, notes: 'No state or local sales tax' },
  PA: { code: 'PA', name: 'Pennsylvania', rate: 0.0000, standardShippingRate: 15, expressShippingRate: 25, notes: 'Apparel exempt from PA state sales tax' },
  RI: { code: 'RI', name: 'Rhode Island', rate: 0.0700, standardShippingRate: 15, expressShippingRate: 25, clothingThreshold: 250, notes: 'Clothing <=$250 exempt; portion over $250 taxed at 7%' },
  SC: { code: 'SC', name: 'South Carolina', rate: 0.0744, standardShippingRate: 15, expressShippingRate: 25, notes: 'State rate 6% + avg local 1.44%' },
  SD: { code: 'SD', name: 'South Dakota', rate: 0.0611, standardShippingRate: 15, expressShippingRate: 25, notes: 'State rate 4.2% + avg local 1.91%' },
  TN: { code: 'TN', name: 'Tennessee', rate: 0.0955, standardShippingRate: 15, expressShippingRate: 25, notes: 'State rate 7% + avg local 2.55%' },
  TX: { code: 'TX', name: 'Texas', rate: 0.0825, standardShippingRate: 15, expressShippingRate: 25, notes: 'State rate 6.25% + local max 2.0%' },
  UT: { code: 'UT', name: 'Utah', rate: 0.0725, standardShippingRate: 15, expressShippingRate: 25, notes: 'State base 6.1% + avg local 1.15%' },
  VT: { code: 'VT', name: 'Vermont', rate: 0.0000, standardShippingRate: 15, expressShippingRate: 25, notes: 'General apparel exempt from VT sales tax' },
  VA: { code: 'VA', name: 'Virginia', rate: 0.0575, standardShippingRate: 15, expressShippingRate: 25, notes: 'State rate 4.3% + local 1.0% + regional 0.45%' },
  WA: { code: 'WA', name: 'Washington', rate: 0.0929, standardShippingRate: 15, expressShippingRate: 25, notes: 'State rate 6.5% + avg local 2.79%' },
  WV: { code: 'WV', name: 'West Virginia', rate: 0.0655, standardShippingRate: 15, expressShippingRate: 25, notes: 'State rate 6% + avg local 0.55%' },
  WI: { code: 'WI', name: 'Wisconsin', rate: 0.0543, standardShippingRate: 15, expressShippingRate: 25, notes: 'State rate 5% + avg local 0.43%' },
  WY: { code: 'WY', name: 'Wyoming', rate: 0.0536, standardShippingRate: 15, expressShippingRate: 25, notes: 'State rate 4% + avg local 1.36%' },
  PR: { code: 'PR', name: 'Puerto Rico', rate: 0.1150, standardShippingRate: 35, expressShippingRate: 65, notes: 'State rate 10.5% + municipal 1.0%' }
};

const STORAGE_KEY_TAX_RATES = 'pa_admin_us_state_tax_rates';

export function getUsStateTaxRates(): Record<string, StateTaxInfo> {
  if (typeof window === 'undefined') return DEFAULT_US_STATE_TAX_RATES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TAX_RATES);
    if (!raw) return DEFAULT_US_STATE_TAX_RATES;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_US_STATE_TAX_RATES, ...parsed };
  } catch {
    return DEFAULT_US_STATE_TAX_RATES;
  }
}

export function saveUsStateTaxRates(rates: Record<string, StateTaxInfo>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_TAX_RATES, JSON.stringify(rates));
    window.dispatchEvent(new CustomEvent('pa_rates_updated'));
  } catch (e) {
    console.error('Failed to save tax rates to localStorage', e);
  }
}

export function resetUsStateTaxRates(): Record<string, StateTaxInfo> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_TAX_RATES);
    window.dispatchEvent(new CustomEvent('pa_rates_updated'));
  }
  return DEFAULT_US_STATE_TAX_RATES;
}

export const US_STATE_TAX_RATES = DEFAULT_US_STATE_TAX_RATES;

export const US_STATES_LIST = Object.values(DEFAULT_US_STATE_TAX_RATES).sort((a, b) => a.name.localeCompare(b.name));

export interface TaxCalculationResult {
  stateCode: string;
  stateName: string;
  rate: number;
  rateFormatted: string;
  taxAmount: number;
  notes?: string;
  isExempt: boolean;
}

/**
 * Calculates sales tax strictly based on destination state.
 */
export function calculateStateTax(
  stateInput: string | undefined | null,
  items: Array<{ price: number; quantity: number }>,
  subtotal: number
): TaxCalculationResult | null {
  if (!stateInput || !stateInput.trim()) {
    return null;
  }

  const rates = getUsStateTaxRates();
  const clean = stateInput.trim().toUpperCase();
  let foundState: StateTaxInfo | undefined = rates[clean];
  if (!foundState) {
    foundState = Object.values(rates).find(
      s => s.name.toUpperCase() === clean || s.name.toUpperCase().startsWith(clean)
    );
  }

  if (!foundState) {
    return null;
  }

  let taxableBase = subtotal;

  // New York Luxury Apparel rule: garments under $110 are exempt from 4% state tax
  if (foundState.code === 'NY' && foundState.clothingThreshold) {
    let qualifyingTotal = 0;
    for (const item of items) {
      if (item.price > foundState.clothingThreshold) {
        qualifyingTotal += item.price * item.quantity;
      }
    }
    taxableBase = qualifyingTotal;
  } else if (foundState.clothingThreshold) {
    let qualifyingTotal = 0;
    for (const item of items) {
      if (item.price > foundState.clothingThreshold) {
        qualifyingTotal += (item.price - foundState.clothingThreshold) * item.quantity;
      }
    }
    taxableBase = qualifyingTotal;
  }

  const taxAmount = Math.round(taxableBase * foundState.rate * 100) / 100;
  const rateFormatted = `${(foundState.rate * 100).toFixed(foundState.rate % 0.01 === 0 ? 1 : 2)}%`;

  return {
    stateCode: foundState.code,
    stateName: foundState.name,
    rate: foundState.rate,
    rateFormatted,
    taxAmount,
    notes: foundState.notes,
    isExempt: foundState.rate === 0
  };
}

/**
 * US ZIP code prefix mapping to State code
 */
export function getStateCodeFromZip(zip: string): string | null {
  const clean = zip.replace(/\D/g, '').substring(0, 5);
  if (clean.length < 5) return null;
  const num = parseInt(clean, 10);
  if (isNaN(num)) return null;

  if (num >= 600 && num <= 999) return 'PR';
  if (num >= 1000 && num <= 2799) return 'MA';
  if (num >= 2800 && num <= 2999) return 'RI';
  if (num >= 3000 && num <= 3899) return 'NH';
  if (num >= 3900 && num <= 4999) return 'ME';
  if (num >= 5000 && num <= 5999) return 'VT';
  if (num >= 6000 && num <= 6999) return 'CT';
  if (num >= 7000 && num <= 8999) return 'NJ';
  if (num >= 10000 && num <= 14999) return 'NY';
  if (num >= 15000 && num <= 19699) return 'PA';
  if (num >= 19700 && num <= 19999) return 'DE';
  if (num >= 20000 && num <= 20099) return 'DC';
  if (num >= 20100 && num <= 24699) return 'VA';
  if (num >= 24700 && num <= 26999) return 'WV';
  if (num >= 27000 && num <= 28999) return 'NC';
  if (num >= 29000 && num <= 29999) return 'SC';
  if (num >= 30000 && num <= 31999) return 'GA';
  if (num >= 32000 && num <= 34999) return 'FL';
  if (num >= 35000 && num <= 36999) return 'AL';
  if (num >= 37000 && num <= 38599) return 'TN';
  if (num >= 38600 && num <= 39799) return 'MS';
  if (num >= 40000 && num <= 42799) return 'KY';
  if (num >= 43000 && num <= 45999) return 'OH';
  if (num >= 46000 && num <= 47999) return 'IN';
  if (num >= 48000 && num <= 49999) return 'MI';
  if (num >= 50000 && num <= 52899) return 'IA';
  if (num >= 53000 && num <= 54999) return 'WI';
  if (num >= 55000 && num <= 56799) return 'MN';
  if (num >= 57000 && num <= 57799) return 'SD';
  if (num >= 58000 && num <= 58899) return 'ND';
  if (num >= 59000 && num <= 59999) return 'MT';
  if (num >= 60000 && num <= 62999) return 'IL';
  if (num >= 63000 && num <= 65899) return 'MO';
  if (num >= 66000 && num <= 67999) return 'KS';
  if (num >= 68000 && num <= 69399) return 'NE';
  if (num >= 70000 && num <= 71499) return 'LA';
  if (num >= 71600 && num <= 72999) return 'AR';
  if (num >= 73000 && num <= 74999) return 'OK';
  if (num >= 75000 && num <= 79999) return 'TX';
  if (num >= 80000 && num <= 81699) return 'CO';
  if (num >= 82000 && num <= 83199) return 'WY';
  if (num >= 83200 && num <= 83899) return 'ID';
  if (num >= 84000 && num <= 84799) return 'UT';
  if (num >= 85000 && num <= 86599) return 'AZ';
  if (num >= 87000 && num <= 88499) return 'NM';
  if (num >= 89000 && num <= 89899) return 'NV';
  if (num >= 90000 && num <= 96199) return 'CA';
  if (num >= 96700 && num <= 96899) return 'HI';
  if (num >= 97000 && num <= 97999) return 'OR';
  if (num >= 98000 && num <= 99499) return 'WA';
  if (num >= 99500 && num <= 99999) return 'AK';

  return null;
}

export interface ZipTaxAndShipmentEstimate {
  zip: string;
  stateCode: string;
  stateName: string;
  taxRate: number;
  taxRateFormatted: string;
  estimatedTax: number;
  isTaxExempt: boolean;
  notes?: string;
  standardShippingFee: number;
  expressShippingFee: number;
  standardShippingCarrier: string;
  expressShippingCarrier: string;
  standardDeliveryDate: string;
  expressDeliveryDate: string;
  subtotal: number;
  totalWithStandard: number;
  totalWithExpress: number;
}

/**
 * Calculates estimated sales tax and shipment rates strictly from a 5-digit US ZIP code
 */
export function estimateTaxAndShipmentByZip(
  zip: string,
  unitPrice: number,
  quantity: number = 1,
  productShippingCharge?: number
): ZipTaxAndShipmentEstimate | null {
  const cleanZip = zip.replace(/\D/g, '').slice(0, 5);
  if (cleanZip.length < 5) return null;

  const stateCode = getStateCodeFromZip(cleanZip);
  if (!stateCode) return null;

  // Reads configured rates directly from Admin Dashboard / LocalStorage
  const rates = getUsStateTaxRates();
  const stateInfo = rates[stateCode] || {
    code: stateCode,
    name: stateCode,
    rate: 0.07,
    standardShippingRate: 15,
    expressShippingRate: 25
  };

  const subtotal = Math.round(unitPrice * quantity * 100) / 100;
  const taxResult = calculateStateTax(stateCode, [{ price: unitPrice, quantity }], subtotal);
  const estimatedTax = taxResult ? taxResult.taxAmount : 0;
  const taxRateFormatted = taxResult ? taxResult.rateFormatted : `${(stateInfo.rate * 100).toFixed(stateInfo.rate % 0.01 === 0 ? 1 : 2)}%`;

  const isOffshore = ['AK', 'HI', 'PR'].includes(stateCode);

  // Standard shipping fee strictly following Dashboard configuration:
  // If product shippingCharge is explicitly configured as 0 (Free Shipping in Dashboard), rate is 0.
  // Otherwise uses the Dashboard's configured standardShippingRate for the destination state.
  let standardShippingFee: number;
  if (productShippingCharge !== undefined && Number(productShippingCharge) === 0) {
    standardShippingFee = 0;
  } else if (productShippingCharge !== undefined && Number(productShippingCharge) > 0 && !isOffshore) {
    standardShippingFee = Number(productShippingCharge);
  } else if (stateInfo.standardShippingRate !== undefined) {
    standardShippingFee = Number(stateInfo.standardShippingRate);
  } else {
    standardShippingFee = isOffshore ? 35 : 15;
  }

  // Express shipping fee strictly from Dashboard state configuration:
  const expressShippingFee = stateInfo.expressShippingRate !== undefined
    ? Number(stateInfo.expressShippingRate)
    : (isOffshore ? 65 : 25);

  // Compute realistic delivery dates skipping Sunday if needed
  const stdDate = new Date();
  stdDate.setDate(stdDate.getDate() + (isOffshore ? 5 : 3));
  if (stdDate.getDay() === 0) stdDate.setDate(stdDate.getDate() + 1);

  const expDate = new Date();
  expDate.setDate(expDate.getDate() + (isOffshore ? 2 : 1));
  if (expDate.getDay() === 0) expDate.setDate(expDate.getDate() + 1);

  const formatDate = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return {
    zip: cleanZip,
    stateCode,
    stateName: stateInfo.name,
    taxRate: stateInfo.rate,
    taxRateFormatted,
    estimatedTax,
    isTaxExempt: estimatedTax === 0,
    notes: taxResult?.notes || stateInfo.notes,
    standardShippingFee,
    expressShippingFee,
    standardShippingCarrier: isOffshore ? 'FedEx 2Day Priority' : 'UPS Insured Ground',
    expressShippingCarrier: isOffshore ? 'FedEx Priority Overnight' : 'FedEx Priority Air',
    standardDeliveryDate: formatDate(stdDate),
    expressDeliveryDate: formatDate(expDate),
    subtotal,
    totalWithStandard: Math.round((subtotal + standardShippingFee + estimatedTax) * 100) / 100,
    totalWithExpress: Math.round((subtotal + expressShippingFee + estimatedTax) * 100) / 100
  };
}

/**
 * Calculates estimated sales tax from a 5-digit ZIP code
 */
export function estimateTaxByZip(zip: string, productPrice: number): {
  stateCode: string;
  stateName: string;
  taxRate: number;
  taxRateFormatted: string;
  estimatedTax: number;
  totalWithTax: number;
  notes?: string;
} | null {
  const stateCode = getStateCodeFromZip(zip);
  if (!stateCode) return null;

  const result = calculateStateTax(stateCode, [{ price: productPrice, quantity: 1 }], productPrice);
  if (!result) return null;

  return {
    stateCode: result.stateCode,
    stateName: result.stateName,
    taxRate: result.rate,
    taxRateFormatted: result.rateFormatted,
    estimatedTax: result.taxAmount,
    totalWithTax: Math.round((productPrice + result.taxAmount) * 100) / 100,
    notes: result.notes
  };
}
