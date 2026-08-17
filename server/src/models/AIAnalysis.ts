import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAIAnalysis extends Document {
  applicationId?: Types.ObjectId;
  userId: Types.ObjectId;
  type: 'INTERVIEW_PROBABILITY' | 'COMPANY_HEALTH' | 'SALARY_NEGOTIATION' | 'EMAIL_DRAFT' | 'JOB_MATCH';
  score?: number;
  result?: string;
  factors?: string[];
  recommendations?: string[];
  payload?: any;
  createdAt: Date;
  updatedAt: Date;
}

const AIAnalysisSchema = new Schema<IAIAnalysis>(
  {
    applicationId: { type: Schema.Types.ObjectId, ref: 'Application' },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['INTERVIEW_PROBABILITY', 'COMPANY_HEALTH', 'SALARY_NEGOTIATION', 'EMAIL_DRAFT', 'JOB_MATCH'],
      required: true
    },
    score: { type: Number },
    result: { type: String },
    factors: [{ type: String }],
    recommendations: [{ type: String }],
    payload: { type: Schema.Types.Mixed }
  },
  { timestamps: true }
);

export default mongoose.model<IAIAnalysis>('AIAnalysis', AIAnalysisSchema);
