import { auth } from "@/auth";
import connectDb from "@/lib/db";
import EmergencySOS from "@/models/emergencySOS.model";
import Booking from "@/models/booking.model";
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
      bookingId,
      sosType,
      location,
      emergencyContacts = [],
      incidentDescription,
      ambulanceRequired = false,
      attachments = [],
    } = body;

    if (!bookingId || !sosType || !location || !incidentDescription) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDb();

    // Get booking details
    const booking = await Booking.findOne({
      _id: bookingId,
      $or: [{ user: userId }, { driver: userId }],
      status: "started",
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Invalid booking or ride not in progress" },
        { status: 404 }
      );
    }

    // Create SOS record
    const sos = await EmergencySOS.create({
      booking: bookingId,
      user: booking.user,
      driver: booking.driver,
      sosType,
      location,
      emergencyContacts,
      incidentDescription,
      ambulanceRequired,
      attachments,
      status: "active",
    });

    // Trigger notifications via n8n
    const otherUserId = booking.user.toString() === userId ? booking.driver : booking.user;

    await Promise.all([
      n8nWorkflows.sendNotification(
        otherUserId.toString(),
        "sos_alert",
        `Emergency SOS triggered during your ride. Status: ${sosType}`,
        ["push", "sms", "in_app"]
      ),
      n8nWorkflows.sendNotification(
        "admin",
        "sos_alert",
        `SOS Alert on Booking ${bookingId}: ${sosType}`,
        ["push", "email"]
      ),
    ]);

    return NextResponse.json(
      {
        sos,
        message: "SOS activated. Help is on the way.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error triggering emergency SOS:", error);
    return NextResponse.json(
      { error: "Failed to trigger emergency SOS" },
      { status: 500 }
    );
  }
}
