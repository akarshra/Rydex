import mongoose, { Schema, Document, Types } from "mongoose";

export interface IReferral extends Document {
  referrer: Types.ObjectId;           // user who shared the code
  referee: Types.ObjectId;            // user who used the code
  referralCode: string;               // the code used
  status: "pending" | "completed" | "rewarded";
  referrerReward: number;             // points/cash given to referrer
  refereeReward: number;              // welcome bonus for referee
  bookingCompleted: boolean;          // whether referee completed first ride
  createdAt: Date;
  updatedAt: Date;
}

const ReferralSchema = new Schema<IReferral>(
  {
    referrer: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    referee: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    referralCode: { type: String, required: true, uppercase: true, trim: true },
    status: {
      type: String,
      enum: ["pending", "completed", "rewarded"],
      default: "pending",
      index: true,
    },
    referrerReward: { type: Number, default: 50 },   // ₹50 or 50 points
    refereeReward: { type: Number, default: 30 },    // ₹30 or 30 points welcome bonus
    bookingCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ReferralSchema.index({ referrer: 1, status: 1 });
ReferralSchema.index({ referralCode: 1 });

const Referral = mongoose.models.Referral || mongoose.model<IReferral>("Referral", ReferralSchema);
export default Referral;

