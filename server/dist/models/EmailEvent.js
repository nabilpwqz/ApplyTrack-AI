import mongoose, { Schema } from 'mongoose';
const EmailEventSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    provider: { type: String, enum: ['GMAIL', 'SIMULATION', 'IMAP'], default: 'SIMULATION' },
    externalId: { type: String },
    sender: { type: String, required: true },
    subject: { type: String, required: true },
    bodyPreview: { type: String, required: true },
    receivedAt: { type: Date, default: Date.now },
    extractedData: {
        company: { type: String },
        jobTitle: { type: String },
        applicationStatus: { type: String },
        interviewDate: { type: Date },
        recruiterEmail: { type: String }
    },
    confidence: { type: Number, default: 0.9 },
    processed: { type: Boolean, default: false },
    applicationId: { type: Schema.Types.ObjectId, ref: 'Application' }
}, { timestamps: true });
export default mongoose.model('EmailEvent', EmailEventSchema);
