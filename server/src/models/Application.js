import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    jobTitle: {
      type: String,
      required: true,
      trim: true,
    },
    jobUrl: {
      type: String,
      trim: true,
      default: '',
    },
    source: {
      type: String,
      trim: true,
      default: 'LinkedIn', // e.g. LinkedIn, Indeed, Company Site, Referral
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    workMode: {
      type: String,
      enum: ['REMOTE', 'HYBRID', 'ON_SITE', 'UNKNOWN'],
      default: 'UNKNOWN',
    },
    employmentType: {
      type: String,
      enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'OTHER'],
      default: 'FULL_TIME',
    },
    salary: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
      currency: { type: String, default: 'USD' },
    },
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
        'GHOSTED',
      ],
      default: 'APPLIED',
      index: true,
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'MEDIUM',
    },
    applicationDate: {
      type: Date,
      default: Date.now,
    },
    deadline: {
      type: Date,
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
    nextFollowUpAt: {
      type: Date,
    },
    resumeUsed: {
      type: String,
      default: '',
    },
    coverLetterUsed: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    tags: [{ type: String }],
    contacts: [
      {
        name: { type: String, required: true },
        role: { type: String, default: '' }, // e.g. Recruiter, Hiring Manager
        email: { type: String, default: '' },
        phone: { type: String, default: '' },
        linkedin: { type: String, default: '' },
      },
    ],
    timeline: [
      {
        type: {
          type: String,
          enum: [
            'NOTE',
            'STATUS_CHANGE',
            'INTERVIEW_SCHEDULED',
            'EMAIL_RECEIVED',
            'EMAIL_SENT',
            'REMINDER_DUE',
            'CREATION',
          ],
          default: 'NOTE',
        },
        title: { type: String, required: true },
        description: { type: String, default: '' },
        occurredAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Auto-update lastActivityAt on change
applicationSchema.pre('save', function (next) {
  this.lastActivityAt = new Date();
  next();
});

const Application = mongoose.model('Application', applicationSchema);
export default Application;
