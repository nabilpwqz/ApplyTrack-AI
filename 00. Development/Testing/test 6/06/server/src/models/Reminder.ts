import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IReminder extends Document {
  applicationId: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  description?: string;
  dueAt: Date;
  completed: boolean;
  type: 'FOLLOW_UP' | 'INTERVIEW_PREP' | 'THANK_YOU_EMAIL' | 'OFFER_DEADLINE';
  createdAt: Date;
  updatedAt: Date;
}

const ReminderSchema = new Schema<IReminder>(
  {
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
  },
  { timestamps: true }
);

export default mongoose.model<IReminder>('Reminder', ReminderSchema);
