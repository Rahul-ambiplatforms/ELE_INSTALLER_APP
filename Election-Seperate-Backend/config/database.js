// database.js
const mongoose = require("mongoose");
const MONGO_URI =
  "mongodb+srv://doadmin:4821yRT9w60OjZo3@vmuktisolution-esp-backup-c0026980.mongo.ondigitalocean.com/ELE?tls=true&authSource=admin&replicaSet=vmuktisolution-esp-backup";

const connectDatabase = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDatabase;
