import mongoose, { Schema, Document } from 'mongoose';

export interface IGroupSession extends Document {
  creatorId: mongoose.Types.ObjectId;
  joinCode: string;
  status: 'Waiting' | 'Active' | 'Ended';
  participants: {
    userId: mongoose.Types.ObjectId;
    status: 'Active' | 'FellBehind' | 'Emergency' | 'Fuel';
    lastLocation?: {
      type: 'Point';
      coordinates: number[]; // [lng, lat]
    };
    lastUpdated: Date;
  }[];
  config: {
    distanceAlertRadiusM: number;
  };
}

const GroupSessionSchema: Schema = new Schema(
  {
    creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    joinCode: { type: String, required: true, unique: true },
    status: { type: String, enum: ['Waiting', 'Active', 'Ended'], default: 'Waiting' },
    participants: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, enum: ['Active', 'FellBehind', 'Emergency', 'Fuel'], default: 'Active' },
        lastLocation: {
          type: { type: String, enum: ['Point'], default: 'Point' },
          coordinates: { type: [Number], default: [0, 0] },
        },
        lastUpdated: { type: Date, default: Date.now },
      },
    ],
    config: {
      distanceAlertRadiusM: { type: Number, default: 1000 },
    },
  },
  { timestamps: true }
);

export default mongoose.model<IGroupSession>('GroupSession', GroupSessionSchema);
