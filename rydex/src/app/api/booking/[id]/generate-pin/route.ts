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

    await connectDb();

    const booking = await Booking.findOne({
      _id: bookingId,
      user: userId,
      status: { $in: ["confirmed", "started"] },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found or not active" }, { status: 404 });
    }

    // Generate 4-digit PIN
    const securePin = Math.floor(1000 + Math.random() * 9000).toString();
    booking.securePin = securePin;
    await booking.save();

    return NextResponse.json({ securePin, message: "PIN generated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error generating secure PIN:", error);
    return NextResponse.json({ error: "Failed to generate PIN" }, { status: 500 });
  }
}

