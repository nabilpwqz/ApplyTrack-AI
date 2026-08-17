import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IInterview extends Document {
  applicationId: Types.ObjectId;
  userId: Types.ObjectId;
  type: 'HR_SCREEN' | 'TECHNICAL' | 'SYSTEM_DESIGN' | 'BEHAVIORAL' | 'MANAGEMENT' | 'FINAL';
  scheduledAt: Date;
  duration: number;
  interviewer?: string;
  meetingUrl?: string;
  location?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InterviewSchema = new Schema<IInterview>(
  {
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
  },
  { timestamps: true }
);

export default mongoose.model<IInterview>('Interview', InterviewSchema);
