import mongoose, { Schema, Document, Types } from "mongoose";

export interface IEmergencySOS extends Document {
  booking: Types.ObjectId;
  user: Types.ObjectId;
  driver: Types.ObjectId;
  sosType: "accident" | "harassment" | "emergency" | "other";
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  emergencyContacts: {
    name: string;
    phone: string;
    relationship: string;
  }[];
  sosTriggeredAt: Date;
  sosResolvedAt?: Date;
  status: "active" | "resolved" | "dismissed";
  supportAgentAssigned?: Types.ObjectId;
  policeNotified: boolean;
  ambulanceRequired: boolean;
  incidentDescription: string;
  attachments: string[]; // URLs of images/videos
  createdAt: Date;
  updatedAt: Date;
}

const EmergencySOSSchema = new Schema<IEmergencySOS>(
  {
    booking: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    driver: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sosType: {
      type: String,
      enum: ["accident", "harassment", "emergency", "other"],
      required: true,
    },
    location: {
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
    emergencyContacts: [
      {
        name: String,
        phone: String,
        relationship: String,
      },
    ],
    sosTriggeredAt: { type: Date, default: Date.now },
    sosResolvedAt: Date,
    status: {
      type: String,
      enum: ["active", "resolved", "dismissed"],
      default: "active",
      index: true,
    },
    supportAgentAssigned: { type: Schema.Types.ObjectId, ref: "User" },
    policeNotified: { type: Boolean, default: false },
    ambulanceRequired: { type: Boolean, default: false },
    incidentDescription: { type: String, required: true },
    attachments: [String],
  },
  { timestamps: true }
);

EmergencySOSSchema.index({ status: 1, sosTriggeredAt: -1 });

const EmergencySOS =
  mongoose.models.EmergencySOS ||
  mongoose.model<IEmergencySOS>("EmergencySOS", EmergencySOSSchema);
export default EmergencySOS;
