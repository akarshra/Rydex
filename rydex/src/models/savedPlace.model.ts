import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISavedPlace extends Document {
  user: Types.ObjectId;
  label: "home" | "work" | "other";
  name: string;
  address: string;
  lat: number;
  lng: number;
  createdAt: Date;
  updatedAt: Date;
}

const SavedPlaceSchema = new Schema<ISavedPlace>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    label: {
      type: String,
      enum: ["home", "work", "other"],
      default: "other",
    },
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { timestamps: true }
);

SavedPlaceSchema.index({ user: 1, label: 1 });

const SavedPlace =
  mongoose.models.SavedPlace ||
  mongoose.model<ISavedPlace>("SavedPlace", SavedPlaceSchema);
export default SavedPlace;

