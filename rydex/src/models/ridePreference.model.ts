import mongoose, { Schema, Document, Types } from "mongoose";

export interface IRidePreference extends Document {
  user: Types.ObjectId;
  temperature: "cool" | "warm" | "neutral";
  musicGenre?: string;
  quietRide: boolean;
  luggageAssistance: boolean;
  childSeat: boolean;
  petFriendly: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RidePreferenceSchema = new Schema<IRidePreference>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    temperature: {
      type: String,
      enum: ["cool", "warm", "neutral"],
      default: "neutral",
    },
    musicGenre: { type: String, default: "" },
    quietRide: { type: Boolean, default: false },
    luggageAssistance: { type: Boolean, default: false },
    childSeat: { type: Boolean, default: false },
    petFriendly: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const RidePreference =
  mongoose.models.RidePreference ||
  mongoose.model<IRidePreference>("RidePreference", RidePreferenceSchema);
export default RidePreference;

