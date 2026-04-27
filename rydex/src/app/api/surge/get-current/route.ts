import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";
import User from "@/models/user.model";
import RideSurge from "@/models/rideSurge.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const lat = parseFloat(new URL(request.url).searchParams.get("lat") || "0");
    const lng = parseFloat(new URL(request.url).searchParams.get("lng") || "0");
    const vehicleType = new URL(request.url).searchParams.get("vehicleType") || "car";

    if (!lat || !lng) {
      return NextResponse.json(
        { error: "Latitude and longitude are required" },
        { status: 400 }
      );
    }

    await connectDb();

    // 1. Find active bookings in 5km radius
    const activeBookings = await Booking.countDocuments({
      status: { $in: ["requested", "awaiting_payment", "confirmed", "started"] },
      pickupLocation: {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: 5000,
        },
      },
    });

    // 2. Find available online drivers in 5km radius
    const availableDrivers = await User.countDocuments({
      role: "vendor",
      isOnline: true,
      currentVehicleType: vehicleType,
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: 5000,
        },
      },
    });

    // 3. Mathematical Surge Calculation
    // Base 1.0 + (active / max(drivers, 1) * 0.2)
    let surgeFactor = 1.0 + (activeBookings / Math.max(availableDrivers, 1)) * 0.2;

    // 4. Time of Day Peak Multiplier (5 PM - 9 PM)
    const hour = new Date().getHours();
    if (hour >= 17 && hour <= 21) {
      surgeFactor += 0.5;
    }

    // 5. Hard limit at 2.5x
    surgeFactor = Math.min(surgeFactor, 2.5);
    // Round to 1 decimal place
    surgeFactor = Math.round(surgeFactor * 10) / 10;

    // Define demand level
    let demandLevel = "low";
    if (surgeFactor >= 1.5) demandLevel = "high";
    else if (surgeFactor >= 1.2) demandLevel = "medium";

    // Async Update the legacy static RideSurge table for historical tracking
    await RideSurge.findOneAndUpdate(
      { vehicleType },
      {
        $set: {
          surgeFactor,
          demandLevel,
          availableVehicles: availableDrivers,
          pendingRequests: activeBookings,
          location: { type: "Point", coordinates: [lng, lat] },
        }
      },
      { upsert: true }
    ).catch(e => console.error("Could not update RideSurge record:", e));

    return NextResponse.json(
      {
        surgeFactor,
        demandLevel,
        availableVehicles: availableDrivers,
        pendingRequests: activeBookings,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching surge pricing:", error);
    return NextResponse.json(
      { error: "Failed to fetch surge pricing" },
      { status: 500 }
    );
  }
}
