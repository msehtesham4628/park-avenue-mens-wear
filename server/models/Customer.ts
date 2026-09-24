import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomerAddress {
  id: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export type CustomerRole = 'customer' | 'admin' | 'staff';
export type CustomerAccountStatus = 'active' | 'suspended' | 'inactive';

export interface ICustomer extends Document {
  customerId: string;
  firstName: string;
  lastName: string;
  name: string;
  username?: string;
  email: string;
  phone: string;
  passwordHash?: string;
  role: CustomerRole;
  status: CustomerAccountStatus;
  addresses: ICustomerAddress[];
  suitSizePreference?: string;
  shirtSizePreference?: string;
  inseamPreference?: string;
  notes?: string;
  vipTier?: 'Member' | 'Bespoke Patron' | 'Private Atelier Club';
  createdAt: Date;
  updatedAt: Date;
}

const CustomerAddressSchema = new Schema<ICustomerAddress>({
  id: { type: String, required: true },
  street: { type: String, required: true },
  apartment: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true, default: 'United States' },
  isDefault: { type: Boolean, default: false }
}, { _id: false });

const CustomerSchema = new Schema<ICustomer>({
  customerId: { type: String, required: true, unique: true, index: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  name: { type: String, required: true, index: true },
  username: { type: String, lowercase: true, trim: true, sparse: true, index: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  phone: { type: String, required: false, default: '', trim: true, index: true },
  passwordHash: { type: String },
  role: { 
    type: String, 
    enum: ['customer', 'admin', 'staff'], 
    default: 'customer',
    index: true 
  },
  status: { 
    type: String, 
    enum: ['active', 'suspended', 'inactive'], 
    default: 'active',
    index: true 
  },
  addresses: [CustomerAddressSchema],
  suitSizePreference: { type: String },
  shirtSizePreference: { type: String },
  inseamPreference: { type: String },
  notes: { type: String },
  vipTier: { 
    type: String, 
    enum: ['Member', 'Bespoke Patron', 'Private Atelier Club'],
    default: 'Member' 
  }
}, {
  timestamps: true
});

CustomerSchema.index({ email: 1, phone: 1 });

export const CustomerModel = mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema);
