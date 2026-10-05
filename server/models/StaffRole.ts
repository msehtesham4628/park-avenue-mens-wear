import mongoose, { Schema, Document } from 'mongoose';

export interface IStaffRole extends Document {
  roleKey: string;
  name: string;
  description?: string;
  department?: string;
  staffTitle?: string;
  baseRole: 'staff' | 'admin';
  permissions: string[];
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStaffPermission extends Document {
  permissionId: string;
  name: string;
  category: string;
  description?: string;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StaffRoleSchema = new Schema<IStaffRole>({
  roleKey: { type: String, required: true, unique: true, trim: true, index: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  department: { type: String, default: 'Tailoring & Alterations' },
  staffTitle: { type: String, default: 'Staff Artisan' },
  baseRole: { type: String, enum: ['staff', 'admin'], default: 'staff' },
  permissions: { type: [String], default: [] },
  isSystem: { type: Boolean, default: false }
}, {
  timestamps: true
});

const StaffPermissionSchema = new Schema<IStaffPermission>({
  permissionId: { type: String, required: true, unique: true, trim: true, index: true },
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  isSystem: { type: Boolean, default: false }
}, {
  timestamps: true
});

export const StaffRoleModel = mongoose.models.StaffRole || mongoose.model<IStaffRole>('StaffRole', StaffRoleSchema);
export const StaffPermissionModel = mongoose.models.StaffPermission || mongoose.model<IStaffPermission>('StaffPermission', StaffPermissionSchema);
