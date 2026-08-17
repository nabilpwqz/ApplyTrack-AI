import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    profile: {
      headline: { type: String, default: '' },
      location: { type: String, default: '' },
      experienceLevel: {
        type: String,
        enum: ['ENTRY_LEVEL', 'JUNIOR', 'MID_LEVEL', 'SENIOR', 'LEAD', 'OTHER'],
        default: 'JUNIOR',
      },
      skills: [{ type: String }],
      preferredRoles: [{ type: String }],
      preferredLocations: [{ type: String }],
      preferredSalary: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 0 },
        currency: { type: String, default: 'USD' },
      },
    },
    preferences: {
      emailNotifications: { type: Boolean, default: true },
      reminderNotifications: { type: Boolean, default: true },
      timezone: { type: String, default: 'UTC' },
    },
  },
  {
    timestamps: true,
  }
);

// Method to verify password
userSchema.methods.comparePassword = async function (enteredPassword) {
  // We will import bcrypt dynamically to keep model lean or use normal comparison inside controller
  // But doing a helper is cleaner
  return enteredPassword === this.passwordHash; // Handled via bcrypt in auth controller
};

const User = mongoose.model('User', userSchema);
export default User;
