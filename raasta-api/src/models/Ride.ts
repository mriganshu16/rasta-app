import mongoose, { Schema, Document } from 'mongoose';

export interface IRide extends Document {
  userId: mongoose.Types.ObjectId;
  sessionId?: mongoose.Types.ObjectId;
  status: 'Active' | 'Paused' | 'Completed';
  metrics: {
    distanceKm: number;
    durationMs: number;
    avgSpeedKmh: number;
    maxSpeedKmh: number;
    elevationGainM: number;
  };
  route: {
    type: 'LineString';
    coordinates: number[][]; // [lng, lat]
  };
  startTime: Date;
  endTime?: Date;
}

const RideSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sessionId: { type: Schema.Types.ObjectId, ref: 'GroupSession' },
    status: { type: String, enum: ['Active', 'Paused', 'Completed'], default: 'Active' },
    metrics: {
      distanceKm: { type: Number, default: 0 },
      durationMs: { type: Number, default: 0 },
      avgSpeedKmh: { type: Number, default: 0 },
      maxSpeedKmh: { type: Number, default: 0 },
      elevationGainM: { type: Number, default: 0 },
    },
    route: {
      type: { type: String, enum: ['LineString'], default: 'LineString' },
      coordinates: { type: [[Number]], default: [] }, // Array of [longitude, latitude]
    },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
  },
  { timestamps: true }
);

// GeoJSON index for geospatial queries
RideSchema.index({ route: '2dsphere' });

export default mongoose.model<IRide>('Ride', RideSchema);
