import { auth } from "@/auth";
import connectDb from "@/lib/db";
import LoyaltyReward from "@/models/loyaltyReward.model";
import PointTransaction from "@/models/pointTransaction.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id as string;
    await connectDb();

    let loyalty = await LoyaltyReward.findOne({ user: userId });

    // Create loyalty record if not exists
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

    const recentTransactions = await PointTransaction.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const tierBenefits = {
      bronze: { cashbackPercentage: 1, prioritySupport: false, freeRidesPerMonth: 0 },
      silver: { cashbackPercentage: 2, prioritySupport: true, freeRidesPerMonth: 1 },
      gold: { cashbackPercentage: 3, prioritySupport: true, freeRidesPerMonth: 2 },
      platinum: { cashbackPercentage: 5, prioritySupport: true, freeRidesPerMonth: 5 },
    };

    return NextResponse.json(
      {
        loyalty,
        tierBenefits: tierBenefits[loyalty.tier as keyof typeof tierBenefits],
        recentTransactions,
        nextTierPoints:
          loyalty.tier === "bronze"
            ? 1000
            : loyalty.tier === "silver"
              ? 5000
              : loyalty.tier === "gold"
                ? 10000
                : null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching loyalty balance:", error);
    return NextResponse.json(
      { error: "Failed to fetch loyalty balance" },
      { status: 500 }
    );
  }
}
