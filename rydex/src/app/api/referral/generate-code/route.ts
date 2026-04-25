import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.model";

function generateReferralCode(name: string): string {
  const prefix = name.slice(0, 3).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  const num = Math.floor(100 + Math.random() * 900);
  return `${prefix}${random}${num}`;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDb();
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate if not exists
    if (!user.referralCode) {
      user.referralCode = generateReferralCode(user.name || "RYD");
      await user.save();
    }

    return NextResponse.json({ referralCode: user.referralCode });
  } catch (error) {
    console.error("Generate referral code error:", error);
    return NextResponse.json({ error: "Failed to generate code" }, { status: 500 });
  }
}

