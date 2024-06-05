import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connect } from "./Config/mongoDBconfig.js";
import dotenv from "dotenv";
import authenticationRouter from "./Routers/AuthenticationRouter.js";
import chatRouter from "./Routers/ChatRouter.js";
import { Server } from "socket.io";
import http from "http";
import messageRouter from "./Routers/MessageRouter.js";

const app = express();

const corsOptions = {
  origin: true,
};

dotenv.config();

app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());

app.use("/api/users", authenticationRouter);
app.use("/api/chat", chatRouter);
app.use("/api/message", messageRouter);


const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

let connectedUsers = [];

io.on("connection", (socket) => {
  socket.on("user-connected", (userId) => {
    const existingUser = connectedUsers.find((user) => user.userId === userId);
    if (!existingUser) {
      connectedUsers.push({ userId: userId, socketId: socket.id });
      console.log("User Connected", connectedUsers);
    }
    io.emit("update-user-list", connectedUsers);
  });

  socket.on("send-message", (message) => {
    const { recipientId } = message;
    const recipient = connectedUsers.find(
      (user) => user.userId === recipientId
    );
    if (recipient) {
      io.to(recipient.socketId).emit("receive-message", message);
    }
  });

  socket.on("disconnect", () => {
    connectedUsers = connectedUsers.filter(
      (user) => user.socketId !== socket.id
    );
    console.log("User Disconnected", connectedUsers);
    io.emit("update-user-list", connectedUsers);
  });
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  connect();
  console.log(`Server started running at http://localhost:${port}`);
});
