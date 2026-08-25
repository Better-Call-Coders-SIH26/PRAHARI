const mongoose = require("mongoose");
const env = require("./env");

const connectDatabase = async () => {
  try {
    await mongoose.connect(env.mongoUri);

    console.log("MongoDB connected successfully");
    console.log(`Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error("MongoDB connection failed");
    console.error(error.message);

    process.exit(1);
  }
};

module.exports = connectDatabase;