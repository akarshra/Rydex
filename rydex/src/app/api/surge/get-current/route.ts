import connectDb from "@/lib/db";
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

    // Find surge pricing for location within 5km radius
    const surge = await RideSurge.findOne({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
          $maxDistance: 5000, // 5km radius
        },
      },
      vehicleType,
    });

    if (!surge) {
      return NextResponse.json(
        {
          surgeFactor: 1.0,
          demandLevel: "low",
          message: "No surge pricing in this area",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        surgeFactor: surge.surgeFactor,
        demandLevel: surge.demandLevel,
        availableVehicles: surge.availableVehicles,
        pendingRequests: surge.pendingRequests,
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
