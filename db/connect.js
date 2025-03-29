const mongoose = require("mongoose");
const connectionString = process.env.MONGO_URI || "mongodb://localhost:27017/Boarding_Houses";

const connectDB = async () => {
  mongoose.set('debug', true)
  mongoose.set('debug', { color: true })

  await mongoose.connect(connectionString, {
    maxPoolSize: 50 // Tối 50 connections và có thể tái sử dụng connect. Default: 100
  })
};

module.exports = connectDB;