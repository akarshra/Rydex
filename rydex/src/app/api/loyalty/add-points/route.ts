import { auth } from "@/auth";
import connectDb from "@/lib/db";
import LoyaltyReward from "@/models/loyaltyReward.model";
import PointTransaction from "@/models/pointTransaction.model";
import Booking from "@/models/booking.model";
import { NextRequest, NextResponse } from "next/server";

const tierThresholds = {
  bronze: 0,
  silver: 1000,
  gold: 5000,
  platinum: 10000,
};

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id as string;
    const body = await request.json();

    const { bookingId, rideAmount } = body;

    if (!bookingId || !rideAmount) {
      return NextResponse.json(
        { error: "Booking ID and ride amount are required" },
        { status: 400 }
      );
    }

    await connectDb();

    // Verify booking belongs to user
    const booking = await Booking.findOne({
      _id: bookingId,
      user: userId,
      status: "completed",
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found or not completed" },
        { status: 404 }
      );
    }

    // Check if points were already awarded for this booking
    const existingTransaction = await PointTransaction.findOne({
      user: userId,
      relatedBooking: bookingId,
      transactionType: "earned",
    });

    if (existingTransaction) {
      return NextResponse.json(
        { error: "Points already awarded for this booking" },
        { status: 400 }
      );
    }

    let loyalty = await LoyaltyReward.findOne({ user: userId });

    if (!loyalty) {
      loyalty = await LoyaltyReward.create({
        user: userId,
        tier: "bronze",
        totalPoints: 0,
        usedPoints: 0,
        availablePoints: 0,
        totalRidesCompleted: 0,
        totalSpent: 0,
      });
    }

    // Calculate points: 1 point per rupee spent
    const pointsEarned = Math.floor(rideAmount);

    // Update loyalty record
    loyalty.totalPoints += pointsEarned;
    loyalty.availablePoints += pointsEarned;
    loyalty.totalRidesCompleted += 1;
    loyalty.totalSpent += rideAmount;

    // Update tier based on total points
    const oldTier = loyalty.tier;
    for (const [tier, threshold] of Object.entries(tierThresholds)) {
      if (loyalty.totalPoints >= threshold) {
        loyalty.tier = tier as any;
      }
    }

    await loyalty.save();

    // Create point transaction
    const transaction = await PointTransaction.create({
      user: userId,
      points: pointsEarned,
      transactionType: "earned",
      description: `Earned from ride booking ${bookingId}`,
      relatedBooking: bookingId,
      balance: loyalty.availablePoints,
    });

    return NextResponse.json(
      {
        message: "Points added successfully",
        pointsEarned,
        totalPoints: loyalty.totalPoints,
        currentTier: loyalty.tier,
        tierUpgrade: oldTier !== loyalty.tier ? `Upgraded to ${loyalty.tier}!` : null,
        transaction,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding loyalty points:", error);
    return NextResponse.json(
      { error: "Failed to add loyalty points" },
      { status: 500 }
    );
  }
}
