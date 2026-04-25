import mongoose, { Schema, Document, Types } from "mongoose";

export type LoyaltyTier = "bronze" | "silver" | "gold" | "platinum";

export interface ILoyaltyReward extends Document {
  user: Types.ObjectId;
  tier: LoyaltyTier;
  totalPoints: number;
  usedPoints: number;
  availablePoints: number;
  totalRidesCompleted: number;
  totalSpent: number;
  tierBenefits: {
    cashbackPercentage: number;
    prioritySupport: boolean;
    freeRidesPerMonth: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const LoyaltyRewardSchema = new Schema<ILoyaltyReward>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    tier: {
      type: String,
      enum: ["bronze", "silver", "gold", "platinum"],
      default: "bronze",
    },
    totalPoints: { type: Number, default: 0, min: 0 },
    usedPoints: { type: Number, default: 0, min: 0 },
    availablePoints: { type: Number, default: 0, min: 0 },
    totalRidesCompleted: { type: Number, default: 0, min: 0 },
    totalSpent: { type: Number, default: 0, min: 0 },
    tierBenefits: {
      cashbackPercentage: { type: Number, default: 1, min: 0, max: 100 },
      prioritySupport: { type: Boolean, default: false },
      freeRidesPerMonth: { type: Number, default: 0, min: 0 },
    },
  },
  { timestamps: true }
);

const LoyaltyReward =
  mongoose.models.LoyaltyReward ||
  mongoose.model<ILoyaltyReward>("LoyaltyReward", LoyaltyRewardSchema);
export default LoyaltyReward;
