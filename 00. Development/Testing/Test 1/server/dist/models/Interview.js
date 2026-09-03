import mongoose, { Schema } from 'mongoose';
const InterviewSchema = new Schema({
    applicationId: { type: Schema.Types.ObjectId, ref: 'Application', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
        type: String,
        enum: ['HR_SCREEN', 'TECHNICAL', 'SYSTEM_DESIGN', 'BEHAVIORAL', 'MANAGEMENT', 'FINAL'],
        default: 'TECHNICAL'
    },
    scheduledAt: { type: Date, required: true },
    duration: { type: Number, default: 45 },
    interviewer: { type: String },
    meetingUrl: { type: String },
    location: { type: String, default: 'Google Meet' },
    notes: { type: String }
}, { timestamps: true });
export default mongoose.model('Interview', InterviewSchema);
