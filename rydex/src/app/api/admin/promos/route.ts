import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import PromoCode from "@/models/promoCode.model";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDb();
    const promos = await PromoCode.find().sort({ createdAt: -1 });

    return NextResponse.json({ success: true, promos });
  } catch (error) {
    console.error("Error fetching promo codes:", error);
    return NextResponse.json({ error: "Failed to fetch promo codes" }, { status: 500 });
  }
}
