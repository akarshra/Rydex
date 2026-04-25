import { auth } from "@/auth";
import connectDb from "@/lib/db";
import SavedPlace from "@/models/savedPlace.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id as string;
    await connectDb();

    const places = await SavedPlace.find({ user: userId }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ places }, { status: 200 });
  } catch (error) {
    console.error("Error fetching saved places:", error);
    return NextResponse.json({ error: "Failed to fetch saved places" }, { status: 500 });
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
    const { label, name, address, lat, lng } = body;

    if (!name || !address || lat == null || lng == null) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDb();

    // Enforce max 1 home and 1 work
    if (label === "home" || label === "work") {
      await SavedPlace.deleteMany({ user: userId, label });
    }

    const place = await SavedPlace.create({
      user: userId,
      label: label || "other",
      name,
      address,
      lat,
      lng,
    });

    return NextResponse.json({ place }, { status: 201 });
  } catch (error) {
    console.error("Error creating saved place:", error);
    return NextResponse.json({ error: "Failed to create saved place" }, { status: 500 });
  }
}

