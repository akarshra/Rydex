import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDb from "@/lib/db";
import EnterpriseAccount from "@/models/enterpriseAccount.model";
import User from "@/models/user.model";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { companyName, companyEmail, companyPhone, gstNumber, billingAddress, employees } = body;

    if (!companyName || !companyEmail || !companyPhone || !billingAddress) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDb();

    // Check if user already has an enterprise account
    const existing = await EnterpriseAccount.findOne({ adminUser: session.user.id });
    if (existing) {
      return NextResponse.json({ error: "Enterprise account already exists" }, { status: 409 });
    }

    // Validate employee emails exist in system
    const employeeEmails = employees || [];
    const employeeUsers = await User.find({ email: { $in: employeeEmails } }).select("_id email name");
    const employeeRecords = employeeUsers.map((u) => ({
      user: u._id,
      department: "",
      monthlyBudget: 5000,
      monthlySpent: 0,
      isActive: true,
    }));

    const enterprise = await EnterpriseAccount.create({
      companyName,
      companyEmail,
      companyPhone,
      gstNumber,
      billingAddress,
      adminUser: session.user.id,
      employees: employeeRecords,
      globalMonthlyBudget: 50000,
      globalMonthlySpent: 0,
      ridePolicies: {
        allowedVehicleTypes: ["car", "auto"],
        maxRideDistanceKm: 50,
        allowedTimeStart: "00:00",
        allowedTimeEnd: "23:59",
        requireApproval: false,
      },
      status: "active",
    });

    return NextResponse.json({ success: true, enterprise }, { status: 201 });
  } catch (error) {
    console.error("Enterprise create error:", error);
    return NextResponse.json({ error: "Failed to create enterprise account" }, { status: 500 });
  }
}

