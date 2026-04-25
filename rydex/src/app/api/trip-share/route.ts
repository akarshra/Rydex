import { auth } from "@/auth";
import connectDb from "@/lib/db";
import TripShare from "@/models/tripShare.model";
import Booking from "@/models/booking.model";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id as string;
    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
    }

    await connectDb();

    const booking = await Booking.findOne({
      _id: bookingId,
      user: userId,
      status: { $in: ["confirmed", "started"] },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found or not active" }, { status: 404 });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const tripShare = await TripShare.create({
      booking: bookingId,
      token,
      expiresAt,
    });

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/track/${token}`;

    return NextResponse.json({ tripShare, shareUrl }, { status: 201 });
  } catch (error) {
    console.error("Error creating trip share:", error);
    return NextResponse.json({ error: "Failed to create trip share" }, { status: 500 });
  }
}

