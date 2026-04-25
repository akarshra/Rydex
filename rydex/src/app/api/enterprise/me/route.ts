import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDb from "@/lib/db";
import EnterpriseAccount from "@/models/enterpriseAccount.model";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDb();

    const enterprise = await EnterpriseAccount.findOne({
      $or: [
        { adminUser: session.user.id },
        { "employees.user": session.user.id },
      ],
    }).populate("adminUser", "name email").populate("employees.user", "name email");

    if (!enterprise) {
      return NextResponse.json({ enterprise: null }, { status: 200 });
    }

    return NextResponse.json({ enterprise });
  } catch (error) {
    console.error("Enterprise me error:", error);
    return NextResponse.json({ error: "Failed to fetch enterprise" }, { status: 500 });
  }
}

