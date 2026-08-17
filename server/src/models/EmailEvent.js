import mongoose from 'mongoose';

const emailEventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    provider: {
      type: String,
      enum: ['GMAIL', 'SIMULATION'],
      default: 'SIMULATION',
    },
    messageId: {
      type: String,
      required: true,
      unique: true,
    },
    sender: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    bodyPreview: {
      type: String,
      default: '',
    },
    receivedAt: {
      type: Date,
      default: Date.now,
    },
    extractedData: {
      company: { type: String, default: '' },
      jobTitle: { type: String, default: '' },
      applicationStatus: {
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
          'UNKNOWN',
        ],
        default: 'UNKNOWN',
      },
      interviewDate: { type: Date },
      deadline: { type: Date },
      recruiterName: { type: String, default: '' },
      recruiterEmail: { type: String, default: '' },
    },
    confidence: {
      type: Number,
      default: 1.0,
    },
    processed: {
      type: Boolean,
      default: false,
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const EmailEvent = mongoose.model('EmailEvent', emailEventSchema);
export default EmailEvent;
