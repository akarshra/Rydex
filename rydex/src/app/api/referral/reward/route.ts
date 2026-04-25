import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Referral from "@/models/referral.model";
import LoyaltyReward from "@/models/loyaltyReward.model";

export async function POST(req: Request) {
  try {
    const { refereeId } = await req.json();
    if (!refereeId) {
      return NextResponse.json({ error: "Referee ID required" }, { status: 400 });
    }

    await connectDb();

    const referral = await Referral.findOne({ referee: refereeId, status: "pending" });
    if (!referral) {
      return NextResponse.json({ error: "No pending referral found" }, { status: 404 });
    }

    // Mark as completed and reward referrer
    referral.status = "rewarded";
    referral.bookingCompleted = true;
    await referral.save();

    const REFERRER_BONUS = referral.referrerReward || 50;
    let loyalty = await LoyaltyReward.findOne({ user: referral.referrer });
    if (!loyalty) {
      loyalty = await LoyaltyReward.create({
        user: referral.referrer,
        tier: "bronze",
        totalPoints: REFERRER_BONUS,
        availablePoints: REFERRER_BONUS,
      });
    } else {
      loyalty.totalPoints += REFERRER_BONUS;
      loyalty.availablePoints += REFERRER_BONUS;
      await loyalty.save();
    }

    return NextResponse.json({
      success: true,
      message: `Referrer rewarded with ${REFERRER_BONUS} points`,
    });
  } catch (error) {
    console.error("Reward referral error:", error);
    return NextResponse.json({ error: "Failed to reward" }, { status: 500 });
  }
}

