import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IApplication extends Document {
  userId: Types.ObjectId;
  jobTitle: string;
  companyId?: Types.ObjectId;
  companyName?: string;
  status: 'SAVED' | 'APPLIED' | 'SCREENING' | 'ASSESSMENT' | 'INTERVIEW' | 'FINAL_INTERVIEW' | 'OFFER' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN' | 'GHOSTED';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  applicationDate: Date;
  lastActivityAt: Date;
  deadline?: Date;
  location?: string;
  workMode?: 'REMOTE' | 'HYBRID' | 'ON_SITE';
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  jobUrl?: string;
  source?: string;
  notes?: string;
  timeline: {
    type: string;
    title: string;
    description?: string;
    occurredAt: Date;
  }[];
  contacts: {
    name: string;
    role?: string;
    email?: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    jobTitle: { type: String, required: true, trim: true },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company' },
    companyName: { type: String, trim: true },
    status: {
      type: String,
      enum: [
        'SAVED',
        'APPLIED',
        'SCREENING',
        'ASSESSMENT',
        'INTERVIEW',
        'FINAL_INTERVIEW',
        'OFFER',
        'ACCEPTED',
        'REJECTED',
        'WITHDRAWN',
        'GHOSTED'
      ],
      default: 'APPLIED',
      required: true
    },
    priority: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW'], default: 'MEDIUM' },
    applicationDate: { type: Date, default: Date.now },
    lastActivityAt: { type: Date, default: Date.now },
    deadline: { type: Date },
    location: { type: String, default: 'Remote' },
    workMode: { type: String, enum: ['REMOTE', 'HYBRID', 'ON_SITE'], default: 'REMOTE' },
    salary: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: 'USD' }
    },
    jobUrl: { type: String },
    source: { type: String, default: 'Website' },
    notes: { type: String, default: '' },
    timeline: [
      {
        type: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String },
        occurredAt: { type: Date, default: Date.now }
      }
    ],
    contacts: [
      {
        name: { type: String, required: true },
        role: { type: String },
        email: { type: String }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model<IApplication>('Application', ApplicationSchema);
