import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['PHONE_SCREEN', 'VIDEO', 'TECHNICAL', 'BEHAVIORAL', 'HR', 'PANEL', 'FINAL'],
      required: true,
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number, // duration in minutes
      default: 30,
    },
    interviewer: {
      type: String,
      default: '',
    },
    meetingUrl: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '', // e.g. Zoom, Google Meet, or address
    },
    notes: {
      type: String,
      default: '',
    },
    result: {
      type: String,
      enum: ['PENDING', 'PASSED', 'FAILED', 'CANCELLED'],
      default: 'PENDING',
    },
    feedback: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Interview = mongoose.model('Interview', interviewSchema);
export default Interview;
