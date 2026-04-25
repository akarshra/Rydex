import express from "express"
import http from "http"
import dotenv from "dotenv"
import { Server } from "socket.io"
import axios from "axios"
import { createClient } from "redis"
import { createAdapter } from "@socket.io/redis-adapter"
import jwt from "jsonwebtoken"

dotenv.config()

import mongoose from "mongoose"
import User from "./models/user.models.js"

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379"
const pubClient = createClient({ url: redisUrl })
const subClient = pubClient.duplicate()

await Promise.all([pubClient.connect(), subClient.connect()])
await mongoose.connect(process.env.MONGODB_URL)
const app = express()
app.use(express.json())
const server = http.createServer(app)
const port = process.env.PORT || 5000

const io = new Server(server, {
  cors: {
    origin: process.env.NEXT_BASE_URL,
  },
})

io.adapter(createAdapter(pubClient, subClient))

const redisLocationKey = (userId) => `user-location:${userId}`

// Middleware for JWT authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error("Authentication error: No token provided"));
  }

  try {
    const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
    if (!secret) {
      console.error("CRITICAL: AUTH_SECRET not set in environment");
      return next(new Error("Server configuration error"));
    }

    const decoded = jwt.verify(token, secret);
    socket.userId = decoded.id || decoded.sub;
    socket.userEmail = decoded.email;
    next();
  } catch (error) {
    return next(new Error("Authentication error: Invalid token"));
  }
});

app.post("/emit", async (req, res) => {
  const { userId, event, data } = req.body;

  try {
    const user = await User.findById(userId);

    if (user?.socketId) {
      io.to(user.socketId).emit(event, data);
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.userId}`);

  socket.on("identity", async (userId) => {
    // Verify the userId matches the authenticated token
    if (socket.userId !== userId) {
      socket.emit("error", "User ID mismatch - authentication failed");
      socket.disconnect(true);
      return;
    }

    socket.userId = userId;

    await User.findByIdAndUpdate(userId, {
      socketId: socket.id,
      isOnline: true
    });

    socket.emit("identity-confirmed", { socketId: socket.id, userId });
  });

  // Join booking room with validation
  socket.on("join-booking", (bookingId) => {
    if (!bookingId || typeof bookingId !== "string") {
      socket.emit("error", "Invalid booking ID");
      return;
    }

    console.log("User joining booking room:", `booking-${bookingId}`);
    socket.join(`booking-${bookingId}`);
    socket.emit("booking-joined", { bookingId });
  });

  // Driver location update with validation
  socket.on("driver-location-update", (data) => {
    if (!data?.bookingId || data.latitude === undefined || data.longitude === undefined) {
      socket.emit("error", "Invalid location data");
      return;
    }

    // Validate coordinates are numbers within valid ranges
    if (typeof data.latitude !== "number" || typeof data.longitude !== "number") {
      socket.emit("error", "Invalid coordinate format");
      return;
    }

    if (data.latitude < -90 || data.latitude > 90 || data.longitude < -180 || data.longitude > 180) {
      socket.emit("error", "Coordinates out of valid range");
      return;
    }

    io.to(`booking-${data.bookingId}`).emit("driver-location", {
      latitude: data.latitude,
      longitude: data.longitude,
      status: "arriving",
      timestamp: new Date().toISOString()
    });
  });

  // Handle disconnection
  socket.on("disconnect", async () => {
    console.log(`User disconnected: ${socket.userId}`);
    if (socket.userId) {
      await User.findByIdAndUpdate(socket.userId, {
        isOnline: false,
        socketId: null
      });
    }
  });
});

socket.on("chat-message", (msg) => {
  console.log("chat to room:", `booking-${msg.rideId}`);
  io.to(`booking-${msg.rideId}`).emit("chat-message", msg);  // ← prefix add karo
});

  socket.on("update-location", async ({ latitude, longitude }) => {
    if (!socket.userId) return

    await User.findByIdAndUpdate(socket.userId, {
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
      lastLocationUpdate: new Date(),
    })

    await pubClient.hSet(redisLocationKey(socket.userId), {
      latitude: `${latitude}`,
      longitude: `${longitude}`,
      updatedAt: new Date().toISOString(),
      isOnline: "true",
    })
  })

  socket.on("disconnect", async () => {
    if (!socket.userId) return

    await User.findByIdAndUpdate(socket.userId, {
      isOnline: false,
      socketId: null,
    })

    await pubClient.hSet(redisLocationKey(socket.userId), {
      isOnline: "false",
      updatedAt: new Date().toISOString(),
    })
  })

})






server.listen(port,()=>{
    console.log("server started at",port)
})