import Chat from "../Models/ChatModel.js";
import User from "../Models/UserModel.js";

export const generateChat = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;
    if (senderId === receiverId) {
      return res
        .status(400)
        .json({ message: "Cannot create chat with oneself" });
    }

    const existingChat = await Chat.findOne({
      chatPersons: { $all: [senderId, receiverId] },
    });
    if (existingChat) {
      existingChat.updatedAt = new Date();
      await existingChat.save();
      return res.status(200).json({ message: "Chat updated", existingChat });
    } else {
      const newChat = new Chat({
        chatPersons: [senderId, receiverId],
      });
      await newChat.save();
      return res.status(200).json({ message: "Chat created", newChat });
    }
  } catch (error) {
    console.error("Error generating chat:", error);
    return res
      .status(500)
      .json({ message: "Something went wrong, please try again later" });
  }
};

export const userChats = async (req, res) => {
  try {
    const userId = req.params.userId;
    const userChats = await Chat.find({
      chatPersons: { $in: [userId] },
    });
    return res.status(200).json(userChats);
  } catch (error) {
    console.error("Error fetching user chats:", error);
    return res
      .status(500)
      .json({ message: "Something went wrong, please try again later" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const allUsers = await User.find({});
    if (allUsers) {
      return res.status(200).json({ message: "All users found", allUsers });
    } else {
      return res.status(400).json({ message: "Failed to fetch users" });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Something went wrong, please try again later" });
  }
};

export const findChat = async (req, res) => {
  try {
    const chat = await Chat.findOne({
      chatPersons: { $all: [req.params.firstId, req.params.secondId] },
    });
    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json(error);
    return res
      .status(500)
      .json({ message: "Something went wrong, please try again later" });
  }
};
