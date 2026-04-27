import mongoose, { Schema, Document, Types } from "mongoose";

export interface INotification extends Document {
  user: Types.ObjectId;
  type:
    | "booking_confirmed"
    | "booking_cancelled"
    | "driver_arrived"
    | "ride_completed"
    | "payment_received"
    | "promo_available"
    | "loyalty_reward"
    | "scheduled_reminder"
    | "sos_alert"
    | "driver_rating_request"
    | "admin_message";
  title: string;
  message: string;
  relatedBooking?: Types.ObjectId;
  relatedEntity?: string; // PromoCode ID, etc.
  isRead: boolean;
  readAt?: Date;
  actions?: {
    label: string;
    url: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: [
        "booking_confirmed",
        "booking_cancelled",
        "driver_arrived",
        "ride_completed",
        "payment_received",
        "promo_available",
        "loyalty_reward",
        "scheduled_reminder",
        "sos_alert",
        "driver_rating_request",
        "admin_message",
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    relatedBooking: { type: Schema.Types.ObjectId, ref: "Booking" },
    relatedEntity: String,
    isRead: { type: Boolean, default: false, index: true },
    readAt: Date,
    actions: [
      {
        label: String,
        url: String,
      },
    ],
  },
  { timestamps: true }
);

NotificationSchema.index({ user: 1, createdAt: -1 });

const Notification =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);
export default Notification;
