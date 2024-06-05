import express from "express";
import { generateChat, userChats,getAllUsers, findChat } from "../Controllers/ChatController.js";

const chatRouter = express.Router();

chatRouter.post("/generateChat", generateChat);
chatRouter.get("/:userId",userChats)
chatRouter.post("/getAllUsers",getAllUsers)
chatRouter.get("/find/:firstId/:secondId",findChat)



export default chatRouter;
