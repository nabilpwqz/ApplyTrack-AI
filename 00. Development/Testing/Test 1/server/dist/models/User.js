import mongoose, { Schema } from 'mongoose';
const UserSchema = new Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    profile: {
        headline: { type: String, default: '' },
        location: { type: String, default: '' },
        experienceLevel: { type: String, enum: ['JUNIOR', 'MID', 'SENIOR', 'LEAD'], default: 'JUNIOR' },
        skills: [{ type: String }],
        preferredRoles: [{ type: String }],
        preferredSalary: {
            min: { type: Number },
            max: { type: Number },
            currency: { type: String, default: 'USD' }
        }
    },
    preferences: {
        emailNotifications: { type: Boolean, default: true },
        inactivityAlerts: { type: Boolean, default: true },
        autoEmailSync: { type: Boolean, default: true }
    }
}, { timestamps: true });
export default mongoose.model('User', UserSchema);
