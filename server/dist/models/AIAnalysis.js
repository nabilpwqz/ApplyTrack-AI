import mongoose, { Schema } from 'mongoose';
const AIAnalysisSchema = new Schema({
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
}, { timestamps: true });
export default mongoose.model('AIAnalysis', AIAnalysisSchema);
