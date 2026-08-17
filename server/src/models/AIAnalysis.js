import mongoose from 'mongoose';

const aiAnalysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      index: true,
    },
    type: {
      type: String,
      enum: ['INTERVIEW_PROBABILITY', 'COMPANY_RISK', 'SALARY_ANALYSIS', 'FOLLOWUP_EMAIL', 'JOB_MATCH'],
      required: true,
    },
    score: {
      type: Number,
      default: 0,
    },
    result: {
      type: String,
      default: '',
    },
    factors: [{ type: String }],
    recommendations: [{ type: String }],
    model: {
      type: String,
      default: 'gemini-2.5-flash',
    },
  },
  {
    timestamps: true,
  }
);

const AIAnalysis = mongoose.model('AIAnalysis', aiAnalysisSchema);
export default AIAnalysis;
