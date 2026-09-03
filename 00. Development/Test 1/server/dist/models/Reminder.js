import mongoose, { Schema } from 'mongoose';
const ReminderSchema = new Schema({
    applicationId: { type: Schema.Types.ObjectId, ref: 'Application', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    dueAt: { type: Date, required: true },
    completed: { type: Boolean, default: false },
    type: {
        type: String,
        enum: ['FOLLOW_UP', 'INTERVIEW_PREP', 'THANK_YOU_EMAIL', 'OFFER_DEADLINE'],
        default: 'FOLLOW_UP'
    }
}, { timestamps: true });
export default mongoose.model('Reminder', ReminderSchema);
