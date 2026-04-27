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
    const { splits } = body; // Array of { userId, amount }

    if (!splits || !Array.isArray(splits) || splits.length === 0) {
      return NextResponse.json({ error: "Splits array is required" }, { status: 400 });
    }

    await connectDb();

    const booking = await Booking.findOne({
      _id: bookingId,
      user: userId,
      status: { $in: ["requested", "awaiting_payment", "confirmed"] },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found or not eligible for fare split" }, { status: 404 });
    }

    // Validate total split amount equals fare
    const totalSplit = splits.reduce((sum: number, s: any) => sum + (s.amount || 0), 0);
    if (Math.abs(totalSplit - booking.fare) > 0.01) {
      return NextResponse.json(
        { error: `Split total (${totalSplit}) must equal fare (${booking.fare})` },
        { status: 400 }
      );
    }

    booking.fareSplit = splits.map((s: any) => ({
      user: s.userId,
      amount: s.amount,
      status: s.userId === userId ? "paid" : "pending",
      paidAt: s.userId === userId ? new Date() : undefined,
    }));

    await booking.save();

    return NextResponse.json(
      { success: true, fareSplit: booking.fareSplit, message: "Fare split configured" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error configuring fare split:", error);
    return NextResponse.json({ error: "Failed to configure fare split" }, { status: 500 });
  }
}

