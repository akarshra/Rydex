import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";
import User from "@/models/user.model";
import RideSurge from "@/models/rideSurge.model";
import Vehicle from "@/models/vehicle.model";

export async function POST() {
  try {
    await connectDb();

    // 1. Clear existing surge data
    await RideSurge.deleteMany({});

    // 2. Get all pending requests
    const pendingBookings = await Booking.find({ status: "requested" });

    if (pendingBookings.length === 0) {
      return NextResponse.json({ success: true, message: "No pending requests, surge cleared." });
    }

    // 3. For each booking, create or update a surge zone
    const surgeZones: Record<string, any> = {};

    for (const booking of pendingBookings) {
      // Find the vehicle type for this booking
      const vehicle = await Vehicle.findById(booking.vehicle);
      if (!vehicle) continue;

      const vehicleType = vehicle.type;

      // Simplistic grid clustering: round coordinates to 2 decimal places (approx 1.1km)
      const lat = booking.pickupLocation.coordinates[1];
      const lng = booking.pickupLocation.coordinates[0];
      const clusterKey = `${lat.toFixed(2)}_${lng.toFixed(2)}_${vehicleType}`;

      if (!surgeZones[clusterKey]) {
        surgeZones[clusterKey] = {
          lat: Number(lat.toFixed(2)),
          lng: Number(lng.toFixed(2)),
          vehicleType,
          pendingRequests: 0,
        };
      }
      surgeZones[clusterKey].pendingRequests += 1;
    }

    // 4. Calculate available drivers for each zone and set surge factor
    for (const key of Object.keys(surgeZones)) {
      const zone = surgeZones[key];

      // Find available drivers near this zone (within 5km)
      const availableDriversCount = await User.countDocuments({
        role: "vendor",
        isOnline: true,
        currentVehicleType: zone.vehicleType,
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [zone.lng, zone.lat],
            },
            $maxDistance: 5000,
          },
        },
      });

      zone.availableVehicles = availableDriversCount;

      let surgeFactor = 1.0;
      let demandLevel = "low";

      if (zone.pendingRequests > availableDriversCount) {
        const diff = zone.pendingRequests - availableDriversCount;
        surgeFactor = Math.min(3.0, 1.0 + diff * 0.2); // +0.2x for each missing driver
        
        if (surgeFactor >= 2.0) {
          demandLevel = "critical";
        } else if (surgeFactor >= 1.5) {
          demandLevel = "high";
        } else {
          demandLevel = "medium";
        }
      }

      // Save to database
      await RideSurge.create({
        location: {
          type: "Point",
          coordinates: [zone.lng, zone.lat],
        },
        vehicleType: zone.vehicleType,
        surgeFactor: Number(surgeFactor.toFixed(1)),
        demandLevel,
        availableVehicles: zone.availableVehicles,
        pendingRequests: zone.pendingRequests,
      });
    }

    return NextResponse.json({ success: true, message: "Surge calculated successfully" });
  } catch (error) {
    console.error("Surge calculation error:", error);
    return NextResponse.json({ error: "Failed to calculate surge" }, { status: 500 });
  }
}
