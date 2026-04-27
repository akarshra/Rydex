import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Review from "@/models/review.model";
import Booking from "@/models/booking.model";
import User from "@/models/user.model";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookingId, rating, comment } = await req.json();

    if (!bookingId || !rating) {
      return NextResponse.json({ error: "Booking ID and rating are required" }, { status: 400 });
    }

    await connectDb();

    // Verify booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Determine roles
    const isRider = booking.user.toString() === session.user.id;
    const isDriver = booking.driver.toString() === session.user.id;

    if (!isRider && !isDriver) {
      return NextResponse.json({ error: "Unauthorized for this booking" }, { status: 403 });
    }

    const revieweeId = isRider ? booking.driver : booking.user;
    const role = isRider ? "rider" : "driver";

    // Prevent duplicate reviews
    const existingReview = await Review.findOne({
      booking: booking._id,
      reviewer: session.user.id,
    });

    if (existingReview) {
      return NextResponse.json({ error: "You have already reviewed this ride" }, { status: 400 });
    }

    // Create review
    const newReview = await Review.create({
      booking: booking._id,
      reviewer: session.user.id,
      reviewee: revieweeId,
      rating,
      comment,
      role,
    });

    // Update user's average rating
    const reviewee = await User.findById(revieweeId);
    if (reviewee) {
      const currentAvg = reviewee.averageRating || 0;
      const currentTotal = reviewee.totalReviews || 0;
      
      const newTotal = currentTotal + 1;
      const newAvg = ((currentAvg * currentTotal) + rating) / newTotal;

      reviewee.averageRating = Number(newAvg.toFixed(1));
      reviewee.totalReviews = newTotal;
      await reviewee.save();
    }

    return NextResponse.json({ success: true, review: newReview }, { status: 201 });
  } catch (error: any) {
    console.error("Submit rating error:", error);
    return NextResponse.json({ error: error.message || "Failed to submit rating" }, { status: 500 });
  }
}
