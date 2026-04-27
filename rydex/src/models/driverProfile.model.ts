import mongoose, { Schema, Document, Types } from "mongoose";

export interface IDriverProfile extends Document {
  user: Types.ObjectId;
  bio: string;
  achievements: string[];
  languages: string[];
  musicPreferences: string[];
  podcastPreferences: string[];
  averageRating: number;
  totalRides: number;
  totalRatings: number;
  yearsExperience: number;
  certifications: string[];
  profilePicture: string;
  musicEnabled: boolean;
  podcastEnabled: boolean;
  spotifyPlaylistId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DriverProfileSchema = new Schema<IDriverProfile>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    bio: { type: String, maxlength: 500 },
    achievements: [String],
    languages: [String],
    musicPreferences: [String],
    podcastPreferences: [String],
    averageRating: { type: Number, default: 5, min: 1, max: 5 },
    totalRides: { type: Number, default: 0, min: 0 },
    totalRatings: { type: Number, default: 0, min: 0 },
    yearsExperience: { type: Number, default: 0, min: 0 },
    certifications: [String],
    profilePicture: String,
    musicEnabled: { type: Boolean, default: true },
    podcastEnabled: { type: Boolean, default: true },
    spotifyPlaylistId: String,
  },
  { timestamps: true }
);

const DriverProfile =
  mongoose.models.DriverProfile ||
  mongoose.model<IDriverProfile>("DriverProfile", DriverProfileSchema);
export default DriverProfile;
