import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Rating from "@/models/rating.model";
import Booking from "@/models/booking.model";
import User from "@/models/user.model";
import { n8nWorkflows } from "@/lib/n8n";
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
      bookingId,
      rating,
      comment,
      categories = {
        safety: 5,
        cleanliness: 5,
        professionalism: 5,
        communication: 5,
      },
    } = body;

    if (!bookingId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Invalid rating data" },
        { status: 400 }
      );
    }

    await connectDb();

    // Check if booking exists and user is part of it
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const isRider = booking.user.toString() === userId;
    const isDriver = booking.driver.toString() === userId;

    if (!isRider && !isDriver) {
      return NextResponse.json(
        { error: "You are not part of this booking" },
        { status: 403 }
      );
    }

    // Determine rater and ratee
    const ratee = isRider ? booking.driver : booking.user;

    // Check if already rated
    const existingRating = await Rating.findOne({
      booking: bookingId,
      rater: userId,
    });

    if (existingRating) {
      return NextResponse.json(
        { error: "You have already rated this booking" },
        { status: 400 }
      );
    }

    // Create rating
    const newRating = await Rating.create({
      booking: bookingId,
      rater: userId,
      ratee,
      raterRole: isRider ? "user" : "vendor",
      rating,
      comment,
      categories,
    });

    // Calculate and update average rating for the ratee
    const allRatings = await Rating.find({ ratee });
    const avgRating =
      allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;

    // Update user's average rating and total reviews
    await User.findByIdAndUpdate(ratee, {
      $set: { 
        averageRating: parseFloat(avgRating.toFixed(2)),
        totalReviews: allRatings.length
      },
    });

    // Send notification via n8n
    await n8nWorkflows.sendNotification(
      ratee.toString(),
      "rating_received",
      `You received a ${rating}-star rating from a ${isRider ? "rider" : "driver"}`,
      ["in_app", "push"]
    );

    return NextResponse.json(newRating, { status: 201 });
  } catch (error) {
    console.error("Error creating rating:", error);
    return NextResponse.json(
      { error: "Failed to create rating" },
      { status: 500 }
    );
  }
}
