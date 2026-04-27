import { auth } from "@/auth";
import connectDb from "@/lib/db";
import ScheduledBooking from "@/models/scheduledBooking.model";
import { n8nWorkflows } from "@/lib/n8n";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id as string;
    const body = await request.json();

    const {
      vehicleType,
      pickupAddress,
      dropAddress,
      pickupLocation,
      dropLocation,
      scheduledTime,
      estimatedFare,
    } = body;

    if (!vehicleType || !pickupAddress || !dropAddress || !scheduledTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate scheduled time is in the future
    if (new Date(scheduledTime) <= new Date()) {
      return NextResponse.json(
        { error: "Scheduled time must be in the future" },
        { status: 400 }
      );
    }

    await connectDb();

    const scheduledBooking = await ScheduledBooking.create({
      user: userId,
      vehicleType,
      pickupAddress,
      dropAddress,
      pickupLocation,
      dropLocation,
      scheduledTime: new Date(scheduledTime),
      estimatedFare,
      status: "pending",
    });

    // Schedule reminder via n8n
    const reminderTime = new Date(
      new Date(scheduledTime).getTime() - 30 * 60000 // 30 minutes before
    );

    await n8nWorkflows.scheduleReminder(
      scheduledBooking._id.toString(),
      userId,
      reminderTime,
      "scheduled_ride"
    );

    return NextResponse.json(scheduledBooking, { status: 201 });
  } catch (error) {
    console.error("Error creating scheduled booking:", error);
    return NextResponse.json(
      { error: "Failed to create scheduled booking" },
      { status: 500 }
    );
  }
}
