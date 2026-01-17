import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`mongodb connected ${conn.connection.host}`);
  } catch (err) {
    console.log(`error connecting to mongo ${err.message}`);
    process.exit(1);
  }
};

export default connectDB;
