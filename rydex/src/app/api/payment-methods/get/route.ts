import { auth } from "@/auth";
import connectDb from "@/lib/db";
import PaymentMethod from "@/models/paymentMethod.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id as string;
    await connectDb();

    const paymentMethods = await PaymentMethod.find({
      user: userId,
      status: "active",
    }).lean();

    const defaultMethod = paymentMethods.find((m) => m.isDefault);

    return NextResponse.json(
      {
        paymentMethods: paymentMethods.map((m) => ({
          ...m,
          // Mask sensitive data
          cardDetails: m.cardDetails
            ? { ...m.cardDetails, cardholderName: m.cardDetails.cardholderName.substring(0, 1) + "***" }
            : undefined,
          upiDetails:
            m.upiDetails && m.type === "upi"
              ? { upiId: m.upiDetails.upiId.replace(/(.{2})/, "*$1").replace(/(@.*)/, "*$1") }
              : undefined,
        })),
        defaultMethod,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment methods" },
      { status: 500 }
    );
  }
}
