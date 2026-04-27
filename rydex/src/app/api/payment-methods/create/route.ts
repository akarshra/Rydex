import { auth } from "@/auth";
import connectDb from "@/lib/db";
import PaymentMethod from "@/models/paymentMethod.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id as string;
    const body = await request.json();

    const { type, isDefault, cardDetails, upiDetails, walletDetails, bankDetails } = body;

    if (!type) {
      return NextResponse.json({ error: "Payment method type is required" }, { status: 400 });
    }

    await connectDb();

    // If setting as default, unset others
    if (isDefault) {
      await PaymentMethod.updateMany({ user: userId }, { isDefault: false });
    }

    const paymentMethod = await PaymentMethod.create({
      user: userId,
      type,
      isDefault: isDefault || false,
      status: "active",
      cardDetails: type === "card" ? cardDetails : undefined,
      upiDetails: type === "upi" ? upiDetails : undefined,
      walletDetails: type === "wallet" ? walletDetails : undefined,
      bankDetails: type === "netbanking" ? bankDetails : undefined,
    });

    return NextResponse.json(paymentMethod, { status: 201 });
  } catch (error) {
    console.error("Error creating payment method:", error);
    return NextResponse.json(
      { error: "Failed to create payment method" },
      { status: 500 }
    );
  }
}
