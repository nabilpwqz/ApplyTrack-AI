import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    domain: { type: String, trim: true },
    website: { type: String, trim: true },
    logo: { type: String, default: '' },
    industry: { type: String, default: '' },
    headquarters: { type: String, default: '' },
    size: { type: String, default: '' }, // e.g. "51-200 employees"
    foundedYear: { type: Number },
    description: { type: String, default: '' },
    healthScore: { type: Number, default: 50 }, // 0 to 100
    layoffRisk: { type: Number, default: 0 }, // 0 to 100
    salaryData: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
      average: { type: Number, default: 0 },
      currency: { type: String, default: 'USD' },
    },
    factors: [{ type: String }], // Factors supporting the score
    lastAnalyzedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

const Company = mongoose.model('Company', companySchema);
export default Company;
