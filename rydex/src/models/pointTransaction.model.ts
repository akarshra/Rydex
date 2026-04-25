import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPointTransaction extends Document {
  user: Types.ObjectId;
  points: number;
  transactionType: "earned" | "redeemed" | "expired" | "adjusted";
  description: string;
  relatedBooking?: Types.ObjectId;
  relatedPromoCode?: Types.ObjectId;
  balance: number; // balance after transaction
  createdAt: Date;
  updatedAt: Date;
}

const PointTransactionSchema = new Schema<IPointTransaction>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    points: { type: Number, required: true },
    transactionType: {
      type: String,
      enum: ["earned", "redeemed", "expired", "adjusted"],
      required: true,
    },
    description: { type: String, required: true },
    relatedBooking: { type: Schema.Types.ObjectId, ref: "Booking" },
    relatedPromoCode: { type: Schema.Types.ObjectId, ref: "PromoCode" },
    balance: { type: Number, required: true },
  },
  { timestamps: true }
);

PointTransactionSchema.index({ user: 1, createdAt: -1 });

const PointTransaction =
  mongoose.models.PointTransaction ||
  mongoose.model<IPointTransaction>("PointTransaction", PointTransactionSchema);
export default PointTransaction;
