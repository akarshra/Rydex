import mongoose, { Schema, Document, Types } from "mongoose";

export interface IRideSurge extends Document {
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  vehicleType: string;
  surgeFactor: number; // 1.0 = no surge, 2.0 = 2x price
  demandLevel: "low" | "medium" | "high" | "critical";
  availableVehicles: number;
  pendingRequests: number;
  activeSince: Date;
  estimatedUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RideSurgeSchema = new Schema<IRideSurge>(
  {
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    vehicleType: { type: String, required: true },
    surgeFactor: { type: Number, default: 1.0, min: 1.0 },
    demandLevel: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "low",
    },
    availableVehicles: { type: Number, default: 0 },
    pendingRequests: { type: Number, default: 0 },
    activeSince: { type: Date, default: Date.now },
    estimatedUntil: Date,
  },
  { timestamps: true }
);

RideSurgeSchema.index({ location: "2dsphere" });
RideSurgeSchema.index({ vehicleType: 1 });

const RideSurge =
  mongoose.models.RideSurge ||
  mongoose.model<IRideSurge>("RideSurge", RideSurgeSchema);
export default RideSurge;
