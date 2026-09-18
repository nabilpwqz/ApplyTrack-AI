import mongoose, { Schema } from 'mongoose';
const CompanySchema = new Schema({
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
}, { timestamps: true });
export default mongoose.model('Company', CompanySchema);
