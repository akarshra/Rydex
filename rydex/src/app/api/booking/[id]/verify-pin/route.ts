import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id as string;
    const { id: bookingId } = await params;
    const body = await request.json();
    const { pin } = body;

    if (!pin) {
      return NextResponse.json({ error: "PIN is required" }, { status: 400 });
    }

    await connectDb();

    const booking = await Booking.findOne({
      _id: bookingId,
      driver: userId,
      status: { $in: ["confirmed", "started"] },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found or not active" }, { status: 404 });
    }

    if (booking.securePin !== pin) {
      return NextResponse.json({ error: "Invalid PIN" }, { status: 400 });
    }

    booking.pinVerified = true;
    await booking.save();

    return NextResponse.json({ success: true, message: "PIN verified. Ride can start." }, { status: 200 });
  } catch (error) {
    console.error("Error verifying PIN:", error);
    return NextResponse.json({ error: "Failed to verify PIN" }, { status: 500 });
  }
}

