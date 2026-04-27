import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPromoCode extends Document {
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minRideAmount?: number;
  maxDiscount?: number;
  validFrom: Date;
  validUntil: Date;
  maxUsageLimit?: number;
  usageCount: number;
  usedBy: Types.ObjectId[];
  status: "active" | "inactive" | "expired";
  applicableVehicleTypes: string[];
  createdBy: Types.ObjectId; // admin
  createdAt: Date;
  updatedAt: Date;
}

const PromoCodeSchema = new Schema<IPromoCode>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: String,
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discountValue: { type: Number, required: true, min: 0 },
    minRideAmount: { type: Number, min: 0 },
    maxDiscount: { type: Number, min: 0 },
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    maxUsageLimit: { type: Number, min: 1 },
    usageCount: { type: Number, default: 0, min: 0 },
    usedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    status: {
      type: String,
      enum: ["active", "inactive", "expired"],
      default: "active",
      index: true,
    },
    applicableVehicleTypes: [String],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

PromoCodeSchema.index({ code: 1 });
PromoCodeSchema.index({ validUntil: 1 });

const PromoCode =
  mongoose.models.PromoCode ||
  mongoose.model<IPromoCode>("PromoCode", PromoCodeSchema);
export default PromoCode;
