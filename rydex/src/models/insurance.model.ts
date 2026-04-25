import mongoose, { Schema, Document, Types } from "mongoose";

export interface IInsurance extends Document {
  booking: Types.ObjectId;
  user: Types.ObjectId;
  insuranceType: "basic" | "premium" | "comprehensive";
  coverageAmount: number;
  premium: number;
  status: "active" | "claimed" | "expired";
  coverageDetails: {
    accidentCoverage: number;
    damageCoverage: number;
    medicalCoverage: number;
    theftCoverage: number;
  };
  claims?: {
    claimId: string;
    amount: number;
    status: "pending" | "approved" | "rejected";
    description: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const InsuranceSchema = new Schema<IInsurance>(
  {
    booking: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    insuranceType: {
      type: String,
      enum: ["basic", "premium", "comprehensive"],
      required: true,
    },
    coverageAmount: { type: Number, required: true },
    premium: { type: Number, required: true },
    status: {
      type: String,
      enum: ["active", "claimed", "expired"],
      default: "active",
    },
    coverageDetails: {
      accidentCoverage: { type: Number, default: 0 },
      damageCoverage: { type: Number, default: 0 },
      medicalCoverage: { type: Number, default: 0 },
      theftCoverage: { type: Number, default: 0 },
    },
    claims: [
      {
        claimId: String,
        amount: Number,
        status: {
          type: String,
          enum: ["pending", "approved", "rejected"],
          default: "pending",
        },
        description: String,
      },
    ],
  },
  { timestamps: true }
);

const Insurance =
  mongoose.models.Insurance ||
  mongoose.model<IInsurance>("Insurance", InsuranceSchema);
export default Insurance;
