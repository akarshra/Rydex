import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICarbonFootprint extends Document {
  user: Types.ObjectId;
  booking: Types.ObjectId;
  distanceTraveled: number; // in km
  estimatedCO2Saved: number; // in kg
  vehicleType: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICarbonStats extends Document {
  user: Types.ObjectId;
  totalDistanceTraveled: number;
  totalCO2Saved: number;
  totalRidesCompleted: number;
  level: "seedling" | "sapling" | "tree" | "forest"; // environmental impact levels
  createdAt: Date;
  updatedAt: Date;
}

const CarbonFootprintSchema = new Schema<ICarbonFootprint>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    booking: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    distanceTraveled: { type: Number, required: true, min: 0 },
    estimatedCO2Saved: { type: Number, required: true, min: 0 },
    vehicleType: String,
  },
  { timestamps: true }
);

CarbonFootprintSchema.index({ user: 1 });

const CarbonStatsSchema = new Schema<ICarbonStats>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    totalDistanceTraveled: { type: Number, default: 0, min: 0 },
    totalCO2Saved: { type: Number, default: 0, min: 0 },
    totalRidesCompleted: { type: Number, default: 0, min: 0 },
    level: {
      type: String,
      enum: ["seedling", "sapling", "tree", "forest"],
      default: "seedling",
    },
  },
  { timestamps: true }
);

const CarbonFootprint =
  mongoose.models.CarbonFootprint ||
  mongoose.model<ICarbonFootprint>("CarbonFootprint", CarbonFootprintSchema);

const CarbonStats =
  mongoose.models.CarbonStats ||
  mongoose.model<ICarbonStats>("CarbonStats", CarbonStatsSchema);

export { CarbonStats };
export default CarbonFootprint;
