import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDb();

  const { id } = await params;
  const booking = await Booking.findById(id);
  if (!booking)
    return NextResponse.json({ message: "Not found" }, { status: 404 });

  booking.status = "completed";
  booking.completedAt = new Date();

  await booking.save();

  // Loyalty Program: 1 point for every 10 INR
  try {
    const User = (await import("@/models/user.model")).default;
    const earnedPoints = Math.floor(booking.fare / 10);
    if (earnedPoints > 0 && booking.user) {
      await User.findByIdAndUpdate(booking.user, {
        $inc: { rewardPoints: earnedPoints }
      });
    }
  } catch (error) {
    console.error("Failed to award points:", error);
  }

  return NextResponse.json({ success: true });
}
