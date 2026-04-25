import { auth } from "@/auth";
import connectDb from "@/lib/db";
import CorporateAccount from "@/models/corporateAccount.model";
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
      company,
      monthlyBudget,
      billingCycle = "monthly",
      discountPercentage = 10,
    } = body;

    if (!company || !company.name || !monthlyBudget) {
      return NextResponse.json(
        { error: "Company name and monthly budget are required" },
        { status: 400 }
      );
    }

    await connectDb();

    // Check if corporate account already exists for this company
    const existing = await CorporateAccount.findOne({
      "company.registrationNumber": company.registrationNumber,
    });

    if (existing) {
      return NextResponse.json(
        { error: "Corporate account already exists for this company" },
        { status: 400 }
      );
    }

    const corporateAccount = await CorporateAccount.create({
      company,
      adminUsers: [userId],
      monthlyBudget,
      billingCycle,
      discountPercentage,
      spentThisMonth: 0,
    });

    return NextResponse.json(corporateAccount, { status: 201 });
  } catch (error) {
    console.error("Error creating corporate account:", error);
    return NextResponse.json(
      { error: "Failed to create corporate account" },
      { status: 500 }
    );
  }
}
