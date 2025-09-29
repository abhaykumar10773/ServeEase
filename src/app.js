import express from 'express';
import cors from 'cors';
import cookieparser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";

dotenv.config();
const app = express();

// Create HTTP server for Socket.IO
const server = createServer(app);
const corsOptions = {
    origin: [process.env.CORS_ORIGIN], // Update with your frontend URL
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  };
  console.log("Allowed CORS Origin:", process.env.CORS_ORIGIN);


  // Create Socket.io Server
  const io = new Server(server, {
    cors: corsOptions,
  });

 
const frontendUrl = process.env.FRONTEND_URL;

app.use(cors({
  origin: frontendUrl,           // dynamic frontend URL
  methods: "GET, POST, PUT, DELETE, OPTIONS",
  allowedHeaders: "Content-Type, Authorization",
  credentials: true
}));

// Optional preflight
app.options( cors({
  origin: frontendUrl,
  methods: "GET, POST, PUT, DELETE, OPTIONS",
  allowedHeaders: "Content-Type, Authorization",
  credentials: true
}));

// Store connected providers & users
const onlineProviders = new Map();
const onlineUsers = new Map();


import { EventEmitter } from "events";
EventEmitter.defaultMaxListeners = 20; // Increase the limit (default is 10)

io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Store online providers and users
    socket.on("joinProvider", (provider) => {
        onlineProviders.set(provider, socket.id);
    });

    socket.on("joinUser", (customer) => {
        onlineUsers.set(customer, socket.id);
    });

    // Send booking to provider
    socket.on("sendBooking", ({ provider, bookingData }) => {
        const providerSocketId = onlineProviders.get(provider);
        console.log("providerSocketId",providerSocketId)
        if (providerSocketId) {
            io.to(providerSocketId).emit("newBooking", bookingData);
        }

        // Emit event to update user booking dashboard
        const userSocketId = onlineUsers.get(bookingData.customer);
        console.log("usersocketid",userSocketId);
        if (userSocketId) {
            io.to(userSocketId).emit("bookingUpdate", bookingData);
        }
    });

    // Accept booking and notify the user
    socket.on("acceptBooking", (updatedBooking)  => {
        io.emit("bookingUpdate", updatedBooking);
    });

    // both ki location update 
    socket.on("liveLocation", ({ id, role, latitude, longitude }) => {
        console.log(`${role} ${id} moved to ${latitude}, ${longitude}`);
        io.emit("userLocation", { id, role, latitude, longitude }); // ✅ Correct event name
      });
      


    socket.on("completeBooking", (updatedBooking) => {
        io.emit("bookingUpdate", updatedBooking);
    });

    // Handle provider rejecting booking
    socket.on("rejectBooking", ({ customer, bookingData }) => {
        const userSocketId = onlineUsers.get(customer);
        if (userSocketId) {
            io.to(userSocketId).emit("bookingRejected", bookingData);
        }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
        onlineProviders.forEach((value, key) => {
            if (value === socket.id) onlineProviders.delete(key);
        });

        onlineUsers.forEach((value, key) => {
            if (value === socket.id) onlineUsers.delete(key);
        });

        console.log("Client disconnected:", socket.id);
    });
});


// Security middleware
app.use(express.json({ limit: '80kb' }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(express.static("public"));
app.use(cookieparser());

// Routes import
import userRouter from "./Routes/user.routes.js"; 
import bookingrouter from "./Routes/booking.routes.js";
import servicerouter from "./Routes/service.routes.js";

// Routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/booking", bookingrouter);
app.use("/api/v1/service", servicerouter);

 
export {  io, server };
