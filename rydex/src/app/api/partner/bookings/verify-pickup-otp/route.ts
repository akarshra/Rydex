import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Booking from "@/models/booking.model";

// Constant-time string comparison to prevent timing attacks
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export async function POST(req: Request) {

  await connectDB();

  try {

    const { bookingId, otp } = await req.json();

    // Validate inputs
    if (!bookingId || !otp) {
      return NextResponse.json(
        { message: "Missing bookingId or otp" },
        { status: 400 }
      );
    }

    if (typeof otp !== "string" || otp.length === 0) {
      return NextResponse.json(
        { message: "Invalid OTP format" },
        { status: 400 }
      );
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 }
      );
    }

    if (!booking.pickupOtp) {
      return NextResponse.json(
        { message: "OTP not generated" },
        { status: 400 }
      );
    }

    // Use constant-time comparison to prevent timing attacks
    if (!constantTimeCompare(String(booking.pickupOtp), otp)) {
      return NextResponse.json(
        { message: "Invalid OTP" },
        { status: 400 }
      );
    }

    // Check expiration
    if (booking.pickupOtpExpires && new Date(booking.pickupOtpExpires) < new Date()) {
      return NextResponse.json(
        { message: "OTP expired" },
        { status: 400 }
      );
    }

    /* update status */

    booking.status = "started";

    booking.pickupOtp = "";
    booking.pickupOtpExpires = undefined as any;

    await booking.save();

    return NextResponse.json({
      success: true,
      message: "OTP verified. Ride started."
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      { message: "OTP verification failed" },
      { status: 500 }
    );

  }

}