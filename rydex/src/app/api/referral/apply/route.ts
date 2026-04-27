import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import Referral from "@/models/referral.model";
import LoyaltyReward from "@/models/loyaltyReward.model";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await req.json();
    if (!code) {
      return NextResponse.json({ error: "Code required" }, { status: 400 });
    }

    await connectDb();

    // Cannot refer yourself
    const selfUser = await User.findById(session.user.id);
    if (selfUser?.referralCode === code.toUpperCase().trim()) {
      return NextResponse.json({ error: "Cannot use your own code" }, { status: 400 });
    }

    // Check if already referred
    const existing = await Referral.findOne({ referee: session.user.id });
    if (existing) {
      return NextResponse.json({ error: "You have already used a referral code" }, { status: 400 });
    }

    const referrer = await User.findOne({ referralCode: code.toUpperCase().trim() });
    if (!referrer) {
      return NextResponse.json({ error: "Invalid referral code" }, { status: 404 });
    }

    // Create referral record
    const referral = await Referral.create({
      referrer: referrer._id,
      referee: session.user.id,
      referralCode: code.toUpperCase().trim(),
      status: "pending",
    });

    // Give welcome bonus to referee immediately
    const REFEREE_BONUS = 30;
    let loyalty = await LoyaltyReward.findOne({ user: session.user.id });
    if (!loyalty) {
      loyalty = await LoyaltyReward.create({
        user: session.user.id,
        tier: "bronze",
        totalPoints: REFEREE_BONUS,
        availablePoints: REFEREE_BONUS,
      });
    } else {
      loyalty.totalPoints += REFEREE_BONUS;
      loyalty.availablePoints += REFEREE_BONUS;
      await loyalty.save();
    }

    return NextResponse.json({
      success: true,
      referral,
      message: `Welcome bonus of ${REFEREE_BONUS} points applied!`,
    });
  } catch (error) {
    console.error("Apply referral error:", error);
    return NextResponse.json({ error: "Failed to apply referral" }, { status: 500 });
  }
}

