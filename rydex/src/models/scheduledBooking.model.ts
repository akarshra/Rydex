import mongoose, { Schema, Document, Types } from "mongoose";

export interface IScheduledBooking extends Document {
  user: Types.ObjectId;
  vehicleType: string;
  pickupAddress: string;
  dropAddress: string;
  pickupLocation: {
    type: "Point";
    coordinates: [number, number];
  };
  dropLocation: {
    type: "Point";
    coordinates: [number, number];
  };
  scheduledTime: Date;
  estimatedFare: number;
  status: "pending" | "scheduled" | "confirmed" | "completed" | "cancelled";
  assignedDriver?: Types.ObjectId;
  reminderSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ScheduledBookingSchema = new Schema<IScheduledBooking>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    vehicleType: { type: String, required: true },
    pickupAddress: { type: String, required: true },
    dropAddress: { type: String, required: true },
    pickupLocation: {
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
    dropLocation: {
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
    scheduledTime: { type: Date, required: true },
    estimatedFare: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "scheduled", "confirmed", "completed", "cancelled"],
      default: "pending",
      index: true,
    },
    assignedDriver: { type: Schema.Types.ObjectId, ref: "User" },
    reminderSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ScheduledBookingSchema.index({ user: 1, scheduledTime: 1 });
ScheduledBookingSchema.index({ scheduledTime: 1 });

const ScheduledBooking =
  mongoose.models.ScheduledBooking ||
  mongoose.model<IScheduledBooking>("ScheduledBooking", ScheduledBookingSchema);
export default ScheduledBooking;
