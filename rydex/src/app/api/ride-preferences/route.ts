import { auth } from "@/auth";
import connectDb from "@/lib/db";
import RidePreference from "@/models/ridePreference.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id as string;
    await connectDb();

    let preferences = await RidePreference.findOne({ user: userId }).lean();

    if (!preferences) {
      preferences = await RidePreference.create({
        user: userId,
        temperature: "neutral",
        musicGenre: "",
        quietRide: false,
        luggageAssistance: false,
        childSeat: false,
        petFriendly: false,
      });
    }

    return NextResponse.json({ preferences }, { status: 200 });
  } catch (error) {
    console.error("Error fetching ride preferences:", error);
    return NextResponse.json({ error: "Failed to fetch ride preferences" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id as string;
    const body = await request.json();

    await connectDb();

    const preferences = await RidePreference.findOneAndUpdate(
      { user: userId },
      { ...body, user: userId },
      { new: true, upsert: true }
    );

    return NextResponse.json({ preferences }, { status: 200 });
  } catch (error) {
    console.error("Error saving ride preferences:", error);
    return NextResponse.json({ error: "Failed to save ride preferences" }, { status: 500 });
  }
}

