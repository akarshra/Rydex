import { auth } from "@/auth";
import connectDb from "@/lib/db";
import CarbonFootprint, { CarbonStats } from "@/models/carbonFootprint.model";
import Booking from "@/models/booking.model";
import { NextRequest, NextResponse } from "next/server";

// Estimated CO2 savings per km for different vehicle types (in kg)
const CO2_SAVINGS_PER_KM = {
  bike: 0.15,
  auto: 0.20,
  car: 0.25,
  truck: 0.30,
  loading: 0.28,
};

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id as string;
    const body = await request.json();

    const { bookingId, distanceTraveled } = body;

    if (!bookingId || !distanceTraveled) {
      return NextResponse.json(
        { error: "Booking ID and distance are required" },
        { status: 400 }
      );
    }

    await connectDb();

    // Verify booking
    const booking = await Booking.findOne({
      _id: bookingId,
      user: userId,
      status: "completed",
    }).populate("vehicle");

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found or not completed" },
        { status: 404 }
      );
    }

    const vehicleType = booking.vehicle?.vehicleType || "car";
    const co2Saved = distanceTraveled * (CO2_SAVINGS_PER_KM[vehicleType as keyof typeof CO2_SAVINGS_PER_KM] || 0.25);

    // Create carbon footprint record
    const carbonRecord = await CarbonFootprint.create({
      user: userId,
      booking: bookingId,
      distanceTraveled,
      estimatedCO2Saved: parseFloat(co2Saved.toFixed(2)),
      vehicleType,
    });

    // Update or create carbon stats
    let carbonStats = await CarbonStats.findOne({ user: userId });

    if (!carbonStats) {
      carbonStats = await CarbonStats.create({
        user: userId,
        totalDistanceTraveled: 0,
        totalCO2Saved: 0,
        totalRidesCompleted: 0,
        level: "seedling",
      });
    }

    carbonStats.totalDistanceTraveled += distanceTraveled;
    carbonStats.totalCO2Saved += co2Saved;
    carbonStats.totalRidesCompleted += 1;

    // Update level based on CO2 saved
    const totalCO2 = carbonStats.totalCO2Saved;
    if (totalCO2 >= 1000) {
      carbonStats.level = "forest";
    } else if (totalCO2 >= 500) {
      carbonStats.level = "tree";
    } else if (totalCO2 >= 100) {
      carbonStats.level = "sapling";
    } else {
      carbonStats.level = "seedling";
    }

    await carbonStats.save();

    return NextResponse.json(
      {
        carbonRecord,
        stats: carbonStats,
        message: `You saved ${co2Saved.toFixed(2)} kg of CO2!`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error tracking carbon footprint:", error);
    return NextResponse.json(
      { error: "Failed to track carbon footprint" },
      { status: 500 }
    );
  }
}
