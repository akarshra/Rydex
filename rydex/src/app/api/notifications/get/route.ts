import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Notification from "@/models/notification.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id as string;
    const limit = parseInt(new URL(request.url).searchParams.get("limit") || "20");
    const unreadOnly = new URL(request.url).searchParams.get("unreadOnly") === "true";

    await connectDb();

    let query: any = { user: userId };
    if (unreadOnly) {
      query = { ...query, isRead: false };
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("relatedBooking", "pickupAddress dropAddress")
      .lean();

    const unreadCount = await Notification.countDocuments({
      user: userId,
      isRead: false,
    });

    return NextResponse.json(
      {
        notifications,
        unreadCount,
        total: await Notification.countDocuments({ user: userId }),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}
