import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  auth: {
    provider: 'local' | 'google' | 'apple';
    passwordHash?: string;
  };
  profile: {
    fullName?: string;
    avatarUrl?: string;
    bio?: string;
    motorcycle?: string;
    skillLevel: 'Beginner' | 'Explorer' | 'Veteran';
    achievements: string[];
  };
  stats: {
    totalKm: number;
    longestRideKm: number;
    highestAltitude: number;
  };
  settings: {
    privacy: 'Public' | 'Friends' | 'Private';
    safetyAlerts: boolean;
  };
}

const UserSchema: Schema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    auth: {
      provider: { type: String, enum: ['local', 'google', 'apple'], default: 'local' },
      passwordHash: { type: String },
    },
    profile: {
      fullName: { type: String },
      avatarUrl: { type: String },
      bio: { type: String },
      motorcycle: { type: String },
      skillLevel: { type: String, enum: ['Beginner', 'Explorer', 'Veteran'], default: 'Beginner' },
      achievements: [{ type: String }],
    },
    stats: {
      totalKm: { type: Number, default: 0 },
      longestRideKm: { type: Number, default: 0 },
      highestAltitude: { type: Number, default: 0 },
    },
    settings: {
      privacy: { type: String, enum: ['Public', 'Friends', 'Private'], default: 'Public' },
      safetyAlerts: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
