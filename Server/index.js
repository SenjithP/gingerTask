
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

app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.use("/api/users", authenticationRouter);
app.use("/api/chat", chatRouter);
app.use("/api/message", messageRouter);

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

let connectedUsers = [];

const findUserBySocketId = (socketId) => {
  return connectedUsers.find((user) => user.socketId === socketId);
};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  const existingUser = findUserBySocketId(socket.id);
  if (existingUser) {
    socket.emit("user-connected", existingUser.userId);
  }

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

  socket.on("send-message", (message) => {
    const { receiverId } = message;
    const recipient = connectedUsers.find((user) => user.userId === receiverId);
    if (recipient) {
      io.to(recipient.socketId).emit("receive-message", message);
    } else {
      socket.emit("recipient-not-found", { receiverId });
    }
  });

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
