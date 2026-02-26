import mongoose, { Document, Schema } from 'mongoose';

// ========= User Schema =========
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'editor';
  access: {
    canApprove: boolean;
    canAddBlog: boolean;
  };
  createdAt: Date;
  status: { type: String, enum: ['active', 'inactive'] }
}

export const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'editor'], default: 'editor' },
  access: {
    canApprove: { type: Boolean, default: false },
    canAddBlog: { type: Boolean, default: true },
  },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, default: 'active' }
});

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);