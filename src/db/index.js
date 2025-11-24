import mongoose from "mongoose";

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  try {
    await mongoose.connect(uri);
    console.log(" MongoDB Connected:",mongoose.connection.host);
  } catch (err) {
    console.error(" MongoDB Connection Error:");
    process.exit(1);
  }
};

