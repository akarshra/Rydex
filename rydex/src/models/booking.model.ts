import mongoose, { Schema, Document, Types } from "mongoose";

export type BookingStatus =
  | "requested"
  | "awaiting_payment"
  | "confirmed"
  | "started"
  | "completed"
  | "cancelled"
  | "rejected"
  | "expired";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "cash"
  | "failed";

export type DispatchTier = "standard" | "priority" | "wait_save";

export interface IBookingStop {
  address: string;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
}

export interface IFareSplit {
  user: Types.ObjectId;
  amount: number;
  status: "pending" | "paid";
  paidAt?: Date;
}

export interface IBooking extends Document {
  user: Types.ObjectId;
  driver: Types.ObjectId;
  vehicle: Types.ObjectId;

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

  stops: IBookingStop[];

  fare: number;

  status: BookingStatus;
  paymentStatus: PaymentStatus;

  paymentDeadline?: Date;

  userMobileNumber: string;
  driverMobileNumber: string;
  adminCommission: number;
  partnerAmount: number;

  pickupOtp: string;
  pickupOtpExpires: Date;
  dropOtp: string;
  dropOtpExpires: Date;

  /* Premium fields */
  dispatchTier: DispatchTier;
  ridePreferencesSnapshot?: {
    temperature?: string;
    musicGenre?: string;
    quietRide?: boolean;
    luggageAssistance?: boolean;
    childSeat?: boolean;
    petFriendly?: boolean;
  };
  fareSplit?: IFareSplit[];
  securePin?: string;
  pinVerified: boolean;

  createdAt: Date;
  updatedAt: Date;
  promoCode?: string;
  discountAmount?: number;
}

const BookingSchema = new Schema<IBooking>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    driver: { type: Schema.Types.ObjectId, ref: "User", required: true },
    vehicle: { type: Schema.Types.ObjectId, ref: "Vehicle", required: true },

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

    stops: [
      {
        address: { type: String, required: true },
        location: {
          type: {
            type: String,
            enum: ["Point"],
            default: "Point",
          },
          coordinates: { type: [Number], required: true },
        },
      },
    ],

    fare: { type: Number, required: true },

    status: {
      type: String,
      default: "requested",
      index: true,
    },
    adminCommission: {
      type: Number,
      default: 0,
    },

    partnerAmount: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      default: "pending",
    },

    paymentDeadline: Date,

    pickupOtp: {
      type: String,
    },

    pickupOtpExpires: {
      type: Date,
    },
    dropOtp: {
      type: String,
    },

    dropOtpExpires: {
      type: Date,
    },

    userMobileNumber: {
      type: String,
      required: true,
      trim: true,
    },

    driverMobileNumber: {
      type: String,
      required: true,
      trim: true,
    },

    /* Premium fields */
    dispatchTier: {
      type: String,
      enum: ["standard", "priority", "wait_save"],
      default: "standard",
    },

    ridePreferencesSnapshot: {
      temperature: { type: String },
      musicGenre: { type: String },
      quietRide: { type: Boolean },
      luggageAssistance: { type: Boolean },
      childSeat: { type: Boolean },
      petFriendly: { type: Boolean },
    },

    fareSplit: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        amount: { type: Number, required: true },
        status: { type: String, enum: ["pending", "paid"], default: "pending" },
        paidAt: { type: Date },
      },
    ],

    securePin: { type: String },
    pinVerified: { type: Boolean, default: false },

    promoCode: { type: String },
    discountAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Booking = mongoose.models.Booking ||
  mongoose.model<IBooking>("Booking", BookingSchema);
export default Booking;
