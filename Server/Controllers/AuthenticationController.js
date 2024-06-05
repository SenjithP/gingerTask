import User from "../Models/UserModel.js";
import bcrypt from "bcrypt";
import { generateToken } from "../Utils/generateToken.js";

export const userRegistration = async (req, res) => {
  try {
    const { userName, userEmail, userPassword, userMobileNumber } = req.body;
    if (
      !userName ||
      userName.trim().length === 0 ||
      !userEmail ||
      userEmail.trim().length === 0 ||
      !userPassword ||
      userPassword.trim().length === 0 ||
      !userMobileNumber
    ) {
      return res.status(400).json({ message: "Please provide all fields" });
    }
    if (!/^[a-zA-Z ]{2,30}$/.test(userName)) {
      return res
        .status(400)
        .json({ message: "Name should not contain numbers" });
    }
    if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
        userPassword
      )
    ) {
      return res.status(400).json({ message: "Need strong password" });
    }
    if (!/^[a-zA-Z0-9._]+@gmail\.com$/.test(userEmail)) {
      return res
        .status(400)
        .json({ message: "Email should be in proper format" });
    }
    if (!/^[0]?[789]\d{9}$/.test(userMobileNumber)) {
      return res.status(400).json({ message: "Mobile number is not valid" });
    }

    let existingUserWithEmail = await User.findOne({ userEmail });
    if (existingUserWithEmail) {
      console.log("reaching");
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(userPassword, 10);

    const user = new User({
      userName,
      userEmail,
      userPassword: hashedPassword,
      userMobileNumber,
    });

    let userCreated = await user.save();
    if (userCreated) {
      return res.status(201).json({ message: "User registered successfully" });
    }
  } catch (error) {
    console.log("Error:", error);
    return res
      .status(500)
      .json({ message: "Some thing went wrong, Please try again later" });
  }
};

export const userLogin = async (req, res) => {
  try {
    const { userEmail, userPassword } = req.body;
    if (
      !userEmail ||
      userEmail.trim().length === 0 ||
      !userPassword ||
      userPassword.trim().length === 0
    ) {
      return res.status(400).json({ message: "Please provide all fields" });
    }

    const registeredUser = await User.findOne({ userEmail });

    if (!registeredUser) {
      return res
        .status(400)
        .json({ message: "User with this email doesn't exists" });
    }

    let correctPassword = await bcrypt.compare(
      userPassword,
      registeredUser.userPassword
    );

    if (correctPassword) {
      generateToken(res, registeredUser._id);
      return res.status(200).json({
        name: registeredUser.userName,
        email: registeredUser.userEmail,
        id: registeredUser._id,
        message: "Login success",
      });
    } else {
      return res.status(400).json({ message: "Invalid Email or Password" });
    }
  } catch (error) {
    console.log("Error:", error);
    return res
      .status(500)
      .json({ message: "Some thing went wrong, Please try again later" });
  }
};
