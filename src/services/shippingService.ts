import { getUsStateTaxRates } from './taxEngine';

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

export function getShippingMethodsForState(stateCode?: string): ShippingMethodOption[] {
  const normState = (stateCode || '').trim().toUpperCase();
  const rates = getUsStateTaxRates();
  const stateInfo = rates[normState];

  const standardRate = stateInfo?.standardShippingRate !== undefined ? stateInfo.standardShippingRate : 15;
  const expressRate = stateInfo?.expressShippingRate !== undefined ? stateInfo.expressShippingRate : 25;

  // Offshore delivery surcharge
  if (normState === 'AK' || normState === 'HI' || normState === 'PR') {
    return [
      {
        id: 'standard',
        name: 'Offshore Priority Insured Delivery',
        carrier: 'FedEx 2Day / UPS Air',
        speed: '3–4 Business Days',
        cost: standardRate,
        description: 'Fully insured express air courier delivery to Alaska, Hawaii, or Puerto Rico.',
        iconType: 'express'
      },
      {
        id: 'express',
        name: 'Offshore Priority Overnight Express',
        carrier: 'FedEx Priority Overnight',
        speed: '1–2 Business Days',
        cost: expressRate,
        description: 'Priority overnight dispatch with real-time satellite tracking.',
        iconType: 'overnight'
      }
    ];
  }

  return [
    {
      id: 'standard',
      name: 'Insured Standard / Ground',
      carrier: 'UPS Ground / FedEx Home Delivery',
      speed: '3–5 Business Days',
      cost: standardRate,
      description: 'Signature garment packaging in breathable atelier travel suit covers with delivery confirmation.',
      iconType: 'standard'
    },
    {
      id: 'express',
      name: 'Atelier Express Air',
      carrier: 'FedEx Priority / UPS 2nd Day Air',
      speed: '2–3 Business Days',
      cost: expressRate,
      description: 'Expedited air courier dispatch with priority atelier preparation schedule.',
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
}

export const LUXURY_SHIPPING_METHODS = getShippingMethodsForState();
