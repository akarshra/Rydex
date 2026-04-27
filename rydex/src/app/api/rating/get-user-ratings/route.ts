import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Rating from "@/models/rating.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = new URL(request.url).searchParams.get("userId");
    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    await connectDb();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const ratings = await Rating.find({ ratee: userId })
      .populate("rater", "name")
      .populate("booking", "pickupAddress dropAddress createdAt")
      .sort({ createdAt: -1 })
      .limit(50);

    const stats = {
      totalRatings: ratings.length,
      averageRating:
        ratings.length > 0
          ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(2)
          : 0,
      categoryAverages: {
        safety: ratings.length > 0 ? (ratings.reduce((sum, r) => sum + r.categories.safety, 0) / ratings.length).toFixed(2) : 0,
        cleanliness: ratings.length > 0 ? (ratings.reduce((sum, r) => sum + r.categories.cleanliness, 0) / ratings.length).toFixed(2) : 0,
        professionalism: ratings.length > 0 ? (ratings.reduce((sum, r) => sum + r.categories.professionalism, 0) / ratings.length).toFixed(2) : 0,
        communication: ratings.length > 0 ? (ratings.reduce((sum, r) => sum + r.categories.communication, 0) / ratings.length).toFixed(2) : 0,
      },
      ratingDistribution: {
        5: ratings.filter((r) => r.rating === 5).length,
        4: ratings.filter((r) => r.rating === 4).length,
        3: ratings.filter((r) => r.rating === 3).length,
        2: ratings.filter((r) => r.rating === 2).length,
        1: ratings.filter((r) => r.rating === 1).length,
      },
    };

    return NextResponse.json({ ratings, stats }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user ratings:", error);
    return NextResponse.json(
      { error: "Failed to fetch ratings" },
      { status: 500 }
    );
  }
}
