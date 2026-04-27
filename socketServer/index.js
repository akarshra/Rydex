import express from "express"
import http from "http"
import dotenv from "dotenv"
import { Server } from "socket.io"
import axios from "axios"
import { createClient } from "redis"
import { createAdapter } from "@socket.io/redis-adapter"

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



app.post("/emit", async (req, res) => {
  const { userId, event, data } = req.body;

  try {
    const user = await User.findById(userId);

    if (user?.socketId) {
      io.to(user.socketId).emit(event, data);
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

io.on("connection", (socket) => {

  socket.on("identity", async (userId) => {

    socket.userId = userId

    await User.findByIdAndUpdate(userId, {
      socketId: socket.id,
      isOnline: true
    })

  })

// server.js — sab jagah ek hi format rakho

socket.on("join-booking", (bookingId) => {
  console.log("joining room:", `booking-${bookingId}`);
  socket.join(`booking-${bookingId}`);  // ← prefix add karo
});

socket.on("driver-location-update", (data) => {
  io.to(`booking-${data.bookingId}`)   // ✅ already sahi
    .emit("driver-location", {
      latitude: data.latitude,
      longitude: data.longitude,
      status: "arriving"
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