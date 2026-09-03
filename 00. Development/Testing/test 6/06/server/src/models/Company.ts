import mongoose, { Schema, Document } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  domain?: string;
  website?: string;
  industry?: string;
  size?: string;
  healthScore?: number;
  layoffRisk?: number;
  description?: string;
  factors?: string[];
  lastAnalyzedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    domain: { type: String, trim: true },
    website: { type: String },
    industry: { type: String, default: 'Technology' },
    size: { type: String, default: '100-500' },
    healthScore: { type: Number, default: 75, min: 0, max: 100 },
    layoffRisk: { type: Number, default: 15, min: 0, max: 100 },
    description: { type: String, default: '' },
    factors: [{ type: String }],
    lastAnalyzedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model<ICompany>('Company', CompanySchema);
