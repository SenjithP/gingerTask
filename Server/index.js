// server.js

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connect } from "./Config/mongoDBconfig.js";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import authenticationRouter from "./Routers/AuthenticationRouter.js";
import chatRouter from "./Routers/ChatRouter.js";
import messageRouter from "./Routers/MessageRouter.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

// Middleware
app.use(express.json());
app.use(cors());
app.use(cookieParser());

// Routes
app.use("/api/users", authenticationRouter);
app.use("/api/chat", chatRouter);
app.use("/api/message", messageRouter);

// MongoDB Connection
connect()
  .then(() => {
    const port = process.env.PORT || 5000;
    server.listen(port, () => {
      console.log(`Server started running at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

// Array to store connected users
let connectedUsers = [];

// Socket.IO events
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Add user to connectedUsers array when they connect
  socket.on("user-connected", (userId) => {
    const existingUserIndex = connectedUsers.findIndex(
      (user) => user.userId === userId
    );
    if (existingUserIndex === -1) {
      connectedUsers.push({ userId, socketId: socket.id });
      io.emit(
        "update-user-list",
        connectedUsers.map((user) => user.userId)
      );
      console.log("User Connected", connectedUsers);
    }
  });

  // Send message to a specific user
  socket.on("send-message", (message) => {
    const { receiverId } = message;
    const recipient = connectedUsers.find((user) => user.userId === receiverId);
    if (recipient) {
      io.to(recipient.socketId).emit("receive-message", message);
    } else {
      // Handle recipient not found
      socket.emit("recipient-not-found", { receiverId });
    }
  });

  // Remove user from connectedUsers array when they disconnect
  socket.on("disconnect", () => {
    connectedUsers = connectedUsers.filter(
      (user) => user.socketId !== socket.id
    );
    console.log("User Disconnected", connectedUsers);
    io.emit(
      "update-user-list",
      connectedUsers.map((user) => user.userId)
    );
  });
});
