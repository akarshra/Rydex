import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";
import User from "@/models/user.model";
import { auth } from "@/auth";
import axios from "axios";

export async function POST(req: Request) {
  await connectDb();

  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const {
    driverId,
    vehicleId,
    pickupAddress,
    dropAddress,
    pickupLocation,
    dropLocation,
    fare,
    mobileNumber,
    promoCode,
    discountAmount,
    stops,
    dispatchTier,
    ridePreferencesSnapshot,
    fareSplit,
  } = body;

  // Validate required fields
  if (
    !driverId ||
    !vehicleId ||
    !pickupLocation?.coordinates ||
    !dropLocation?.coordinates
  ) {
    return NextResponse.json(
      { message: "Missing required fields" },
      { status: 400 }
    );
  }

  // Validate fare is positive
  if (!fare || typeof fare !== "number" || fare <= 0) {
    return NextResponse.json(
      { message: "Invalid fare amount" },
      { status: 400 }
    );
  }

  // Validate coordinates format
  if (!Array.isArray(pickupLocation.coordinates) || pickupLocation.coordinates.length !== 2 ||
      !Array.isArray(dropLocation.coordinates) || dropLocation.coordinates.length !== 2) {
    return NextResponse.json(
      { message: "Invalid coordinate format" },
      { status: 400 }
    );
  }

  // Validate mobile number format
  if (!mobileNumber || !/^\d{10,15}$/.test(mobileNumber)) {
    return NextResponse.json(
      { message: "Invalid mobile number" },
      { status: 400 }
    );
  }

  try {
    // Get driver's mobile number from database and verify driver exists
    const driver = await User.findById(driverId).select("mobileNumber role");
    
    if (!driver) {
      return NextResponse.json(
        { message: "Driver not found" },
        { status: 404 }
      );
    }

    // Verify driver is actually a vendor/driver
    if (driver.role !== "vendor") {
      return NextResponse.json(
        { message: "Selected user is not a valid driver" },
        { status: 400 }
      );
    }

    // Prevent duplicate active booking - check for race condition
    const existingBooking = await Booking.findOne({
      user: session.user.id,
      status: {
        $in: ["requested", "awaiting_payment", "confirmed", "started"],
      },
    });

    if (existingBooking) {
      return NextResponse.json({ 
        success: true, 
        booking: existingBooking,
        message: "Existing active booking found"
      });
    }

    // Additional validation for optional fields
    if (discountAmount && (typeof discountAmount !== "number" || discountAmount < 0)) {
      return NextResponse.json(
        { message: "Invalid discount amount" },
        { status: 400 }
      );
    }

    if (dispatchTier && !["standard", "premium", "express"].includes(dispatchTier)) {
      return NextResponse.json(
        { message: "Invalid dispatch tier" },
        { status: 400 }
      );
    }

    const booking = await Booking.create({
      user: session.user.id,
      driver: driverId,
      vehicle: vehicleId,
      pickupAddress,
      dropAddress,
      pickupLocation,
      dropLocation,
      fare,
      userMobileNumber: mobileNumber,
      driverMobileNumber: driver.mobileNumber,
      promoCode: promoCode || null,
      discountAmount: discountAmount || 0,
      status: "requested",
      stops: stops || [],
      dispatchTier: dispatchTier || "standard",
      ridePreferencesSnapshot: ridePreferencesSnapshot || undefined,
      fareSplit: fareSplit || undefined,
    });
    
    // Notify driver asynchronously
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_SOCKET_SERVER}/emit`,
        {
          userId: driverId,
          event: "new-booking",
          data: booking,
        },
        { timeout: 5000 } // 5 second timeout
      );
    } catch (socketError) {
      console.error("Socket notification failed:", socketError);
      // Don't fail the booking creation if socket notification fails
    }

    return NextResponse.json({ success: true, booking });
  } catch (error: any) {
    console.error("Booking creation error:", error);
    return NextResponse.json(
      { message: "Failed to create booking: " + error.message },
      { status: 500 }
    );
  }
}