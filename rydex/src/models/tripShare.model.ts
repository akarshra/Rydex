import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITripShare extends Document {
  booking: Types.ObjectId;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

const TripShareSchema = new Schema<ITripShare>(
  {
    booking: { type: Schema.Types.ObjectId, ref: "Booking", required: true, index: true },
    token: { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

const TripShare =
  mongoose.models.TripShare ||
  mongoose.model<ITripShare>("TripShare", TripShareSchema);
export default TripShare;

