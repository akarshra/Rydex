import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Insurance from "@/models/insurance.model";
import Booking from "@/models/booking.model";
import { NextRequest, NextResponse } from "next/server";

const insurancePlans = {
  basic: {
    premium: 25,
    coverageAmount: 50000,
    coverageDetails: {
      accidentCoverage: 50000,
      damageCoverage: 0,
      medicalCoverage: 5000,
      theftCoverage: 0,
    },
  },
  premium: {
    premium: 50,
    coverageAmount: 100000,
    coverageDetails: {
      accidentCoverage: 100000,
      damageCoverage: 50000,
      medicalCoverage: 10000,
      theftCoverage: 0,
    },
  },
  comprehensive: {
    premium: 100,
    coverageAmount: 200000,
    coverageDetails: {
      accidentCoverage: 200000,
      damageCoverage: 100000,
      medicalCoverage: 25000,
      theftCoverage: 50000,
    },
  },
};

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id as string;
    const body = await request.json();

    const { bookingId, insuranceType } = body;

    if (!bookingId || !insuranceType) {
      return NextResponse.json(
        { error: "Booking ID and insurance type are required" },
        { status: 400 }
      );
    }

    if (!insurancePlans[insuranceType as keyof typeof insurancePlans]) {
      return NextResponse.json(
        { error: "Invalid insurance type" },
        { status: 400 }
      );
    }

    await connectDb();

    // Verify booking
    const booking = await Booking.findOne({
      _id: bookingId,
      user: userId,
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Check if insurance already exists for this booking
    const existingInsurance = await Insurance.findOne({ booking: bookingId });
    if (existingInsurance) {
      return NextResponse.json(
        { error: "Insurance already purchased for this booking" },
        { status: 400 }
      );
    }

    const plan = insurancePlans[insuranceType as keyof typeof insurancePlans];

    const insurance = await Insurance.create({
      booking: bookingId,
      user: userId,
      insuranceType,
      coverageAmount: plan.coverageAmount,
      premium: plan.premium,
      status: "active",
      coverageDetails: plan.coverageDetails,
    });

    return NextResponse.json(
      {
        insurance,
        message: `Insurance purchased for ${insuranceType} plan`,
        premium: plan.premium,
        coverage: plan.coverageAmount,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating insurance:", error);
    return NextResponse.json(
      { error: "Failed to create insurance" },
      { status: 500 }
    );
  }
}
