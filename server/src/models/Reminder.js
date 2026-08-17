import mongoose from 'mongoose';

const reminderSchema = new mongoose.Schema(
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
      enum: ['FOLLOW_UP', 'PREPARE_INTERVIEW', 'SUBMIT_ASSESSMENT', 'SEND_THANK_YOU', 'CHECK_STATUS', 'OTHER'],
      default: 'FOLLOW_UP',
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    dueAt: {
      type: Date,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    notificationSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Reminder = mongoose.model('Reminder', reminderSchema);
export default Reminder;
