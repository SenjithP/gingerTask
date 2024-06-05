import jwt from "jsonwebtoken";

const COOKIE_CONFIG = {
  httpOnly: true,
  secure: process.env.NODE_ENV !== "development",
  sameSite: "strict",
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

export const generateToken = (res, userId) => {
  try {
    if (!process.env.USER_JWT_SECRET) {
      return res.status(400).json({ message: "JWT secret is not defined" });
    }

    const token = jwt.sign({ userId }, process.env.USER_JWT_SECRET, {
      expiresIn: "30d",
    });

    console.log(token);
    const result = res.cookie("userjwt", token, COOKIE_CONFIG);
    console.log(result);
  } catch (error) {
    console.error("Error:", error);
    return res.status(400).json({ message: "Token generation unsuccessfull" });
  }
};
