const mongoose = require("mongoose");

const host = process.env.DB_HOST || 'localhost'
const port = process.env.DB_PORT || 27017
const name = process.env.DB_NAME || ''

const connectionString = `mongodb://${host}:${port}/${name}`

const connectDB = async () => {
  mongoose.set('debug', true)
  mongoose.set('debug', { color: true })

  await mongoose.connect(connectionString, {
    maxPoolSize: 50 // Tối 50 connections và có thể tái sử dụng connect. Default: 100
  })
  console.log('COnnected database', connectionString);

};

module.exports = connectDB;