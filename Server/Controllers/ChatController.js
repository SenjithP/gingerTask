import Chat from "../Models/ChatModel.js";
import User from "../Models/UserModel.js";

export const generateChat = async (req, res) => {
  try {
    const existingPersonsChat = await Chat.findOne({
      chatPersons: { $all: [req.body.senderId, req.body.recieverId] },
    });
    if (existingPersonsChat) {
      existingPersonsChat.updatedAt = new Date();
      await existingPersonsChat.save();
      return res
        .status(200)
        .json({ message: "Chat updated", existingPersonsChat });
    } else {
      const newGeneratedChat = new Chat({
        chatPersons: [req.body.senderId, req.body.recieverId],
      });
      const created = newGeneratedChat.save();
      return res.status(200).json({ message: "Chat Created", created });
    }
  } catch (error) {
    console.log("Error:", error);
    return res
      .status(500)
      .json({ message: "Some thing went wrong, Please try again later" });
  }
};

export const userChats = async (req, res) => {
  try {
    const chat = await Chat.find({
      chatPersons: { $in: [req.params.userId] },
    });
    res.status(200).json(chat);
  } catch (error) {
    console.log("Error:", error);
    return res
      .status(500)
      .json({ message: "Some thing went wrong, Please try again later" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const allUsers = await User.find({});
    res.status(200).json(allUsers);
  } catch (error) {
    console.log("Error:", error);
    return res
      .status(500)
      .json({ message: "Some thing went wrong, Please try again later" });
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
  }
};
