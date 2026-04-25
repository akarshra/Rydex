import { auth } from "@/auth";
import connectDb from "@/lib/db";
import PromoCode from "@/models/promoCode.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can create promo codes" },
        { status: 403 }
      );
    }

    const adminId = session.user.id as string;
    const body = await request.json();

    const {
      code,
      description,
      discountType,
      discountValue,
      minRideAmount,
      maxDiscount,
      validFrom,
      validUntil,
      maxUsageLimit,
      applicableVehicleTypes = [],
    } = body;

    if (!code || !discountType || !discountValue || !validFrom || !validUntil) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (new Date(validUntil) <= new Date(validFrom)) {
      return NextResponse.json(
        { error: "Valid until date must be after valid from date" },
        { status: 400 }
      );
    }

    await connectDb();

    // Check if code already exists
    const existingCode = await PromoCode.findOne({
      code: code.toUpperCase(),
    });
    if (existingCode) {
      return NextResponse.json(
        { error: "Promo code already exists" },
        { status: 400 }
      );
    }

    const promoCode = await PromoCode.create({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      minRideAmount,
      maxDiscount,
      validFrom: new Date(validFrom),
      validUntil: new Date(validUntil),
      maxUsageLimit,
      applicableVehicleTypes,
      createdBy: adminId,
      status: "active",
    });

    return NextResponse.json(promoCode, { status: 201 });
  } catch (error) {
    console.error("Error creating promo code:", error);
    return NextResponse.json(
      { error: "Failed to create promo code" },
      { status: 500 }
    );
  }
}
