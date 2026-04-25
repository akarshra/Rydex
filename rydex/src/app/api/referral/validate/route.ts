import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import User from "@/models/user.model";

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    if (!code) {
      return NextResponse.json({ error: "Code required" }, { status: 400 });
    }

    await connectDb();
    const referrer = await User.findOne({ referralCode: code.toUpperCase().trim() });
    if (!referrer) {
      return NextResponse.json({ error: "Invalid referral code" }, { status: 404 });
    }

    return NextResponse.json({
      valid: true,
      referrerName: referrer.name,
      message: `Valid code! You'll get a welcome bonus and ${referrer.name} gets rewarded too.`,
    });
  } catch (error) {
    console.error("Validate referral error:", error);
    return NextResponse.json({ error: "Failed to validate" }, { status: 500 });
  }
}

