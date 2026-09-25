export interface ShippingMethod {
  id:string;
  name:string;
  description:string;
  price:number;
  estimatedDelivery:string;
  enabled:boolean;
  freeShippingThreshold?:number;
}

export const SHIPPING_METHODS: ShippingMethod[] = [
  { id:'standard', name:'Complimentary Standard / Ground', description:'Insured ground delivery', price:0, estimatedDelivery:'5–8 business days', enabled:true },
  { id:'express', name:'Atelier Express Air', description:'Priority insured air delivery', price:25, estimatedDelivery:'2–3 business days', enabled:true },
  { id:'overnight', name:'White-Glove VIP Courier / Overnight', description:'Priority white-glove delivery', price:65, estimatedDelivery:'1 business day', enabled:true }
];

export const shippingService = {
  getOptions() { return SHIPPING_METHODS.filter(m => m.enabled); },
  calculate(methodId: string, subtotal: number, _state?: string) {
    const normalized = (methodId || 'standard').toLowerCase().trim();
    const method = SHIPPING_METHODS.find(m => 
      m.id.toLowerCase() === normalized || 
      m.name.toLowerCase().includes(normalized) ||
      normalized.includes(m.id.toLowerCase()) ||
      (normalized.includes('white') && m.id === 'overnight') ||
      (normalized.includes('express') && m.id === 'express') ||
      (normalized.includes('standard') && m.id === 'standard')
    ) || SHIPPING_METHODS[0];

    const amount = method.freeShippingThreshold !== undefined && subtotal >= method.freeShippingThreshold ? 0 : method.price;
    return { ...method, amount };
  }
};
