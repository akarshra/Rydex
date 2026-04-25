import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPaymentMethod extends Document {
  user: Types.ObjectId;
  type: "card" | "upi" | "wallet" | "netbanking" | "cash";
  isDefault: boolean;
  status: "active" | "expired" | "deleted";
  cardDetails?: {
    lastFourDigits: string;
    cardBrand: string; // Visa, Mastercard, etc.
    expiryMonth: number;
    expiryYear: number;
    cardholderName: string;
  };
  upiDetails?: {
    upiId: string;
  };
  walletDetails?: {
    walletBalance: number;
    walletProvider: string; // PayTM, Google Pay, etc.
  };
  bankDetails?: {
    bankName: string;
    accountLastFourDigits: string;
  };
  stripePaymentMethodId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentMethodSchema = new Schema<IPaymentMethod>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: ["card", "upi", "wallet", "netbanking", "cash"],
      required: true,
    },
    isDefault: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["active", "expired", "deleted"],
      default: "active",
    },
    cardDetails: {
      lastFourDigits: String,
      cardBrand: String,
      expiryMonth: Number,
      expiryYear: Number,
      cardholderName: String,
    },
    upiDetails: {
      upiId: String,
    },
    walletDetails: {
      walletBalance: { type: Number, default: 0 },
      walletProvider: String,
    },
    bankDetails: {
      bankName: String,
      accountLastFourDigits: String,
    },
    stripePaymentMethodId: String,
  },
  { timestamps: true }
);

PaymentMethodSchema.index({ user: 1, isDefault: 1 });

const PaymentMethod =
  mongoose.models.PaymentMethod ||
  mongoose.model<IPaymentMethod>("PaymentMethod", PaymentMethodSchema);
export default PaymentMethod;
