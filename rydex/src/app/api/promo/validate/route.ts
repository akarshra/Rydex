import { auth } from "@/auth";
import connectDb from "@/lib/db";
import PromoCode from "@/models/promoCode.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id as string;
    const body = await request.json();

    const { code, rideAmount, vehicleType } = body;

    if (!code || !rideAmount) {
      return NextResponse.json(
        { error: "Code and ride amount are required" },
        { status: 400 }
      );
    }

    await connectDb();

    const promoCode = await PromoCode.findOne({
      code: code.toUpperCase(),
    });

    if (!promoCode) {
      return NextResponse.json({ error: "Invalid promo code" }, { status: 404 });
    }

    // Check if code is active
    if (promoCode.status !== "active") {
      return NextResponse.json({ error: "Promo code is inactive" }, { status: 400 });
    }

    // Check if code is within valid date range
    const now = new Date();
    if (now < promoCode.validFrom || now > promoCode.validUntil) {
      return NextResponse.json({ error: "Promo code expired" }, { status: 400 });
    }

    // Check usage limit
    if (promoCode.maxUsageLimit && promoCode.usageCount >= promoCode.maxUsageLimit) {
      return NextResponse.json(
        { error: "Promo code usage limit reached" },
        { status: 400 }
      );
    }

    // Check if user already used this code
    if (promoCode.usedBy.includes(userId)) {
      return NextResponse.json(
        { error: "You have already used this promo code" },
        { status: 400 }
      );
    }

    // Check minimum ride amount
    if (promoCode.minRideAmount && rideAmount < promoCode.minRideAmount) {
      return NextResponse.json(
        { error: `Minimum ride amount is ${promoCode.minRideAmount}` },
        { status: 400 }
      );
    }

    // Check if applicable to vehicle type
    if (
      promoCode.applicableVehicleTypes.length > 0 &&
      !promoCode.applicableVehicleTypes.includes(vehicleType)
    ) {
      return NextResponse.json(
        { error: "Promo code not applicable to this vehicle type" },
        { status: 400 }
      );
    }

    // Calculate discount
    let discount = 0;
    if (promoCode.discountType === "percentage") {
      discount = (rideAmount * promoCode.discountValue) / 100;
      if (promoCode.maxDiscount) {
        discount = Math.min(discount, promoCode.maxDiscount);
      }
    } else {
      discount = promoCode.discountValue;
    }

    // Update usage count and add user to usedBy
    await PromoCode.findByIdAndUpdate(promoCode._id, {
      $inc: { usageCount: 1 },
      $push: { usedBy: userId },
    });

    return NextResponse.json(
      {
        valid: true,
        discount: parseFloat(discount.toFixed(2)),
        finalAmount: parseFloat((rideAmount - discount).toFixed(2)),
        message: `Discount of ${discount} applied!`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error validating promo code:", error);
    return NextResponse.json(
      { error: "Failed to validate promo code" },
      { status: 500 }
    );
  }
}
