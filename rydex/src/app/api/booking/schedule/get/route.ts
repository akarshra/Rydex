import { auth } from "@/auth";
import connectDb from "@/lib/db";
import ScheduledBooking from "@/models/scheduledBooking.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id as string;
    const status = new URL(request.url).searchParams.get("status");

    await connectDb();

    let query: any = { user: userId };
    if (status) {
      query = { ...query, status };
    }

    const scheduledBookings = await ScheduledBooking.find(query)
      .sort({ scheduledTime: 1 })
      .lean();

    return NextResponse.json(scheduledBookings, { status: 200 });
  } catch (error) {
    console.error("Error fetching scheduled bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch scheduled bookings" },
      { status: 500 }
    );
  }
}
