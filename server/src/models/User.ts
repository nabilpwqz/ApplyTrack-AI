import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  profile?: {
    headline?: string;
    location?: string;
    experienceLevel?: 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD';
    skills?: string[];
    preferredRoles?: string[];
    preferredSalary?: {
      min?: number;
      max?: number;
      currency?: string;
    };
  };
  preferences?: {
    emailNotifications?: boolean;
    inactivityAlerts?: boolean;
    autoEmailSync?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    profile: {
      headline: { type: String, default: '' },
      location: { type: String, default: '' },
      experienceLevel: { type: String, enum: ['JUNIOR', 'MID', 'SENIOR', 'LEAD'], default: 'JUNIOR' },
      skills: [{ type: String }],
      preferredRoles: [{ type: String }],
      preferredSalary: {
        min: { type: Number },
        max: { type: Number },
        currency: { type: String, default: 'USD' }
      }
    },
    preferences: {
      emailNotifications: { type: Boolean, default: true },
      inactivityAlerts: { type: Boolean, default: true },
      autoEmailSync: { type: Boolean, default: true }
    }
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
