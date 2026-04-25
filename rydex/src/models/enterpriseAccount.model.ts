import mongoose, { Schema, Document, Types } from "mongoose";

export type EnterpriseStatus = "active" | "suspended" | "inactive";

export interface IEnterpriseAccount extends Document {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  gstNumber?: string;
  billingAddress: string;
  adminUser: Types.ObjectId;           // primary admin from User model
  employees: {
    user: Types.ObjectId;
    department?: string;
    monthlyBudget: number;
    monthlySpent: number;
    isActive: boolean;
  }[];
  globalMonthlyBudget: number;
  globalMonthlySpent: number;
  ridePolicies: {
    allowedVehicleTypes: string[];
    maxRideDistanceKm?: number;
    allowedTimeStart?: string;         // "09:00"
    allowedTimeEnd?: string;           // "18:00"
    requireApproval: boolean;
  };
  status: EnterpriseStatus;
  createdAt: Date;
  updatedAt: Date;
}

const EnterpriseAccountSchema = new Schema<IEnterpriseAccount>(
  {
    companyName: { type: String, required: true, trim: true },
    companyEmail: { type: String, required: true, lowercase: true, trim: true },
    companyPhone: { type: String, required: true, trim: true },
    gstNumber: { type: String, trim: true },
    billingAddress: { type: String, required: true },
    adminUser: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    employees: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        department: String,
        monthlyBudget: { type: Number, default: 5000, min: 0 },
        monthlySpent: { type: Number, default: 0, min: 0 },
        isActive: { type: Boolean, default: true },
      },
    ],
    globalMonthlyBudget: { type: Number, default: 50000, min: 0 },
    globalMonthlySpent: { type: Number, default: 0, min: 0 },
    ridePolicies: {
      allowedVehicleTypes: { type: [String], default: ["car", "auto"] },
      maxRideDistanceKm: { type: Number, default: 50 },
      allowedTimeStart: { type: String, default: "00:00" },
      allowedTimeEnd: { type: String, default: "23:59" },
      requireApproval: { type: Boolean, default: false },
    },
    status: {
      type: String,
      enum: ["active", "suspended", "inactive"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true }
);

EnterpriseAccountSchema.index({ adminUser: 1 });
EnterpriseAccountSchema.index({ "employees.user": 1 });

const EnterpriseAccount =
  mongoose.models.EnterpriseAccount ||
  mongoose.model<IEnterpriseAccount>("EnterpriseAccount", EnterpriseAccountSchema);
export default EnterpriseAccount;

