import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import RideSurge from "@/models/rideSurge.model";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDb();
    const surges = await RideSurge.find({ surgeFactor: { $gt: 1.0 } }).sort({ surgeFactor: -1 });
    return NextResponse.json({ success: true, surges });
  } catch (error) {
    console.error("Error fetching active surges:", error);
    return NextResponse.json({ error: "Failed to fetch active surges" }, { status: 500 });
  }
}
