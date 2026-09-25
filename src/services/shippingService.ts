export interface ShippingMethodOption {
  id: string;
  name: string;
  carrier: string;
  speed: string;
  cost: number;
  description: string;
  freeThreshold?: number;
  iconType: 'standard' | 'express' | 'overnight' | 'international';
}

export const LUXURY_SHIPPING_METHODS: ShippingMethodOption[] = [
  {
    id: 'standard',
    name: 'Complimentary Standard / Ground',
    carrier: 'UPS Ground / FedEx Home',
    speed: '3–5 Business Days',
    cost: 0,
    freeThreshold: 0, // Complimentary on all orders
    description: 'Signature garment packaging in breathable atelier travel suit covers.',
    iconType: 'standard'
  },
  {
    id: 'express',
    name: 'Atelier Express Air',
    carrier: 'FedEx Priority / UPS 2nd Day Air',
    speed: '2–3 Business Days',
    cost: 25,
    description: 'Expedited air courier dispatch with priority tailoring schedule.',
    iconType: 'express'
  },
  {
    id: 'overnight',
    name: 'White-Glove VIP Courier / Overnight',
    carrier: 'Atelier Private White-Glove Courier',
    speed: 'Next Business Morning (Pre-10:30 AM)',
    cost: 65,
    description: 'Direct door-to-door hand delivery on cedar hangers with personal sartorial attendant.',
    iconType: 'overnight'
  }
];

export function getShippingMethodsForState(stateCode?: string): ShippingMethodOption[] {
  const normState = (stateCode || '').trim().toUpperCase();
  // For Alaska, Hawaii or Puerto Rico, air freight surcharge applies
  if (normState === 'AK' || normState === 'HI' || normState === 'PR') {
    return [
      {
        id: 'island_express',
        name: 'Offshore Priority Air Courier',
        carrier: 'FedEx 2Day / UPS Air',
        speed: '3–4 Business Days',
        cost: 35,
        description: 'Insured air courier dispatch to Alaska, Hawaii, or Puerto Rico.',
        iconType: 'express'
      },
      {
        id: 'island_overnight',
        name: 'Offshore Priority Overnight',
        carrier: 'FedEx Priority Overnight',
        speed: '1–2 Business Days',
        cost: 75,
        description: 'Express priority air with live satellite tracking.',
        iconType: 'overnight'
      }
    ];
  }

  return LUXURY_SHIPPING_METHODS;
}
