import mongoose from "mongoose";

export const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO);
  } catch (error) {
    throw error;
  }
};

mongoose.connection.on("disconnected", () => {
  console.log("Mongodb got disconnected");
});


mongoose.connection.on("connected", () => {
  console.log("mongoDb connected");
});
