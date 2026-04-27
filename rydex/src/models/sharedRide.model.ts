import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISharedRide extends Document {
  mainBooking: Types.ObjectId; // main ride booking
  pooledBookings: Types.ObjectId[]; // other bookings in the same ride
  driver: Types.ObjectId;
  vehicle: Types.ObjectId;
  status: "active" | "completed" | "cancelled";
  totalPassengers: number;
  route: {
    type: "LineString";
    coordinates: [number, number][];
  };
  costSplitRatio: Map<string, number>; // booking ID -> percentage of cost
  createdAt: Date;
  updatedAt: Date;
}

const SharedRideSchema = new Schema<ISharedRide>(
  {
    mainBooking: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    pooledBookings: [{ type: Schema.Types.ObjectId, ref: "Booking" }],
    driver: { type: Schema.Types.ObjectId, ref: "User", required: true },
    vehicle: { type: Schema.Types.ObjectId, ref: "Vehicle", required: true },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
    totalPassengers: { type: Number, default: 1, min: 1 },
    route: {
      type: {
        type: String,
        enum: ["LineString"],
        default: "LineString",
      },
      coordinates: {
        type: [[Number]],
      },
    },
    costSplitRatio: {
      type: Map,
      of: Number,
    },
  },
  { timestamps: true }
);

const SharedRide =
  mongoose.models.SharedRide ||
  mongoose.model<ISharedRide>("SharedRide", SharedRideSchema);
export default SharedRide;
