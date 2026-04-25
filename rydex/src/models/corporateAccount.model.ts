import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICorporateAccount extends Document {
  company: {
    name: string;
    registrationNumber: string;
    industry: string;
    employeeCount: number;
  };
  adminUsers: Types.ObjectId[];
  linkedEmployees: Types.ObjectId[];
  monthlyBudget: number;
  spentThisMonth: number;
  billingCycle: "monthly" | "quarterly" | "annual";
  paymentMethod: string;
  discountPercentage: number;
  usageReports: {
    month: string;
    totalRides: number;
    totalCost: number;
    topUsers: { userId: Types.ObjectId; rideCount: number }[];
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const CorporateAccountSchema = new Schema<ICorporateAccount>(
  {
    company: {
      name: { type: String, required: true },
      registrationNumber: { type: String, required: true },
      industry: String,
      employeeCount: { type: Number, default: 0 },
    },
    adminUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    linkedEmployees: [{ type: Schema.Types.ObjectId, ref: "User" }],
    monthlyBudget: { type: Number, required: true },
    spentThisMonth: { type: Number, default: 0, min: 0 },
    billingCycle: {
      type: String,
      enum: ["monthly", "quarterly", "annual"],
      default: "monthly",
    },
    paymentMethod: String,
    discountPercentage: { type: Number, default: 10, min: 0, max: 100 },
    usageReports: [
      {
        month: String,
        totalRides: Number,
        totalCost: Number,
        topUsers: [
          {
            userId: { type: Schema.Types.ObjectId, ref: "User" },
            rideCount: Number,
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

const CorporateAccount =
  mongoose.models.CorporateAccount ||
  mongoose.model<ICorporateAccount>("CorporateAccount", CorporateAccountSchema);
export default CorporateAccount;
