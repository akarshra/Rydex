import mongoose, { Schema, Document, Types } from "mongoose";

export interface IRating extends Document {
  booking: Types.ObjectId;
  rater: Types.ObjectId; // user or driver
  ratee: Types.ObjectId; // driver or user
  raterRole: "user" | "vendor";
  rating: number; // 1-5
  comment: string;
  categories: {
    safety: number;
    cleanliness: number;
    professionalism: number;
    communication: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const RatingSchema = new Schema<IRating>(
  {
    booking: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    rater: { type: Schema.Types.ObjectId, ref: "User", required: true },
    ratee: { type: Schema.Types.ObjectId, ref: "User", required: true },
    raterRole: {
      type: String,
      enum: ["user", "vendor"],
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
      maxlength: 500,
    },
    categories: {
      safety: { type: Number, min: 1, max: 5, default: 5 },
      cleanliness: { type: Number, min: 1, max: 5, default: 5 },
      professionalism: { type: Number, min: 1, max: 5, default: 5 },
      communication: { type: Number, min: 1, max: 5, default: 5 },
    },
  },
  { timestamps: true }
);

RatingSchema.index({ rater: 1, booking: 1 });
RatingSchema.index({ ratee: 1 });

const Rating =
  mongoose.models.Rating || mongoose.model<IRating>("Rating", RatingSchema);
export default Rating;
